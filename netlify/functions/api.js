let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = require('node-fetch');
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Sadece POST isteğine izin ver (Gemini için)
  // Contentful için GET isteğine de izin veriyoruz
  if (event.httpMethod === 'GET') {
    const query = event.queryStringParameters || {};
    const type = query.type;
    
    if (type === 'contentful-homepage') {
      try {
        const spaceId = process.env.CONTENTFUL_SPACE_ID;
        const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

        if (!spaceId || !accessToken) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Contentful credentials are missing in environment variables." })
          };
        }

        // pageLanding içerik tipindeki Homepage girişini çek
        const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=pageLanding&fields.internalName=Homepage&include=2`;
        
        const response = await fetchFn(url);
        if (!response.ok) {
          throw new Error(`Contentful API error: ${response.status}`);
        }

        const data = await response.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }
    }

    if (type === 'contentful-blog-posts') {
      try {
        const spaceId = process.env.CONTENTFUL_SPACE_ID;
        const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

        if (!spaceId || !accessToken) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Contentful credentials are missing in environment variables." })
          };
        }

        const requestedSlug = query.slug;

        const contentTypeCandidates = [
          process.env.CONTENTFUL_BLOG_POST_TYPE_ID,
          'pageBlogPost',
          'pageBlogpost',
          'page_blog_post',
          'blogPost',
          'pageBlog',
        ].filter(Boolean);

        const buildUrl = (contentType) => {
          const params = new URLSearchParams({
            access_token: accessToken,
            content_type: contentType,
            include: '2',
            order: '-sys.createdAt',
            limit: '100'
          });

          if (requestedSlug) {
            params.set('fields.slug', requestedSlug);
          }

          return `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?${params.toString()}`;
        };

        let lastError = null;
        let data = null;
        let usedContentType = null;

        for (const contentType of contentTypeCandidates) {
          const url = buildUrl(contentType);
          const response = await fetchFn(url);

          if (!response.ok) {
            lastError = new Error(`Contentful API error: ${response.status}`);
            continue;
          }

          const json = await response.json();
          if (Array.isArray(json.items) && json.items.length > 0) {
            data = json;
            usedContentType = contentType;
            break;
          }

          if (!requestedSlug && Array.isArray(json.items) && json.items.length === 0) {
            data = json;
            usedContentType = contentType;
          }
        }

        if (!data) {
          throw lastError || new Error('Contentful blog posts could not be fetched.');
        }

        const assetsById = new Map(
          ((data.includes && data.includes.Asset) || []).map((a) => [a.sys.id, a])
        );

        const normalizeImageUrl = (assetLink) => {
          const assetId = assetLink && assetLink.sys && assetLink.sys.id;
          if (!assetId) return null;
          const asset = assetsById.get(assetId);
          const url = asset && asset.fields && asset.fields.file && asset.fields.file.url;
          if (!url) return null;
          if (url.startsWith('http')) return url;
          return `https:${url}`;
        };

        const pickField = (fields, candidates) => {
          for (const key of candidates) {
            if (fields && typeof fields[key] !== 'undefined' && fields[key] !== null) {
              return fields[key];
            }
          }
          return null;
        };

        const escapeHtml = (str) => String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        const renderMarks = (textNode) => {
          let html = escapeHtml(textNode.value || '');
          const marks = Array.isArray(textNode.marks) ? textNode.marks : [];
          for (const mark of marks) {
            if (!mark || !mark.type) continue;
            if (mark.type === 'bold') html = `<strong>${html}</strong>`;
            if (mark.type === 'italic') html = `<em>${html}</em>`;
            if (mark.type === 'underline') html = `<u>${html}</u>`;
            if (mark.type === 'code') html = `<code>${html}</code>`;
          }
          return html;
        };

        const renderRichTextNode = (node) => {
          if (!node || !node.nodeType) return '';
          const children = Array.isArray(node.content) ? node.content.map(renderRichTextNode).join('') : '';

          switch (node.nodeType) {
            case 'document':
              return children;
            case 'paragraph':
              return `<p>${children}</p>`;
            case 'heading-1':
              return `<h1>${children}</h1>`;
            case 'heading-2':
              return `<h2>${children}</h2>`;
            case 'heading-3':
              return `<h3>${children}</h3>`;
            case 'heading-4':
              return `<h4>${children}</h4>`;
            case 'heading-5':
              return `<h5>${children}</h5>`;
            case 'heading-6':
              return `<h6>${children}</h6>`;
            case 'unordered-list':
              return `<ul>${children}</ul>`;
            case 'ordered-list':
              return `<ol>${children}</ol>`;
            case 'list-item':
              return `<li>${children}</li>`;
            case 'blockquote':
              return `<blockquote>${children}</blockquote>`;
            case 'hr':
              return `<hr/>`;
            case 'hyperlink': {
              const uri = node.data && node.data.uri ? String(node.data.uri) : '#';
              const safeUri = escapeHtml(uri);
              return `<a href="${safeUri}" target="_blank" rel="noopener noreferrer">${children}</a>`;
            }
            case 'text':
              return renderMarks(node);
            default:
              return children;
          }
        };

        const toHtmlFromField = (value) => {
          if (!value) return '';
          if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return '';
            return `<p>${escapeHtml(trimmed)}</p>`;
          }
          if (typeof value === 'object' && value.nodeType) {
            return renderRichTextNode(value);
          }
          return '';
        };

        const normalized = (data.items || [])
          .map((item) => {
            const fields = item.fields || {};
            const title = pickField(fields, ['title', 'headline', 'name', 'internalName']);
            const slug = pickField(fields, ['slug', 'urlSlug']);
            const summary = pickField(fields, ['summary', 'excerpt', 'description']);
            const imageLink = pickField(fields, ['featuredImage', 'heroImage', 'image', 'thumbnail', 'coverImage']);
            const imageUrl = normalizeImageUrl(imageLink);
            const contentField = pickField(fields, ['content', 'body', 'postContent', 'articleBody', 'richText', 'richtext']);
            const contentHtml = toHtmlFromField(contentField);

            return {
              id: item.sys.id,
              title: title || '',
              slug: slug || item.sys.id,
              summary: summary || '',
              imageUrl,
              contentHtml,
              publishedAt: item.sys.createdAt,
            };
          })
          .filter((p) => p.title && p.slug);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ contentType: usedContentType, items: normalized })
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Unknown GET endpoint.' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Sadece POST istekleri kabul edilir.' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const message = body.message;

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: "Geçerli bir istek alınamadı. Lütfen tekrar deneyin." })
      };
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: "Yapay zeka şu an yoğun, lütfen birazdan tekrar deneyin." })
      };
    }

    const groqResponse = await fetchFn('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!groqResponse.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: "Yapay zeka şu an yoğun, lütfen birazdan tekrar deneyin." })
      };
    }

    const data = await groqResponse.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

    if (!reply) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: "Yapay zeka şu an yoğun, lütfen birazdan tekrar deneyin." })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, reply })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, message: "Yapay zeka şu an yoğun, lütfen birazdan tekrar deneyin." })
    };
  }
};
