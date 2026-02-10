import { AppSettings, PROVIDER_CONFIGS } from '../types/settings';
import { CharacterCard, ThemeType, CustomTemplates } from '../types/character-card';
import { SYSTEM_PROMPT, SEARCH_SYSTEM_PROMPT, GENERATE_ALL_PROMPT, MODULE_PROMPTS } from '../data/ai-prompts';
import {
  OPENAI_TOOLS,
  CLAUDE_TOOLS,
  SEARCH_TOOL_NAME,
  executeSearchTool,
  formatSearchResults,
} from './tool-calling';

// 生成结果类型（包含搜索来源）
export interface GenerationResult {
  card: Partial<CharacterCard>;
  searchSources?: SearchSource[];
}

// 搜索来源（导出供 UI 使用）
export interface SearchSource {
  uri: string;
  title: string;
}

// 消息类型
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// API 响应类型
interface APIResponse {
  content: string;
  error?: string;
  searchSources?: SearchSource[];
}

// 后端代理服务器地址
const API_PROXY_SERVER = 'http://localhost:3001';

// 获取代理 URL
function getProxyUrl(provider: string, path: string): string {
  return `${API_PROXY_SERVER}/api/${provider}${path}`;
}

// ============== OpenAI API (支持 Tool Calling) ==============

async function callOpenAIWithTools(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean,
  onProgress?: (text: string, value: number) => void
): Promise<APIResponse> {
  const url = getProxyUrl('openai', '/v1/chat/completions');
  const searchSources: SearchSource[] = [];

  // 转换消息格式
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiMessages: any[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const maxIterations = 5;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const requestBody: Record<string, unknown> = {
      model: settings.model,
      messages: apiMessages,
      temperature: 0.7,
    };

    // 只在启用搜索且是第一次迭代时添加工具
    if (enableSearch && iteration === 1) {
      requestBody.tools = OPENAI_TOOLS;
      requestBody.tool_choice = 'auto';
    } else {
      // 最后一次请求要求 JSON 格式
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API 调用失败');
    }

    const data = await response.json();
    const choice = data.choices[0];

    // 检查是否有工具调用
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      onProgress?.('正在搜索资料...', 30);

      // 添加 assistant 消息（包含工具调用）
      apiMessages.push(choice.message);

      // 处理每个工具调用
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === SEARCH_TOOL_NAME) {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[OpenAI] 搜索: ${args.query}`);

          try {
            const searchResult = await executeSearchTool(args.query);
            const formattedResult = formatSearchResults(searchResult.results);

            // 记录搜索来源
            searchResult.results.forEach(r => {
              searchSources.push({ uri: r.url, title: r.title });
            });

            // 添加工具结果
            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: formattedResult,
            });
          } catch (err) {
            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: '搜索失败，请根据已有知识生成内容。',
            });
          }
        }
      }

      onProgress?.('正在生成角色卡...', 50);
      continue;
    }

    // 没有工具调用，返回最终结果
    return {
      content: choice.message.content,
      searchSources: searchSources.length > 0 ? searchSources : undefined,
    };
  }

  throw new Error('Tool calling 循环超过最大次数');
}

// ============== Claude API (支持 Tool Calling) ==============

async function callClaudeWithTools(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean,
  onProgress?: (text: string, value: number) => void
): Promise<APIResponse> {
  const url = getProxyUrl('claude', '/v1/messages');
  const searchSources: SearchSource[] = [];

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiMessages: any[] = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role,
      content: m.content,
    }));

  const maxIterations = 5;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const requestBody: Record<string, unknown> = {
      model: settings.model,
      max_tokens: 8192,
      system: systemMessage,
      messages: apiMessages,
    };

    if (enableSearch) {
      requestBody.tools = CLAUDE_TOOLS;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API 调用失败');
    }

    const data = await response.json();

    // 检查是否有工具调用
    if (data.stop_reason === 'tool_use') {
      onProgress?.('正在搜索资料...', 30);

      // 添加 assistant 消息
      apiMessages.push({
        role: 'assistant',
        content: data.content,
      });

      // 处理工具调用
      const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

      for (const block of data.content) {
        if (block.type === 'tool_use' && block.name === SEARCH_TOOL_NAME) {
          console.log(`[Claude] 搜索: ${block.input.query}`);

          try {
            const searchResult = await executeSearchTool(block.input.query);
            const formattedResult = formatSearchResults(searchResult.results);

            searchResult.results.forEach(r => {
              searchSources.push({ uri: r.url, title: r.title });
            });

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: formattedResult,
            });
          } catch (err) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: '搜索失败，请根据已有知识生成内容。',
            });
          }
        }
      }

      apiMessages.push({
        role: 'user',
        content: toolResults,
      });

      onProgress?.('正在生成角色卡...', 50);
      continue;
    }

    // 没有工具调用，返回最终结果
    const textBlock = data.content.find((b: { type: string }) => b.type === 'text');
    return {
      content: textBlock?.text || '',
      searchSources: searchSources.length > 0 ? searchSources : undefined,
    };
  }

  throw new Error('Tool calling 循环超过最大次数');
}

// ============== Gemini API (原生 Google Search) ==============

async function callGeminiWithSearch(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean
): Promise<APIResponse> {
  console.log(`[Gemini] 开始调用，搜索模式: ${enableSearch ? '开启' : '关闭'}`);

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  const requestBody: Record<string, unknown> = {
    contents,
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: enableSearch ? 'text/plain' : 'application/json',
    },
  };

  if (enableSearch) {
    requestBody.tools = [{ googleSearch: {} }];
    console.log('[Gemini] 已添加 Google Search Grounding 工具');
  }

  const url = getProxyUrl('gemini', `/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API 调用失败');
  }

  const data = await response.json();
  const candidate = data.candidates[0];

  // 检查是否使用了搜索
  let searchSources: SearchSource[] | undefined;
  if (candidate.groundingMetadata) {
    console.log('[Gemini] ✅ 使用了 Google Search Grounding');
    console.log('[Gemini] groundingMetadata:', candidate.groundingMetadata);

    if (candidate.groundingMetadata.groundingChunks) {
      const sources = candidate.groundingMetadata.groundingChunks
        .filter((chunk: { web?: { uri: string; title: string } }) => chunk.web)
        .map((chunk: { web: { uri: string; title: string } }) => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        }));
      searchSources = sources;
      console.log(`[Gemini] 搜索来源 (${sources.length} 条):`, sources);
    }

    if (candidate.groundingMetadata.searchEntryPoint?.renderedContent) {
      console.log('[Gemini] 搜索入口:', candidate.groundingMetadata.searchEntryPoint);
    }
  } else {
    console.log('[Gemini] ❌ 未使用搜索（无 groundingMetadata）');
  }

  return {
    content: candidate.content.parts[0].text,
    searchSources,
  };
}

// ============== Deepseek API (支持 Tool Calling，OpenAI 兼容) ==============

async function callDeepseekWithTools(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean,
  onProgress?: (text: string, value: number) => void
): Promise<APIResponse> {
  const url = getProxyUrl('deepseek', '/chat/completions');
  const searchSources: SearchSource[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiMessages: any[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const maxIterations = 5;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const requestBody: Record<string, unknown> = {
      model: settings.model,
      messages: apiMessages,
      temperature: 0.7,
    };

    if (enableSearch && iteration === 1) {
      requestBody.tools = OPENAI_TOOLS;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Deepseek API 调用失败');
    }

    const data = await response.json();
    const choice = data.choices[0];

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      onProgress?.('正在搜索资料...', 30);
      apiMessages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === SEARCH_TOOL_NAME) {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[Deepseek] 搜索: ${args.query}`);

          try {
            const searchResult = await executeSearchTool(args.query);
            const formattedResult = formatSearchResults(searchResult.results);

            searchResult.results.forEach(r => {
              searchSources.push({ uri: r.url, title: r.title });
            });

            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: formattedResult,
            });
          } catch (err) {
            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: '搜索失败，请根据已有知识生成内容。',
            });
          }
        }
      }

      onProgress?.('正在生成角色卡...', 50);
      continue;
    }

    return {
      content: choice.message.content,
      searchSources: searchSources.length > 0 ? searchSources : undefined,
    };
  }

  throw new Error('Tool calling 循环超过最大次数');
}

// ============== Qwen API (支持 Tool Calling，OpenAI 兼容) ==============

async function callQwenWithTools(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean,
  onProgress?: (text: string, value: number) => void
): Promise<APIResponse> {
  const url = getProxyUrl('qwen', '/compatible-mode/v1/chat/completions');
  const searchSources: SearchSource[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiMessages: any[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const maxIterations = 5;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const requestBody: Record<string, unknown> = {
      model: settings.model,
      messages: apiMessages,
      temperature: 0.7,
    };

    if (enableSearch && iteration === 1) {
      requestBody.tools = OPENAI_TOOLS;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Qwen API 调用失败');
    }

    const data = await response.json();
    const choice = data.choices[0];

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      onProgress?.('正在搜索资料...', 30);
      apiMessages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === SEARCH_TOOL_NAME) {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[Qwen] 搜索: ${args.query}`);

          try {
            const searchResult = await executeSearchTool(args.query);
            const formattedResult = formatSearchResults(searchResult.results);

            searchResult.results.forEach(r => {
              searchSources.push({ uri: r.url, title: r.title });
            });

            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: formattedResult,
            });
          } catch (err) {
            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: '搜索失败，请根据已有知识生成内容。',
            });
          }
        }
      }

      onProgress?.('正在生成角色卡...', 50);
      continue;
    }

    return {
      content: choice.message.content,
      searchSources: searchSources.length > 0 ? searchSources : undefined,
    };
  }

  throw new Error('Tool calling 循环超过最大次数');
}

// ============== 统一的 API 调用入口 ==============

async function callAPIWithSearch(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean,
  onProgress?: (text: string, value: number) => void
): Promise<APIResponse> {
  const shouldSearch = enableSearch && settings.enableSearch && PROVIDER_CONFIGS[settings.provider].supportsSearch;

  switch (settings.provider) {
    case 'openai':
      return callOpenAIWithTools(messages, settings, shouldSearch, onProgress);
    case 'claude':
      return callClaudeWithTools(messages, settings, shouldSearch, onProgress);
    case 'gemini':
      return callGeminiWithSearch(messages, settings, shouldSearch);
    case 'deepseek':
      return callDeepseekWithTools(messages, settings, shouldSearch, onProgress);
    case 'qwen':
      return callQwenWithTools(messages, settings, shouldSearch, onProgress);
    default:
      throw new Error(`不支持的 AI 提供商: ${settings.provider}`);
  }
}

// 简单调用（不带搜索，用于测试连接等）
async function callAPISimple(
  messages: Message[],
  settings: AppSettings
): Promise<APIResponse> {
  return callAPIWithSearch(messages, settings, false);
}

// ============== 解析 JSON 响应 ==============

function parseJSONResponse(content: string): Record<string, unknown> {
  // 尝试提取 JSON 块
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonContent = jsonMatch ? jsonMatch[1] : content;

  try {
    return JSON.parse(jsonContent);
  } catch {
    // 尝试修复常见的 JSON 问题
    const fixedContent = jsonContent
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    return JSON.parse(fixedContent);
  }
}

// ============== 导出的生成函数 ==============

// 生成全部模块（支持搜索增强）
export async function generateAllModules(
  userPrompt: string,
  settings: AppSettings,
  theme: ThemeType = 'modern',
  onProgress?: (module: string, progress: number) => void,
  enableSearch: boolean = false
): Promise<GenerationResult> {
  const shouldSearch = enableSearch && settings.enableSearch && PROVIDER_CONFIGS[settings.provider].supportsSearch;

  const systemPrompt = shouldSearch ? SEARCH_SYSTEM_PROMPT : SYSTEM_PROMPT;

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `${GENERATE_ALL_PROMPT}\n\n用户描述：\n${userPrompt}\n\n选择的主题风格：${theme}`,
    },
  ];

  if (shouldSearch) {
    onProgress?.('正在搜索角色资料...', 5);
  }

  onProgress?.('正在生成角色卡...', shouldSearch ? 20 : 10);

  const response = await callAPIWithSearch(messages, settings, enableSearch, onProgress);

  onProgress?.('正在解析结果...', 90);

  const data = parseJSONResponse(response.content);

  onProgress?.('完成', 100);

  return {
    card: {
      theme,
      characterInfo: data.characterInfo as CharacterCard['characterInfo'],
      persona: data.persona as CharacterCard['persona'],
      adversityHandling: data.adversityHandling as CharacterCard['adversityHandling'],
      plotSetting: data.plotSetting as CharacterCard['plotSetting'],
      outputSetting: data.outputSetting as CharacterCard['outputSetting'],
      sampleDialogue: data.sampleDialogue as CharacterCard['sampleDialogue'],
      miniTheater: data.miniTheater as CharacterCard['miniTheater'],
      opening: data.opening as CharacterCard['opening'],
    },
    searchSources: response.searchSources,
  };
}

// 分步生成 - 基础模块
export async function generateBasicModules(
  userPrompt: string,
  settings: AppSettings,
  theme: ThemeType = 'modern'
): Promise<Partial<CharacterCard>> {
  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请根据以下描述，先生成角色的基础信息。

${MODULE_PROMPTS.characterInfo}

${MODULE_PROMPTS.persona}

用户描述：
${userPrompt}

请返回 JSON 格式：
{
  "characterInfo": { ... },
  "persona": { ... }
}`,
    },
  ];

  const response = await callAPISimple(messages, settings);
  const data = parseJSONResponse(response.content);

  return {
    theme,
    characterInfo: data.characterInfo as CharacterCard['characterInfo'],
    persona: data.persona as CharacterCard['persona'],
  };
}

// 分步生成 - 继续生成其他模块
export async function generateRemainingModules(
  userPrompt: string,
  existingCard: Partial<CharacterCard>,
  targetModules: string[],
  settings: AppSettings
): Promise<Partial<CharacterCard>> {
  const existingContext = JSON.stringify({
    characterInfo: existingCard.characterInfo,
    persona: existingCard.persona,
  }, null, 2);

  const modulePrompts = targetModules
    .map(key => MODULE_PROMPTS[key as keyof typeof MODULE_PROMPTS])
    .join('\n\n');

  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `基于已有的角色设定，继续生成其他模块。

已有设定：
${existingContext}

原始描述：
${userPrompt}

请生成以下模块：
${modulePrompts}

请返回 JSON 格式，只包含新生成的模块。`,
    },
  ];

  const response = await callAPISimple(messages, settings);
  const data = parseJSONResponse(response.content);

  return data as Partial<CharacterCard>;
}

// AI 生成自定义风格模板 - 遵循 immersive-ui Skill 规范
const STYLE_GENERATION_PROMPT = `你是一个专业的沉浸式对话 UI 设计师，需要根据角色特点生成符合 immersive-dialogue-ui 规范的完整样式系统。

## 设计规范

### 必须使用的 CSS 类名
- \`.scene-card\` - 场景卡片容器
- \`.scene-title\` - 场景标题
- \`.scene-info\` - 场景信息行（时间、地点、氛围）
- \`.scene-desc\` - 场景描述
- \`.dialogue\` - 对话容器
- \`.dialogue .speaker\` - 说话者名称
- \`.divider\` - 分隔线

### 配色方案参考（6种预设主题特征）
1. **cyberpunk 赛博朋克**: 霓虹青#00f5ff + 洋红#ff00ff, 深空背景#0a0a0f, 发光边框, 故障动画
2. **ancient-chinese 古风水墨**: 赭石#8b7355 + 墨绿#2f4f4f, 宣纸米#f5f5dc, 水墨渐变, 印章装饰
3. **modern-minimal 现代简约**: 纯黑#1a1a1a, 纯白#ffffff, 大留白, 无衬线字体
4. **cozy-warm 温馨暖调**: 珊瑚橙#ff9966, 奶油白#fff8f0, 圆角, 柔和阴影
5. **dark-gothic 暗黑哥特**: 暗红#8b0000, 深黑#0d0d0d, 金色点缀, 哥特字体
6. **pastel-cute 粉彩可爱**: 粉红#ffb3ba, 天蓝#bae1ff, 超圆角, 可爱装饰

### 设计要求
1. 根据角色气质创造**独特的新风格**，不要直接复制预设主题
2. 配色要有主色、辅色、强调色、背景色、文字色
3. 正文模板和状态栏模板必须保持视觉一致性（使用相近的背景色、边框风格）
4. 可使用渐变、阴影、圆角、动画等 CSS 效果
5. 可使用 emoji 或 Unicode 符号（如 ◈ ◆ ✿ ♡）增强视觉效果
6. 使用内联 style 属性（因为会嵌入到 Mufy 平台）

## 输出格式

请返回 JSON 格式：
\`\`\`json
{
  "styleName": "风格名称（2-4个字，如：暗夜玫瑰、冰雪童话、星海迷雾）",
  "styleDescription": "简短描述这个风格的特点（10-20字）",
  "colorScheme": {
    "primary": "#主色调",
    "secondary": "#辅助色",
    "background": "#背景色",
    "text": "#文字色",
    "accent": "#强调色"
  },
  "themeCSS": "完整的CSS代码，使用 .scene-card .scene-title 等类名",
  "sceneInfo": "<div style='...'>包含 [时间] [地点] [氛围] 占位符的内联样式 HTML</div>",
  "mainContent": "<div style='...'>包含 [正文内容] 占位符的内联样式 HTML</div>",
  "statusBar": "<div style='...'>包含 [角色名] [衣着描述] [动作描述] [神态描述] [内心独白] 占位符的内联样式 HTML</div>",
  "sceneCard": "<div style='...'>包含 [场景标题] [对话内容] [动作描写] 占位符的内联样式 HTML</div>"
}
\`\`\`

### themeCSS 示例结构
themeCSS 应包含完整的 CSS 样式块，例如：
\`\`\`css
/* ═══ [风格名称]主题 ═══ */
.scene-card {
  background: linear-gradient(...);
  border: 1px solid #xxx;
  padding: 20px;
  margin: 16px 0;
  font-family: 'xxx', sans-serif;
  color: #xxx;
}
.scene-title { ... }
.scene-info { ... }
.scene-desc { ... }
.dialogue { ... }
.dialogue .speaker { ... }
\`\`\``;

export async function generateCustomStyle(
  characterInfo: {
    name: string;
    positioning: string;
    worldBackground?: string;
    personality?: string;
  },
  settings: AppSettings
): Promise<CustomTemplates> {
  console.log('[AI Style] 开始生成自定义风格...');
  console.log('[AI Style] 角色信息:', characterInfo);

  const messages: Message[] = [
    { role: 'system', content: STYLE_GENERATION_PROMPT },
    {
      role: 'user',
      content: `请为以下角色设计独特的视觉风格：

角色名称：${characterInfo.name}
角色定位：${characterInfo.positioning}
${characterInfo.worldBackground ? `世界观背景：${characterInfo.worldBackground}` : ''}
${characterInfo.personality ? `性格特点：${characterInfo.personality}` : ''}

请根据角色的气质和世界观，创造一个独特的视觉风格（不要直接使用预设的6种主题，要创新）。
输出完整的 JSON 格式，包含 themeCSS、colorScheme 和 4 个 HTML 模板。`,
    },
  ];

  const response = await callAPISimple(messages, settings);
  const data = parseJSONResponse(response.content);

  console.log('[AI Style] 生成的风格:', data.styleName);
  console.log('[AI Style] 配色方案:', data.colorScheme);

  // 默认配色方案
  const defaultColorScheme = {
    primary: '#666666',
    secondary: '#999999',
    background: '#ffffff',
    text: '#333333',
    accent: '#007aff',
  };

  return {
    styleName: (data.styleName as string) || '自定义风格',
    styleDescription: (data.styleDescription as string) || '',
    themeCSS: (data.themeCSS as string) || '',
    sceneInfo: (data.sceneInfo as string) || '',
    mainContent: (data.mainContent as string) || '',
    statusBar: (data.statusBar as string) || '',
    sceneCard: (data.sceneCard as string) || '',
    colorScheme: (data.colorScheme as CustomTemplates['colorScheme']) || defaultColorScheme,
  };
}

// 测试 API 连接
export async function testConnection(settings: AppSettings): Promise<boolean> {
  try {
    const messages: Message[] = [
      { role: 'user', content: '请回复 "ok"' },
    ];

    const response = await callAPISimple(messages, settings);
    return response.content.toLowerCase().includes('ok');
  } catch {
    return false;
  }
}
