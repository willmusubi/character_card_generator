import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET_URL = 'https://generativelanguage.googleapis.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 获取路径参数
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path || '';

  // 构建目标 URL（保留 query string）
  const url = new URL(`/${pathStr}`, TARGET_URL);
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && typeof value === 'string') {
      url.searchParams.set(key, value);
    }
  });

  console.log(`[Gemini Proxy] ${req.method} ${url.toString().substring(0, 100)}...`);

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    console.log(`[Gemini Proxy] Response status: ${response.status}`);

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(data);
  } catch (error) {
    console.error('[Gemini Proxy] Error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}
