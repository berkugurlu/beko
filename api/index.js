export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Sadece POST istekleri kabul edilir.' 
    });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(200).json({ 
        success: false, 
        message: 'Geçerli bir istek alınamadı. Lütfen tekrar deneyin.' 
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ 
        success: false, 
        message: 'Yapay zeka şu an yanıt veremiyor.' 
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      return res.status(200).json({ 
        success: false, 
        message: 'Yapay zeka şu an yanıt veremiyor.' 
      });
    }

    const data = await response.json();
    const content = data &&
      Array.isArray(data.choices) &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!content) {
      return res.status(200).json({ 
        success: false, 
        message: 'Yapay zeka şu an yanıt veremiyor.' 
      });
    }

    return res.status(200).json({ success: true, data: content });
  } catch (error) {
    return res.status(200).json({ 
      success: false, 
      message: 'Yapay zeka şu an yanıt veremiyor.' 
    });
  }
}
