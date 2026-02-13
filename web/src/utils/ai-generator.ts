import { AppSettings, PROVIDER_CONFIGS } from '../types/settings';
import { CharacterCard, ThemeType, CustomTemplates, WordCountRange } from '../types/character-card';
import {
  MultiCharacterCard,
  MainCharacter,
  createEmptyMultiCharacterCard,
  createEmptyMainCharacter,
} from '../types/multi-character-card';
import { SYSTEM_PROMPT, SEARCH_SYSTEM_PROMPT, GENERATE_ALL_PROMPT, MODULE_PROMPTS } from '../data/ai-prompts';

// 字数范围设置
export interface WordCountSettings {
  replyLength: WordCountRange;
  opening: WordCountRange;
  miniTheater: WordCountRange;
}
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
    const errorText = await response.text();
    console.error('[Gemini] API 错误响应:', errorText);
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.error?.message || error.message || `Gemini API 调用失败: ${response.status}`);
    } catch (parseError) {
      throw new Error(`Gemini API 调用失败: ${response.status} - ${errorText.substring(0, 200)}`);
    }
  }

  const data = await response.json();

  // 检查是否有 candidates
  if (!data.candidates || data.candidates.length === 0) {
    console.error('[Gemini] 无效响应，没有 candidates:', data);
    // 检查是否有安全过滤
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini 内容被安全过滤: ${data.promptFeedback.blockReason}`);
    }
    throw new Error('Gemini 返回空响应，请重试');
  }

  const candidate = data.candidates[0];

  // 检查是否被安全过滤
  if (candidate.finishReason === 'SAFETY') {
    console.error('[Gemini] 内容被安全过滤:', candidate.safetyRatings);
    throw new Error('内容被 Gemini 安全过滤，请修改输入后重试');
  }

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

  // 检查响应内容是否存在
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    console.error('[Gemini] 无效的响应内容:', candidate);
    throw new Error('Gemini 返回了空内容，请重试');
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
  enableSearch: boolean = false,
  wordCountSettings?: WordCountSettings
): Promise<GenerationResult> {
  const shouldSearch = enableSearch && settings.enableSearch && PROVIDER_CONFIGS[settings.provider].supportsSearch;

  const systemPrompt = shouldSearch ? SEARCH_SYSTEM_PROMPT : SYSTEM_PROMPT;

  // 构建字数要求说明
  const wordCountInstructions = wordCountSettings
    ? `\n\n**【最重要】字数要求**
请严格遵守以下字数要求（统计纯文本字数，不包括HTML标签、CSS样式代码）：

1. **outputSetting.replyLength** = "${wordCountSettings.replyLength.min}-${wordCountSettings.replyLength.max}字"

2. **opening 开场设计**：纯文本内容总计 ${wordCountSettings.opening.min}-${wordCountSettings.opening.max} 字
   - sceneDescription（场景描述）：至少 ${Math.floor(wordCountSettings.opening.min * 0.3)} 字，详细描写环境、氛围
   - firstDialogue（开场白）：至少 ${Math.floor(wordCountSettings.opening.min * 0.3)} 字，体现角色性格
   - innerThought（内心独白）：至少 ${Math.floor(wordCountSettings.opening.min * 0.2)} 字，展现角色心理

3. **miniTheater 小剧场**：每个场景 ${wordCountSettings.miniTheater.min}-${wordCountSettings.miniTheater.max} 字
   - scene1Dialogue + scene1Action：总计 ${wordCountSettings.miniTheater.min}-${wordCountSettings.miniTheater.max} 字
   - scene2Dialogue + scene2Action：总计 ${wordCountSettings.miniTheater.min}-${wordCountSettings.miniTheater.max} 字
   - scene3Dialogue + scene3Action：总计 ${wordCountSettings.miniTheater.min}-${wordCountSettings.miniTheater.max} 字

**重要提醒**：
- 请务必生成足够丰富的内容，每个场景都要有详细的对话和动作描写
- 不要因为字数限制而省略内容，宁可略超字数也不要内容过少
- 对话和动作描写要具体生动，避免空洞简短的表述`
    : '';

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `${GENERATE_ALL_PROMPT}\n\n用户描述：\n${userPrompt}\n\n选择的主题风格：${theme}${wordCountInstructions}`,
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

  // 合并字数范围设置到生成的数据中
  const generatedOutputSetting = data.outputSetting as CharacterCard['outputSetting'];
  const outputSetting: CharacterCard['outputSetting'] = {
    replyLength: wordCountSettings
      ? `${wordCountSettings.replyLength.min}-${wordCountSettings.replyLength.max}字`
      : generatedOutputSetting?.replyLength || '200-400字',
    replyLengthRange: wordCountSettings?.replyLength || { min: 200, max: 400 },
    languageStyle: generatedOutputSetting?.languageStyle || '',
    perspective: generatedOutputSetting?.perspective || '第一人称',
    actionFormat: generatedOutputSetting?.actionFormat || '使用 *动作* 格式',
    moduleRules: generatedOutputSetting?.moduleRules || '',
  };

  const generatedMiniTheater = data.miniTheater as CharacterCard['miniTheater'];
  const miniTheater: CharacterCard['miniTheater'] = {
    ...generatedMiniTheater,
    wordCountRange: wordCountSettings?.miniTheater || { min: 200, max: 400 },
  };

  const generatedOpening = data.opening as CharacterCard['opening'];
  const opening: CharacterCard['opening'] = {
    ...generatedOpening,
    wordCountRange: wordCountSettings?.opening || { min: 300, max: 500 },
  };

  // 处理角色信息（包含新字段）
  const generatedCharacterInfo = data.characterInfo as CharacterCard['characterInfo'];
  const characterInfo: CharacterCard['characterInfo'] = {
    ...generatedCharacterInfo,
    // 确保新字段有默认值
    height: generatedCharacterInfo?.height || '',
    weight: generatedCharacterInfo?.weight || '',
    zodiac: generatedCharacterInfo?.zodiac || '',
    mbti: generatedCharacterInfo?.mbti || '',
    race: generatedCharacterInfo?.race || '',
    occupation: generatedCharacterInfo?.occupation || '',
  };

  // 处理人设（包含新字段）
  const generatedPersona = data.persona as CharacterCard['persona'];
  const persona: CharacterCard['persona'] = {
    ...generatedPersona,
    // 确保新字段有默认值
    personalityTags: generatedPersona?.personalityTags || [],
    lifeStory: generatedPersona?.lifeStory || { childhood: '', growth: '', turning: '' },
    quotes: generatedPersona?.quotes || [],
    interview: generatedPersona?.interview || '',
    // 确保 languageExamples 存在
    languageExamples: generatedPersona?.languageExamples || { daily: '', happy: '', angry: '', flirty: '' },
  };

  // 处理开场白扩展（新模块）
  const generatedOpeningExtension = data.openingExtension as CharacterCard['openingExtension'];
  const openingExtension: CharacterCard['openingExtension'] = generatedOpeningExtension ? {
    cardSummary: generatedOpeningExtension.cardSummary || '',
    relationshipSummary: {
      characterLabel: generatedOpeningExtension.relationshipSummary?.characterLabel || '',
      userLabel: generatedOpeningExtension.relationshipSummary?.userLabel || '',
    },
    worldBackgroundDetail: generatedOpeningExtension.worldBackgroundDetail || '',
  } : {
    cardSummary: '',
    relationshipSummary: { characterLabel: '', userLabel: '' },
    worldBackgroundDetail: '',
  };

  // 处理输出模块
  const generatedOutputModules = data.outputModules as CharacterCard['outputModules'];
  const outputModules: CharacterCard['outputModules'] = generatedOutputModules ? {
    characterStatus: {
      attire: generatedOutputModules.characterStatus?.attire || '',
      action: generatedOutputModules.characterStatus?.action || '',
      expression: generatedOutputModules.characterStatus?.expression || '',
      affection: generatedOutputModules.characterStatus?.affection || '50/100',
      innerOS: generatedOutputModules.characterStatus?.innerOS || '',
      relationship: generatedOutputModules.characterStatus?.relationship || '',
      todoList: generatedOutputModules.characterStatus?.todoList || [],
      randomContent: generatedOutputModules.characterStatus?.randomContent || '',
    },
    memoryArea: {
      hotSearch: generatedOutputModules.memoryArea?.hotSearch || [],
      shortTermMemory: generatedOutputModules.memoryArea?.shortTermMemory || '',
      longTermMemory: generatedOutputModules.memoryArea?.longTermMemory || '',
      danmaku: generatedOutputModules.memoryArea?.danmaku || [],
    },
    enablePhoneInterface: generatedOutputModules.enablePhoneInterface || false,
    enableMusicPlayer: generatedOutputModules.enableMusicPlayer || false,
  } : undefined;

  return {
    card: {
      theme,
      characterInfo,
      persona,
      adversityHandling: data.adversityHandling as CharacterCard['adversityHandling'] || {
        inappropriateRequest: '',
        insufficientInfo: '',
        emotionalAttack: '',
        beyondCapability: '',
      },
      plotSetting: data.plotSetting as CharacterCard['plotSetting'] || {
        worldBackground: '',
        establishedFacts: '',
        unchangeableRules: '',
        currentPhase: '',
      },
      outputSetting,
      sampleDialogue: data.sampleDialogue as CharacterCard['sampleDialogue'] || {
        dialogue1User: '',
        dialogue1Response: '',
        dialogue2User: '',
        dialogue2Response: '',
        styleNotes: '',
      },
      miniTheater,
      opening,
      openingExtension,
      outputModules,
      // 多主角和副角色需要单独生成，这里保持空数组
      additionalMainCharacters: [],
      supportingCharacters: [],
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

// 生成多主角（用于多人卡场景）
export async function generateAdditionalMainCharacters(
  mainCharacterInfo: CharacterCard['characterInfo'],
  worldBackground: string,
  count: number,
  settings: AppSettings
): Promise<CharacterCard['additionalMainCharacters']> {
  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `基于主角设定，生成 ${count} 个额外的主角角色（用于多人卡场景）。

主角信息：
- 名称：${mainCharacterInfo.name}
- 定位：${mainCharacterInfo.positioning}
- 与用户关系：${mainCharacterInfo.relationshipWithUser}

世界观背景：${worldBackground || '现代都市'}

${MODULE_PROMPTS.additionalMainCharacters}

请返回 JSON 格式：
{
  "additionalMainCharacters": [
    {
      "id": "char_xxx",
      "name": "",
      "age": "",
      "height": "",
      "weight": "",
      "zodiac": "",
      "mbti": "",
      "identity": "",
      "race": "",
      "appearance": "",
      "personalityTags": [],
      "personalityAnalysis": "",
      "lifeStory": { "childhood": "", "growth": "", "turning": "" },
      "quotes": [],
      "relationToUser": ""
    }
  ]
}

注意：
1. 每个角色要有独特的性格和定位
2. 角色之间的关系要有互动性
3. 与主角的关系要明确`,
    },
  ];

  const response = await callAPISimple(messages, settings);
  const data = parseJSONResponse(response.content);

  return (data.additionalMainCharacters as CharacterCard['additionalMainCharacters']) || [];
}

// 生成副角色（精简版）
export async function generateSupportingCharacters(
  mainCharacterInfo: CharacterCard['characterInfo'],
  worldBackground: string,
  count: number,
  settings: AppSettings
): Promise<CharacterCard['supportingCharacters']> {
  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `基于主角设定，生成 ${count} 个副角色（出场有限的配角）。

主角信息：
- 名称：${mainCharacterInfo.name}
- 定位：${mainCharacterInfo.positioning}

世界观背景：${worldBackground || '现代都市'}

${MODULE_PROMPTS.supportingCharacters}

请返回 JSON 格式：
{
  "supportingCharacters": [
    {
      "id": "support_xxx",
      "name": "",
      "identity": "",
      "appearance": "",
      "quote": "",
      "relationToMain": ""
    }
  ]
}

注意：
1. 副角色只需要精简信息
2. 个性语要能体现角色特点
3. 与主角的关系标签要简洁明了（如：唯一能制住他的人、损友、经纪人等）`,
    },
  ];

  const response = await callAPISimple(messages, settings);
  const data = parseJSONResponse(response.content);

  return (data.supportingCharacters as CharacterCard['supportingCharacters']) || [];
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

// ============== 多角色卡生成 ==============

// 多角色生成结果类型
export interface MultiCharacterGenerationResult {
  card: MultiCharacterCard;
  searchSources?: SearchSource[];
}

// 检测用户输入是否包含多个角色
export function detectMultipleCharacters(prompt: string): string[] {
  // 常见的多角色连接词
  const connectors = ['和', '与', '、', '以及', '还有', '加上', '&', ',', '，'];

  // 检测 "XX和YY" 或 "XX、YY、ZZ" 模式
  for (const connector of connectors) {
    if (prompt.includes(connector)) {
      // 尝试提取角色名
      const parts = prompt.split(new RegExp(`[${connectors.join('')}]`)).map(s => s.trim()).filter(s => s);
      if (parts.length >= 2) {
        // 验证每个部分是否像角色名（至少2个字符）
        const validNames = parts.filter(p => p.length >= 2 && p.length <= 20);
        if (validNames.length >= 2) {
          return validNames;
        }
      }
    }
  }

  return [];
}

// 生成多角色卡的系统提示
const MULTI_CHARACTER_SYSTEM_PROMPT = `你是一个专业的角色卡生成助手。你的任务是根据用户的描述，为多个角色分别生成完整的角色卡数据。

## 重要原则

1. **角色独立性**：每个角色都有独立的人设、逆境处理、样例对话、小剧场
2. **全局共享**：世界背景、输出设定、开场设计是所有角色共享的
3. **关系网络**：需要定义角色之间的关系，以及每个角色与用户的关系

## 输出格式

请严格按照以下 JSON 格式输出，**每个字段都必须填写完整内容**：

\`\`\`json
{
  "cardName": "角色A & 角色B",
  "cardType": "multi",
  "plotSetting": {
    "worldBackground": "世界背景描述（详细描写这个故事发生的世界）",
    "establishedFacts": "已发生的事实（不可推翻的设定）",
    "unchangeableRules": "不可改变的规则",
    "currentPhase": "当前阶段"
  },
  "outputSetting": {
    "replyLength": "200-400字",
    "languageStyle": "语言风格",
    "perspective": "第一人称",
    "actionFormat": "使用 *动作* 格式",
    "moduleRules": ""
  },
  "opening": {
    "time": "时间",
    "location": "地点",
    "atmosphere": "氛围",
    "sceneDescription": "场景描述（至少100字）",
    "firstDialogue": "开场对话（至少50字）",
    "attire": "穿着描述",
    "action": "动作描述",
    "expression": "神态描述",
    "innerThought": "内心独白（至少30字）"
  },
  "relationshipNetwork": {
    "relationships": [
      {
        "characterId1": "char_1",
        "characterId2": "char_2",
        "labelFrom1To2": "角色1对角色2的看法",
        "labelFrom2To1": "角色2对角色1的看法",
        "relationshipType": "关系类型",
        "history": "关系历史",
        "dynamics": "当前动态"
      }
    ],
    "userRelationships": [
      {
        "characterId": "char_1",
        "labelFromUser": "用户对角色的看法",
        "labelToUser": "角色对用户的看法",
        "relationshipType": "关系类型"
      }
    ]
  },
  "mainCharacters": [
    {
      "id": "char_1",
      "isPrimaryFocus": true,
      "characterInfo": {
        "name": "角色名称",
        "gender": "性别",
        "age": "年龄",
        "positioning": "一句话角色定位",
        "relationshipWithUser": "与用户的关系",
        "coreValue": "角色能给用户带来什么",
        "useCase": "适合的使用场景",
        "height": "身高",
        "weight": "体重",
        "zodiac": "星座",
        "mbti": "MBTI类型",
        "race": "种族",
        "occupation": "职业/身份"
      },
      "persona": {
        "identity": "身份背景",
        "appearance": "详细外貌描述（至少50字）",
        "voice": "声音特点",
        "dressStyle": "穿衣风格",
        "foodPreference": "饮食偏好",
        "hobbies": "兴趣爱好",
        "personalities": "性格特点详细描述",
        "personalityTags": ["标签1", "标签2", "标签3"],
        "emotionToUser": "对用户的情感态度",
        "brief": "2-3句话的角色简介",
        "backstory": "角色背景故事",
        "lifeStory": {
          "childhood": "童年经历",
          "growth": "成长过程",
          "turning": "关键转折点"
        },
        "quotes": ["语录1", "语录2", "语录3"],
        "interview": "采访内容",
        "languageStyle": "语言风格描述",
        "languageExamples": {
          "daily": "日常说话示例",
          "happy": "开心时说话示例",
          "angry": "生气时说话示例",
          "flirty": "撒娇时说话示例"
        },
        "attitudeToUser": "对用户的态度",
        "dialogueRequirements": "台词要求",
        "boundaries": "行为边界（永远不会做的事）"
      },
      "adversityHandling": {
        "inappropriateRequest": "用户请求不当内容时的回应",
        "insufficientInfo": "信息不足时的回应",
        "emotionalAttack": "用户情绪激动时的回应",
        "beyondCapability": "超出能力范围时的回应"
      },
      "sampleDialogue": {
        "dialogue1User": "用户说的第一句话",
        "dialogue1Response": "角色的回复（至少50字，体现角色性格）",
        "dialogue2User": "用户说的第二句话",
        "dialogue2Response": "角色的回复（至少50字，体现角色性格）",
        "styleNotes": "文风说明"
      },
      "miniTheater": {
        "scene1Title": "场景1标题",
        "scene1Dialogue": "场景1对话内容（至少100字）",
        "scene1Action": "场景1动作描写（至少50字）",
        "scene2Title": "场景2标题",
        "scene2Dialogue": "场景2对话内容（至少100字）",
        "scene2Action": "场景2动作描写（至少50字）",
        "scene3Title": "场景3标题",
        "scene3Dialogue": "场景3对话内容（至少100字）",
        "scene3Action": "场景3动作描写（至少50字）"
      }
    }
  ],
  "secondaryCharacters": [],
  "outputModules": {
    "characterStatus": {
      "attire": "当前穿搭描述（详细）",
      "action": "当前动作",
      "expression": "神态表情",
      "affection": "50/100",
      "innerOS": "内心独白（角色此刻在想什么）",
      "relationship": "与用户的关系状态",
      "todoList": ["待办1", "待办2", "待办3"],
      "randomContent": "随机内容（梦境/回忆/备忘录，>100字，增加角色深度）"
    },
    "memoryArea": {
      "hotSearch": ["热搜1", "热搜2", "热搜3"],
      "shortTermMemory": "短期记忆（最近发生的事）",
      "longTermMemory": "长期记忆说明",
      "danmaku": ["弹幕1", "弹幕2", "弹幕3", "弹幕4"]
    },
    "enablePhoneInterface": false,
    "enableMusicPlayer": false
  }
}
\`\`\`

## 重要说明

1. **mainCharacters 数组中的每个角色都必须包含完整的 characterInfo、persona、adversityHandling、sampleDialogue、miniTheater**
2. **每个角色的所有字段都必须填写具体内容，不能为空**
3. **请为每个检测到的角色生成完整的独立数据**
4. **outputModules 是全局共享的，包含角色状态栏和记忆区，必须生成**`;

// 生成多角色卡
export async function generateMultiCharacterCard(
  userPrompt: string,
  settings: AppSettings,
  theme: ThemeType = 'modern',
  onProgress?: (module: string, progress: number) => void,
  enableSearch: boolean = false,
  wordCountSettings?: WordCountSettings
): Promise<MultiCharacterGenerationResult> {
  const shouldSearch = enableSearch && settings.enableSearch && PROVIDER_CONFIGS[settings.provider].supportsSearch;

  // 检测多角色
  const detectedCharacters = detectMultipleCharacters(userPrompt);
  const isMultiCharacter = detectedCharacters.length >= 2;

  if (!isMultiCharacter) {
    // 单角色场景，使用旧的生成逻辑并转换
    const result = await generateAllModules(
      userPrompt,
      settings,
      theme,
      onProgress,
      enableSearch,
      wordCountSettings
    );

    // 转换为 MultiCharacterCard 格式
    const multiCard = convertToMultiCharacterCard(result.card as CharacterCard, theme);

    return {
      card: multiCard,
      searchSources: result.searchSources,
    };
  }

  // 多角色场景
  onProgress?.('检测到多个角色，正在生成...', 5);

  const systemPrompt = shouldSearch ? `${MULTI_CHARACTER_SYSTEM_PROMPT}\n\n如果需要了解角色的详细信息，请使用搜索工具。` : MULTI_CHARACTER_SYSTEM_PROMPT;

  // 构建字数要求
  const wordCountInstructions = wordCountSettings
    ? `\n\n**【重要】字数要求**
- 每个角色的 opening.sceneDescription: ${wordCountSettings.opening.min}-${wordCountSettings.opening.max}字
- 每个角色的 miniTheater 每场景: ${wordCountSettings.miniTheater.min}-${wordCountSettings.miniTheater.max}字
- outputSetting.replyLength: ${wordCountSettings.replyLength.min}-${wordCountSettings.replyLength.max}字`
    : '';

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `请为以下多个角色生成完整的多人卡数据：

用户描述：${userPrompt}

检测到的角色：${detectedCharacters.join('、')}

主题风格：${theme}
${wordCountInstructions}

【极其重要】请严格按照系统提示中的 JSON 格式返回数据。

mainCharacters 数组必须包含 ${detectedCharacters.length} 个角色对象，每个角色对象必须包含以下完整模块：

1. **characterInfo** - 完整的角色基本信息（name, gender, age, positioning, relationshipWithUser, coreValue, useCase, height, weight, zodiac, mbti, race, occupation）

2. **persona** - 完整的人设（identity, appearance, voice, dressStyle, foodPreference, hobbies, personalities, personalityTags, emotionToUser, brief, backstory, lifeStory, quotes, interview, languageStyle, languageExamples, attitudeToUser, dialogueRequirements, boundaries）

3. **adversityHandling** - 逆境处理（inappropriateRequest, insufficientInfo, emotionalAttack, beyondCapability）

4. **sampleDialogue** - 样例对话（dialogue1User, dialogue1Response, dialogue2User, dialogue2Response, styleNotes）

5. **miniTheater** - 小剧场3个场景（scene1Title, scene1Dialogue, scene1Action, scene2Title, scene2Dialogue, scene2Action, scene3Title, scene3Dialogue, scene3Action）

请确保每个角色的每个字段都有具体内容，不要留空！`,
    },
  ];

  if (shouldSearch) {
    onProgress?.('正在搜索角色资料...', 10);
  }

  onProgress?.('正在生成多角色卡...', shouldSearch ? 30 : 20);

  const response = await callAPIWithSearch(messages, settings, enableSearch, onProgress);

  onProgress?.('正在解析结果...', 90);

  const data = parseJSONResponse(response.content);

  onProgress?.('完成', 100);

  // 构建完整的 MultiCharacterCard
  const multiCard = buildMultiCharacterCard(data, theme, wordCountSettings);

  return {
    card: multiCard,
    searchSources: response.searchSources,
  };
}

// 将旧版 CharacterCard 转换为 MultiCharacterCard
function convertToMultiCharacterCard(
  card: CharacterCard,
  theme: ThemeType
): MultiCharacterCard {
  const baseCard = createEmptyMultiCharacterCard();

  // 创建主角
  const mainChar = createEmptyMainCharacter();
  mainChar.isPrimaryFocus = true;
  mainChar.displayOrder = 0;
  mainChar.characterInfo = card.characterInfo;
  mainChar.persona = card.persona;
  mainChar.adversityHandling = card.adversityHandling;
  mainChar.sampleDialogue = card.sampleDialogue;
  mainChar.miniTheater = card.miniTheater;

  return {
    ...baseCard,
    id: card.id || `multicard_${Date.now()}`,
    createdAt: card.createdAt || Date.now(),
    updatedAt: Date.now(),
    cardName: card.characterInfo?.name || '未命名角色',
    cardType: 'single',
    theme,
    customTemplates: card.customTemplates,
    plotSetting: card.plotSetting || baseCard.plotSetting,
    outputSetting: card.outputSetting || baseCard.outputSetting,
    opening: card.opening || baseCard.opening,
    openingExtension: card.openingExtension || baseCard.openingExtension,
    outputModules: card.outputModules || baseCard.outputModules,
    mainCharacters: [mainChar],
    secondaryCharacters: card.supportingCharacters?.map(s => ({
      id: s.id,
      name: s.name,
      identity: s.identity,
      appearance: s.appearance,
      quote: s.quote,
      relationToMain: s.relationToMain,
    })) || [],
    relationshipNetwork: {
      relationships: [],
      userRelationships: [{
        characterId: mainChar.id,
        labelFromUser: '',
        labelToUser: card.characterInfo.relationshipWithUser,
        relationshipType: card.characterInfo.relationshipWithUser,
      }],
    },
  };
}

// 从 AI 响应构建 MultiCharacterCard
function buildMultiCharacterCard(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  theme: ThemeType,
  wordCountSettings?: WordCountSettings
): MultiCharacterCard {
  const baseCard = createEmptyMultiCharacterCard();

  // 处理主角列表
  const mainCharacters: MainCharacter[] = (data.mainCharacters || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (char: any, index: number) => {
      const baseChar = createEmptyMainCharacter();
      return {
        ...baseChar,
        id: char.id || `char_${Date.now()}_${index}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        displayOrder: index,
        isPrimaryFocus: char.isPrimaryFocus || index === 0,
        characterInfo: {
          ...baseChar.characterInfo,
          ...char.characterInfo,
        },
        persona: {
          ...baseChar.persona,
          ...char.persona,
          languageExamples: char.persona?.languageExamples || baseChar.persona.languageExamples,
          lifeStory: char.persona?.lifeStory || baseChar.persona.lifeStory,
        },
        adversityHandling: {
          ...baseChar.adversityHandling,
          ...char.adversityHandling,
        },
        sampleDialogue: {
          ...baseChar.sampleDialogue,
          ...char.sampleDialogue,
        },
        miniTheater: {
          ...baseChar.miniTheater,
          ...char.miniTheater,
          wordCountRange: wordCountSettings?.miniTheater || { min: 200, max: 400 },
        },
      };
    }
  );

  // 如果没有主角，创建一个空的
  if (mainCharacters.length === 0) {
    const emptyChar = createEmptyMainCharacter();
    emptyChar.isPrimaryFocus = true;
    mainCharacters.push(emptyChar);
  }

  // 生成卡片名称
  const cardName = data.cardName ||
    mainCharacters.map(c => c.characterInfo.name).filter(n => n).join(' & ') ||
    '未命名角色卡';

  return {
    ...baseCard,
    id: `multicard_${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cardName,
    cardType: mainCharacters.length > 1 ? 'multi' : 'single',
    theme,
    plotSetting: {
      ...baseCard.plotSetting,
      ...data.plotSetting,
    },
    outputSetting: {
      ...baseCard.outputSetting,
      ...data.outputSetting,
      replyLengthRange: wordCountSettings?.replyLength || { min: 200, max: 400 },
    },
    opening: {
      ...baseCard.opening,
      ...data.opening,
      wordCountRange: wordCountSettings?.opening || { min: 300, max: 500 },
    },
    openingExtension: data.openingExtension || baseCard.openingExtension,
    relationshipNetwork: {
      relationships: data.relationshipNetwork?.relationships || [],
      userRelationships: data.relationshipNetwork?.userRelationships || [],
    },
    outputModules: data.outputModules ? {
      characterStatus: {
        attire: data.outputModules.characterStatus?.attire || '',
        action: data.outputModules.characterStatus?.action || '',
        expression: data.outputModules.characterStatus?.expression || '',
        affection: data.outputModules.characterStatus?.affection || '50/100',
        innerOS: data.outputModules.characterStatus?.innerOS || '',
        relationship: data.outputModules.characterStatus?.relationship || '',
        todoList: data.outputModules.characterStatus?.todoList || [],
        randomContent: data.outputModules.characterStatus?.randomContent || '',
      },
      memoryArea: {
        hotSearch: data.outputModules.memoryArea?.hotSearch || [],
        shortTermMemory: data.outputModules.memoryArea?.shortTermMemory || '',
        longTermMemory: data.outputModules.memoryArea?.longTermMemory || '',
        danmaku: data.outputModules.memoryArea?.danmaku || [],
      },
      enablePhoneInterface: data.outputModules.enablePhoneInterface || false,
      enableMusicPlayer: data.outputModules.enableMusicPlayer || false,
    } : baseCard.outputModules,
    mainCharacters,
    secondaryCharacters: data.secondaryCharacters || [],
  };
}
