const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Anahtarı Netlify ayarlarından çek
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: { message: "API Key sunucuda bulunamadı." } }) };
    }

    // 2. Kullanıcıdan gelen prompt'u al
    const { prompt } = JSON.parse(event.body);

    // 3. Google'a isteği sunucu üzerinden gönder
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 4. Google'dan gelen cevabı olduğu gibi siteye ilet (Hata olsa bile)
    return {
      statusCode: response.ok ? 200 : response.status,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
