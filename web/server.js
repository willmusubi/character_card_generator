import express from 'express';
import cors from 'cors';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const app = express();
const PORT = 3001;

// Clash VPN 代理
const VPN_PROXY = 'http://127.0.0.1:7890';
const proxyAgent = new ProxyAgent(VPN_PROXY);

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 通用的 API 转发函数
async function proxyRequest(targetUrl, req, res, useVPN = true) {
  try {
    console.log(`[Proxy] ${req.method} ${targetUrl}`);

    // 构建请求头，只保留必要的头
    const headers = {
      'Content-Type': 'application/json',
    };

    // 从原请求复制认证相关的头
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }
    if (req.headers['x-api-key']) {
      headers['x-api-key'] = req.headers['x-api-key'];
    }
    if (req.headers['anthropic-version']) {
      headers['anthropic-version'] = req.headers['anthropic-version'];
    }

    const fetchOptions = {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    };

    // 如果需要 VPN，使用 undici 的 ProxyAgent
    if (useVPN) {
      fetchOptions.dispatcher = proxyAgent;
    }

    // 使用 undici fetch
    const response = await undiciFetch(targetUrl, fetchOptions);
    const data = await response.text();

    console.log(`[Proxy] Response status: ${response.status}`);

    // 转发响应
    res.status(response.status);
    res.set('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(data);
  } catch (error) {
    console.error(`[Proxy] Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
}

// OpenAI API (需要 VPN)
app.use('/api/openai', (req, res) => {
  const path = req.url;
  const targetUrl = `https://api.openai.com${path}`;
  proxyRequest(targetUrl, req, res, true);
});

// Claude API (需要 VPN)
app.use('/api/claude', (req, res) => {
  const path = req.url;
  const targetUrl = `https://api.anthropic.com${path}`;
  proxyRequest(targetUrl, req, res, true);
});

// Gemini API (需要 VPN)
app.use('/api/gemini', (req, res) => {
  const path = req.url;
  const targetUrl = `https://generativelanguage.googleapis.com${path}`;
  proxyRequest(targetUrl, req, res, true);
});

// Deepseek API (国内，不需要 VPN)
app.use('/api/deepseek', (req, res) => {
  const path = req.url;
  const targetUrl = `https://api.deepseek.com${path}`;
  proxyRequest(targetUrl, req, res, false);
});

// Qwen API (国内，不需要 VPN)
app.use('/api/qwen', (req, res) => {
  const path = req.url;
  const targetUrl = `https://dashscope.aliyuncs.com${path}`;
  proxyRequest(targetUrl, req, res, false);
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Proxy Server running at http://localhost:${PORT}`);
  console.log(`📡 VPN Proxy: ${VPN_PROXY}\n`);
  console.log('Available endpoints:');
  console.log('  /api/openai/*   -> api.openai.com (via VPN)');
  console.log('  /api/claude/*   -> api.anthropic.com (via VPN)');
  console.log('  /api/gemini/*   -> generativelanguage.googleapis.com (via VPN)');
  console.log('  /api/deepseek/* -> api.deepseek.com (direct)');
  console.log('  /api/qwen/*     -> dashscope.aliyuncs.com (direct)');
  console.log('');
});
