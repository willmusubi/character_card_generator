import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com';
const DEMO_MODEL = 'gemini-2.5-pro-preview-05-06';  // 使用最新的 Gemini 模型

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inviteCode, contents, systemInstruction, enableSearch } = req.body;

  // 验证邀请码
  const validCodes = (process.env.DEMO_INVITE_CODES || '')
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length > 0);

  if (!validCodes.includes(inviteCode?.trim())) {
    return res.status(401).json({ error: '邀请码无效或已过期' });
  }

  // 获取服务端 API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Demo Generate] GEMINI_API_KEY 环境变量未配置');
    return res.status(500).json({ error: '服务暂时不可用' });
  }

  console.log(`[Demo Generate] 开始生成，搜索模式: ${enableSearch ? '开启' : '关闭'}`);

  // 构建 Gemini API 请求
  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: enableSearch ? 'text/plain' : 'application/json',
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = systemInstruction;
  }

  if (enableSearch) {
    requestBody.tools = [{ googleSearch: {} }];
  }

  const url = `${GEMINI_API_URL}/v1beta/models/${DEMO_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Demo Generate] Gemini API 错误:', errorText);
      return res.status(response.status).json({
        error: `AI 服务调用失败: ${response.status}`,
      });
    }

    const data = await response.json();

    // 检查是否有 candidates
    if (!data.candidates || data.candidates.length === 0) {
      if (data.promptFeedback?.blockReason) {
        return res.status(400).json({
          error: `内容被安全过滤: ${data.promptFeedback.blockReason}`,
        });
      }
      return res.status(500).json({ error: 'AI 返回空响应，请重试' });
    }

    const candidate = data.candidates[0];

    // 检查是否被安全过滤
    if (candidate.finishReason === 'SAFETY') {
      return res.status(400).json({
        error: '内容被安全过滤，请修改输入后重试',
      });
    }

    // 提取搜索来源
    let searchSources;
    if (candidate.groundingMetadata?.groundingChunks) {
      searchSources = candidate.groundingMetadata.groundingChunks
        .filter((chunk: { web?: { uri: string; title: string } }) => chunk.web)
        .map((chunk: { web: { uri: string; title: string } }) => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        }));
      console.log(`[Demo Generate] 搜索来源: ${searchSources.length} 条`);
    }

    // 返回结果
    const content = candidate.content?.parts?.[0]?.text || '';

    console.log(`[Demo Generate] 生成完成，内容长度: ${content.length}`);

    return res.status(200).json({
      content,
      searchSources,
      model: DEMO_MODEL,
    });
  } catch (error) {
    console.error('[Demo Generate] 请求失败:', error);
    return res.status(500).json({
      error: '请求失败，请稍后重试',
    });
  }
}
