// Country ISO2 → IATA airport code mapping (most popular airport)
const countryToIata = {
  TR:'IST', IT:'FCO', JP:'TYO', FR:'CDG', GB:'LHR', US:'JFK', BR:'GRU',
  EG:'CAI', AU:'SYD', ES:'MAD', GR:'ATH', TH:'BKK', KR:'ICN', MX:'MEX',
  PE:'LIM', ZA:'JNB', NZ:'AKL', IE:'DUB', CH:'ZRH', NL:'AMS', PT:'LIS',
  MA:'CMN', VN:'HAN', AR:'EZE', CA:'YYZ', IN:'DEL', CN:'PEK', RU:'SVO',
  NO:'OSL', SE:'ARN', DK:'CPH', AT:'VIE', HU:'BUD', CZ:'PRG', HR:'ZAG',
  BE:'BRU', SG:'SIN', MY:'KUL', ID:'CGK', PH:'MNL', AE:'DXB', PL:'WAW',
  SK:'BTS', SI:'LJU', RO:'OTP', BG:'SOF', UA:'KBP', LV:'RIX', LT:'VNO',
  EE:'TLL', RS:'BEG', BA:'SJJ', ME:'TGD', AL:'TIA', XK:'PRN', LU:'LUX',
  MT:'MLA', BH:'BAH', KW:'KWI', QA:'DOH', OM:'MCT', JO:'AMM', LK:'CMB',
  AM:'EVN', GE:'TBS', KZ:'ALA', TN:'TUN', DZ:'ALG', TZ:'DAR', MD:'KIV',
};

// Realistic base prices (EUR) from IST for mock fallback
const mockPrices = {
  IT:149, JP:520, FR:160, GB:175, US:490, BR:600, EG:89, AU:720, ES:145,
  GR:110, TH:380, KR:540, MX:580, PE:650, ZA:520, NZ:800, IE:210, CH:190,
  NL:175, PT:155, MA:119, VN:420, AR:620, CA:510, IN:290, CN:340, RU:170,
  NO:195, SE:185, DK:188, AT:175, HU:130, CZ:132, HR:140, BE:172, SG:490,
  MY:420, ID:450, PH:460, AE:160, PL:135, RO:115, BG:100, UA:105,
};

export default async function handler(req, res) {
  // Handle GET /api/flights?dest=IT&origin=TR
  if (req.method === 'GET') {
    const { dest = 'FR', origin = 'TR' } = req.query;
    const destIata = countryToIata[dest] || dest;
    const originIata = countryToIata[origin] || 'IST';

    const AMADEUS_KEY = process.env.AMADEUS_API_KEY;
    const AMADEUS_SECRET = process.env.AMADEUS_API_SECRET;

    // Use Amadeus if configured, otherwise return mock
    if (AMADEUS_KEY && AMADEUS_SECRET) {
      try {
        // Get token
        const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=client_credentials&client_id=${AMADEUS_KEY}&client_secret=${AMADEUS_SECRET}`
        });
        const { access_token } = await tokenRes.json();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 30);
        const date = tomorrow.toISOString().slice(0, 10);

        const flightRes = await fetch(
          `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originIata}&destinationLocationCode=${destIata}&departureDate=${date}&adults=1&max=3&currencyCode=EUR`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const flightData = await flightRes.json();
        const offers = flightData.data || [];
        const minPrice = offers.length ? Math.round(parseFloat(offers[0].price.total)) : null;

        return res.status(200).json({
          success: true,
          price: minPrice,
          currency: 'EUR',
          dest: destIata,
          source: 'amadeus'
        });
      } catch (err) {
        console.error('Amadeus error:', err.message);
      }
    }

    // Mock fallback
    const base = mockPrices[dest] || 300;
    const variation = Math.floor(Math.random() * 40) - 20;
    return res.status(200).json({
      success: true,
      price: base + variation,
      currency: 'EUR',
      dest: destIata,
      source: 'mock'
    });
  }

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
