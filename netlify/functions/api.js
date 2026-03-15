const fetch = require('node-fetch');

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
        
        const response = await fetch(url);
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
          const response = await fetch(url);

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

        const normalized = (data.items || [])
          .map((item) => {
            const fields = item.fields || {};
            const title = pickField(fields, ['title', 'headline', 'name', 'internalName']);
            const slug = pickField(fields, ['slug', 'urlSlug']);
            const summary = pickField(fields, ['summary', 'excerpt', 'description']);
            const imageLink = pickField(fields, ['featuredImage', 'heroImage', 'image', 'thumbnail', 'coverImage']);
            const imageUrl = normalizeImageUrl(imageLink);

            return {
              id: item.sys.id,
              title: title || '',
              slug: slug || item.sys.id,
              summary: summary || '',
              imageUrl,
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
        body: JSON.stringify({ reply: "Geçerli bir 'message' alanı gönderilmedi." })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: "Sunucu yapılandırma hatası: GEMINI_API_KEY tanımlı değil." })
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: `Sen, Vuelina için yazan, dünyayı gezmiş, yerel kültürlere aşık, her ülkenin kendine has ruhunu anlayan tecrübeli ve karizmatik bir seyahat editörüsün. 
            
Asla standart bir template (Konaklama > Ulaşım > Gezi) kullanma. 

Kullanıcının sorduğu ülke veya rotanın kültürel, sanatsal, tarihi ve gastronomik özelliklerine odaklanarak cevap ver. Japonya'yı anlatırken 'saygı', 'zen' ve 'disiplin' duygusunu; İtalya'yı anlatırken 'sanat', 'lezzet' ve 'hayatın tadı (dolce vita)' duygusunu yansıt. 

Sadece bilgi verme, o ülkenin atmosferini hissettirecek descriptive (betimleyici) sıfatlar ve hikaye anlatımı kullan. Okuyucuyu oradaymış gibi hissettir. 

Cevaplarının yapısı her zaman değişsin. Bazen bir yemekten başla, bazen bir sokak festivalinden, bazen de tarihi bir tapınaktan. Rutine binme.`
          }]
        },
        contents: [{ parts: [{ text: message }] }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: `Gemini API hatası (${response.status}): ${errorBody || 'Bilinmeyen hata'}`
        })
      };
    }

    const data = await response.json();

    const reply =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!reply) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: "Gemini API'den geçerli bir yanıt alınamadı." })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: "Sunucu hatası: " + error.message })
    };
  }
};
