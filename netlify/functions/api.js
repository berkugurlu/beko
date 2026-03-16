exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Sadece POST istekleri kabul edilir.' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: 'Geçerli bir istek alınamadı. Lütfen tekrar deneyin.' })
      };
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: 'Yapay zeka şu an yanıt veremiyor.' })
      };
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
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: 'Yapay zeka şu an yanıt veremiyor.' })
      };
    }

    const data = await response.json();
    const content = data &&
      Array.isArray(data.choices) &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!content) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: 'Yapay zeka şu an yanıt veremiyor.' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: content })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, message: 'Yapay zeka şu an yanıt veremiyor.' })
    };
  }
};
