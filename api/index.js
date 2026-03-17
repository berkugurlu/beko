export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });
  
  try {
    const { prompt, type, slug } = req.body;

    // Contentful blog posts isteği
    if (type === 'contentful-blog-posts') {
      const spaceId = process.env.CONTENTFUL_SPACE_ID;
      const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
      const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

      if (!spaceId || !accessToken) {
        return res.status(200).json({ 
          success: false, 
          error: 'Contentful credentials missing' 
        });
      }

      // Try different content type variations
      const contentTypeVariations = ['pageBlogPost', 'blogPost', 'blog', 'post'];
      let contentfulData = null;
      let lastError = null;

      for (const contentType of contentTypeVariations) {
        try {
          let contentfulUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=${contentType}&include=2`;
          
          if (slug) {
            contentfulUrl += `&fields.slug=${slug}`;
          }

          console.log(`Trying content type: ${contentType}, URL: ${contentfulUrl}`);

          const contentfulResponse = await fetch(contentfulUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!contentfulResponse.ok) {
            const errorText = await contentfulResponse.text();
            console.error(`Contentful API Error for ${contentType}:`, {
              status: contentfulResponse.status,
              statusText: contentfulResponse.statusText,
              error: errorText,
              url: contentfulUrl
            });
            lastError = `${contentfulResponse.status} ${contentfulResponse.statusText}`;
            continue;
          }

          contentfulData = await contentfulResponse.json();
          console.log(`Success with content type: ${contentType}`, {
            url: contentfulUrl,
            total: contentfulData.total,
            items: contentfulData.items?.length || 0
          });
          
          if (contentfulData.items && contentfulData.items.length > 0) {
            break; // Found content, exit loop
          }
        } catch (error) {
          console.error(`Error with content type ${contentType}:`, error);
          lastError = error.message;
        }
      }

      if (!contentfulData) {
        return res.status(200).json({ 
          success: false, 
          error: `No content found. Tried content types: ${contentTypeVariations.join(', ')}. Last error: ${lastError}` 
        });
      }
      return res.status(200).json({ 
        success: true, 
        data: contentfulData 
      });
    }

    // Groq AI isteği
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq Hatası');

    // Frontend'in beklediği formatta tertemiz yanıt dön
    return res.status(200).json({ 
      success: true, 
      data: data.choices[0].message.content 
    });

  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  }
}
