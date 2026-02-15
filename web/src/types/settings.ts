// AI 服务提供商
export type AIProvider = 'openai' | 'claude' | 'gemini' | 'deepseek' | 'qwen';

// 提供商配置信息
export interface ProviderConfig {
  name: string;
  label: string;
  defaultBaseUrl: string;
  supportsSearch: boolean;
  models: string[];
}

// 提供商配置 (2025-2026 最新模型)
// supportsSearch: 是否支持搜索增强（通过 Tool Calling 或原生搜索）
export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'openai',
    label: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    supportsSearch: true, // 通过 Tool Calling
    models: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'o3',
      'o4-mini',
      'gpt-4o',
      'gpt-4o-mini',
    ],
  },
  claude: {
    name: 'claude',
    label: 'Claude (Anthropic)',
    defaultBaseUrl: 'https://api.anthropic.com',
    supportsSearch: true, // 通过 Tool Calling
    models: [
      'claude-opus-4-5-20251101',
      'claude-sonnet-4-5-20251101',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
  },
  gemini: {
    name: 'gemini',
    label: 'Gemini (Google)',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    supportsSearch: true, // 原生 Google Search Grounding
    models: [
      'gemini-3-pro-preview',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
    ],
  },
  deepseek: {
    name: 'deepseek',
    label: 'Deepseek',
    defaultBaseUrl: 'https://api.deepseek.com',
    supportsSearch: true, // 通过 Tool Calling
    models: [
      'deepseek-chat',
      'deepseek-reasoner',
    ],
  },
  qwen: {
    name: 'qwen',
    label: 'Qwen (阿里云)',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    supportsSearch: true, // 通过 Tool Calling
    models: [
      'qwen3-235b-a22b',
      'qwen-max',
      'qwen-plus',
      'qwen-turbo',
      'qwen2.5-72b-instruct',
    ],
  },
};

// 应用设置
export interface AppSettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  enableSearch: boolean;
}

// 默认设置
export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'openai',
  apiKey: '',
  baseUrl: PROVIDER_CONFIGS.openai.defaultBaseUrl,
  model: 'gpt-4o',
  enableSearch: true,
};
