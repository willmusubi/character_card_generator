import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET_URL = 'https://dashscope.aliyuncs.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 获取路径参数
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path || '';

  // 构建目标 URL
  const url = new URL(`/${pathStr}`, TARGET_URL);
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && typeof value === 'string') {
      url.searchParams.set(key, value);
    }
  });

  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 转发 Authorization header
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'] as string;
  }

  console.log(`[Qwen Proxy] ${req.method} ${url.toString().substring(0, 100)}...`);

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    console.log(`[Qwen Proxy] Response status: ${response.status}`);

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(data);
  } catch (error) {
    console.error('[Qwen Proxy] Error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}
