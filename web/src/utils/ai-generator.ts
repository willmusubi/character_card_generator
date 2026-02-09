import { AppSettings, PROVIDER_CONFIGS } from '../types/settings';
import { CharacterCard, ThemeType } from '../types/character-card';
import { SYSTEM_PROMPT, SEARCH_SYSTEM_PROMPT, GENERATE_ALL_PROMPT, MODULE_PROMPTS } from '../data/ai-prompts';

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
  searchSources?: SearchSource[];  // 搜索来源（仅 Gemini Search Grounding）
}

// 后端代理服务器地址
const API_PROXY_SERVER = 'http://localhost:3001';

// 获取代理 URL
function getProxyUrl(provider: string, path: string): string {
  // 使用后端代理服务器
  return `${API_PROXY_SERVER}/api/${provider}${path}`;
}

// 调用 OpenAI API
async function callOpenAI(
  messages: Message[],
  settings: AppSettings
): Promise<APIResponse> {
  const url = getProxyUrl('openai', '/v1/chat/completions');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 调用失败');
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

// 调用 Claude API
async function callClaude(
  messages: Message[],
  settings: AppSettings
): Promise<APIResponse> {
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const url = getProxyUrl('claude', '/v1/messages');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 8192,
      system: systemMessage,
      messages: userMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API 调用失败');
  }

  const data = await response.json();
  return { content: data.content[0].text };
}

// 调用 Gemini API
async function callGemini(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean = false
): Promise<APIResponse> {
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  // 构建请求体
  const requestBody: Record<string, unknown> = {
    contents,
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  };

  // 如果启用搜索，添加 Google Search Grounding 工具
  if (enableSearch) {
    requestBody.tools = [{ googleSearch: {} }];
    // 搜索模式下不强制 JSON 输出，因为搜索结果可能影响格式
    (requestBody.generationConfig as Record<string, unknown>).responseMimeType = 'text/plain';
  }

  const url = getProxyUrl('gemini', `/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API 调用失败');
  }

  const data = await response.json();
  const candidate = data.candidates[0];

  // 提取搜索来源（如果有）
  let searchSources: SearchSource[] | undefined;
  if (candidate.groundingMetadata?.groundingChunks) {
    searchSources = candidate.groundingMetadata.groundingChunks
      .filter((chunk: { web?: { uri: string; title: string } }) => chunk.web)
      .map((chunk: { web: { uri: string; title: string } }) => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
      }));
  }

  return {
    content: candidate.content.parts[0].text,
    searchSources,
  };
}

// 调用 Deepseek API (兼容 OpenAI 格式)
async function callDeepseek(
  messages: Message[],
  settings: AppSettings
): Promise<APIResponse> {
  const url = getProxyUrl('deepseek', '/chat/completions');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Deepseek API 调用失败');
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

// 调用 Qwen API (兼容 OpenAI 格式)
async function callQwen(
  messages: Message[],
  settings: AppSettings
): Promise<APIResponse> {
  const url = getProxyUrl('qwen', '/compatible-mode/v1/chat/completions');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Qwen API 调用失败');
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

// 统一的 API 调用入口
async function callAPI(
  messages: Message[],
  settings: AppSettings,
  enableSearch: boolean = false
): Promise<APIResponse> {
  switch (settings.provider) {
    case 'openai':
      return callOpenAI(messages, settings);
    case 'claude':
      return callClaude(messages, settings);
    case 'gemini':
      // Gemini 支持搜索增强
      return callGemini(messages, settings, enableSearch && settings.enableSearch);
    case 'deepseek':
      return callDeepseek(messages, settings);
    case 'qwen':
      return callQwen(messages, settings);
    default:
      throw new Error(`不支持的 AI 提供商: ${settings.provider}`);
  }
}

// 解析 JSON 响应
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

// 生成全部模块（支持搜索增强）
export async function generateAllModules(
  userPrompt: string,
  settings: AppSettings,
  theme: ThemeType = 'modern',
  onProgress?: (module: string, progress: number) => void,
  enableSearch: boolean = false
): Promise<GenerationResult> {
  // 判断是否启用搜索（仅 Gemini 支持）
  const shouldSearch = enableSearch && settings.enableSearch && PROVIDER_CONFIGS[settings.provider].supportsSearch;

  // 使用搜索增强的系统提示词
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

  const response = await callAPI(messages, settings, shouldSearch);

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

  const response = await callAPI(messages, settings);
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

  const response = await callAPI(messages, settings);
  const data = parseJSONResponse(response.content);

  return data as Partial<CharacterCard>;
}

// 测试 API 连接
export async function testConnection(settings: AppSettings): Promise<boolean> {
  try {
    const messages: Message[] = [
      { role: 'user', content: '请回复 "ok"' },
    ];

    const response = await callAPI(messages, settings);
    return response.content.toLowerCase().includes('ok');
  } catch {
    return false;
  }
}
