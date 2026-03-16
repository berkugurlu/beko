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

      let contentfulUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=blogPost&include=2`;
      
      if (slug) {
        contentfulUrl += `&fields.slug=${slug}`;
      }

      const contentfulResponse = await fetch(contentfulUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!contentfulResponse.ok) {
        throw new Error('Contentful API error');
      }

      const contentfulData = await contentfulResponse.json();
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
