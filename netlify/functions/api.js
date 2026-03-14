const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Sadece POST isteğine izin ver
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