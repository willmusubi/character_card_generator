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

    // 如果是错误响应，打印详细信息
    if (response.status >= 400) {
      console.error(`[Proxy] Error response body:`, data.substring(0, 500));
    }

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

// ============== 搜索 API ==============

// 使用 DuckDuckGo 搜索（通过 html.duckduckgo.com）
async function duckduckgoSearch(query, maxResults = 5) {
  try {
    // 使用 DuckDuckGo HTML 版本进行搜索
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await undiciFetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      dispatcher: proxyAgent, // 使用 VPN
    });

    const html = await response.text();

    // 简单解析搜索结果
    const results = [];
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/g;

    let match;
    const urls = [];
    const titles = [];
    const snippets = [];

    while ((match = resultRegex.exec(html)) !== null && urls.length < maxResults) {
      urls.push(match[1]);
      titles.push(match[2].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    }

    while ((match = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
      // 清理 HTML 标签
      const snippet = match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      snippets.push(snippet);
    }

    for (let i = 0; i < Math.min(urls.length, maxResults); i++) {
      results.push({
        title: titles[i] || '',
        url: urls[i] || '',
        snippet: snippets[i] || '',
      });
    }

    return results;
  } catch (error) {
    console.error('[Search] DuckDuckGo error:', error.message);
    return [];
  }
}

// 使用百度搜索（国内备用）
async function baiduSearch(query, maxResults = 5) {
  try {
    const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;

    const response = await undiciFetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // 百度不需要 VPN
    });

    const html = await response.text();

    // 简单解析百度搜索结果
    const results = [];
    // 百度的结果结构比较复杂，这里做简化处理
    const titleRegex = /<h3[^>]*class="[^"]*t[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;

    let match;
    while ((match = titleRegex.exec(html)) !== null && results.length < maxResults) {
      const title = match[2].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
      if (title) {
        results.push({
          title,
          url: match[1],
          snippet: '',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('[Search] Baidu error:', error.message);
    return [];
  }
}

// 搜索 API 端点
app.post('/api/search', async (req, res) => {
  const { query, maxResults = 5, engine = 'duckduckgo' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  console.log(`[Search] Query: "${query}" (engine: ${engine})`);

  let results;
  if (engine === 'baidu') {
    results = await baiduSearch(query, maxResults);
  } else {
    results = await duckduckgoSearch(query, maxResults);
  }

  console.log(`[Search] Found ${results.length} results`);

  res.json({
    query,
    results,
    source: engine,
  });
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
