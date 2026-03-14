exports.handler = async function(event, context) {
    // Sadece POST isteklerini kabul et (Güvenlik için)
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Sadece POST istekleri kabul edilir." };
    }
  
    try {
      // Frontend'den gelen mesajı al
      const body = JSON.parse(event.body);
      const userMessage = body.message;
      
      // Netlify'ın kasasına sakladığın o gizli şifreyi çağır
      const apiKey = process.env.GEMINI_API_KEY;
  
      // Google Gemini'ye şifrenle beraber isteği gönder
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }]
        })
      });
  
      const data = await response.json();
  
      // Gemini'den gelen cevabı frontend'e (kullanıcıya) geri yolla
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: data.candidates[0].content.parts[0].text })
      };
      
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Sunucuda bir hata oluştu.' })
      };
    }
  };