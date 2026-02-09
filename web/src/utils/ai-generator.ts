import { AppSettings, PROVIDER_CONFIGS } from '../types/settings';
import { CharacterCard, ThemeType } from '../types/character-card';
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
      searchSources = candidate.groundingMetadata.groundingChunks
        .filter((chunk: { web?: { uri: string; title: string } }) => chunk.web)
        .map((chunk: { web: { uri: string; title: string } }) => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        }));
      console.log(`[Gemini] 搜索来源 (${searchSources.length} 条):`, searchSources);
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
