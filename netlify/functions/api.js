const https = require("https");

exports.handler = async function (event, context) {
  // Sadece POST isteklerini kabul et (Güvenlik için)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Sadece POST istekleri kabul edilir." };
  }

  try {
    // Frontend'den gelen mesajı al
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Geçerli bir 'message' alanı gönderilmedi." }),
      };
    }

    // Netlify ortam değişkeninden Gemini API anahtarını al
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Sunucu yapılandırma hatası: GEMINI_API_KEY tanımlı değil." }),
      };
    }

    // Google Gemini istek gövdesi
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: userMessage }] }],
    });

    // HTTPS isteğini Promise ile sarmalayan yardımcı fonksiyon
    const callGemini = () =>
      new Promise((resolve, reject) => {
        const url = new URL(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
        );

        const options = {
          method: "POST",
          hostname: url.hostname,
          path: url.pathname + url.search,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
          },
        };

        const req = https.request(options, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(
                  new Error(
                    `Gemini API error ${res.statusCode}: ${JSON.stringify(json)}`
                  )
                );
              }
              resolve(json);
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on("error", (err) => reject(err));
        req.write(requestBody);
        req.end();
      });

    const data = await callGemini();

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
        statusCode: 500,
        body: JSON.stringify({
          error: "Gemini API'den geçerli bir yanıt alınamadı.",
        }),
      };
    }

    // Gemini'den gelen cevabı frontend'e (kullanıcıya) geri yolla
    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Netlify function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sunucuda bir hata oluştu." }),
    };
  }
};