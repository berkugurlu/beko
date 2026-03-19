// --- UYGULAMA BAŞLANGICI ---
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM Content Loaded");

        const countryCodes = {
            "Türkiye": "TR", "İtalya": "IT", "Japonya": "JP", "Fransa": "FR", "Birleşik Krallık": "GB",
            "ABD": "US", "Brezilya": "BR", "Mısır": "EG", "Avustralya": "AU", "İspanya": "ES",
            "Yunanistan": "GR", "Tayland": "TH", "Güney Kore": "KR", "Meksika": "MX", "Peru": "PE",
            "Güney Afrika": "ZA", "Yeni Zelanda": "NZ", "İrlanda": "IE", "İsviçre": "CH", "Hollanda": "NL",
            "Portekiz": "PT", "Fas": "MA", "Vietnam": "VN", "Arjantin": "AR", "Kanada": "CA",
            "Hindistan": "IN", "Çin": "CN", "Rusya": "RU", "Norveç": "NO", "İsveç": "SE",
            "Danimarka": "DK", "Avusturya": "AT", "Macaristan": "HU", "Çek Cumhuriyeti": "CZ", "Hırvatistan": "HR",
            "Belçika": "BE", "Singapur": "SG", "Malezya": "MY", "Endonezya": "ID", "Filipinler": "PH",
            "Birleşik Arap Emirlikleri": "AE", "Polonya": "PL", "Slovakya": "SK", "Slovenya": "SI", "Romanya": "RO",
            "Bulgaristan": "BG", "Ukrayna": "UA", "Letonya": "LV", "Litvanya": "LT", "Estonya": "EE",
            "Sırbistan": "RS", "Bosna-Hersek": "BA", "Karadağ": "ME", "Arnavutluk": "AL", "Kosova": "XK",
            "Lüksemburg": "LU", "Malta": "MT", "Monako": "MC", "Andorra": "AD", "San Marino": "SM",
            "Vatikan": "VA", "Bahreyn": "BH", "Kuveyt": "KW", "Katar": "QA", "Umman": "OM",
            "Ürdün": "JO", "Sri Lanka": "LK", "Ermenistan": "AM", "Gürcistan": "GE", "Kazakistan": "KZ",
            "Tunus": "TN", "Cezayir": "DZ", "Tanzanya": "TZ", "Libya": "LY", "Moldova": "MD", "Yemen": "YE"
        };
    
        // --- Sabitler ve DOM Elementleri ---
        const countryListView = document.getElementById('country-list-view');
        const countryDetailView = document.getElementById('country-detail-view');
        const blogListView = document.getElementById('blog-list-view');
        const blogDetailView = document.getElementById('blog-detail-view');
        const aboutPageView = document.getElementById('about-page-view');
        const aboutPageContent = document.getElementById('about-page-content');
        const whatPageView = document.getElementById('what-page-view');
        const whatPageContent = document.getElementById('what-page-content');
        const countryListContainer = document.getElementById('country-list-container');
        const searchInput = document.getElementById('search-input');
        const noResults = document.getElementById('no-results');
        const preloader = document.getElementById('preloader');
        const infoModal = document.getElementById('info-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalText = document.getElementById('modal-text');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const homeLink = document.getElementById('home-link');
        const itineraryModal = document.getElementById('itinerary-modal');
        const itineraryModalCloseBtn = document.getElementById('itinerary-modal-close-btn');
        const getItineraryBtn = document.getElementById('get-itinerary-btn');
        const legalModal = document.getElementById('legal-modal');
        const legalModalTitle = document.getElementById('legal-modal-title');
        const legalModalContent = document.getElementById('legal-modal-content');
        const legalModalCloseBtn = document.getElementById('legal-modal-close-btn'); 

        // --- ANA LOGO TIKLANMA DURUMU (YENİLEMESİZ ANA SAYFAYA DÖNÜŞ) ---
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                countryDetailView.classList.add('hidden');
                blogListView.classList.add('hidden');
                blogDetailView.classList.add('hidden');
                aboutPageView.classList.add('hidden');
                whatPageView.classList.add('hidden');
                countryListView.classList.remove('hidden');
                window.history.pushState({}, document.title, window.location.pathname);
                scrollToTop();
            });
        }

        // --- FOOTER LOGO TIKLANMA DURUMU ---
        const footerLogo = document.getElementById('main-logo');
        if (footerLogo) {
            footerLogo.addEventListener('click', (e) => {
                e.preventDefault();
                if(homeLink) homeLink.click();
            });
        }

        // --- GDPR COOKIE CONSENT MANTIĞI ---
        const cookieConsentBanner = document.getElementById('cookie-consent-banner');
        const cookieAcceptBtn = document.getElementById('cookie-accept-btn');
        const cookieRejectBtn = document.getElementById('cookie-reject-btn');

        if (cookieConsentBanner && cookieAcceptBtn && cookieRejectBtn) {
            // Eğer daha evvel onaylanmamış/reddedilmemişse göster
            if (!localStorage.getItem('cookieConsent')) {
                setTimeout(() => {
                    cookieConsentBanner.classList.remove('hidden');
                    // Küçük bir animasyon gecikmesi
                    setTimeout(() => {
                        cookieConsentBanner.classList.remove('translate-y-full');
                    }, 50);
                }, 1000);
            }

            const handleCookieConsent = (type) => {
                localStorage.setItem('cookieConsent', type);
                cookieConsentBanner.classList.add('translate-y-full');
                setTimeout(() => {
                    cookieConsentBanner.classList.add('hidden');
                    if(typeof showToast === 'function') {
                        showToast(`Çerezler ${type === 'accepted' ? 'kabul edildi' : 'reddedildi'}.`, 'success');
                    }
                }, 500);
            };

            cookieAcceptBtn.addEventListener('click', () => handleCookieConsent('accepted'));
            cookieRejectBtn.addEventListener('click', () => handleCookieConsent('rejected'));
        }
        
        // --- GEMINI AI API ENTEGRASYONU ---
        async function fetchJsonWithTimeout(url, options, timeoutMs = 10000) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                const text = await response.text().catch(() => '');
                let json = null;
                try {
                    json = text ? JSON.parse(text) : null;
                } catch (e) {
                    json = null;
                }
                return { ok: response.ok, status: response.status, json, text };
            } finally {
                clearTimeout(timeout);
            }
        }

        // --- TOAST NOTIFICATION SİSTEMİ ---
        function showToast(message, type = 'error') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 z-[100] flex items-center gap-3 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
            toast.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    ${type === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'}
                </svg>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);
            
            // Animasyon (Giriş)
            setTimeout(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
            }, 10);
            
            // 3.5 saniye sonra kaldır (Çıkış)
            setTimeout(() => {
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        async function callGroqAPI(prompt) {
          try {
            const response = await fetch('/api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt })
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result.data;
          } catch (error) {
            console.error('AI Hatası:', error);
            showToast('Hata oluştu: ' + error.message, 'error');
            return null;
          }
        }

        let currencyRates = null;
        let aiGeneratedContent = {}; 

        const countryTravelData = {
            "Türkiye": { visaStatus: "Yerel", dailyBudget: "$40-$90", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "İtalya": { visaStatus: "Schengen", dailyBudget: "$110-$190", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / F / L", tipping: "%5-%10" },
            "Japonya": { visaStatus: "Vizesiz", dailyBudget: "$90-$160", bestTime: "Mart - Mayıs, Ekim - Kasım", plugType: "Tip A / B", tipping: "Yok" },
            "Fransa": { visaStatus: "Schengen", dailyBudget: "$130-$220", bestTime: "Mayıs - Eylül", plugType: "Tip C / E", tipping: "%5-%10" },
            "Birleşik Krallık": { visaStatus: "Vize Gerekli", dailyBudget: "$140-$240", bestTime: "Mayıs - Eylül", plugType: "Tip G", tipping: "%10-%12.5" },
            "ABD": { visaStatus: "Vize Gerekli", dailyBudget: "$150-$250", bestTime: "Mayıs - Ekim", plugType: "Tip A / B", tipping: "%15-%20" },
            "Brezilya": { visaStatus: "Vizesiz", dailyBudget: "$60-$130", bestTime: "Mayıs - Eylül", plugType: "Tip N", tipping: "%10" },
            "Mısır": { visaStatus: "Kapıda Vize / e-Vize", dailyBudget: "$35-$80", bestTime: "Ekim - Nisan", plugType: "Tip C / F", tipping: "%10" },
            "Avustralya": { visaStatus: "e-Vize", dailyBudget: "$140-$240", bestTime: "Kasım - Mart", plugType: "Tip I", tipping: "Opsiyonel" },
            "İspanya": { visaStatus: "Schengen", dailyBudget: "$90-$160", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Yunanistan": { visaStatus: "Schengen", dailyBudget: "$80-$140", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Tayland": { visaStatus: "e-Vize", dailyBudget: "$35-$70", bestTime: "Kasım - Mart", plugType: "Tip A / B / C", tipping: "Opsiyonel" },
            "Güney Kore": { visaStatus: "Vizesiz", dailyBudget: "$80-$140", bestTime: "Nisan - Haziran, Eylül - Kasım", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Meksika": { visaStatus: "Vize Gerekli", dailyBudget: "$50-$110", bestTime: "Kasım - Nisan", plugType: "Tip A / B", tipping: "%10-%15" },
            "Peru": { visaStatus: "Vizesiz", dailyBudget: "$40-$90", bestTime: "Mayıs - Ekim", plugType: "Tip A / B / C", tipping: "%10" },
            "Güney Afrika": { visaStatus: "Vize Gerekli", dailyBudget: "$60-$120", bestTime: "Mayıs - Eylül", plugType: "Tip M / N", tipping: "%10-%15" },
            "Yeni Zelanda": { visaStatus: "e-Vize", dailyBudget: "$130-$220", bestTime: "Kasım - Mart", plugType: "Tip I", tipping: "Opsiyonel" },
            "İrlanda": { visaStatus: "Vize Gerekli", dailyBudget: "$130-$220", bestTime: "Mayıs - Eylül", plugType: "Tip G", tipping: "%10-%12.5" },
            "İsviçre": { visaStatus: "Schengen", dailyBudget: "$200-$320", bestTime: "Haziran - Eylül, Aralık - Mart", plugType: "Tip J", tipping: "%5-%10" },
            "Hollanda": { visaStatus: "Schengen", dailyBudget: "$140-$230", bestTime: "Nisan - Eylül", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Portekiz": { visaStatus: "Schengen", dailyBudget: "$80-$140", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Fas": { visaStatus: "Vizesiz", dailyBudget: "$40-$80", bestTime: "Mart - Mayıs, Eylül - Kasım", plugType: "Tip C / E", tipping: "%5-%10" },
            "Vietnam": { visaStatus: "e-Vize", dailyBudget: "$30-$60", bestTime: "Kasım - Nisan", plugType: "Tip A / C", tipping: "Opsiyonel" },
            "Arjantin": { visaStatus: "Vizesiz", dailyBudget: "$50-$110", bestTime: "Ekim - Nisan", plugType: "Tip C / I", tipping: "%10" },
            "Kanada": { visaStatus: "Vize Gerekli", dailyBudget: "$130-$220", bestTime: "Haziran - Eylül", plugType: "Tip A / B", tipping: "%15-%20" },
            "Hindistan": { visaStatus: "e-Vize", dailyBudget: "$25-$55", bestTime: "Kasım - Mart", plugType: "Tip C / D / M", tipping: "%5-%10" },
            "Çin": { visaStatus: "Vize Gerekli", dailyBudget: "$70-$150", bestTime: "Nisan - Mayıs, Eylül - Ekim", plugType: "Tip A / C / I", tipping: "Genelde Yok" },
            "Rusya": { visaStatus: "e-Vize", dailyBudget: "$70-$140", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Norveç": { visaStatus: "Schengen", dailyBudget: "$170-$280", bestTime: "Haziran - Ağustos", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "İsveç": { visaStatus: "Schengen", dailyBudget: "$120-$210", bestTime: "Haziran - Ağustos", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Danimarka": { visaStatus: "Schengen", dailyBudget: "$140-$240", bestTime: "Mayıs - Eylül", plugType: "Tip C / K", tipping: "Opsiyonel" },
            "Avusturya": { visaStatus: "Schengen", dailyBudget: "$120-$200", bestTime: "Mayıs - Eylül, Aralık - Mart", plugType: "Tip C / F", tipping: "%5-%10" },
            "Macaristan": { visaStatus: "Schengen", dailyBudget: "$55-$95", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Çek Cumhuriyeti": { visaStatus: "Schengen", dailyBudget: "$60-$110", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / E", tipping: "%5-%10" },
            "Hırvatistan": { visaStatus: "Schengen", dailyBudget: "$70-$140", bestTime: "Haziran - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Belçika": { visaStatus: "Schengen", dailyBudget: "$130-$220", bestTime: "Mayıs - Eylül", plugType: "Tip E", tipping: "Opsiyonel" },
            "Singapur": { visaStatus: "Vizesiz", dailyBudget: "$120-$220", bestTime: "Şubat - Nisan", plugType: "Tip G", tipping: "Genelde Yok" },
            "Malezya": { visaStatus: "Vizesiz", dailyBudget: "$40-$80", bestTime: "Aralık - Mart", plugType: "Tip G", tipping: "Opsiyonel" },
            "Endonezya": { visaStatus: "Kapıda Vize / e-Vize", dailyBudget: "$35-$80", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Filipinler": { visaStatus: "Vizesiz", dailyBudget: "$35-$75", bestTime: "Aralık - Mayıs", plugType: "Tip A / B / C", tipping: "Opsiyonel" },
            "Birleşik Arap Emirlikleri": { visaStatus: "Vizesiz", dailyBudget: "$120-$220", bestTime: "Kasım - Mart", plugType: "Tip G", tipping: "%10" },
            "Polonya": { visaStatus: "Schengen", dailyBudget: "$60-$110", bestTime: "Mayıs - Eylül", plugType: "Tip C / E", tipping: "%5-%10" },
            "Slovakya": { visaStatus: "Schengen", dailyBudget: "$60-$110", bestTime: "Mayıs - Eylül, Aralık - Mart", plugType: "Tip C / E", tipping: "%5-%10" },
            "Slovenya": { visaStatus: "Schengen", dailyBudget: "$80-$140", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Romanya": { visaStatus: "Vize Gerekli", dailyBudget: "$45-$85", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Bulgaristan": { visaStatus: "Vize Gerekli", dailyBudget: "$40-$75", bestTime: "Mayıs - Eylül, Aralık - Mart", plugType: "Tip C / F", tipping: "%5-%10" },
            "Ukrayna": { visaStatus: "Vizesiz", dailyBudget: "$35-$70", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Letonya": { visaStatus: "Schengen", dailyBudget: "$70-$120", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Litvanya": { visaStatus: "Schengen", dailyBudget: "$60-$110", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Estonya": { visaStatus: "Schengen", dailyBudget: "$80-$140", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Sırbistan": { visaStatus: "Vizesiz", dailyBudget: "$45-$80", bestTime: "Nisan - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Bosna-Hersek": { visaStatus: "Vizesiz", dailyBudget: "$35-$65", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Karadağ": { visaStatus: "Vizesiz", dailyBudget: "$50-$90", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Arnavutluk": { visaStatus: "Vizesiz", dailyBudget: "$40-$70", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Kosova": { visaStatus: "Vizesiz", dailyBudget: "$35-$65", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Lüksemburg": { visaStatus: "Schengen", dailyBudget: "$170-$260", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "Malta": { visaStatus: "Schengen", dailyBudget: "$90-$160", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip G", tipping: "%5-%10" },
            "Monako": { visaStatus: "Schengen", dailyBudget: "$200-$350", bestTime: "Mayıs - Eylül", plugType: "Tip C / E / F", tipping: "%5-%10" },
            "Andorra": { visaStatus: "Schengen", dailyBudget: "$90-$160", bestTime: "Haziran - Eylül, Aralık - Mart", plugType: "Tip C / F", tipping: "Opsiyonel" },
            "San Marino": { visaStatus: "Schengen", dailyBudget: "$100-$170", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Vatikan": { visaStatus: "Schengen", dailyBudget: "$110-$190", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Bahreyn": { visaStatus: "e-Vize", dailyBudget: "$110-$200", bestTime: "Kasım - Mart", plugType: "Tip G", tipping: "%10" },
            "Kuveyt": { visaStatus: "e-Vize", dailyBudget: "$120-$220", bestTime: "Kasım - Mart", plugType: "Tip G", tipping: "%10" },
            "Katar": { visaStatus: "Vizesiz", dailyBudget: "$140-$240", bestTime: "Kasım - Mart", plugType: "Tip G", tipping: "%10" },
            "Umman": { visaStatus: "e-Vize", dailyBudget: "$90-$170", bestTime: "Ekim - Nisan", plugType: "Tip G", tipping: "%10" },
            "Ürdün": { visaStatus: "Kapıda Vize", dailyBudget: "$60-$120", bestTime: "Mart - Mayıs, Eylül - Kasım", plugType: "Tip C / D / G", tipping: "%10" },
            "Sri Lanka": { visaStatus: "e-Vize", dailyBudget: "$30-$65", bestTime: "Aralık - Mart", plugType: "Tip D / G", tipping: "Opsiyonel" },
            "Ermenistan": { visaStatus: "e-Vize", dailyBudget: "$25-$55", bestTime: "Mayıs - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Gürcistan": { visaStatus: "Vizesiz", dailyBudget: "$25-$55", bestTime: "Mayıs - Ekim", plugType: "Tip C / F", tipping: "%5-%10" },
            "Kazakistan": { visaStatus: "Vizesiz", dailyBudget: "$40-$80", bestTime: "Haziran - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Tunus": { visaStatus: "Vizesiz", dailyBudget: "$35-$70", bestTime: "Nisan - Haziran, Eylül - Ekim", plugType: "Tip C / E", tipping: "%5-%10" },
            "Cezayir": { visaStatus: "Vize Gerekli", dailyBudget: "$45-$90", bestTime: "Mart - Mayıs, Eylül - Kasım", plugType: "Tip C / F", tipping: "%5-%10" },
            "Tanzanya": { visaStatus: "e-Vize", dailyBudget: "$60-$130", bestTime: "Haziran - Ekim", plugType: "Tip G", tipping: "%5-%10" },
            "Libya": { visaStatus: "Vize Gerekli", dailyBudget: "$50-$100", bestTime: "Ekim - Nisan", plugType: "Tip C / F", tipping: "%5-%10" },
            "Moldova": { visaStatus: "Vizesiz", dailyBudget: "$30-$55", bestTime: "Mayıs - Eylül", plugType: "Tip C / F", tipping: "%5-%10" },
            "Yemen": { visaStatus: "Vize Gerekli", dailyBudget: "$40-$90", bestTime: "Ekim - Mart", plugType: "Tip G", tipping: "Opsiyonel" }
        };

        Object.keys(countriesData).forEach((name) => {
            const d = countryTravelData[name];
            if (d) Object.assign(countriesData[name], d);
        });

        const blogData = [];

        // --- DATA ENRICHMENT (TAGS) ---
        const countryCategoryMap = {
            "Türkiye": ["avrupa", "asya", "deniz", "vizesiz", "tarih"],
            "İtalya": ["avrupa", "deniz", "tarih", "schengen"],
            "Yunanistan": ["avrupa", "deniz", "tarih", "schengen"],
            "İspanya": ["avrupa", "deniz", "tarih", "schengen"],
            "Fransa": ["avrupa", "tarih", "schengen"],
            "Japonya": ["asya", "vizesiz", "teknoloji"],
            "Güney Kore": ["asya", "vizesiz", "teknoloji"],
            "Tayland": ["asya", "vizesiz", "deniz", "tropikal"],
            "Mısır": ["afrika", "tarih", "vizesiz_kapida"],
            "ABD": ["amerika", "şehir"],
            "Birleşik Krallık": ["avrupa", "tarih"],
            "Almanya": ["avrupa", "tarih", "schengen"],
            "Hollanda": ["avrupa", "schengen"],
            "Brezilya": ["amerika", "vizesiz", "deniz"],
            "Arjantin": ["amerika", "vizesiz"],
            "Meksika": ["amerika", "deniz", "tarih"],
            "Endonezya": ["asya", "deniz", "vizesiz_kapida", "tropikal"],
            "Maldivler": ["asya", "deniz", "balayi", "vizesiz"],
            "Karadağ": ["avrupa", "vizesiz", "deniz"],
            "Sırbistan": ["avrupa", "vizesiz", "tarih"],
            "Bosna-Hersek": ["avrupa", "vizesiz", "tarih"],
            "Arnavutluk": ["avrupa", "vizesiz", "deniz"],
            "Gürcistan": ["asya", "vizesiz", "kimlikle"],
            "Ukrayna": ["avrupa", "vizesiz", "kimlikle"],
            "Kıbrıs": ["avrupa", "deniz", "kimlikle"], // KKTC context usually implied for Turkish users or generic
            "Fas": ["afrika", "vizesiz", "tarih"],
            "Tunus": ["afrika", "vizesiz", "deniz"],
            "Filipinler": ["asya", "deniz", "vizesiz"],
            "Malezya": ["asya", "vizesiz", "tropikal"],
            "Singapur": ["asya", "vizesiz", "şehir"],
            "Güney Afrika": ["afrika", "safari"],
            "Tanzanya": ["afrika", "safari", "deniz"],
            "Katar": ["asya", "vizesiz", "luks"],
            "Dubai": ["asya", "luks", "deniz"], // UAE
            "Birleşik Arap Emirlikleri": ["asya", "luks", "deniz"],
            "Rusya": ["avrupa", "asya"],
            "Hırvatistan": ["avrupa", "deniz"],
            "Portekiz": ["avrupa", "deniz", "tarih"],
            "Norveç": ["avrupa", "doga"],
            "İsveç": ["avrupa", "doga"],
            "Finlandiya": ["avrupa", "doga"],
            "Danimarka": ["avrupa"],
            "İsviçre": ["avrupa", "doga", "kayak"],
            "Avusturya": ["avrupa", "kayak", "tarih"],
            "Polonya": ["avrupa", "tarih"],
            "Çek Cumhuriyeti": ["avrupa", "tarih"],
            "Macaristan": ["avrupa", "tarih"],
            "Bulgaristan": ["avrupa", "kayak"],
            "Romanya": ["avrupa", "tarih"],
            "Makedonya": ["avrupa", "vizesiz", "tarih"],
            "Kosova": ["avrupa", "vizesiz"],
            "Moldova": ["avrupa", "vizesiz"],
            "Azerbaycan": ["asya", "vizesiz", "kimlikle"]
        };

        // Merge tags into main data
        Object.keys(countriesData).forEach(country => {
            // Assign ISO Code from mapping
            if (countryCodes[country]) {
                countriesData[country].code = countryCodes[country];
            }
            
            countriesData[country].tags = countryCategoryMap[country] || [];
            // Auto-tag continents/regions based on description if missing
            if (countriesData[country].description.toLowerCase().includes("avrupa")) countriesData[country].tags.push("avrupa");
            if (countriesData[country].description.toLowerCase().includes("asya")) countriesData[country].tags.push("asya");
            if (countriesData[country].description.toLowerCase().includes("afrika")) countriesData[country].tags.push("afrika");
            if (countriesData[country].description.toLowerCase().includes("amerika")) countriesData[country].tags.push("amerika");
        });

        let activeTagFilter = 'all';

        const showInfoModal = (title, text) => {
            modalTitle.textContent = title;
            modalText.textContent = text;
            infoModal.classList.add('visible');
        };
        
        const formatGeminiResponse = (text) => {
            let html = '<div class="markdown-content animate-fade-in-up">';
            const lines = text.split('\n').filter(line => line.trim() !== '');
            let inList = false;
            let staggerIndex = 1;

            lines.forEach(line => {
                line = line.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
                
                if (line.startsWith('###')) {
                      html += `${inList ? '</ul>' : ''}<h3 class="animate-fade-in-up stagger-${(staggerIndex % 3) + 1}">${line.replace(/###\s*/, '')}</h3>`;
                      inList = false;
                } else if (line.startsWith('##')) {
                      html += `${inList ? '</ul>' : ''}<h2 class="animate-fade-in-up stagger-${(staggerIndex % 3) + 1}">${line.replace(/##\s*/, '')}</h2>`;
                      inList = false;
                } else if (line.startsWith('-') || line.startsWith('*')) {
                    if (!inList) {
                        html += '<ul class="list-disc pl-5 space-y-2 mt-2">';
                        inList = true;
                    }
                    html += `<li class="animate-fade-in-up stagger-${(staggerIndex % 3) + 1}">${line.substring(1).trim()}</li>`;
                } else {
                    html += `${inList ? '</ul>' : ''}<p class="animate-fade-in-up stagger-${(staggerIndex % 3) + 1} mb-3">${line}</p>`;
                    inList = false;
                }
                staggerIndex++;
            });
            html += (inList ? '</ul>' : '') + '</div>';
            return html;
        };

        const copyToClipboard = (text) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showInfoModal('Başarılı!', 'Seyahat planı panoya kopyalandı.');
            } catch (err) {
                showInfoModal('Hata!', 'Otomatik kopyalama başarısız oldu.');
            }
            document.body.removeChild(textArea);
        };
        
        // --- FAVORITES SYSTEM ---
        const getFavorites = () => {
            try {
                return JSON.parse(localStorage.getItem('favorites') || '[]');
            } catch (e) {
                console.error("Error parsing favorites:", e);
                return [];
            }
        };
        const toggleFavorite = (countryName) => {
            const favorites = getFavorites();
            const index = favorites.indexOf(countryName);
            if (index > -1) {
                favorites.splice(index, 1);
            } else {
                favorites.push(countryName);
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            displayCountries(document.getElementById('search-input').value); // Re-render
        };

        let showOnlyFavorites = false;

        // Olay Delegasyonu kullanılarak kart listeleme işlevi
        
        const updateSchema = (type, data) => {
            // Remove existing JSON-LD scripts
            const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
            existingScripts.forEach(script => script.remove());

            let schemaData = {};

            if (type === 'country') {
                schemaData = {
                    "@context": "https://schema.org",
                    "@type": "TouristDestination",
                    "name": data.name,
                    "description": data.description,
                    "image": `https://flagcdn.com/w320/${data.code}.png`, // Placeholder for flag/image logic
                    "touristType": [
                        "History",
                        "Culture"
                    ],
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": "0", // Dynamic coords would be better but static for now
                        "longitude": "0" 
                    },
                    "publicAccess": true
                };
            } else if (type === 'blog') {
                schemaData = {
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": data.title,
                    "image": data.image,
                    "datePublished": data.date, 
                    "author": {
                        "@type": "Organization",
                        "name": "Vuelina"
                    },
                    "description": data.summary
                };
            } else {
                // Default Website Schema
                schemaData = {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "Vuelina",
                    "url": window.location.href,
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://vuelina.com/?country={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                };
            }

            const script = document.createElement('script');
            script.type = "application/ld+json";
            script.text = JSON.stringify(schemaData);
            document.head.appendChild(script);
        };
    
        const displayCountries = (filter = '') => {
            countryListContainer.innerHTML = '';
            const normalizedFilter = filter.toLocaleLowerCase('tr').trim();
            const countryNames = Object.keys(countriesData).sort((a,b) => a.localeCompare(b, 'tr'));
            const favorites = getFavorites();
            let visibleCount = 0;

            countryNames.forEach((name, index) => {
                const country = countriesData[name];
                const searchScope = [
                    name.toLocaleLowerCase('tr'),
                    country.flag,
                    ...Object.values(country.searchTerms).map(t => t.toLowerCase())
                ];

                const matchesSearch = searchScope.some(term => term.includes(normalizedFilter));
                const normalizedTags = (country.tags || []).map(t => String(t).toLocaleLowerCase('tr'));
                const parseBudgetMin = (budgetStr) => {
                    const m = String(budgetStr || '').match(/(\d+)\s*-\s*(\d+)|(\d+)/);
                    if (!m) return null;
                    return Number(m[1] || m[3] || 0) || null;
                };
                const isEconomicByBudget = (() => {
                    const min = parseBudgetMin(country.dailyBudget);
                    if (min === null) return false;
                    return min <= 80;
                })();
                const matchesTag =
                    activeTagFilter === 'all' ||
                    (activeTagFilter === 'ekonomik' ? isEconomicByBudget : normalizedTags.includes(activeTagFilter));
                const matchesFavorite = !showOnlyFavorites || favorites.includes(name);

                if (matchesSearch && matchesTag && matchesFavorite) {
                    const isFav = favorites.includes(name);
                    const visaStatus = country.visaStatus || 'Vize Bilgisi';
                    const bestTime = country.bestTime || 'En İyi Dönem';
                    const budget = country.dailyBudget || 'Bütçe';
                    const card = document.createElement('div');
                    // Premium SaaS card styling with animation
                    card.className = 'country-card content-card glass-card p-8 text-center relative group overflow-hidden hover:border-accent/50 animate-fade-in-up';
                    card.style.animationDelay = `${(visibleCount % 8) * 0.1}s`;
                    card.setAttribute('data-country-name', name); 

                    card.innerHTML = `
                        <div class="absolute top-4 right-4 z-10 ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300">
                             <button class="favorite-btn p-2.5 rounded-full bg-white/90 dark:bg-black/60 shadow-lg ${isFav ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 hover:scale-110 transition-all" data-name="${name}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                             </button>
                        </div>
                        <div class="text-8xl mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 drop-shadow-xl">${country.flag}</div>
                        <h3 class="text-2xl font-bold mb-3 text-primary group-hover:text-accent transition-colors">${name}</h3>
                        <p class="text-base text-secondary line-clamp-3 leading-relaxed mb-4">${country.description}</p>
                        <div class="grid grid-cols-3 gap-2 mb-4 text-left">
                            <div class="p-3 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Vize</div>
                                <div class="text-sm font-bold text-primary">🛂 ${visaStatus}</div>
                            </div>
                            <div class="p-3 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Dönem</div>
                                <div class="text-sm font-bold text-primary">📅 ${bestTime}</div>
                            </div>
                            <div class="p-3 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Bütçe</div>
                                <div class="text-sm font-bold text-primary">💰 ${budget}</div>
                            </div>
                        </div>
                        <div class="mt-auto flex flex-wrap justify-center gap-2">
                            ${country.tags.slice(0, 3).map(tag => `<span class="text-[10px] px-3 py-1.5 rounded-full bg-accent/5 text-accent font-semibold uppercase tracking-widest border border-accent/10">${tag}</span>`).join('')}
                        </div>
                    `;
                    countryListContainer.appendChild(card);
                    visibleCount++;
                }

                // "Smart Travel Card" (Native Ad / Affiliate)
                if (index === 7 && visibleCount > 4 && !document.getElementById('smart-ad')) {
                    const adCard = document.createElement('div');
                    adCard.id = 'smart-ad';
                    adCard.className = 'content-card p-6 text-center lg:col-span-2 md:col-span-1 sm:col-span-2 col-span-1 flex flex-col justify-center items-center relative overflow-hidden group';
                    adCard.style.backgroundColor = 'var(--card-bg)';
                    adCard.innerHTML = `
                        <div class="absolute top-0 right-0 bg-accent text-white text-xs px-2 py-1 rounded-bl-lg font-bold">ÖNERİ</div>
                        <div class="text-4xl mb-2">✈️🏨</div>
                        <h3 class="text-xl font-bold mb-2 text-primary">Seyahatini Ucuza Getir</h3>
                        <p class="text-secondary mb-4 text-sm max-w-md">En iyi uçuş fırsatlarını ve konforlu otelleri keşfetmek için partnerlerimize göz at.</p>
                        <div class="flex gap-3 justify-center">
                            <a href="https://www.skyscanner.com.tr" target="_blank" rel="nofollow" class="btn btn-primary py-2 px-4 text-sm">Ucuz Uçak Bileti</a>
                            <a href="https://www.booking.com" target="_blank" rel="nofollow" class="btn btn-secondary py-2 px-4 text-sm">Otel Fırsatları</a>
                        </div>
                    `;
                    countryListContainer.appendChild(adCard);
                }
            });

            const hasResults = countryListContainer.querySelectorAll('.country-card').length > 0;
            noResults.classList.toggle('hidden', hasResults);
        };
        
        countryListContainer.addEventListener('click', async (e) => {
            const card = e.target.closest('.country-card');
            if (card && card.dataset.countryName) {
                await displayCountryDetail(card.dataset.countryName);
            }
        });

        // Gelişmiş Yönlendirme (Routing)
        const scrollToTop = () => {
            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isiOS = /iP(ad|hone|od)/.test(navigator.userAgent || '');
            const behavior = (prefersReducedMotion || isiOS) ? 'auto' : 'smooth';
            window.scrollTo({ top: 0, behavior });
        };

        const handleRouting = async () => {
            const params = new URLSearchParams(window.location.search);
            let countryName = params.get('country');
            const page = params.get('page');
            const postId = params.get('post');
            const normalizedPath = window.location.pathname.replace(/\/+$/, '').toLocaleLowerCase('tr');
            const isAboutRoute = page === 'hakkimizda' || normalizedPath.endsWith('/hakkimizda');
            const isWhatRoute = page === 'nedir' || normalizedPath.endsWith('/nedir');

            // Tüm görünümleri gizle
            countryListView.classList.add('hidden');
            countryDetailView.classList.add('hidden');
            blogListView.classList.add('hidden');
            blogDetailView.classList.add('hidden');
            if (aboutPageView) aboutPageView.classList.add('hidden');
            if (whatPageView) whatPageView.classList.add('hidden');

            // Case-insensitive lookup
            let matchedCountryKey = null;
            if (countryName) {
                const normalizedParam = countryName.toLocaleLowerCase('tr');
                matchedCountryKey = Object.keys(countriesData).find(key => 
                    key.toLocaleLowerCase('tr') === normalizedParam
                );
            }

            if (matchedCountryKey) {
                await displayCountryDetail(matchedCountryKey);
            } else if (postId) {
                displayBlogPost(postId);
            } else if (page === 'blog') {
                displayBlogList();
            } else if (isAboutRoute) {
                updateSchema('website');
                if (aboutPageView) aboutPageView.classList.remove('hidden');
                if (aboutPageContent && typeof aboutPremiumHtml === 'string') {
                    aboutPageContent.innerHTML = aboutPremiumHtml;
                }
                document.title = 'Hakkımızda - Vuelina';
                document.getElementById('meta-description')?.setAttribute('content', 'Vuelina hakkında: seyahat planlamayı hızlandıran, yapay zeka destekli ücretsiz SaaS platformu.');
            } else if (isWhatRoute) {
                updateSchema('website');
                if (whatPageView) whatPageView.classList.remove('hidden');
                if (whatPageContent && typeof whatPageHtml === 'string') {
                    whatPageContent.innerHTML = whatPageHtml;
                }
                document.title = 'Nedir? - Vuelina';
                document.getElementById('meta-description')?.setAttribute('content', 'Vuelina vizyonu: yapay zeka ile akıllı, hızlı ve sade seyahat planlama deneyimi.');
            } else {
                // Varsayılan: Ana sayfa
                updateSchema('website');
                countryListView.classList.remove('hidden');
                displayCountries();
            }
            scrollToTop();
        };

        window.handleRouting = handleRouting;

        (function () {
            const dispatchRouteChange = () => window.dispatchEvent(new Event('vuelina:routechange'));

            const originalPushState = history.pushState;
            history.pushState = function (...args) {
                originalPushState.apply(history, args);
                dispatchRouteChange();
            };

            const originalReplaceState = history.replaceState;
            history.replaceState = function (...args) {
                originalReplaceState.apply(history, args);
                dispatchRouteChange();
            };

            window.addEventListener('popstate', async () => await handleRouting());
            window.addEventListener('vuelina:routechange', async () => await handleRouting());
        })();

        const displayBlogList = async () => {
            blogListView.classList.remove('hidden');
            const container = document.getElementById('blog-posts-container');
            
            // Show skeletons while loading
            container.innerHTML = Array(3).fill(0).map(() => `
                <div class="content-card glass-card overflow-hidden flex flex-col h-full">
                    <div class="h-48 skeleton"></div>
                    <div class="p-6 flex flex-col flex-grow space-y-4">
                        <div class="h-4 w-24 skeleton rounded"></div>
                        <div class="h-8 w-full skeleton rounded"></div>
                        <div class="h-20 w-full skeleton rounded"></div>
                    </div>
                </div>
            `).join('');

            try {
                if (window.location.protocol === 'file:') {
                    container.innerHTML = `
                        <div class="content-card p-8 col-span-1 md:col-span-2 lg:col-span-3 text-center">
                            <h3 class="text-xl font-bold text-primary mb-2">VueBlog içerikleri şu an yüklenemiyor</h3>
                            <p class="text-secondary text-sm">Contentful verileri, Netlify Function üzerinden çekildiği için sayfayı file:// yerine bir sunucu üzerinden açmanız gerekir.</p>
                        </div>
                    `;
                    return;
                }

                const response = await fetch('/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'contentful-blog-posts' })
                });
                if (!response.ok) throw new Error('Failed to fetch blog posts from Contentful');

                const payload = await response.json();
                console.log('Contentful Response:', payload);
                const posts = Array.isArray(payload.data?.items) ? payload.data.items : [];
                console.log('Posts from Contentful:', posts);
                if (!posts.length) {
                    container.innerHTML = `
                        <div class="content-card p-8 col-span-1 md:col-span-2 lg:col-span-3 text-center">
                            <h3 class="text-xl font-bold text-primary mb-2">Henüz blog yazısı bulunmuyor</h3>
                            <p class="text-secondary text-sm">Contentful'da "Page - Blog post" tipinde içerikler yayınlandığında burada otomatik listelenecek.</p>
                        </div>
                    `;
                    return;
                }

                const allPosts = posts.map((p) => {
                    console.log('Processing post:', p);
                    console.log('Post fields:', p.fields);
                    return {
                        id: p.fields?.slug || '',
                        title: p.fields?.title || 'Başlık Yok',
                        summary: p.fields?.summary || "Bu yazıyı okumak için tıklayın.",
                        image: p.fields?.imageUrl || "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop",
                        date: p.fields?.publishedAt ? new Date(p.fields.publishedAt).toLocaleDateString('tr-TR') : "",
                    };
                });

                container.innerHTML = allPosts.map(post => `
                    <div class="content-card glass-card overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-full" onclick="window.history.pushState({post: '${post.id}'}, '', '?post=${post.id}');">
                        <div class="h-48 overflow-hidden">
                            <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500">
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <div class="text-xs text-accent font-bold mb-2 uppercase tracking-wider">Seyahat Rehberi</div>
                            <h3 class="text-xl font-bold mb-3 text-primary line-clamp-2">${post.title}</h3>
                            <p class="text-secondary text-sm mb-4 line-clamp-3 flex-grow">${post.summary}</p>
                            <div class="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                                <span class="text-xs text-secondary">${post.date}</span>
                                <span class="text-sm font-semibold text-accent flex items-center group">
                                    Oku 
                                    <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error("Contentful Error:", error);
                // Fallback to local data on error
                if (!blogData.length) {
                    container.innerHTML = `
                        <div class="content-card p-8 col-span-1 md:col-span-2 lg:col-span-3 text-center">
                            <h3 class="text-xl font-bold text-primary mb-2">VueBlog içerikleri yüklenemedi</h3>
                            <p class="text-secondary text-sm">Contentful bağlantısını kontrol edip tekrar deneyin.</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = blogData.map(post => `
                    <div class="content-card glass-card overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-full" onclick="window.history.pushState({post: '${post.id}'}, '', '?post=${post.id}');">
                        <div class="h-48 overflow-hidden">
                            <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500">
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <div class="text-xs text-accent font-bold mb-2 uppercase tracking-wider">Seyahat Rehberi</div>
                            <h3 class="text-xl font-bold mb-3 text-primary line-clamp-2">${post.title}</h3>
                            <p class="text-secondary text-sm mb-4 line-clamp-3 flex-grow">${post.summary}</p>
                            <div class="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                                <span class="text-xs text-secondary">${post.date}</span>
                                <span class="text-sm font-semibold text-accent flex items-center group">
                                    Oku 
                                    <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            const newUrl = `${window.location.pathname}?page=blog`;
            if (window.location.search !== '?page=blog') {
                 window.history.pushState({ page: 'blog' }, 'Blog', newUrl);
            }
        };

        const displayBlogPost = async (slug) => {
            const escapeHtml = (str) => String(str || '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');

            blogDetailView.classList.remove('hidden');
            blogDetailView.innerHTML = `
                <div class="fade-in max-w-4xl mx-auto">
                    <button onclick="window.history.pushState({page: 'blog'}, '', '?page=blog');" class="btn btn-secondary mb-6 py-2 px-4 rounded-lg flex items-center hover:bg-card-bg hover:shadow-md transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Blog Listesine Dön
                    </button>
                    <div class="content-card glass-card overflow-hidden">
                        <div class="h-64 md:h-96 w-full relative">
                            <div class="w-full h-full skeleton"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-8" style="background-color: rgba(0,0,0,0.6);">
                                <h1 class="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">Yükleniyor...</h1>
                                <p class="text-white/80 text-sm">Vuelina Editörü</p>
                            </div>
                        </div>
                        <div class="p-8 md:p-12">
                            <div class="prose prose-lg [data-theme*='dark']:prose-invert max-w-none text-secondary">
                                <div class="skeleton h-6 w-2/3 rounded mb-4"></div>
                                <div class="skeleton h-4 w-full rounded mb-2"></div>
                                <div class="skeleton h-4 w-11/12 rounded mb-2"></div>
                                <div class="skeleton h-4 w-10/12 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            try {
                if (window.location.protocol === 'file:') {
                    throw new Error('Blog içeriği için sunucu gerekli.');
                }

                const response = await fetch('/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'contentful-blog-posts', slug })
                });
                if (!response.ok) throw new Error('Failed to fetch blog post');
                const payload = await response.json();
                console.log('Blog post response:', payload);
                const item = Array.isArray(payload.data?.items) ? payload.data.items[0] : null;
                if (!item) throw new Error('Post not found');

                console.log('Blog post item:', item);
                console.log('Blog post fields:', item.fields);

                const title = item.fields?.title || slug;
                const image = item.fields?.imageUrl || "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1200&auto=format&fit=crop";
                const date = item.fields?.publishedAt ? new Date(item.fields.publishedAt).toLocaleDateString('tr-TR') : '';
                const summary = item.fields?.summary || '';
                let contentHtml = item.fields?.contentHtml || '';

                if (!contentHtml && item.fields?.content) {
                    if (typeof item.fields.content === 'object') {
                        const parseRichText = (node) => {
                            if (!node) return '';
                            if (typeof node === 'string') return escapeHtml(node);
                            
                            if (node.nodeType === 'text') {
                                let text = escapeHtml(node.value || '');
                                if (node.marks && node.marks.length > 0) {
                                    node.marks.forEach(mark => {
                                        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
                                        if (mark.type === 'italic') text = `<em>${text}</em>`;
                                        if (mark.type === 'underline') text = `<u>${text}</u>`;
                                        if (mark.type === 'code') text = `<code>${text}</code>`;
                                    });
                                }
                                return text;
                            }
                            
                            if (node.content && Array.isArray(node.content)) {
                                const children = node.content.map(child => parseRichText(child)).join('');
                                switch (node.nodeType) {
                                    case 'paragraph': return `<p class="mb-4">${children}</p>`;
                                    case 'heading-1': return `<h1 class="text-3xl font-bold mt-8 mb-4">${children}</h1>`;
                                    case 'heading-2': return `<h2 class="text-2xl font-bold mt-6 mb-3">${children}</h2>`;
                                    case 'heading-3': return `<h3 class="text-xl font-bold mt-5 mb-2">${children}</h3>`;
                                    case 'heading-4': return `<h4 class="text-lg font-bold mt-4 mb-2">${children}</h4>`;
                                    case 'heading-5': return `<h5 class="text-base font-bold mt-3 mb-1">${children}</h5>`;
                                    case 'heading-6': return `<h6 class="text-sm font-bold mt-3 mb-1">${children}</h6>`;
                                    case 'unordered-list': return `<ul class="list-disc pl-6 mb-4 space-y-2">${children}</ul>`;
                                    case 'ordered-list': return `<ol class="list-decimal pl-6 mb-4 space-y-2">${children}</ol>`;
                                    case 'list-item': return `<li>${children}</li>`;
                                    case 'blockquote': return `<blockquote class="border-l-4 border-accent pl-4 italic my-4">${children}</blockquote>`;
                                    case 'hr': return `<hr class="my-6 border-border-color"/>`;
                                    case 'hyperlink': 
                                        return `<a href="${node.data?.uri}" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-primary">${children}</a>`;
                                    case 'embedded-asset-block':
                                        const url = node.data?.target?.fields?.file?.url;
                                        if (url) return `<img src="${url}" alt="${node.data?.target?.fields?.title || ''}" class="w-full rounded-lg my-6"/>`;
                                        return '';
                                    case 'document': return children;
                                    default: return children;
                                }
                            }
                            
                            return `<pre class="overflow-x-auto text-xs bg-gray-100 p-4 rounded text-black">${escapeHtml(JSON.stringify(node, null, 2))}</pre>`;
                        };
                        
                        contentHtml = parseRichText(item.fields.content);
                    } else if (typeof item.fields.content === 'string') {
                        contentHtml = escapeHtml(item.fields.content).replace(/\n/g, '<br/>');
                    }
                }

                updateSchema('blog', { id: slug, title, summary, image, date, content: summary });

                blogDetailView.innerHTML = `
                    <div class="fade-in max-w-4xl mx-auto">
                        <button onclick="window.history.pushState({page: 'blog'}, '', '?page=blog');" class="btn btn-secondary mb-6 py-2 px-4 rounded-lg flex items-center hover:bg-card-bg hover:shadow-md transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            Blog Listesine Dön
                        </button>
                        <div class="content-card glass-card overflow-hidden">
                            <div class="h-64 md:h-96 w-full relative">
                                <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="w-full h-full object-cover">
                                <div class="absolute bottom-0 left-0 right-0 p-8" style="background-color: rgba(0,0,0,0.6);">
                                    <h1 class="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">${escapeHtml(title)}</h1>
                                    <p class="text-white/80 text-sm">${escapeHtml(date)} • Vuelina Editörü</p>
                                </div>
                            </div>
                            <div class="p-8 md:p-12">
                                <div class="prose prose-lg [data-theme*='dark']:prose-invert max-w-none text-secondary">
                                    ${contentHtml || `<p>${escapeHtml(summary)}</p>`}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error("Contentful Error:", error);
                blogDetailView.innerHTML = `
                    <div class="fade-in max-w-4xl mx-auto">
                        <button onclick="window.history.pushState({page: 'blog'}, '', '?page=blog');" class="btn btn-secondary mb-6 py-2 px-4 rounded-lg flex items-center hover:bg-card-bg hover:shadow-md transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            Blog Listesine Dön
                        </button>
                        <div class="content-card p-8 text-center">
                            <h3 class="text-xl font-bold text-primary mb-2">Bu içerik şu an yüklenemiyor</h3>
                            <p class="text-secondary text-sm">Lütfen daha sonra tekrar deneyin.</p>
                        </div>
                    </div>
                `;
            }

            scrollToTop();
        };

        const displayCountryDetail = async (countryName) => {
            const country = countriesData[countryName];
            updateSchema('country', { name: countryName, description: country.description, code: country.code || 'TR' });
            
            // Yeni: URL'yi güncelle (SEO için kritik)
            const currentCountryParam = new URLSearchParams(window.location.search).get('country');
            const shouldUpdateUrl = !currentCountryParam || currentCountryParam.toLocaleLowerCase('tr') !== countryName.toLocaleLowerCase('tr');
            if (shouldUpdateUrl) {
                const newUrl = `${window.location.pathname}?country=${encodeURIComponent(countryName)}`;
                window.history.pushState({ country: countryName }, countryName, newUrl);
            }

            const popularAppsHtml = country.popularApps.map(app => `
                <li class="flex items-center">
                    <span class="font-semibold text-primary mr-2">${app.name}</span>
                    <span class="text-sm text-secondary">- ${app.category}</span>
                </li>
            `).join('');
            const fastFoodHtml = country.fastFoodChains.map(chain => `<li class="text-secondary">${chain}</li>`).join('');
            const basicPhrasesHtml = country.basicPhrases.map(phrase => `
                <li class="flex justify-between items-center">
                    <span class="text-primary">${phrase.tr}</span>
                    <span class="text-secondary font-semibold">${phrase.local}</span>
                </li>
            `).join('');

            // AI içeriğini dinamik olarak kontrol et ve HTML'e ekle
            const itineraryContent = aiGeneratedContent[countryName]?.itinerary ? formatGeminiResponse(aiGeneratedContent[countryName].itinerary) : 
                `<p class="text-center text-secondary">Seyahat planı oluşturulmadı. Lütfen butona tıklayarak Yapay Zeka Asistanından talep edin.</p>`;
            const culturalTipsContent = aiGeneratedContent[countryName]?.tips ? formatGeminiResponse(aiGeneratedContent[countryName].tips) : 
                `<p class="text-center text-secondary">Kültürel ipuçları henüz oluşturulmadı. Lütfen butona tıklayarak Yapay Zeka Asistanından talep edin.</p>`;
            const packingListContent = aiGeneratedContent[countryName]?.packing ? formatGeminiResponse(aiGeneratedContent[countryName].packing) : 
                `<p class="text-center text-secondary">Bavul hazırlama listesi oluşturulmadı. Lütfen butona tıklayarak Yapay Zeka Asistanından talep edin.</p>`;

            const quickLook = {
                visa: country.visaStatus || 'Vize Bilgisi',
                bestTime: country.bestTime || 'En İyi Dönem',
                budget: country.dailyBudget || 'Bütçe',
                plug: country.plugType || 'Priz Tipi',
                tipping: country.tipping || 'Bahşiş',
            };

            const aiResultsContainerHtml = `
                <div class="mt-8 pt-8 border-t border-border-color relative">
                    <!-- AI Section Background Pattern -->
                    <div class="absolute inset-0 opacity-5 pointer-events-none" style="
                        background-image: 
                            radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, var(--accent) 0%, transparent 50%),
                            radial-gradient(circle at 40% 20%, var(--accent) 0%, transparent 50%);
                        background-size: 200px 200px, 150px 150px, 100px 100px;
                        background-position: 0% 0%, 100% 100%, 50% 50%;
                        background-repeat: no-repeat;
                    "></div>
                    
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                    </svg>
                                </div>
                                <h3 class="text-3xl font-bold text-primary">AI Asistan</h3>
                            </div>
                            <span class="text-xs text-secondary uppercase tracking-wider">Ücretsiz</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="ai-tool-card">
                                <div class="flex items-center gap-4 pr-4">
                                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            <polyline points="9 22 9 12 15 12 15 22"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="font-bold text-primary">Seyahat Planı</div>
                                        <div class="text-xs text-secondary mt-1">Gün gün rota ve öneriler.</div>
                                    </div>
                                </div>
                                <button id="open-itinerary-modal-btn" class="ai-tool-btn">Oluştur</button>
                            </div>

                            <div class="ai-tool-card">
                                <div class="flex items-center gap-4 pr-4">
                                    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="font-bold text-primary">Kültürel İpuçları</div>
                                        <div class="text-xs text-secondary mt-1">Yerel görgü ve pratik bilgiler.</div>
                                    </div>
                                </div>
                                <button id="get-cultural-tips-btn" class="ai-tool-btn">Oluştur</button>
                            </div>

                            <div class="ai-tool-card">
                                <div class="flex items-center gap-4 pr-4">
                                    <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="8.5" cy="7" r="4"/>
                                            <line x1="20" y1="8" x2="20" y2="14"/>
                                            <line x1="23" y1="11" x2="17" y2="11"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="font-bold text-primary">Bavul Listesi</div>
                                        <div class="text-xs text-secondary mt-1">Hızlı ve eksiksiz kontrol listesi.</div>
                                    </div>
                                </div>
                                <button id="open-packing-list-btn" class="ai-tool-btn">Oluştur</button>
                            </div>
                        </div>

                    <div class="mt-6 space-y-6">
                        <div id="ai-itinerary-embed" class="content-card p-6 rounded-2xl markdown-content ${aiGeneratedContent[countryName]?.itinerary ? '' : 'hidden'}">
                            <h4 class="text-xl font-bold mb-4 text-primary">🗺️ Seyahat Planı</h4>
                            <div class="prose prose-sm sm:prose-base [data-theme*='dark']:prose-invert max-w-none">${itineraryContent}</div>
                        </div>

                        <div id="ai-tips-embed" class="content-card p-6 rounded-2xl markdown-content ${aiGeneratedContent[countryName]?.tips ? '' : 'hidden'}">
                            <h4 class="text-xl font-bold mb-4 text-primary">💡 Kültürel İpuçları</h4>
                            <div class="prose prose-sm sm:prose-base [data-theme*='dark']:prose-invert max-w-none">${culturalTipsContent}</div>
                        </div>

                        <div id="ai-packing-embed" class="content-card p-6 rounded-2xl markdown-content ${aiGeneratedContent[countryName]?.packing ? '' : 'hidden'}">
                            <h4 class="text-xl font-bold mb-4 text-primary">🎒 Bavul Listesi</h4>
                            <div class="prose prose-sm sm:prose-base [data-theme*='dark']:prose-invert max-w-none">${packingListContent}</div>
                        </div>
                    </div>
                </div>
            `;
            
            countryListView.classList.add('hidden');
            countryDetailView.innerHTML = `
                <div class="animate-fade-in-up">
                    <button id="back-to-list" class="btn btn-secondary mb-10 py-3 px-6 rounded-xl flex items-center hover:bg-card-bg hover:shadow-xl transition-all group stagger-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Keşfe Geri Dön
                    </button>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <!-- LEFT COLUMN (Main Content) -->
                        <div class="lg:col-span-8 space-y-10">
                            
                            <!-- Hero Section -->
                            <div class="content-card p-8 md:p-12 relative overflow-hidden stagger-2 flex flex-col justify-end min-h-[400px]" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 100%), url('https://image.pollinations.ai/prompt/${encodeURIComponent(countryName)}%20landmark%20beautiful%20photography%20scenic?width=1600&height=500&nologo=true') center/cover no-repeat; border-radius: 2rem; box-shadow: inset 0 0 100px rgba(0,0,0,0.5);">
                                <div class="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10 h-full w-full mt-auto">
                                    <div class="text-8xl md:text-9xl filter drop-shadow-2xl transform hover:scale-110 transition-transform duration-500 cursor-default p-2 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">${country.flag}</div>
                                    <div class="flex-1 pb-2">
                                        <h2 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-3 text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">${countryName} <span class="text-2xl md:text-3xl text-white/70 font-light ml-2">(${country.code || ''})</span></h2>
                                        <p class="text-lg md:text-xl text-white/90 leading-relaxed font-light drop-shadow-md max-w-2xl">${country.description}</p>
                                    </div>
                                </div>
                                <div class="mt-8 flex flex-wrap gap-4 relative z-10 border-t border-white/20 pt-6">
                                    <a href="https://www.skyscanner.com.tr/transport/flights/tr/${(country.code || 'tr').toLowerCase()}/?adults=1&cabinclass=economy." target="_blank" class="bg-indigo-600/90 backdrop-blur-md text-white border border-indigo-400/50 flex flex-1 md:flex-none items-center justify-center gap-3 py-3 px-6 text-base md:text-lg rounded-2xl font-bold font-medium shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 3L5 15l-3 1 1 3 3-1 4-4 9 6c.4.3.9.1 1-.4l-.2-1.4z"/></svg> Uçuş Bul
                                    </a>
                                    <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(country.code || countryName)}&selected_currency=TRY." target="_blank" class="bg-white/10 backdrop-blur-xl text-white border border-white/30 flex flex-1 md:flex-none items-center justify-center gap-3 py-3 px-6 text-base md:text-lg rounded-2xl font-bold font-medium shadow-xl hover:bg-white/20 hover:-translate-y-1 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-6.57"/><path d="M14 22v-6.57"/><path d="M19 3v11.83"/><path d="M22 6.57v3.26"/><path d="M3 22v-6.57"/><path d="M5 3v11.83"/><path d="M8 6.57v3.26"/><path d="M8.57 2H10v4.57H8.57z"/><path d="M14 2h1.43v4.57H14z"/><path d="M5.43 2.57h13.14V7.5H5.43z"/><path d="M3 13.5v8.5h18v-8.5"/><path d="m3 13.5 1.43-1.43c.1-.1.25-.1.35 0L6.5 13.8l1.7-1.74a.26.26 0 0 1 .36 0L10.3 13.8l1.7-1.74a.26.26 0 0 1 .36 0l1.73 1.74 1.71-1.74a.26.26 0 0 1 .37 0l1.43 1.44v8.5"/></svg> Otel Bak
                                    </a>
                                    <button id="share-country-btn" class="bg-emerald-500/20 backdrop-blur-xl text-emerald-100 border border-emerald-400/30 flex flex-1 md:flex-none items-center justify-center gap-3 py-3 px-6 text-base md:text-lg rounded-2xl font-bold font-medium shadow-xl hover:bg-emerald-500/40 hover:-translate-y-1 transition-all group" title="Bu Ülkenin Profilini Paylaş">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                        Paylaş
                                    </button>
                                </div>
                            </div>

                            <div class="content-card p-8">
                                <div class="flex items-center justify-between mb-6">
                                    <h3 class="text-2xl font-bold text-primary">Hızlı Bakış</h3>
                                    <span class="text-xs text-secondary uppercase tracking-wider">Veri Odaklı</span>
                                </div>
                                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div class="p-4 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                        <div class="text-xl mb-2">🛂</div>
                                        <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Vize Şartları</div>
                                        <div class="text-sm font-bold text-primary">${quickLook.visa}</div>
                                    </div>
                                    <div class="p-4 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                        <div class="text-xl mb-2">📅</div>
                                        <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">En İyi Dönem</div>
                                        <div class="text-sm font-bold text-primary">${quickLook.bestTime}</div>
                                    </div>
                                    <div class="p-4 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                        <div class="text-xl mb-2">💰</div>
                                        <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Günlük Bütçe</div>
                                        <div class="text-sm font-bold text-primary">${quickLook.budget}</div>
                                    </div>
                                    <div class="p-4 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                        <div class="text-xl mb-2">🔌</div>
                                        <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Priz Tipi</div>
                                        <div class="text-sm font-bold text-primary">${quickLook.plug}</div>
                                    </div>
                                    <div class="p-4 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                        <div class="text-xl mb-2">☕</div>
                                        <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">Bahşiş</div>
                                        <div class="text-sm font-bold text-primary">${quickLook.tipping}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabs & Content -->
                            <div class="content-card glass-card p-8 stagger-3">
                                <div class="border-b border-border-color mb-8 overflow-x-auto">
                                    <nav class="flex space-x-10 min-w-max" id="detail-tabs">
                                        <button data-tab="todo" class="tab-button active font-bold text-xl flex items-center gap-3 pb-5 transition-all">${icons.map} Gezilecek Yerler</button>
                                        <button data-tab="toeat" class="tab-button font-bold text-xl flex items-center gap-3 pb-5 transition-all">${icons.utensils} Mutfak Kültürü</button>
                                        <button data-tab="tostay" class="tab-button font-bold text-xl flex items-center gap-3 pb-5 transition-all">${icons.bed} Nerede Kalınır?</button>
                                        <button data-tab="fastfood" class="tab-button font-bold text-xl flex items-center gap-3 pb-5 transition-all">${icons.fastfood} Fast Food</button>
                                    </nav>
                                </div>
                                
                                <div id="tab-content-container" class="min-h-[200px]">
                                    <div id="tab-todo" class="tab-content active space-y-4">
                                        <ul class="space-y-3">
                                            ${country.whatToDo.map(i => `<li class="flex items-start gap-3"><span class="text-accent mt-1">●</span><span class="text-secondary">${i}</span></li>`).join('')}
                                        </ul>
                                        <div class="mt-6 pt-4 border-t border-border-color">
                                            <a href="https://www.getyourguide.com/s/?q=${encodeURIComponent(country.code || countryName)}" target="_blank" class="flex items-center gap-2 text-accent font-semibold hover:text-accent-dark transition-colors group">
                                                <span>Bu bölgedeki en popüler turları keşfet</span>
                                                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                            </a>
                                        </div>
                                    </div>
                                    <div id="tab-toeat" class="tab-content">
                                        <ul class="space-y-3">
                                            ${country.whatToEat.map(i => `<li class="flex items-start gap-3"><span class="text-accent mt-1">●</span><span class="text-secondary">${i}</span></li>`).join('')}
                                        </ul>
                                    </div>
                                    <div id="tab-tostay" class="tab-content">
                                        <ul class="space-y-3">
                                            ${country.whereToStay.map(i => `<li class="flex items-start gap-3"><span class="text-accent mt-1">●</span><span class="text-secondary">${i}</span></li>`).join('')}
                                        </ul>
                                    </div>
                                    <div id="tab-fastfood" class="tab-content">
                                        <ul class="space-y-3">
                                            ${country.fastFoodChains.map(i => `<li class="flex items-start gap-3"><span class="text-accent mt-1">●</span><span class="text-secondary">${i}</span></li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div class="ad-area ad-infeed">
                                <ins class="adsbygoogle"
                                     style="display:block"
                                     data-ad-format="fluid"
                                     data-ad-layout-key="-fb+5w+4e-db+86"
                                     data-ad-client="ca-pub-9708298035800838"
                                     data-ad-slot="1111111111"></ins>
                                <script>
                                     (adsbygoogle = window.adsbygoogle || []).push({});
                                </script>
                            </div>
                            <!-- AI Assistant Section -->
                             ${aiResultsContainerHtml}

                        </div>

                        <!-- RIGHT COLUMN (Sidebar) -->
                        <div class="lg:col-span-4 space-y-6">
                            
                            <!-- Map Card -->
                            <div class="content-card glass-card p-1 overflow-hidden h-64 shadow-md">
                                <iframe width="100%" height="100%" style="border:0; border-radius: 16px;" loading="lazy" allowfullscreen src="https://maps.google.com/maps?q=${encodeURIComponent(countryName)}&t=&z=5&ie=UTF8&iwloc=&output=embed"></iframe>
                            </div>

                            <div class="ad-area ad-square">
                                <ins class="adsbygoogle"
                                     style="display:block; width: 100%; height: 250px;"
                                     data-ad-client="ca-pub-9708298035800838"
                                     data-ad-slot="2222222222"
                                     data-ad-format="auto"
                                     data-full-width-responsive="true"></ins>
                                <script>
                                     (adsbygoogle = window.adsbygoogle || []).push({});
                                </script>
                            </div>

                            <!-- Quick Info -->
                            <div class="content-card glass-card p-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    ${icons.info}
                                    <span class="text-primary">Hızlı Bilgiler</span>
                                </h3>
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between p-3 rounded-lg bg-background border border-border-color">
                                        <span class="text-sm text-secondary">Para Birimi</span>
                                        <span class="font-bold text-primary">${country.currency}</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 rounded-lg bg-background border border-border-color">
                                        <span class="text-sm text-secondary">Dil</span>
                                        <span class="font-bold text-primary text-right max-w-[150px] truncate">${country.language}</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                                        <span class="text-sm text-red-600 dark:text-red-400 font-medium">Acil Durum</span>
                                        <span class="font-bold text-red-600 dark:text-red-400">${country.emergencyNumber}</span>
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <h4 class="font-semibold text-sm text-primary mb-3">İklim</h4>
                                    <p class="text-sm text-secondary leading-relaxed bg-background p-3 rounded-lg border border-border-color">${country.climate}</p>
                                </div>
                            </div>

                            <!-- Tools: Currency Converter -->
                            <div class="content-card glass-card p-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span class="text-2xl">💱</span>
                                    <span class="text-primary">Döviz Çevirici</span>
                                </h3>
                                <div id="currency-converter-container">
                                    <div id="currency-converter-content" class="space-y-3">Yükleniyor...</div>
                                </div>
                            </div>
                            
                            <!-- Useful Apps -->
                            <div class="content-card glass-card p-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    ${icons.smartphone}
                                    <span class="text-primary">Faydalı Uygulamalar</span>
                                </h3>
                                <ul class="space-y-3">
                                    ${popularAppsHtml}
                                </ul>
                            </div>

                             <!-- Basic Phrases -->
                            <div class="content-card glass-card p-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span class="text-2xl">🗣️</span>
                                    <span class="text-primary">Temel İfadeler</span>
                                </h3>
                                <ul class="space-y-3">
                                    ${basicPhrasesHtml}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>`;
            countryDetailView.classList.remove('hidden');
            scrollToTop();
            
            await initCurrencyConverter(country.currency);

            document.getElementById('back-to-list').addEventListener('click', () => {
                countryDetailView.classList.add('hidden');
                countryListView.classList.remove('hidden');
                // Yeni: Ana sayfaya dönerken URL'yi temizle
                window.history.pushState({}, document.title, window.location.pathname);
            });
            
            const tabs = document.getElementById('detail-tabs').querySelectorAll('button');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    document.querySelectorAll('#tab-content-container .tab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
                });
            });
            
            // Yapay Zeka Butonları için olay dinleyicilerini yeniden ata (Yeni butonu bulmak için)
            document.getElementById('open-itinerary-modal-btn').onclick = () => {
                document.getElementById('itinerary-modal-subtitle').textContent = `${countryName} için plan oluştur.`;
                itineraryModal.classList.add('visible');
            };

            const shareBtn = document.getElementById('share-country-btn');
            if(shareBtn) {
                shareBtn.onclick = () => {
                    const url = window.location.href;
                    const fallbackCopy = () => {
                        const el = document.createElement('textarea');
                        el.value = url;
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand('copy');
                        document.body.removeChild(el);
                        if(typeof showToast === 'function') showToast('Bağlantı Panoya Kopyalandı!', 'success');
                        else alert('Bağlantı Panoya Kopyalandı!');
                    };
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(url).then(() => {
                            if(typeof showToast === 'function') showToast('Bağlantı Panoya Kopyalandı!', 'success');
                            else alert('Bağlantı Panoya Kopyalandı!');
                        }).catch(() => fallbackCopy());
                    } else {
                        fallbackCopy();
                    }
                };
            }

            
            // Itinerary modal içindeki butona yeni işlev atama (önceki atanmış işlevi ezer)
            const itineraryDurationInput = document.getElementById('itinerary-duration');
            const itineraryInterestsInput = document.getElementById('itinerary-interests');

            getItineraryBtn.onclick = () => {
                const duration = itineraryDurationInput.value || "3";
                const interests = itineraryInterestsInput.value || "genel turistik yerler ve yerel lezzetler";
                generateItinerary(countryName, duration, interests);
                itineraryModal.classList.remove('visible');
            };

            document.getElementById('get-cultural-tips-btn').onclick = () => {
                getCulturalTips(countryName);
            };

            document.getElementById('open-packing-list-btn').onclick = () => {
                const duration = document.getElementById('itinerary-duration').value || "7";
                generatePackingList(countryName, duration, 'mevsimine uygun');
            };

        };

        const typeIntoProse = (proseEl, markdownText) => {
            if (!proseEl) return;
            proseEl.classList.add('typing-text');
            proseEl.textContent = '';
            let i = 0;
            const timer = setInterval(() => {
                i += 2;
                if (i >= markdownText.length) {
                    clearInterval(timer);
                    proseEl.classList.remove('typing-text');
                    proseEl.innerHTML = formatGeminiResponse(markdownText);
                    return;
                }
                proseEl.textContent = markdownText.slice(0, i);
            }, 12);
        };

        const generateItinerary = async (countryName, duration, interests) => {
            const resultEmbed = document.getElementById('ai-itinerary-embed');
            const triggerBtn = document.getElementById('open-itinerary-modal-btn');
            resultEmbed.classList.remove('hidden');
            
            const tempResultDiv = document.createElement('div');
            tempResultDiv.innerHTML = `<div class="content-card p-6 rounded-2xl text-center text-secondary">Akıllı asistanımız senin için planı hazırlıyor...</div>`;
            const prose = resultEmbed.querySelector('div.prose');
            prose.innerHTML = tempResultDiv.innerHTML;


            const prompt = `Lütfen "${countryName}" için ${duration} günlük, heyecan verici ve detaylı bir seyahat planı oluştur. İlgi alanları: ${interests}. Plan, her gün için Sabah, Öğle, Akşam aktiviteleri içermeli. Her aktivite için kısa ve ilgi çekici bir açıklama ekle. Cevabını Türkçe ve Markdown formatında, başlıklar ve listeler kullanarak ver. Ana başlıklar için '##', alt başlıklar için '###' kullan.`;
            
            const originalBtnText = triggerBtn.innerText;
            triggerBtn.disabled = true;
            triggerBtn.innerText = "Düşünüyor...";
            triggerBtn.classList.add('opacity-75', 'cursor-wait');

            const result = await callGroqAPI(prompt);

            triggerBtn.disabled = false;
            triggerBtn.innerText = originalBtnText;
            triggerBtn.classList.remove('opacity-75', 'cursor-wait');

            if (!result) {
                showInfoModal("Bilgi", 'Yapay zeka şu an yanıt veremiyor.');
                return;
            }
            const text = result;
            if (text) {
                if (!aiGeneratedContent[countryName]) aiGeneratedContent[countryName] = {};
                aiGeneratedContent[countryName].itinerary = text;
                typeIntoProse(prose, text);
            }
        };

        const getCulturalTips = async (countryName) => {
            const resultEmbed = document.getElementById('ai-tips-embed');
            const tipsBtn = document.getElementById('get-cultural-tips-btn');
            resultEmbed.classList.remove('hidden');
            
            const tempResultDiv = document.createElement('div');
            tempResultDiv.innerHTML = `<div class="content-card p-6 rounded-2xl text-center text-secondary">Akıllı asistanımız senin için ipuçlarını hazırlıyor...</div>`;
            const prose = resultEmbed.querySelector('div.prose');
            prose.innerHTML = tempResultDiv.innerHTML;

            const prompt = `Türkiye'den ${countryName}'e seyahat edecek bir turist için 5 önemli kültürel ipucu ve görgü kuralı listele. İpuçları pratik, anlaşılır ve saygılı bir tonda olmalı. Örneğin, selamlaşma, bahşiş, giyim kuralları, hediyeleşme ve kaçınılması gereken hassas konular gibi başlıkları ele al. Cevabını Türkçe ve Markdown formatında ver.`;

            const originalBtnText = tipsBtn.innerText;
            tipsBtn.disabled = true;
            tipsBtn.innerText = "Düşünüyor...";
            tipsBtn.classList.add('opacity-75', 'cursor-wait');

            const result = await callGroqAPI(prompt);

            tipsBtn.disabled = false;
            tipsBtn.innerText = originalBtnText;
            tipsBtn.classList.remove('opacity-75', 'cursor-wait');

            if (!result) {
                showInfoModal("Bilgi", 'Yapay zeka şu an yanıt veremiyor.');
                return;
            }
            const text = result;
            if (text) {
                if (!aiGeneratedContent[countryName]) aiGeneratedContent[countryName] = {};
                aiGeneratedContent[countryName].tips = text;
                typeIntoProse(prose, text);
            }
        };

        const generatePackingList = async (countryName, duration, season) => {
            const resultEmbed = document.getElementById('ai-packing-embed');
            const packingBtn = document.getElementById('open-packing-list-btn');
            resultEmbed.classList.remove('hidden');
            
            const tempResultDiv = document.createElement('div');
            tempResultDiv.innerHTML = `<div class="content-card p-6 rounded-2xl text-center text-secondary">Akıllı asistanımız senin için listeyi hazırlıyor...</div>`;
            const prose = resultEmbed.querySelector('div.prose');
            prose.innerHTML = tempResultDiv.innerHTML;

            const prompt = `Lütfen "${countryName}" için ${duration} günlük, ${season} bir seyahate yönelik detaylı bir bavul hazırlama listesi oluştur. Listeyi Giyim, Elektronik, Kişisel Bakım ve Belgeler gibi pratik kategorilere ayır. Cevabını Türkçe ve Markdown formatında ver.`;
            
            const originalBtnText = packingBtn.innerText;
            packingBtn.disabled = true;
            packingBtn.innerText = "Düşünüyor...";
            packingBtn.classList.add('opacity-75', 'cursor-wait');

            const result = await callGroqAPI(prompt);

            packingBtn.disabled = false;
            packingBtn.innerText = originalBtnText;
            packingBtn.classList.remove('opacity-75', 'cursor-wait');

            if (!result) {
                showInfoModal("Bilgi", 'Yapay zeka şu an yanıt veremiyor.');
                return;
            }
            const text = result;
            if (text) {
                if (!aiGeneratedContent[countryName]) aiGeneratedContent[countryName] = {};
                aiGeneratedContent[countryName].packing = text;
                typeIntoProse(prose, text);
            }
        };
        
        // Diğer fonksiyonlar (fetchCurrencyRates, initCurrencyConverter, legalTexts, showLegalModal, renderChecklist, saveChecklistState, handleChecklistInteraction)

        const fetchCurrencyRates = async () => {
            if (currencyRates) return;
            try {
                // Frankfurter API - supports all major currencies
                const response = await fetch('https://api.frankfurter.app/latest?from=TRY');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                currencyRates = data.rates;
                currencyRates['TRY'] = 1; // Base currency
                
                // Add additional common currencies that might not be in the base response
                const additionalCurrencies = ['ALL', 'JPY', 'EUR', 'SEK', 'HUF', 'MKD', 'CHF', 'GBP', 'USD', 'AUD', 'CAD', 'NOK', 'DKK', 'PLN', 'CZK', 'RON', 'BGN', 'HRK', 'RSD', 'BAM', 'ISK'];
                
                // Try to get rates for additional currencies
                for (const currency of additionalCurrencies) {
                    if (!currencyRates[currency]) {
                        try {
                            const extraResponse = await fetch(`https://api.frankfurter.app/latest?from=TRY&to=${currency}`);
                            if (extraResponse.ok) {
                                const extraData = await extraResponse.json();
                                if (extraData.rates[currency]) {
                                    currencyRates[currency] = extraData.rates[currency];
                                }
                            }
                        } catch (error) {
                            console.log(`Could not fetch rate for ${currency}:`, error.message);
                        }
                    }
                }
                
                console.log('Available currencies:', Object.keys(currencyRates).sort());
                
                // Update any existing currency converter if it's waiting
                const converterContent = document.getElementById('currency-converter-content');
                if (converterContent && converterContent.innerHTML.includes('Kurlar yükleniyor...')) {
                    // Re-initialize with the loaded rates
                    const countryName = new URLSearchParams(window.location.search).get('country');
                    if (countryName) {
                        const country = countriesData[Object.keys(countriesData).find(key => 
                            key.toLocaleLowerCase('tr') === countryName.toLocaleLowerCase('tr')
                        )];
                        if (country) {
                            await initCurrencyConverter(country.currency);
                        }
                    }
                }
            } catch (error) {
                console.error("Döviz kurları alınamadı:", error);
                const converterContent = document.getElementById('currency-converter-content');
                if(converterContent) {
                    converterContent.innerHTML = `<p class="text-red-500">Kurlar yüklenemedi. İnternet bağlantınızı kontrol edin.</p>`;
                }
            }
        };

        const initCurrencyConverter = async (localCurrency) => {
            const container = document.getElementById('currency-converter-content');
            
            // Show loading state
            container.innerHTML = `<p class="text-gray-500">Kurlar yükleniyor...</p>`;
            
            // Ensure currency rates are loaded with timeout
            if (!currencyRates) {
                try {
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 5000)
                    );
                    await Promise.race([fetchCurrencyRates(), timeoutPromise]);
                } catch (error) {
                    console.error('Currency rates loading failed:', error);
                    container.innerHTML = `<p class="text-red-500">Kurlar yüklenemedi. İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.</p>`;
                    return;
                }
            }
            
            // Check again after trying to load
            if (!currencyRates) {
                container.innerHTML = `<p class="text-red-500">Kurlar yüklenemedi. Lütfen sayfayı yenileyin.</p>`;
                return;
            }

            // Get all country currencies from the data
            const allCountryCurrencies = Object.values(countriesData).map(country => country.currency).filter(Boolean);
            const allCurrencies = [...new Set([...Object.keys(currencyRates), ...allCountryCurrencies])].sort();
            
            // Create searchable select options
            const createSearchableSelect = (id, selectedCurrency) => {
                const options = allCurrencies.map(c => {
                    const countryName = Object.keys(countriesData).find(key => countriesData[key].currency === c);
                    const displayName = countryName ? `${c} - ${countryName}` : c;
                    return `<option value="${c}" ${c === selectedCurrency ? 'selected' : ''}>${displayName}</option>`;
                }).join('');
                return `<select id="${id}" class="w-24 sm:w-32 flex-shrink-0 p-3 rounded-xl bg-card-bg border border-border-color shadow-sm focus:ring-2 focus:ring-accent outline-none text-xs sm:text-sm md:text-base font-medium touch-manipulation cursor-pointer truncate">${options}</select>`;
            };

            container.innerHTML = `
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                        <input type="number" id="from-amount" value="100" class="w-full p-4 rounded-xl bg-background border border-border-color text-xl font-bold shadow-inner focus:ring-2 focus:ring-accent outline-none transition-all touch-manipulation">
                        ${createSearchableSelect('from-currency', 'TRY')}
                    </div>
                    <div class="flex justify-center -my-3 relative z-10"><div class="bg-card-bg border border-border-color text-accent rounded-full p-2 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="14" x2="21" y2="3"></line><polyline points="8 21 3 21 3 16"></polyline><line x1="20" y1="10" x2="3" y2="21"></line></svg></div></div>
                     <div class="flex items-center gap-3">
                        <input type="text" id="to-amount" readonly class="w-full p-4 rounded-xl bg-background border border-border-color text-xl font-bold shadow-inner text-indigo-400 dark:text-indigo-300 focus:outline-none touch-manipulation">
                        ${createSearchableSelect('to-currency', localCurrency)}
                    </div>
                </div>`;
            
            const fromAmount = document.getElementById('from-amount');
            const fromCurrency = document.getElementById('from-currency');
            const toAmount = document.getElementById('to-amount');
            const toCurrency = document.getElementById('to-currency');
            
            const calculateCurrency = () => {
                const amount = parseFloat(fromAmount.value);
                const fromRate = currencyRates[fromCurrency.value];
                const toRate = currencyRates[toCurrency.value];
                if(isNaN(amount) || !fromRate || !toRate) {
                    toAmount.value = '';
                    return;
                }
                // Convert from FromCurrency to TRY base, then to ToCurrency
                const amountInTRY = amount / fromRate;
                const result = amountInTRY * toRate;
                toAmount.value = result.toFixed(2);
            };

            fromAmount.addEventListener('input', calculateCurrency);
            fromCurrency.addEventListener('change', calculateCurrency);
            toCurrency.addEventListener('change', calculateCurrency);
            
            calculateCurrency();
        };

        const legalTexts = {
            'privacy': `
                <h2>Gizlilik Politikası</h2>
                <p><strong>Son Güncelleme: Mart 2026</strong></p>
                <p>Vuelina ("Site" veya "Hizmet"), kullanıcılarının gizliliğine saygı duyar ve kişisel verilerin korunmasını öncelik haline getirir. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuata uygun olarak, Site'yi kullanırken hangi verilerin işlendiğini ve bu verilerin nasıl korunduğunu açıklar.</p>
                
                <h3>1. Toplanan Veriler ve İşleme Amaçları</h3>
                <p>Site'yi ziyaret ettiğinizde aşağıdaki veri kategorileri işlenebilir:</p>
                <ul>
                    <li><strong>Cihaz ve kullanım verileri:</strong> IP adresi, tarayıcı türü, işletim sistemi, ziyaret edilen sayfalar, tıklama ve gezinme bilgileri, oturum süresi.</li>
                    <li><strong>Çerezler ve benzeri teknolojiler:</strong> Tercihlerinizi (tema seçimi vb.) ve kullanıcı deneyimini iyileştirmek için kullanılan teknik ve fonksiyonel çerezler.</li>
                    <li><strong>İletişim verileri:</strong> İletişim formu veya e-posta yoluyla bizimle paylaştığınız ad, e-posta adresi ve mesaj içeriği.</li>
                </ul>
                <p>Bu veriler; hizmetin sunulması, performansın izlenmesi, güvenliğin sağlanması, hataların tespiti ve kullanıcı deneyiminin iyileştirilmesi amaçlarıyla işlenir.</p>
                
                <h3>2. Google AdSense ve Reklam Ortakları</h3>
                <p>Site, içerik ve reklamların kişiselleştirilmesi, reklam performansının ölçülmesi ve hileli etkinliklerin önlenmesi amacıyla Google AdSense ve diğer reklam iş ortaklarından hizmet alabilir. Bu kapsamda üçüncü taraf sağlayıcılar, tarayıcınıza çerez yerleştirebilir ve cihazınızla ilişkilendirilen benzersiz tanımlayıcılar aracılığıyla kullanım verilerinizi işleyebilir.</p>
                <p>Google tarafından çerezlerin kullanımı ve kişiselleştirilmiş reklamlar hakkında daha fazla bilgi için lütfen Google'ın <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Reklamcılık Politikaları</a> sayfasını ziyaret edin.</p>
                
                <h3>3. Çerez Yönetimi</h3>
                <p>Tarayıcınızın ayarlarını kullanarak çerezleri kabul edebilir, reddedebilir veya mevcut çerezleri silebilirsiniz. Çerezleri devre dışı bırakmanız durumunda, Site'nin bazı bölümleri beklenen şekilde çalışmayabilir.</p>
                
                <h3>4. Verilerin Saklanma Süresi</h3>
                <p>Kişisel verileriniz, ilgili mevzuatta öngörülen veya işleme amaçları için gerekli olan süre boyunca saklanır; bu süre sonunda mevzuata uygun yöntemlerle silinir, yok edilir veya anonim hale getirilir.</p>
                
                <h3>5. Haklarınız</h3>
                <p>KVKK kapsamında; kişisel verilerinize erişme, düzeltme, silinmesini veya işlemeye kısıt getirilmesini talep etme, işlenmesine itiraz etme ve veri taşınabilirliği haklarına sahipsiniz. Bu haklarınızı kullanmak için aşağıda yer alan iletişim kanalları üzerinden bizimle irtibata geçebilirsiniz.</p>
            `,
            'terms': `
                <h2>Kullanım Koşulları</h2>
                <p><strong>Son Güncelleme: Mart 2026</strong></p>
                <p>Bu Kullanım Koşulları ("Koşullar"), Vuelina tarafından sunulan web sitesi ve yapay zeka destekli seyahat asistanı hizmetinin kullanımına ilişkin kuralları düzenler. Site'ye erişerek veya Hizmet'i kullanarak bu Koşulları kabul etmiş sayılırsınız.</p>
    
                <h3>1. Hizmetin Kapsamı</h3>
                <p>Vuelina, seyahat planlamanıza yardımcı olmak amacıyla yapay zeka tabanlı öneriler, bilgilendirici içerikler ve yönlendirmeler sunar. Sunulan içerikler yalnızca genel bilgilendirme niteliğindedir ve hukuki, finansal veya profesyonel danışmanlık olarak yorumlanmamalıdır.</p>
                
                <h3>2. Sorumluluk Reddi</h3>
                <p>Uçuş saatleri, vize koşulları, döviz kurları ve diğer seyahat bilgilerinin doğruluğu için azami özen gösterilmekle birlikte, bu bilgilerin her zaman güncel olacağı garanti edilmez. Nihai kararlarınızı vermeden önce, ilgili resmi kurum ve kuruluşlardan bilgi almanız önerilir. Vuelina, Site'nin kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumlu değildir.</p>
                
                <h3>3. Fikri Mülkiyet Hakları</h3>
                <p>Site'de yer alan tüm metin, görsel, logo, ikon, tasarım ve yazılım bileşenleri Vuelina'ya veya lisans veren üçüncü kişilere aittir ve telif hakkı mevzuatı ile korunur. Önceden yazılı izin alınmaksızın, bu içerikler çoğaltılamaz, dağıtılamaz, kamuya açık şekilde kullanıma sunulamaz.</p>
                
                <h3>4. Kullanıcı Yükümlülükleri</h3>
                <p>Site'yi hukuka, kamu düzenine, genel ahlaka ve üçüncü kişilerin haklarına aykırı şekilde kullanamazsınız. Hizmet'e zarar verebilecek, işleyişi bozabilecek veya diğer kullanıcıların deneyimini olumsuz etkileyebilecek her türlü davranıştan kaçınmayı kabul edersiniz.</p>
                
                <h3>5. Değişiklikler</h3>
                <p>Vuelina, Site'yi ve bu Koşulları önceden bildirimde bulunmaksızın güncelleme veya sona erdirme hakkını saklı tutar. Güncel Koşullar her zaman bu sayfada yayımlanır.</p>
            `,
            'cookies': `
                <h2>Çerez Politikası</h2>
                <p><strong>Son Güncelleme: Mart 2026</strong></p>
                <p>Bu Çerez Politikası, Vuelina tarafından kullanılan çerez türlerini ve bu çerezlerin hangi amaçlarla işlendiğini açıklar. Site'yi kullanmaya devam ederek, bu Politikada açıklanan çerez kullanımını kabul etmiş olursunuz.</p>
                
                <h3>1. Çerez Nedir?</h3>
                <p>Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza veya cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, Site'nin düzgün çalışmasını sağlamak, tercihlerinizi hatırlamak ve istatistiksel analizler yapmak için kullanılır.</p>
                
                <h3>2. Kullandığımız Çerez Türleri</h3>
                <ul>
                    <li><strong>Zorunlu çerezler:</strong> Site'nin temel işlevlerinin çalışması için gereklidir. Oturumun devam ettirilmesi ve güvenlik gibi amaçlarla kullanılır.</li>
                    <li><strong>Performans ve analiz çerezleri:</strong> Site trafiğini ve kullanım istatistiklerini anlamamıza yardımcı olur. Bu veriler anonim olarak değerlendirilir.</li>
                    <li><strong>Reklam ve hedefleme çerezleri:</strong> Google AdSense ve benzeri reklam ortakları tarafından, ilgi alanlarınıza daha uygun reklamlar göstermek amacıyla kullanılabilir.</li>
                </ul>
                
                <h3>3. Çerezleri Nasıl Yönetebilirsiniz?</h3>
                <p>Tarayıcı ayarlarınızı kullanarak çerezleri kabul edebilir, reddedebilir veya belirli türdeki çerezleri engelleyebilirsiniz. Bununla birlikte, bazı çerezleri devre dışı bırakmanız, Site'nin fonksiyonlarının kısmen veya tamamen etkilenmesine neden olabilir.</p>
                
                <h3>4. Üçüncü Taraf Çerezleri</h3>
                <p>Google ve diğer iş ortakları, Site ziyaretleriniz hakkında istatistik toplamak ve reklamları kişiselleştirmek için kendi çerezlerini kullanabilir. Bu çerezler üzerinde doğrudan kontrolümüz bulunmamaktadır. Ayrıntılı bilgi için ilgili üçüncü taraf sağlayıcıların gizlilik ve çerez politikalarını incelemenizi öneririz.</p>
            `,
            'contact': `
                <h2>İletişim</h2>
                <p>Gizlilik, çerezler, reklam politikaları veya Hizmet'in kullanımı ile ilgili her türlü soru ve talebiniz için bizimle iletişime geçebilirsiniz.</p>
    
                <h3>1. İletişim Kanalları</h3>
                <ul>
                    <li><strong>E-posta:</strong> support@vuelina.com</li>
                </ul>
    
                <h3>2. Geri Dönüş Süresi</h3>
                <p>Talep ve sorularınıza, yoğunluğa bağlı olarak makul bir süre içinde yanıt verilmesi hedeflenir. Kişisel verilerinizle ilgili başvurularınız, ilgili mevzuatta öngörülen yasal süreler içerisinde değerlendirilecektir.</p>
            `
        };

        const aboutPremiumHtml = `
            <div class="about-premium">
                <h2>Vuelina: Planlama Yükünü At, Sadece Yola Odaklan.</h2>
                <p>Seyahat etmek bir özgürlük hikayesidir; ama o hikaye, sonsuz sekmeler ve karmaşık vize rehberleri arasında boğulmamalı. Vuelina, seyahat planlamayı bir "ev ödevi" olmaktan çıkarıp, maceranın en heyecan verici başlangıcına dönüştürmek için burada.</p>

                <h3>Neyi Değiştiriyoruz?</h3>
                <div class="compare-grid">
                    <div class="compare-card">
                        <div class="flex items-center justify-between mb-3">
                            <span class="pill">Eskiden</span>
                            <span class="pill accent">Vuelina ile</span>
                        </div>
                        <div class="text-sm text-secondary mb-2">Rota Araştırması</div>
                        <div class="text-base font-bold text-primary">Saniyeler içinde hazır planlar.</div>
                    </div>
                    <div class="compare-card">
                        <div class="flex items-center justify-between mb-3">
                            <span class="pill">Eskiden</span>
                            <span class="pill accent">Vuelina ile</span>
                        </div>
                        <div class="text-sm text-secondary mb-2">Belirsiz Vize Süreçleri</div>
                        <div class="text-base font-bold text-primary">Net ve güncel adımlar.</div>
                    </div>
                    <div class="compare-card">
                        <div class="flex items-center justify-between mb-3">
                            <span class="pill">Eskiden</span>
                            <span class="pill accent">Vuelina ile</span>
                        </div>
                        <div class="text-sm text-secondary mb-2">Sıkıcı Bütçeler</div>
                        <div class="text-base font-bold text-primary">Akıllı bütçe yönetimi.</div>
                    </div>
                </div>

                <div class="quote">
                    Neden Buradayız? Çünkü en güzel anıların, ekran başında değil; o ilk adımı attığın yolda biriktiğini biliyoruz. Vuelina yanındaysa, sana sadece bavulunu hazırlamak ve anı yaşamak kalır.
                </div>
            </div>
        `;
        legalTexts['about'] = aboutPremiumHtml;

        const whatPageHtml = `
            <div class="about-premium">
                <h2 style="color: var(--text-primary);">Vuelina: Geleceğin Seyahat Deneyimini Bugün Tasarlıyoruz.</h2>
                <p class="text-secondary">Seyahat etmek bir keşif yolculuğudur; ancak bu yolculuk, sonsuz dijital gürültü ve karmaşık planlama süreçleri arasında kaybolmamalıdır. Vuelina, seyahat planlamayı bir yük olmaktan çıkarıp, keşfin en heyecan verici başlangıcına dönüştüren yapay zeka tabanlı bir ekosistemdir.</p>
                <p class="text-secondary">Geleneksel rehberlerin statik yapısını, verinin hızı ve yerel bir kaşifin samimiyetiyle harmanlıyoruz. Amacımız; gezginlerin vize prosedürleri, bütçe yönetimi ve rota optimizasyonu gibi teknik detaylarla boğulmak yerine, sadece o anın ruhuna odaklanmasını sağlamaktır.</p>
                <div class="quote">
                    Vuelina ile sekmeleri kapatın, dünyayı keşfetmeye odaklanın.
                </div>
            </div>
        `;

        const footerAbout = document.getElementById('footer-about-link');
        if(footerAbout) footerAbout.addEventListener('click', (e) => { e.preventDefault(); showLegalModal('about'); });
        const footerContact = document.getElementById('footer-contact-link');
        if(footerContact) footerContact.addEventListener('click', (e) => { e.preventDefault(); showLegalModal('contact'); });
        const footerCookies = document.getElementById('footer-cookies-link');
        if(footerCookies) footerCookies.addEventListener('click', (e) => { e.preventDefault(); showLegalModal('cookies'); });

        const showLegalModal = (type) => {
            const text = legalTexts[type];
            if (!text) return;
            if (type === 'privacy') legalModalTitle.textContent = 'Gizlilik Politikası';
            else if (type === 'terms') legalModalTitle.textContent = 'Kullanım Koşulları';
            else if (type === 'cookies') legalModalTitle.textContent = 'Çerez Politikası';
            else if (type === 'about') legalModalTitle.textContent = 'Hakkımızda';
            else legalModalTitle.textContent = 'İletişim';
            legalModalContent.innerHTML = text;
            legalModal.classList.add('visible');
        };
        
        const renderChecklist = () => {
            let items;
            try {
                items = JSON.parse(localStorage.getItem('travelChecklist'));
            } catch (e) {
                console.error("Error parsing checklist:", e);
            }

            if (!items || !Array.isArray(items)) {
                items = [
                    { text: "Pasaport ve Vize", completed: false, id: 1},
                { text: "Uçak Biletleri ve Konfirmasyonlar", completed: false, id: 2},
                { text: "Nakit ve Kredi Kartları", completed: false, id: 3},
                { text: "Priz Dönüştürücü (Adaptör)", completed: false, id: 4},
                { text: "Kişisel İlaçlar ve İlk Yardım Seti", completed: false, id: 5}
            ];
            }
            
            checklistContainer.innerHTML = items.map(item => `
                <div class="checklist-item flex items-center justify-between p-3 rounded-lg bg-background ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                    <div class="flex items-center">
                        <input type="checkbox" id="item-${item.id}" class="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent mr-3" ${item.completed ? 'checked' : ''}>
                        <label for="item-${item.id}" class="flex-grow">${item.text}</label>
                    </div>
                    <button class="delete-checklist-item text-gray-400 hover:text-red-500">&times;</button>
                </div>
            `).join('');

            saveChecklistState(items);
        };
        
        const saveChecklistState = (items) => {
            localStorage.setItem('travelChecklist', JSON.stringify(items));
        };
        
        const handleChecklistInteraction = (e) => {
            let items;
            try {
                items = JSON.parse(localStorage.getItem('travelChecklist')) || [];
            } catch (e) {
                console.error("Error parsing checklist for interaction:", e);
                return;
            }
            if (!Array.isArray(items)) return;

            const target = e.target;
            const itemDiv = target.closest('.checklist-item');
            if(!itemDiv) return;

            const itemId = parseInt(itemDiv.dataset.id, 10);

            if (target.type === 'checkbox') {
                const item = items.find(i => i.id === itemId);
                item.completed = target.checked;
            }
            if(target.classList.contains('delete-checklist-item')) {
                 const itemIndex = items.findIndex(i => i.id === itemId);
                 items.splice(itemIndex, 1);
            }
            saveChecklistState(items);
            renderChecklist();
        };

        // --- TEMA YÖNETİMİ ---
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', theme);
        };
        // --- TEMA YÖNETİMİ SONU ---

        // --- FILTERS ---
        const setupFilters = () => {
            const filters = [
                { id: 'all', label: 'Tümü', icon: '🌍' },
                { id: 'avrupa', label: 'Avrupa', icon: '🇪🇺' },
                { id: 'asya', label: 'Asya', icon: '⛩️' },
                { id: 'vizesiz', label: 'Vizesiz', icon: '🛂' },
                { id: 'deniz', label: 'Deniz & Güneş', icon: '🌊' },
                { id: 'tarih', label: 'Tarih & Kültür', icon: '🏛️' },
                { id: 'ekonomik', label: 'Ekonomik', icon: '💰' } // Placeholder for future logic
            ];

            const container = document.getElementById('filter-container');
            container.innerHTML = filters.map(f => `
                <button data-filter="${f.id}" class="filter-chip px-4 py-2 rounded-full border border-border-color bg-card-bg text-secondary hover:border-accent hover:text-accent transition-all flex items-center gap-2 text-sm font-medium ${f.id === 'all' ? 'border-accent text-accent bg-accent/5' : ''}">
                    <span>${f.icon}</span> ${f.label}
                </button>
            `).join('');

            container.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-chip');
                if (!btn) return;

                // UI Update
                container.querySelectorAll('.filter-chip').forEach(b => {
                    b.classList.remove('border-accent', 'text-accent', 'bg-accent/5');
                    b.classList.add('border-border-color', 'text-secondary');
                });
                btn.classList.remove('border-border-color', 'text-secondary');
                btn.classList.add('border-accent', 'text-accent', 'bg-accent/5');

                // Logic
                activeTagFilter = btn.dataset.filter;
                displayCountries(document.getElementById('search-input').value);
            });
        };

        // --- Olay Dinleyicileri ---
        // Ülke kartı ve Favori butonu tıklaması
        countryListContainer.addEventListener('click', async (e) => {
            // Favori butonuna tıklandıysa
            const favBtn = e.target.closest('.favorite-btn');
            if (favBtn) {
                e.stopPropagation(); // Kart detayının açılmasını engelle
                const name = favBtn.dataset.name;
                toggleFavorite(name);
                return;
            }

            // Karta tıklandıysa
            const card = e.target.closest('.country-card');
            if (card && card.dataset.countryName) {
                await displayCountryDetail(card.dataset.countryName);
            }
        });
        
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.value = '';
            if (window.location.protocol === 'file:') {
                window.history.pushState({}, document.title, window.location.pathname);
            } else {
                window.history.pushState({}, document.title, '/');
            }
        });

        const navBlogLink = document.getElementById('nav-blog-link');
        if (navBlogLink) {
            navBlogLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.pushState({ page: 'blog' }, 'Blog', '?page=blog');
            });
        }
        const navBlogLinkMobile = document.getElementById('nav-blog-link-mobile');
        if (navBlogLinkMobile) {
            navBlogLinkMobile.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.pushState({ page: 'blog' }, 'Blog', '?page=blog');
            });
        }

        const navWhatLink = document.getElementById('nav-what-link');
        if (navWhatLink) {
            navWhatLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.location.protocol === 'file:') {
                    window.history.pushState({ page: 'nedir' }, 'Nedir?', '?page=nedir');
                } else {
                    window.history.pushState({ page: 'nedir' }, 'Nedir?', '/nedir');
                }
            });
        }
        const navWhatLinkMobile = document.getElementById('nav-what-link-mobile');
        if (navWhatLinkMobile) {
            navWhatLinkMobile.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.location.protocol === 'file:') {
                    window.history.pushState({ page: 'nedir' }, 'Nedir?', '?page=nedir');
                } else {
                    window.history.pushState({ page: 'nedir' }, 'Nedir?', '/nedir');
                }
            });
        }

        const navAboutLink = document.getElementById('nav-about-link');
        if (navAboutLink) {
            navAboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.location.protocol === 'file:') {
                    window.history.pushState({ page: 'hakkimizda' }, 'Hakkımızda', '?page=hakkimizda');
                } else {
                    window.history.pushState({ page: 'hakkimizda' }, 'Hakkımızda', '/hakkimizda');
                }
            });
        }
        const navAboutLinkMobile = document.getElementById('nav-about-link-mobile');
        if (navAboutLinkMobile) {
            navAboutLinkMobile.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.location.protocol === 'file:') {
                    window.history.pushState({ page: 'hakkimizda' }, 'Hakkımızda', '?page=hakkimizda');
                } else {
                    window.history.pushState({ page: 'hakkimizda' }, 'Hakkımızda', '/hakkimizda');
                }
            });
        }

        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const closeMobileMenu = () => {
            if (!mobileMenu || !mobileMenuBtn) return;
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        };
        const toggleMobileMenu = () => {
            if (!mobileMenu || !mobileMenuBtn) return;
            const willOpen = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        };
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMobileMenu();
            });
        }
        window.addEventListener('vuelina:routechange', () => closeMobileMenu());
        
        itineraryModalCloseBtn.addEventListener('click', () => itineraryModal.classList.remove('visible'));
        itineraryModal.addEventListener('click', (e) => {
            if (e.target === itineraryModal) itineraryModal.classList.remove('visible');
        });
        
        searchInput.addEventListener('input', (e) => displayCountries(e.target.value));
        
        modalCloseBtn.addEventListener('click', () => {
            infoModal.classList.remove('visible');
        });
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) infoModal.classList.remove('visible');
        });

        if (legalModalCloseBtn) {
            legalModalCloseBtn.addEventListener('click', () => legalModal.classList.remove('visible')); 
        }
        if (legalModal) {
            legalModal.addEventListener('click', (e) => {
                if (e.target === legalModal) legalModal.classList.remove('visible');
            });
        }

        const initApp = async () => {
            console.log("initApp started");
            try {
                // 1. SaaS Görünümü için Dark Mode Sabitlendi
                applyTheme('dark-indigo');
                console.log("SaaS Theme applied");

                // 2. Filters
                setupFilters();
                console.log("Filters setup");

                // 3. URL kontrolü: Eğer bir ülke parametresi varsa detay sayfasını yükle
                await handleRouting();
                console.log("URL checked and content rendered");

                // 4. Preloader'ı kaldır (Kullanıcı bekletilmesin)
                setTimeout(() => {
                    if (preloader) {
                        preloader.style.opacity = '0';
                        preloader.addEventListener('transitionend', () => preloader.remove());
                    }
                }, 500);

                // 5. Para birimi kurlarını yükle (Arka planda)
                fetchCurrencyRates(); 

            } catch (error) {
                console.error("Initialization Error:", error);
                if (preloader) preloader.remove();
            }
        };
    
    
        // Footer Links Event Listeners - Modal links removed, now using direct page navigation
        
    initApp();

    });