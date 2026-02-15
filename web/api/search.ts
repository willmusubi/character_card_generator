import type { VercelRequest, VercelResponse } from '@vercel/node';

// 使用 DuckDuckGo 搜索（通过 html.duckduckgo.com）
async function duckduckgoSearch(query: string, maxResults: number = 5) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();

    // 简单解析搜索结果
    const results: Array<{ title: string; url: string; snippet: string }> = [];
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/g;

    let match;
    const urls: string[] = [];
    const titles: string[] = [];
    const snippets: string[] = [];

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
    console.error('[Search] DuckDuckGo error:', error);
    return [];
  }
}

// 使用百度搜索（国内备用）
async function baiduSearch(query: string, maxResults: number = 5) {
  try {
    const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();

    const results: Array<{ title: string; url: string; snippet: string }> = [];
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
    console.error('[Search] Baidu error:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
