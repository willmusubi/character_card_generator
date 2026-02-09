// Tool Calling 支持 - 为各模型提供统一的工具调用接口

import { AIProvider } from '../types/settings';

// 搜索工具定义
export const SEARCH_TOOL_NAME = 'web_search';
export const SEARCH_TOOL_DESCRIPTION = '搜索网络获取角色的官方资料、背景故事、性格特点等信息。对于已知 IP 角色（动漫、游戏、小说、历史人物等），请使用此工具获取准确信息。';

// 搜索结果类型
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  source: string;
}

// 工具调用类型
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// OpenAI/Deepseek/Qwen 格式的工具定义
export const OPENAI_TOOLS = [
  {
    type: 'function',
    function: {
      name: SEARCH_TOOL_NAME,
      description: SEARCH_TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词，例如角色名称、作品名称等',
          },
        },
        required: ['query'],
      },
    },
  },
];

// Claude 格式的工具定义
export const CLAUDE_TOOLS = [
  {
    name: SEARCH_TOOL_NAME,
    description: SEARCH_TOOL_DESCRIPTION,
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词，例如角色名称、作品名称等',
        },
      },
      required: ['query'],
    },
  },
];

// Gemini 格式的工具定义（Gemini 有原生 Google Search，但也支持自定义函数）
export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: SEARCH_TOOL_NAME,
        description: SEARCH_TOOL_DESCRIPTION,
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索关键词，例如角色名称、作品名称等',
            },
          },
          required: ['query'],
        },
      },
    ],
  },
];

// 获取指定提供商的工具定义
export function getToolsForProvider(provider: AIProvider): unknown[] | undefined {
  switch (provider) {
    case 'openai':
    case 'deepseek':
    case 'qwen':
      return OPENAI_TOOLS;
    case 'claude':
      return CLAUDE_TOOLS;
    case 'gemini':
      // Gemini 使用原生 Google Search，返回 undefined
      return undefined;
    default:
      return undefined;
  }
}

// 从 OpenAI 响应中提取工具调用
export function extractOpenAIToolCalls(response: {
  choices: Array<{
    message: {
      tool_calls?: Array<{
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
}): ToolCall[] | null {
  const choice = response.choices[0];
  if (choice.finish_reason !== 'tool_calls' || !choice.message.tool_calls) {
    return null;
  }

  return choice.message.tool_calls.map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: JSON.parse(tc.function.arguments),
  }));
}

// 从 Claude 响应中提取工具调用
export function extractClaudeToolCalls(response: {
  content: Array<{
    type: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  }>;
  stop_reason: string;
}): ToolCall[] | null {
  if (response.stop_reason !== 'tool_use') {
    return null;
  }

  const toolUses = response.content.filter((c) => c.type === 'tool_use');
  if (toolUses.length === 0) {
    return null;
  }

  return toolUses.map((tu) => ({
    id: tu.id || '',
    name: tu.name || '',
    arguments: tu.input || {},
  }));
}

// 从 Gemini 响应中提取工具调用
export function extractGeminiToolCalls(response: {
  candidates: Array<{
    content: {
      parts: Array<{
        functionCall?: {
          name: string;
          args: Record<string, unknown>;
        };
      }>;
    };
  }>;
}): ToolCall[] | null {
  const parts = response.candidates[0]?.content?.parts || [];
  const functionCalls = parts.filter((p) => p.functionCall);

  if (functionCalls.length === 0) {
    return null;
  }

  return functionCalls.map((p, index) => ({
    id: `call_${index}`,
    name: p.functionCall!.name,
    arguments: p.functionCall!.args,
  }));
}

// 执行搜索工具
export async function executeSearchTool(query: string): Promise<SearchResponse> {
  const response = await fetch('http://localhost:3001/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, maxResults: 5 }),
  });

  if (!response.ok) {
    throw new Error('搜索请求失败');
  }

  return response.json();
}

// 格式化搜索结果为文本
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '未找到相关搜索结果。';
  }

  return results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n来源: ${r.url}`)
    .join('\n\n');
}

// 构建 OpenAI 格式的工具结果消息
export function buildOpenAIToolResultMessage(
  toolCallId: string,
  result: string
): { role: 'tool'; tool_call_id: string; content: string } {
  return {
    role: 'tool',
    tool_call_id: toolCallId,
    content: result,
  };
}

// 构建 Claude 格式的工具结果消息
export function buildClaudeToolResultMessage(
  toolUseId: string,
  result: string
): { role: 'user'; content: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> } {
  return {
    role: 'user',
    content: [
      {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: result,
      },
    ],
  };
}

// 构建 Gemini 格式的工具结果消息
export function buildGeminiToolResultPart(
  functionName: string,
  result: string
): { functionResponse: { name: string; response: { result: string } } } {
  return {
    functionResponse: {
      name: functionName,
      response: { result },
    },
  };
}
