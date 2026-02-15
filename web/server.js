import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const app = express();
const PORT = 3001;

// Clash VPN 代理
const VPN_PROXY = 'http://127.0.0.1:7890';

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 使用 spawn + curl 发送请求（带重试）
async function curlRequest(url, method, headers, body, useVPN = true, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await curlRequestOnce(url, method, headers, body, useVPN);
      return result;
    } catch (error) {
      console.error(`[curl] 尝试 ${attempt}/${maxRetries} 失败:`, error.message);
      if (attempt < maxRetries) {
        const waitTime = attempt * 3000; // 3秒, 6秒, 9秒, 12秒
        console.log(`[curl] 等待 ${waitTime/1000}s 后重试...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}

// 单次 curl 请求
function curlRequestOnce(url, method, headers, body, useVPN = true) {
  return new Promise((resolve, reject) => {
    let tempFile = null;

    const args = [
      '-s',                    // 静默模式
      '-S',                    // 显示错误信息
      '-w', '\\n%{http_code}', // 输出 HTTP 状态码
      '--max-time', '180',     // 3分钟超时
      '--connect-timeout', '30', // 连接超时30秒
      '--http1.1',             // 强制 HTTP/1.1
      '-H', 'Connection: close', // 禁用 keep-alive
      '-X', method,
    ];

    // 使用 VPN 代理
    if (useVPN) {
      args.push('-x', VPN_PROXY);
    }

    // 添加 headers
    for (const [key, value] of Object.entries(headers)) {
      args.push('-H', `${key}: ${value}`);
    }

    // 使用临时文件传递 body（比 stdin 更稳定）
    if (body) {
      tempFile = join(tmpdir(), `curl-body-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
      writeFileSync(tempFile, body, 'utf8');
      args.push('-d', `@${tempFile}`);
    }

    args.push(url);

    const curl = spawn('curl', args);
    let stdout = '';
    let stderr = '';

    curl.stdout.on('data', (data) => { stdout += data; });
    curl.stderr.on('data', (data) => { stderr += data; });

    curl.on('close', (code) => {
      // 清理临时文件
      if (tempFile) {
        try { unlinkSync(tempFile); } catch (e) { /* ignore */ }
      }

      if (code === 0) {
        // 解析响应和状态码
        const lines = stdout.trim().split('\n');
        const statusCode = parseInt(lines.pop(), 10);
        const responseBody = lines.join('\n');
        resolve({ ok: statusCode >= 200 && statusCode < 300, status: statusCode, data: responseBody });
      } else {
        const errorMsg = stderr.trim() || `exit code ${code}`;
        reject(new Error(`curl error: ${errorMsg}`));
      }
    });

    curl.on('error', (err) => {
      if (tempFile) {
        try { unlinkSync(tempFile); } catch (e) { /* ignore */ }
      }
      reject(err);
    });
  });
}

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 通用的 API 转发函数
async function proxyRequest(targetUrl, req, res, useVPN = true) {
  const logPrefix = `[Proxy]`;

  // 构建请求头
  const headers = {
    'Content-Type': 'application/json',
  };

  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }
  if (req.headers['x-api-key']) {
    headers['x-api-key'] = req.headers['x-api-key'];
  }
  if (req.headers['anthropic-version']) {
    headers['anthropic-version'] = req.headers['anthropic-version'];
  }

  const bodyStr = req.method !== 'GET' ? JSON.stringify(req.body) : undefined;

  console.log(`${logPrefix} ${req.method} ${targetUrl.substring(0, 80)}... (${useVPN ? 'VPN/curl' : 'direct'})`);

  try {
    const result = await curlRequest(targetUrl, req.method, headers, bodyStr, useVPN);

    console.log(`${logPrefix} ✅ 成功 (status: ${result.status})`);

    // 转发响应
    res.status(result.status);
    res.set('Content-Type', 'application/json');
    res.send(result.data);
  } catch (error) {
    console.error(`${logPrefix} ❌ 失败:`, error.message);
    res.status(500).json({ error: `请求失败: ${error.message}` });
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
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const result = await curlRequest(searchUrl, 'GET', {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }, null, true);

    const html = result.data;

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

    const result = await curlRequest(searchUrl, 'GET', {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }, null, false);

    const html = result.data;

    const results = [];
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
