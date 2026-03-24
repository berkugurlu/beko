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

        // --- AUTH LOGIC (MOCK) ---
        const authModalBtn = document.getElementById('auth-modal-btn');
        const authModalBtnMobile = document.getElementById('auth-modal-btn-mobile');
        const authModal = document.getElementById('auth-modal');
        const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
        const authForm = document.getElementById('auth-form');
        const authGoogleBtn = document.getElementById('auth-google-btn');

        let currentUser = JSON.parse(localStorage.getItem('vuelina_user') || 'null');
        let userPassport = localStorage.getItem('vuelina_passport') || 'Türkiye';

        // --- IP-BASED AUTOMATIC PASSPORT DETECTION ---
        // Reverse map: ISO code → Turkish country name
        const codeToCountry = {};
        Object.entries(countryCodes).forEach(([name, code]) => { codeToCountry[code] = name; });

        // Supported passports (ones that have visa override data)
        const supportedPassports = ["Türkiye", "Almanya", "ABD", "Birleşik Krallık", "Fransa", "İtalya", "İspanya", "Japonya", "Kanada", "Avustralya", "Brezilya", "Güney Kore", "Rusya", "Çin"];

        const detectPassportFromIP = async () => {
            // Skip if already auto-detected
            if (localStorage.getItem('vuelina_passport_auto_set')) return;

            try {
                const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
                if (!response.ok) throw new Error('API error');
                const data = await response.json();
                const detectedCode = data.country_code; // e.g. "TR", "DE", "US"
                
                if (detectedCode && codeToCountry[detectedCode]) {
                    const detectedCountry = codeToCountry[detectedCode];
                    // Use detected country if it's a supported passport, otherwise use it as-is
                    if (supportedPassports.includes(detectedCountry)) {
                        userPassport = detectedCountry;
                    } else {
                        // Even if not a "supported" passport with detailed overrides,
                        // set it so the fallback logic in getVisaForPassport works
                        userPassport = detectedCountry;
                    }
                    localStorage.setItem('vuelina_passport', userPassport);
                }
            } catch (err) {
                console.log('IP-based passport detection failed, using default:', err.message);
            }

            // Mark as auto-set so we don't call the API again
            localStorage.setItem('vuelina_passport_auto_set', '1');
        };

        // --- VISITED COUNTRIES SYSTEM ---
        const getVisitedCountries = () => {
            try { return JSON.parse(localStorage.getItem('vuelina_visited') || '[]'); } catch(e) { return []; }
        };
        const toggleVisitedCountry = (name) => {
            let visited = getVisitedCountries();
            if (visited.includes(name)) {
                visited = visited.filter(v => v !== name);
            } else {
                visited.push(name);
            }
            localStorage.setItem('vuelina_visited', JSON.stringify(visited));
            return visited;
        };
        const getVisitedStats = () => {
            const visited = getVisitedCountries();
            const total = Object.keys(countriesData).length;
            const pct = total > 0 ? Math.round((visited.length / total) * 100) : 0;
            return { count: visited.length, total, pct };
        };

        // --- WEATHER API HELPER ---
        const capitalCoords = {
            "Türkiye": {lat:39.93,lon:32.86}, "İtalya": {lat:41.90,lon:12.50}, "Japonya": {lat:35.68,lon:139.69},
            "Fransa": {lat:48.85,lon:2.35}, "Birleşik Krallık": {lat:51.50,lon:-0.12}, "ABD": {lat:38.90,lon:-77.04},
            "Brezilya": {lat:-15.79,lon:-47.88}, "Mısır": {lat:30.04,lon:31.24}, "Avustralya": {lat:-33.87,lon:151.21},
            "İspanya": {lat:40.42,lon:-3.70}, "Yunanistan": {lat:37.98,lon:23.73}, "Tayland": {lat:13.76,lon:100.50},
            "Güney Kore": {lat:37.57,lon:126.98}, "Meksika": {lat:19.43,lon:-99.13}, "Peru": {lat:-12.05,lon:-77.04},
            "Güney Afrika": {lat:-33.93,lon:18.42}, "Yeni Zelanda": {lat:-41.29,lon:174.78}, "İrlanda": {lat:53.35,lon:-6.26},
            "İsviçre": {lat:46.95,lon:7.45}, "Hollanda": {lat:52.37,lon:4.90}, "Portekiz": {lat:38.72,lon:-9.14},
            "Fas": {lat:33.97,lon:-6.85}, "Vietnam": {lat:21.03,lon:105.85}, "Arjantin": {lat:-34.60,lon:-58.38},
            "Kanada": {lat:45.42,lon:-75.70}, "Hindistan": {lat:28.61,lon:77.21}, "Çin": {lat:39.90,lon:116.40},
            "Rusya": {lat:55.76,lon:37.62}, "Norveç": {lat:59.91,lon:10.75}, "İsveç": {lat:59.33,lon:18.07},
            "Danimarka": {lat:55.68,lon:12.57}, "Avusturya": {lat:48.21,lon:16.37}, "Macaristan": {lat:47.50,lon:19.04},
            "Çek Cumhuriyeti": {lat:50.08,lon:14.44}, "Hırvatistan": {lat:45.81,lon:15.98}, "Belçika": {lat:50.85,lon:4.35},
            "Singapur": {lat:1.35,lon:103.82}, "Malezya": {lat:3.14,lon:101.69}, "Endonezya": {lat:-6.21,lon:106.85},
            "Filipinler": {lat:14.60,lon:120.98}, "Birleşik Arap Emirlikleri": {lat:24.45,lon:54.65},
            "Polonya": {lat:52.23,lon:21.01}, "Romanya": {lat:44.43,lon:26.10}, "Bulgaristan": {lat:42.70,lon:23.32}
        };

        const fetchWeather = async (countryName) => {
            const coords = capitalCoords[countryName];
            if (!coords) return null;
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`, { signal: AbortSignal.timeout(5000) });
                if (!res.ok) return null;
                const data = await res.json();
                const c = data.current;
                const wmoIcon = (code) => {
                    if (code <= 1) return '☀️';
                    if (code <= 3) return '⛅';
                    if (code <= 48) return '🌫️';
                    if (code <= 67) return '🌧️';
                    if (code <= 77) return '🌨️';
                    if (code <= 82) return '🌦️';
                    if (code <= 86) return '❄️';
                    return '⛈️';
                };
                const wmoText = (code) => {
                    if (code <= 1) return 'Açık';
                    if (code <= 3) return 'Parçalı Bulutlu';
                    if (code <= 48) return 'Sisli';
                    if (code <= 67) return 'Yağmurlu';
                    if (code <= 77) return 'Karlı';
                    if (code <= 82) return 'Sağanak';
                    if (code <= 86) return 'Yoğun Kar';
                    return 'Gök Gürültülü';
                };
                return { temp: Math.round(c.temperature_2m), humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), icon: wmoIcon(c.weather_code), desc: wmoText(c.weather_code) };
            } catch(e) { return null; }
        };

        // --- SMOOTH VIEW TRANSITION HELPER ---
        const smoothViewTransition = (hideEl, showEl, callback) => {
            if (typeof gsap !== 'undefined') {
                gsap.to(hideEl, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
                    hideEl.classList.add('hidden');
                    hideEl.style.opacity = ''; hideEl.style.transform = '';
                    if (callback) callback();
                    showEl.classList.remove('hidden');
                    gsap.fromTo(showEl, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
                }});
            } else {
                hideEl.classList.add('hidden');
                if (callback) callback();
                showEl.classList.remove('hidden');
            }
        };

        // Run auto-detection (non-blocking)
        detectPassportFromIP().then(() => {
            // Re-render country cards if they were already displayed, to reflect the detected passport
            if (typeof displayCountries === 'function') {
                const searchVal = document.getElementById('search-input')?.value || '';
                displayCountries(searchVal);
            }
        });


        const updateAuthUI = () => {
            const langObj = typeof translations !== 'undefined' ? translations[currentLang] : null;
            const profileText = langObj ? langObj['nav.profile'] : 'Profilim';
            const loginText = langObj ? langObj['nav.login'] : 'Giriş Yap';
            
            if (currentUser) {
                // Profile View
                if (authModalBtn) {
                    authModalBtn.innerHTML = `
                        <img src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.email}" class="w-6 h-6 rounded-full border-2 border-indigo-400 shadow-md" alt="Profile">
                        <span data-i18n="nav.profile">${profileText}</span>
                    `;
                }
                if (authModalBtnMobile) {
                    authModalBtnMobile.innerHTML = `
                        <img src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.email}" class="w-5 h-5 rounded-full border border-indigo-200 mr-2" alt="Profile">
                        <span data-i18n="nav.profile">${profileText}</span>
                    `;
                    authModalBtnMobile.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
                    authModalBtnMobile.classList.add('bg-card-bg', 'text-primary', 'border-border-color');
                }
            } else {
                // Login View
                if (authModalBtn) {
                    authModalBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span data-i18n="nav.login">${loginText}</span>
                    `;
                }
                if (authModalBtnMobile) {
                    authModalBtnMobile.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span data-i18n="nav.login">${loginText}</span>
                    `;
                    authModalBtnMobile.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
                    authModalBtnMobile.classList.remove('bg-card-bg', 'text-primary', 'border-border-color');
                }
            }
        };

        const openAuthModal = () => {
            if (!authModal) return;
            authModal.classList.add('visible');
        };
        const closeAuthModal = () => {
            if (!authModal) return;
            authModal.classList.remove('visible');
        };

        const handleAuthClick = (e) => {
            if (e) e.preventDefault();
            if (currentUser) {
                if (window.openProfileModal) {
                    window.openProfileModal();
                } else {
                    if (confirm(typeof currentLang !== 'undefined' && currentLang === 'en' ? "Are you sure you want to log out?" : "Çıkış yapmak istediğinize emin misiniz?")) {
                        currentUser = null;
                        localStorage.removeItem('vuelina_user');
                        updateAuthUI();
                    }
                }
            } else {
                openAuthModal();
            }
        };

        if (authModalBtn) authModalBtn.addEventListener('click', handleAuthClick);
        if (authModalBtnMobile) authModalBtnMobile.addEventListener('click', handleAuthClick);
        
        if (authModalCloseBtn) {
            authModalCloseBtn.addEventListener('click', closeAuthModal);
        }
        
        // Close on overlay click
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) closeAuthModal();
            });
        }
        
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('auth-email').value;
                currentUser = {
                    uid: 'mock-' + Date.now(),
                    email: email,
                    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
                };
                localStorage.setItem('vuelina_user', JSON.stringify(currentUser));
                updateAuthUI();
                closeAuthModal();
                showInfoModal(
                    typeof currentLang !== 'undefined' && currentLang === 'en' ? "Welcome!" : "Hoş Geldin!", 
                    typeof currentLang !== 'undefined' && currentLang === 'en' ? "Successfully logged in." : "Vuelina hesabınıza başarıyla giriş yaptınız."
                );
            });
        }

        if (authGoogleBtn) {
            authGoogleBtn.addEventListener('click', () => {
                currentUser = {
                    uid: 'mock-g-' + Date.now(),
                    email: 'google.user@example.com',
                    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google'
                };
                localStorage.setItem('vuelina_user', JSON.stringify(currentUser));
                updateAuthUI();
                closeAuthModal();
                showInfoModal(
                    typeof currentLang !== 'undefined' && currentLang === 'en' ? "Welcome!" : "Hoş Geldin!", 
                    typeof currentLang !== 'undefined' && currentLang === 'en' ? "Google Login Successful." : "Google ile başarıyla giriş yaptınız."
                );
            });
        }
        
        window.addEventListener('languageChanged', updateAuthUI);
        updateAuthUI();

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
            
            // Geographic Coordinates for Interactive Map
            const geoData = {
                "Türkiye": { lat: 38.9637, lng: 35.2433 },
                "İtalya": { lat: 41.8719, lng: 12.5674 },
                "Japonya": { lat: 36.2048, lng: 138.2529 },
                "Fransa": { lat: 46.2276, lng: 2.2137 },
                "Birleşik Krallık": { lat: 55.3781, lng: -3.4360 },
                "ABD": { lat: 37.0902, lng: -95.7129 },
                "Yunanistan": { lat: 39.0742, lng: 21.8243 },
                "İspanya": { lat: 40.4637, lng: -3.7492 },
                "Güney Kore": { lat: 35.9078, lng: 127.7669 },
                "Tayland": { lat: 15.8700, lng: 100.9925 },
                "Mısır": { lat: 26.8206, lng: 30.8025 },
                "Hollanda": { lat: 52.1326, lng: 5.2913 },
                "Meksika": { lat: 23.6345, lng: -102.5528 },
                "Endonezya": { lat: -0.7893, lng: 113.9213 },
                "Brezilya": { lat: -14.2350, lng: -51.9253 },
                "Güney Afrika": { lat: -30.5595, lng: 22.9375 },
                "Arjantin": { lat: -38.4161, lng: -63.6167 },
                "İsviçre": { lat: 46.8182, lng: 8.2275 },
                "Norveç": { lat: 60.4720, lng: 8.4689 },
                "Kanada": { lat: 56.1304, lng: -106.3468 },
                "Çin": { lat: 35.8617, lng: 104.1954 },
                "Hindistan": { lat: 20.5937, lng: 78.9629 },
                "Avustralya": { lat: -25.2744, lng: 133.7751 }
            };
            countriesData[country].coords = geoData[country] || { lat: 0, lng: 0 };
        });

        // --- MAP LOGIC ---
        const viewListBtn = document.getElementById('view-list-btn');
        const viewMapBtn = document.getElementById('view-map-btn');
        const mapWrapper = document.getElementById('map-container-wrapper');
        let leafletMap = null;
        let markersGroup = null;
        let allMarkers = [];

        const getVisaColor = (visa) => {
            if (!visa) return { color: '#6366f1', label: 'Bilinmiyor' };
            const v = visa.toLowerCase();
            if (v.includes('vizesiz')) return { color: '#22c55e', label: 'Vizesiz' };
            if (v.includes('kapida') || v.includes('e-vize')) return { color: '#f59e0b', label: 'Kapıda/e-Vize' };
            if (v.includes('schengen')) return { color: '#818cf8', label: 'Schengen' };
            return { color: '#ef4444', label: 'Vize Gerekli' };
        };

        const createPulseIcon = (color) => L.divIcon({
            className: '',
            html: `<div style="position:relative;width:24px;height:24px">
                <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:map-pulse 2s ease-out infinite;"></div>
                <div style="position:absolute;inset:4px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -14]
        });

        const initMap = () => {
            if (leafletMap) return;
            leafletMap = L.map('world-map', { zoomControl: false, attributionControl: false }).setView([25, 15], 2);
            L.control.zoom({ position: 'topright' }).addTo(leafletMap);
            L.control.attribution({ prefix: false, position: 'bottomright' }).addAttribution('<a href="https://carto.com">CARTO</a> | <a href="https://openstreetmap.org">OpenStreetMap</a>').addTo(leafletMap);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                subdomains: 'abcd', maxZoom: 19
            }).addTo(leafletMap);

            markersGroup = L.layerGroup().addTo(leafletMap);

            Object.keys(countriesData).forEach(name => {
                const country = countriesData[name];
                if (!country.coords || country.coords.lat === 0) return;

                const visa = country.visaStatus || '';
                const { color } = getVisaColor(visa);
                const icon = createPulseIcon(color);

                const marker = L.marker([country.coords.lat, country.coords.lng], { icon })
                    .addTo(markersGroup);

                marker.bindPopup(() => {
                    const popupDiv = document.createElement('div');
                    popupDiv.style.cssText = 'min-width:200px;max-width:240px;padding:4px';
                    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'tr';
                    popupDiv.innerHTML = `
                        <div style="text-align:center;margin-bottom:10px">
                            <div style="font-size:2.5rem;margin-bottom:4px">${country.flag || ''}</div>
                            <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${name}</div>
                            <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px">${country.description ? country.description.substring(0, 70) + '...' : ''}</div>
                        </div>
                        <table style="width:100%;border-collapse:collapse;font-size:0.78rem;margin-bottom:10px">
                            <tr><td style="color:var(--text-secondary);padding:3px 0">${lang === 'en' ? '🛂 Visa' : '🛂 Vize'}</td>
                                <td style="font-weight:600;color:${color};text-align:right">${country.visaStatus || '-'}</td></tr>
                            <tr><td style="color:var(--text-secondary);padding:3px 0">${lang === 'en' ? '💰 Budget/day' : '💰 Günlük Bütçe'}</td>
                                <td style="font-weight:600;color:var(--text-primary);text-align:right">${country.dailyBudget || '-'}</td></tr>
                            <tr><td style="color:var(--text-secondary);padding:3px 0">${lang === 'en' ? '📅 Best Time' : '📅 En İyi Dönem'}</td>
                                <td style="font-weight:600;color:var(--text-primary);text-align:right;max-width:110px">${country.bestTime || '-'}</td></tr>
                        </table>
                        <button onclick="window.vuelinaGoToCountry('${name}')" style="width:100%;padding:8px 12px;background:#4f46e5;color:white;border:none;border-radius:10px;font-weight:600;font-size:0.85rem;cursor:pointer">${lang === 'en' ? 'Explore' : 'Detayları Keşfet'} →</button>
                    `;
                    return popupDiv;
                }, { className: 'premium-popup', closeButton: false, maxWidth: 260 });

                // Tooltip on hover
                marker.bindTooltip(`<strong>${country.flag || ''} ${name}</strong>`, {
                    permanent: false, direction: 'top', offset: [0, -12],
                    className: 'premium-tooltip'
                });
                allMarkers.push({ name, marker, lat: country.coords.lat, lng: country.coords.lng });
            });

            // --- Legend Control ---
            const legend = L.control({ position: 'bottomleft' });
            legend.onAdd = () => {
                const div = L.DomUtil.create('div', '');
                const lang = (typeof currentLang !== 'undefined') ? currentLang : 'tr';
                div.style.cssText = 'background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:12px 16px;font-size:0.78rem;box-shadow:0 4px 20px rgba(0,0,0,0.3);min-width:150px';
                div.innerHTML = `
                    <div style="font-weight:700;margin-bottom:8px;color:var(--text-primary)">${lang === 'en' ? '🗺️ Visa Legend' : '🗺️ Vize Durumu'}</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="width:12px;height:12px;border-radius:50%;background:#22c55e;display:inline-block"></span><span style="color:var(--text-secondary)">${lang === 'en' ? 'Visa-free' : 'Vizesiz'}</span></div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="width:12px;height:12px;border-radius:50%;background:#f59e0b;display:inline-block"></span><span style="color:var(--text-secondary)">${lang === 'en' ? 'On-arrival / e-Visa' : 'Kapıda / e-Vize'}</span></div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="width:12px;height:12px;border-radius:50%;background:#818cf8;display:inline-block"></span><span style="color:var(--text-secondary)">Schengen</span></div>
                    <div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:50%;background:#ef4444;display:inline-block"></span><span style="color:var(--text-secondary)">${lang === 'en' ? 'Visa required' : 'Vize Gerekli'}</span></div>
                `;
                return div;
            };
            legend.addTo(leafletMap);

            // --- Map Search Box ---
            const searchControl = L.control({ position: 'topleft' });
            searchControl.onAdd = () => {
                const div = L.DomUtil.create('div', '');
                div.innerHTML = `<div style="position:relative">
                    <input id="map-search-input" type="text" placeholder="🔍 ${(typeof currentLang !== 'undefined' && currentLang === 'en') ? 'Search countries on map...' : 'Haritada ülke ara...'}" 
                        style="padding:10px 14px;border-radius:12px;border:1px solid var(--border-color);background:var(--card-bg);color:var(--text-primary);font-size:0.85rem;width:220px;outline:none;box-shadow:0 4px 16px rgba(0,0,0,0.3)">
                    <div id="map-search-results" style="position:absolute;top:calc(100%+4px);left:0;right:0;background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:none;max-height:200px;overflow-y:auto;z-index:9999"></div>
                </div>`;
                L.DomEvent.disableClickPropagation(div);
                return div;
            };
            searchControl.addTo(leafletMap);

            // Wire up search functionality after adding to map
            setTimeout(() => {
                const mapSearchInput = document.getElementById('map-search-input');
                const mapSearchResults = document.getElementById('map-search-results');
                if (!mapSearchInput || !mapSearchResults) return;

                mapSearchInput.addEventListener('input', () => {
                    const q = mapSearchInput.value.trim().toLowerCase();
                    if (q.length < 1) { mapSearchResults.style.display = 'none'; return; }
                    const matches = allMarkers.filter(m => m.name.toLowerCase().includes(q));
                    if (matches.length === 0) { mapSearchResults.style.display = 'none'; return; }
                    mapSearchResults.innerHTML = matches.slice(0, 8).map(m => {
                        const flag = countriesData[m.name]?.flag || '';
                        return `<div onclick="window.vuelinaFlyToMarker('${m.name}')" style="padding:8px 12px;cursor:pointer;font-size:0.85rem;color:var(--text-primary);border-bottom:1px solid var(--border-color)" onmouseover="this.style.background='var(--background)'" onmouseout="this.style.background='transparent'">${flag} ${m.name}</div>`;
                    }).join('');
                    mapSearchResults.style.display = 'block';
                });
            }, 100);
        };

        window.vuelinaGoToCountry = (name) => {
            const card = document.querySelector(`.country-card[data-country-name="${name}"]`);
            if (card) { card.click(); return; }
            // If on map view, switch to list and navigate
            if (viewListBtn) viewListBtn.click();
            setTimeout(() => {
                const c = document.querySelector(`.country-card[data-country-name="${name}"]`);
                if (c) c.click();
            }, 300);
        };

        window.vuelinaFlyToMarker = (name) => {
            const markerObj = allMarkers.find(m => m.name === name);
            if (markerObj && leafletMap) {
                leafletMap.flyTo([markerObj.lat, markerObj.lng], 5, { duration: 1.2 });
                setTimeout(() => markerObj.marker.openPopup(), 1300);
                const res = document.getElementById('map-search-results');
                if (res) res.style.display = 'none';
                const inp = document.getElementById('map-search-input');
                if (inp) inp.value = name;
            }
        };

        if (viewListBtn && viewMapBtn) {
            viewListBtn.addEventListener('click', () => {
                viewListBtn.classList.add('bg-accent', 'text-white');
                viewListBtn.classList.remove('text-secondary', 'hover:text-primary');
                viewMapBtn.classList.remove('bg-accent', 'text-white');
                viewMapBtn.classList.add('text-secondary', 'hover:text-primary');
                
                mapWrapper.classList.add('hidden');
                countryListContainer.classList.remove('hidden');
            });

            viewMapBtn.addEventListener('click', () => {
                viewMapBtn.classList.add('bg-accent', 'text-white');
                viewMapBtn.classList.remove('text-secondary', 'hover:text-primary');
                viewListBtn.classList.remove('bg-accent', 'text-white');
                viewListBtn.classList.add('text-secondary', 'hover:text-primary');
                
                countryListContainer.classList.add('hidden');
                mapWrapper.classList.remove('hidden');
                initMap();
                setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 200);
            });
        }

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
            
            // Clean up old ScrollTriggers if mapping is refreshed
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.getAll().forEach(t => t.kill());
            }

            const getT = (key, defaultStr) => {
                const lang = typeof currentLang !== 'undefined' ? currentLang : 'tr';
                const dict = typeof translations !== 'undefined' ? translations[lang] : null;
                return (dict && dict[key]) ? dict[key] : defaultStr;
            };

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
                    
                    // -- DYNAMIC VISA LOOKUP VIA visaData.js --
                    const visaInfo = (typeof getVisaForPassport === 'function')
                        ? getVisaForPassport(userPassport, name, country.visaStatus)
                        : { status: country.visaStatus || 'Vize Bilgisi', note: '', colorClass: 'text-primary' };
                    
                    const visaStatus = visaInfo.status;
                    const visaNote = visaInfo.note;
                    const visaColorClass = visaInfo.colorClass || 'text-primary';

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
                        <div class="space-y-2 mb-4 text-left">
                            <div class="p-3 rounded-2xl border border-border-color flex items-center justify-between" style="background-color: rgba(255,255,255,0.03);">
                                <span class="text-xs uppercase tracking-wider text-secondary">${currentLang === 'en' ? '🛂 Visa' : '🛂 Vize'}</span>
                                <div class="text-right">
                                    <span class="text-sm font-bold ${visaColorClass}">${visaStatus}</span>
                                    ${visaNote ? `<span class="block text-[10px] text-secondary mt-0.5">${visaNote}</span>` : ''}
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="p-3 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                    <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">${currentLang === 'en' ? 'Period' : 'Dönem'}</div>
                                    <div class="text-xs font-bold text-primary">📅 ${bestTime}</div>
                                </div>
                                <div class="p-3 rounded-2xl border border-border-color" style="background-color: rgba(255,255,255,0.03);">
                                    <div class="text-[10px] uppercase tracking-wider text-secondary mb-1">${currentLang === 'en' ? 'Budget' : 'Bütçe'}</div>
                                    <div class="text-xs font-bold text-primary">💰 ${budget}</div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-auto flex flex-wrap justify-center gap-2">
                            ${country.tags.slice(0, 3).map(tag => {
                                const tagT = getT('filter.' + tag, tag);
                                return `<span class="text-[10px] px-3 py-1.5 rounded-full bg-accent/5 text-accent font-semibold uppercase tracking-widest border border-accent/10">${tagT}</span>`;
                            }).join('')}
                        </div>
                    `;
                    countryListContainer.appendChild(card);
                    visibleCount++;
                }

            });

            const hasResults = countryListContainer.querySelectorAll('.country-card').length > 0;
            noResults.classList.toggle('hidden', hasResults);

            // GSAP ScrollTrigger Integration for rendered cards
            setTimeout(() => {
                if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                    const cards = gsap.utils.toArray('.country-card');
                    cards.forEach(card => {
                        // Determine initial state: if filtering dynamically, we might just want to fade them in normally.
                        // But to strictly follow the prompt (scrub: 1, y: 30, top 75%):
                        gsap.fromTo(card,
                            { opacity: 0, y: 30 },
                            {
                                opacity: 1, 
                                y: 0, 
                                ease: "power3.out",
                                scrollTrigger: {
                                    trigger: card,
                                    start: "top 85%", // Triggers slightly before reaching view
                                    end: "top 65%",
                                    scrub: 1,
                                    toggleActions: "play none none reverse"
                                }
                            }
                        );
                    });
                }
            }, 50);
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
            
            if (normalizedPath.startsWith('/ulke/')) {
                const slug = decodeURIComponent(normalizedPath.split('/ulke/')[1]);
                const foundKey = Object.keys(countriesData).find(key => {
                    const keyTr = key.toLocaleLowerCase('tr');
                    return keyTr === slug || keyTr.replace(/\s+/g, '-') === slug || keyTr.replace(/ /g, '-') === slug;
                });
                if (foundKey) {
                    countryName = foundKey;
                }
            }

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
            const currentPath = window.location.pathname;
            const urlSlug = countryName.toLocaleLowerCase('tr').replace(/\s+/g, '-');
            const newUrl = `/ulke/${encodeURIComponent(urlSlug)}`;
            
            if (currentPath !== newUrl) {
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

            // Use dynamic visa data based on selected passport
            const detailVisaInfo = (typeof getVisaForPassport === 'function')
                ? getVisaForPassport(userPassport, countryName, country.visaStatus)
                : { status: country.visaStatus || 'Vize Bilgisi', note: '' };

            const quickLook = {
                visa: detailVisaInfo.status + (detailVisaInfo.note ? ` (${detailVisaInfo.note})` : ''),
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
            
            // Use smooth transition
            smoothViewTransition(countryListView, countryDetailView, async () => {
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

                            <div class="ad-area mt-6 mb-6">
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
                            
                            <!-- Visited Button -->
                            <button id="visited-toggle-btn" class="w-full content-card glass-card p-4 flex items-center justify-between hover:border-accent/50 transition-all group">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl">${getVisitedCountries().includes(countryName) ? '✅' : '✈️'}</span>
                                    <div>
                                        <div class="font-bold text-primary text-left">${getVisitedCountries().includes(countryName) ? 'Ziyaret Edildi!' : 'Ziyaret Ettim'}</div>
                                        <div class="text-xs text-secondary">Dünyanın %${getVisitedStats().pct}\'ini keşfettin (${getVisitedStats().count}/${getVisitedStats().total})</div>
                                    </div>
                                </div>
                                <div class="w-8 h-8 rounded-full ${getVisitedCountries().includes(countryName) ? 'bg-green-500/20 text-green-400' : 'bg-accent/10 text-accent'} flex items-center justify-center group-hover:scale-110 transition-transform">
                                    ${getVisitedCountries().includes(countryName) ? '✓' : '+'}
                                </div>
                            </button>

                            <!-- Weather Widget -->
                            <div id="weather-widget" class="content-card glass-card p-6 hidden">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span class="text-2xl">🌤️</span>
                                    <span class="text-primary">Anlık Hava Durumu</span>
                                </h3>
                                <div id="weather-content" class="text-center">
                                    <div class="skeleton h-16 w-full rounded-lg"></div>
                                </div>
                            </div>

                            <!-- Flight Widget (Travelpayouts/Tequila) -->
                            <div class="content-card glass-card p-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span class="text-2xl">✈️</span>
                                    <span class="text-primary">Canlı Uçuş Fiyatları</span>
                                </h3>
                                <div id="flight-widget-${country.code}" class="space-y-3">
                                    <div class="skeleton w-full h-24 rounded-xl"></div>
                                </div>
                            </div>


                            <!-- Photo Gallery -->
                            <div class="content-card glass-card p-6">
                                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span class="text-2xl">📸</span>
                                    <span class="text-primary">Fotoğraf Galerisi</span>
                                </h3>
                                <div id="gallery-container-${country.code}" class="grid grid-cols-2 gap-2 min-h-[120px]">
                                    <div class="skeleton w-full h-28 rounded-xl bg-gray-700/30 animate-pulse"></div>
                                    <div class="skeleton w-full h-28 rounded-xl bg-gray-700/30 animate-pulse"></div>
                                    <div class="skeleton w-full h-28 rounded-xl bg-gray-700/30 animate-pulse"></div>
                                    <div class="skeleton w-full h-28 rounded-xl bg-gray-700/30 animate-pulse"></div>
                                </div>
                            </div>

                            <!-- Map Card -->
                            <div class="content-card glass-card p-1 overflow-hidden h-64 shadow-md">
                                <iframe width="100%" height="100%" style="border:0; border-radius: 16px;" loading="lazy" allowfullscreen src="https://maps.google.com/maps?q=${encodeURIComponent(countryName)}&t=&z=5&ie=UTF8&iwloc=&output=embed"></iframe>
                            </div>

                            <div class="ad-area mt-6 mb-6">
                                <ins class="adsbygoogle"
                                     style="display:block;"
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
            
            await initCurrencyConverter(country.currency);

            // Canlı Uçuş Fiyatları (Tequila API Mock/Gerçek)
            const fetchFlights = (cCode, cName) => {
                const container = document.getElementById(`flight-widget-${cCode}`);
                if (!container) return;
                
                // API Key buraya eklenecek
                const TEQUILA_API_KEY = '';
                
                if (!TEQUILA_API_KEY) {
                    setTimeout(() => {
                        const mockPrice = Math.floor(Math.random() * (12000 - 3000) + 3000);
                        container.innerHTML = `
                            <div class="p-4 rounded-xl bg-gradient-to-r from-indigo-600/10 to-blue-600/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-default">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Canlı Fiyat</span>
                                    <span class="text-xs text-secondary">Skyscanner</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-sm font-bold text-primary">İstanbul (IST) → ${cName}</div>
                                        <div class="text-xs text-secondary mt-1">En uygun tahmini fiyat</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-xl font-black text-indigo-600 dark:text-indigo-400">${mockPrice.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                </div>
                                <a href="https://www.skyscanner.com.tr/transport/flights/ist/${cCode.toLowerCase()}" target="_blank" class="w-full mt-4 btn btn-primary py-2.5 text-sm flex justify-center items-center rounded-xl shadow-md">
                                    Biletleri Görüntüle
                                </a>
                            </div>
                        `;
                    }, 800);
                } else {
                    // Gerçek API Call (Örnek)
                    // fetch(`https://api.tequila.kiwi.com/v2/search?fly_from=IST&fly_to=${cCode}`, { headers: { 'apikey': TEQUILA_API_KEY } })
                }
            };
            fetchFlights(country.code || 'TR', countryName);

            // Fetch Wikipedia Images for Gallery
            fetch(`https://tr.wikipedia.org/w/api.php?action=query&generator=images&titles=${encodeURIComponent(countryName)}&gimlimit=30&prop=imageinfo&iiprop=url&format=json&origin=*`)
                .then(res => res.json())
                .then(data => {
                    const pages = data?.query?.pages;
                    const container = document.getElementById(`gallery-container-${country.code}`);
                    if(pages && container) {
                        const images = Object.values(pages)
                            .map(p => p.imageinfo?.[0]?.url)
                            .filter(url => url && (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) && !url.toLowerCase().includes('map') && !url.toLowerCase().includes('flag') && !url.toLowerCase().includes('logo') && !url.toLowerCase().includes('icon'))
                            .slice(0, 4);
                        if (images.length > 0) {
                            container.innerHTML = images.map((url, i) => `<img src="${url}" alt="${countryName} ${i+1}" class="w-full h-28 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer" loading="lazy" onclick="window.open('${url}', '_blank')">`).join('');
                        } else {
                            container.innerHTML = `<div class="col-span-2 text-center text-sm text-secondary">Fotoğraf bulunamadı.</div>`;
                        }
                    }
                }).catch(e => console.error('Gallery error:', e));

            // Weather widget
            fetchWeather(countryName).then(w => {
                const widget = document.getElementById('weather-widget');
                const content = document.getElementById('weather-content');
                if (w && widget && content) {
                    widget.classList.remove('hidden');
                    content.innerHTML = `
                        <div class="flex items-center justify-center gap-4 mb-3">
                            <span class="text-5xl">${w.icon}</span>
                            <div class="text-left">
                                <div class="text-3xl font-bold text-primary">${w.temp}°C</div>
                                <div class="text-sm text-secondary">${w.desc}</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 mt-3">
                            <div class="p-2 rounded-lg bg-background border border-border-color text-center">
                                <div class="text-xs text-secondary">💧 Nem</div>
                                <div class="text-sm font-bold text-primary">%${w.humidity}</div>
                            </div>
                            <div class="p-2 rounded-lg bg-background border border-border-color text-center">
                                <div class="text-xs text-secondary">💨 Rüzgar</div>
                                <div class="text-sm font-bold text-primary">${w.wind} km/s</div>
                            </div>
                        </div>
                    `;
                }
            });

            // Visited toggle
            const visitedBtn = document.getElementById('visited-toggle-btn');
            if (visitedBtn) {
                visitedBtn.addEventListener('click', () => {
                    const visited = toggleVisitedCountry(countryName);
                    const isVisited = visited.includes(countryName);
                    const stats = getVisitedStats();
                    visitedBtn.innerHTML = `
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${isVisited ? '✅' : '✈️'}</span>
                            <div>
                                <div class="font-bold text-primary text-left">${isVisited ? 'Ziyaret Edildi!' : 'Ziyaret Ettim'}</div>
                                <div class="text-xs text-secondary">Dünyanın %${stats.pct}'ini keşfettin (${stats.count}/${stats.total})</div>
                            </div>
                        </div>
                        <div class="w-8 h-8 rounded-full ${isVisited ? 'bg-green-500/20 text-green-400' : 'bg-accent/10 text-accent'} flex items-center justify-center">
                            ${isVisited ? '✓' : '+'}
                        </div>
                    `;
                    showToast(isVisited ? `${countryName} ziyaret listenize eklendi! 🎉` : `${countryName} listeden çıkarıldı.`, 'success');
                });
            }

            document.getElementById('back-to-list').addEventListener('click', () => {
                smoothViewTransition(countryDetailView, countryListView);
                // Yeni: Ana sayfaya dönerken URL'yi temizle
                window.history.pushState({}, document.title, '/');
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

            scrollToTop();
            }); // end smoothViewTransition callback
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
                // Open Exchange Rate API (Free and supports all currencies)
                const response = await fetch('https://open.er-api.com/v6/latest/TRY');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                currencyRates = data.rates;
                currencyRates['TRY'] = 1; // Base currency
                
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
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'tr';
            const dict = typeof translations !== 'undefined' ? translations[lang] : null;
            const getT = (key, defaultStr) => (dict && dict[key]) ? dict[key] : defaultStr;

            const filters = [
                { id: 'all', label: getT('filter.all', 'Tümü'), icon: '🌍' },
                { id: 'avrupa', label: getT('filter.avrupa', 'Avrupa'), icon: '🇪🇺' },
                { id: 'asya', label: getT('filter.asya', 'Asya'), icon: '⛩️' },
                { id: 'vizesiz', label: getT('filter.vizesiz', 'Vizesiz'), icon: '🛂' },
                { id: 'deniz', label: getT('filter.deniz', 'Deniz & Güneş'), icon: '🌊' },
                { id: 'tarih', label: getT('filter.tarih', 'Tarih & Kültür'), icon: '🏛️' },
                { id: 'ekonomik', label: 'Ekonomik', icon: '💰' } // Placeholder for future logic
            ];

            const container = document.getElementById('filter-container');
            container.innerHTML = filters.map(f => `
                <button data-filter="${f.id}" class="filter-chip px-4 py-2 rounded-full border border-border-color bg-card-bg text-secondary hover:border-accent hover:text-accent transition-all flex items-center gap-2 text-sm font-medium ${f.id === activeTagFilter ? 'border-accent text-accent bg-accent/5' : ''}">
                    <span>${f.icon}</span> ${f.label}
                </button>
            `).join('');

            // Only attach event listener once if not attached
            if (!container.dataset.listenerAttached) {
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
                container.dataset.listenerAttached = 'true';
            }
        };

        window.addEventListener('languageChanged', () => {
            setupFilters();
            displayCountries(document.getElementById('search-input') ? document.getElementById('search-input').value : '');
        });

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

        // --- QUIZ SYSTEM ---
        const quizQuestions = [
            { id: 'budget', title: '💰 Bütçen ne kadar?', options: [
                { label: '💸 Düşük (Ekonomik)', value: 'low', emoji: '💸' },
                { label: '💵 Orta', value: 'mid', emoji: '💵' },
                { label: '💎 Yüksek (Lüks)', value: 'high', emoji: '💎' }
            ]},
            { id: 'climate', title: '🌡️ Hangi iklimi tercih edersin?', options: [
                { label: '☀️ Sıcak & Güneşli', value: 'hot', emoji: '☀️' },
                { label: '❄️ Soğuk & Kar', value: 'cold', emoji: '❄️' },
                { label: '🌤️ Ilıman', value: 'mild', emoji: '🌤️' },
                { label: '🌴 Tropikal', value: 'tropical', emoji: '🌴' }
            ]},
            { id: 'visa', title: '🛂 Vize durumu önemli mi?', options: [
                { label: '🟢 Vizesiz olsun', value: 'free', emoji: '🟢' },
                { label: '🟡 Fark etmez', value: 'any', emoji: '🟡' }
            ]},
            { id: 'interest', title: '🎯 Ne tür bir tatil istersin?', options: [
                { label: '🏛️ Tarih & Kültür', value: 'culture', emoji: '🏛️' },
                { label: '🏖️ Plaj & Deniz', value: 'beach', emoji: '🏖️' },
                { label: '🏔️ Doğa & Macera', value: 'nature', emoji: '🏔️' },
                { label: '🍕 Yemek & Gastronomi', value: 'food', emoji: '🍕' },
                { label: '🌃 Şehir & Gece Hayatı', value: 'city', emoji: '🌃' }
            ]},
            { id: 'continent', title: '🌍 Hangi bölge?', options: [
                { label: '🇪🇺 Avrupa', value: 'europe', emoji: '🇪🇺' },
                { label: '🌏 Asya', value: 'asia', emoji: '🌏' },
                { label: '🌎 Amerika', value: 'americas', emoji: '🌎' },
                { label: '🌍 Afrika & Diğer', value: 'other', emoji: '🌍' },
                { label: '🌐 Fark Etmez', value: 'any', emoji: '🌐' }
            ]}
        ];

        const countryQuizMeta = {
            "Türkiye": { budget:'low', climate:'hot', continent:'europe', tags:['culture','beach','food'] },
            "İtalya": { budget:'mid', climate:'mild', continent:'europe', tags:['culture','food','city'] },
            "Japonya": { budget:'high', climate:'mild', continent:'asia', tags:['culture','food','city'] },
            "Fransa": { budget:'high', climate:'mild', continent:'europe', tags:['culture','food','city'] },
            "İspanya": { budget:'mid', climate:'hot', continent:'europe', tags:['beach','food','city'] },
            "Yunanistan": { budget:'mid', climate:'hot', continent:'europe', tags:['beach','culture','food'] },
            "Tayland": { budget:'low', climate:'tropical', continent:'asia', tags:['beach','food','nature'] },
            "Güney Kore": { budget:'mid', climate:'mild', continent:'asia', tags:['culture','food','city'] },
            "Meksika": { budget:'low', climate:'hot', continent:'americas', tags:['culture','food','beach'] },
            "Brezilya": { budget:'mid', climate:'tropical', continent:'americas', tags:['beach','nature','city'] },
            "Mısır": { budget:'low', climate:'hot', continent:'other', tags:['culture','nature'] },
            "Avustralya": { budget:'high', climate:'hot', continent:'other', tags:['nature','beach','city'] },
            "ABD": { budget:'high', climate:'mild', continent:'americas', tags:['city','nature','food'] },
            "Birleşik Krallık": { budget:'high', climate:'cold', continent:'europe', tags:['culture','city'] },
            "Portekiz": { budget:'mid', climate:'mild', continent:'europe', tags:['beach','food','culture'] },
            "Fas": { budget:'low', climate:'hot', continent:'other', tags:['culture','food','nature'] },
            "Vietnam": { budget:'low', climate:'tropical', continent:'asia', tags:['food','nature','beach'] },
            "Hırvatistan": { budget:'mid', climate:'hot', continent:'europe', tags:['beach','culture','nature'] },
            "Norveç": { budget:'high', climate:'cold', continent:'europe', tags:['nature','city'] },
            "İsviçre": { budget:'high', climate:'cold', continent:'europe', tags:['nature','city'] },
            "Endonezya": { budget:'low', climate:'tropical', continent:'asia', tags:['beach','nature','food'] },
            "Peru": { budget:'low', climate:'mild', continent:'americas', tags:['culture','nature','food'] },
            "Arjantin": { budget:'mid', climate:'mild', continent:'americas', tags:['food','nature','city'] },
            "Hindistan": { budget:'low', climate:'tropical', continent:'asia', tags:['culture','food','nature'] },
            "Macaristan": { budget:'low', climate:'mild', continent:'europe', tags:['culture','city','food'] },
            "Çek Cumhuriyeti": { budget:'low', climate:'cold', continent:'europe', tags:['culture','city'] },
            "Singapur": { budget:'high', climate:'tropical', continent:'asia', tags:['food','city'] },
            "Güney Afrika": { budget:'mid', climate:'mild', continent:'other', tags:['nature','culture'] },
            "Birleşik Arap Emirlikleri": { budget:'high', climate:'hot', continent:'other', tags:['city','food'] },
            "Karadağ": { budget:'low', climate:'hot', continent:'europe', tags:['beach','nature'] },
            "İrlanda": { budget:'mid', climate:'cold', continent:'europe', tags:['nature','culture','city'] },
            "Hollanda": { budget:'mid', climate:'cold', continent:'europe', tags:['culture','city'] },
        };

        let quizStep = 0;
        let quizAnswers = {};

        const initQuiz = () => {
            const modal = document.getElementById('quiz-modal');
            const closeBtn = document.getElementById('quiz-close-btn');
            const prevBtn = document.getElementById('quiz-prev-btn');
            const nextBtn = document.getElementById('quiz-next-btn');
            const heroQuizBtn = document.getElementById('hero-quiz-btn');
            const navQuizBtn = document.getElementById('nav-quiz-btn');

            const openQuiz = () => { quizStep = 0; quizAnswers = {}; renderQuizStep(); modal.classList.add('visible'); };
            if (heroQuizBtn) heroQuizBtn.addEventListener('click', openQuiz);
            if (navQuizBtn) navQuizBtn.addEventListener('click', openQuiz);
            if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
            if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('visible'); });

            const renderQuizStep = () => {
                const content = document.getElementById('quiz-content');
                const progressBar = document.getElementById('quiz-progress-bar');
                progressBar.style.width = `${((quizStep + 1) / quizQuestions.length) * 100}%`;
                prevBtn.classList.toggle('hidden', quizStep === 0);

                if (quizStep >= quizQuestions.length) {
                    showQuizResults();
                    return;
                }
                const q = quizQuestions[quizStep];
                nextBtn.textContent = quizStep === quizQuestions.length - 1 ? 'Sonuçları Gör 🎉' : 'Sonraki →';
                content.innerHTML = `
                    <h4 class="text-2xl font-bold text-primary mb-6">${q.title}</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${q.options.map(o => `
                            <button class="quiz-option p-4 rounded-xl border-2 ${quizAnswers[q.id] === o.value ? 'border-accent bg-accent/10' : 'border-border-color hover:border-accent/50'} text-left transition-all flex items-center gap-3 group" data-value="${o.value}">
                                <span class="text-2xl group-hover:scale-125 transition-transform">${o.emoji}</span>
                                <span class="font-medium text-primary">${o.label}</span>
                            </button>
                        `).join('')}
                    </div>
                `;
                content.querySelectorAll('.quiz-option').forEach(btn => {
                    btn.addEventListener('click', () => {
                        quizAnswers[q.id] = btn.dataset.value;
                        content.querySelectorAll('.quiz-option').forEach(b => { b.classList.remove('border-accent', 'bg-accent/10'); b.classList.add('border-border-color'); });
                        btn.classList.add('border-accent', 'bg-accent/10');
                        btn.classList.remove('border-border-color');
                    });
                });
            };

            if (prevBtn) prevBtn.addEventListener('click', () => { if (quizStep > 0) { quizStep--; renderQuizStep(); } });
            if (nextBtn) nextBtn.addEventListener('click', () => { quizStep++; renderQuizStep(); });

            const showQuizResults = () => {
                const content = document.getElementById('quiz-content');
                prevBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
                document.getElementById('quiz-progress-bar').style.width = '100%';

                const scores = {};
                Object.keys(countriesData).forEach(name => {
                    const meta = countryQuizMeta[name];
                    if (!meta) return;
                    let score = 0;
                    if (quizAnswers.budget && (quizAnswers.budget === meta.budget)) score += 3;
                    if (quizAnswers.climate && (quizAnswers.climate === meta.climate)) score += 3;
                    if (quizAnswers.interest && meta.tags.includes(quizAnswers.interest)) score += 4;
                    if (quizAnswers.continent === 'any' || quizAnswers.continent === meta.continent) score += 2;
                    scores[name] = score;
                });

                const top3 = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
                content.innerHTML = `
                    <h4 class="text-2xl font-bold text-primary mb-2">🎉 Sana En Uygun Ülkeler</h4>
                    <p class="text-secondary mb-6">Tercihlerine göre en iyi 3 eşleşme:</p>
                    <div class="space-y-4">
                        ${top3.map(([name, score], i) => {
                            const c = countriesData[name];
                            const medals = ['🥇', '🥈', '🥉'];
                            return `
                            <div class="p-5 rounded-2xl border-2 ${i === 0 ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-border-color'} flex items-center gap-4 cursor-pointer hover:border-accent/50 transition-all quiz-result-card" data-country="${name}">
                                <span class="text-4xl">${medals[i]}</span>
                                <span class="text-4xl">${c.flag}</span>
                                <div class="flex-1">
                                    <div class="font-bold text-lg text-primary">${name}</div>
                                    <div class="text-sm text-secondary">${c.description}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs text-secondary">Uyum</div>
                                    <div class="text-lg font-bold text-accent">${Math.min(Math.round((score / 12) * 100), 100)}%</div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                    <button id="quiz-restart-btn" class="btn btn-secondary w-full py-3 rounded-xl mt-4">🔄 Quizi Tekrarla</button>
                `;
                content.querySelectorAll('.quiz-result-card').forEach(card => {
                    card.addEventListener('click', () => {
                        modal.classList.remove('visible');
                        displayCountryDetail(card.dataset.country);
                    });
                });
                const restartBtn = document.getElementById('quiz-restart-btn');
                if (restartBtn) restartBtn.addEventListener('click', () => { quizStep = 0; quizAnswers = {}; nextBtn.classList.remove('hidden'); renderQuizStep(); });
            };
        };

        // --- COMPARISON SYSTEM ---
        const initComparison = () => {
            const modal = document.getElementById('compare-modal');
            const closeBtn = document.getElementById('compare-close-btn');
            const goBtn = document.getElementById('compare-go-btn');
            const navBtn = document.getElementById('nav-compare-btn');
            const sel1 = document.getElementById('compare-country-1');
            const sel2 = document.getElementById('compare-country-2');
            if (!modal || !sel1 || !sel2) return;

            // Populate dropdowns
            const countries = Object.keys(countriesData).sort();
            countries.forEach(name => {
                sel1.innerHTML += `<option value="${name}">${countriesData[name].flag} ${name}</option>`;
                sel2.innerHTML += `<option value="${name}">${countriesData[name].flag} ${name}</option>`;
            });

            if (navBtn) navBtn.addEventListener('click', () => modal.classList.add('visible'));
            if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('visible'); });

            if (goBtn) goBtn.addEventListener('click', () => {
                const n1 = sel1.value, n2 = sel2.value;
                if (!n1 || !n2 || n1 === n2) { showToast('Lütfen iki farklı ülke seçin!', 'error'); return; }
                const c1 = countriesData[n1], c2 = countriesData[n2];
                const results = document.getElementById('compare-results');
                const quickLook1 = typeof getVisaForPassport === 'function' ? getVisaForPassport(n1, userPassport) : {};
                const quickLook2 = typeof getVisaForPassport === 'function' ? getVisaForPassport(n2, userPassport) : {};

                const rows = [
                    ['🏳️ Bayrak', c1.flag, c2.flag],
                    ['🛂 Vize', quickLook1.visa || '-', quickLook2.visa || '-'],
                    ['💰 Para Birimi', c1.currency, c2.currency],
                    ['🗣️ Dil', c1.language, c2.language],
                    ['📅 En İyi Dönem', quickLook1.bestTime || '-', quickLook2.bestTime || '-'],
                    ['💸 Günlük Bütçe', quickLook1.budget || '-', quickLook2.budget || '-'],
                    ['🔌 Priz Tipi', quickLook1.plug || '-', quickLook2.plug || '-'],
                    ['☕ Bahşiş', quickLook1.tipping || '-', quickLook2.tipping || '-'],
                    ['🆘 Acil Durum', c1.emergencyNumber, c2.emergencyNumber],
                    ['🌡️ İklim', c1.climate, c2.climate],
                ];
                results.classList.remove('hidden');
                results.innerHTML = `
                    <div class="overflow-x-auto rounded-2xl border border-border-color">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="bg-card-bg">
                                    <th class="p-3 text-left text-secondary font-medium w-1/4">Özellik</th>
                                    <th class="p-3 text-center font-bold text-primary">${c1.flag} ${n1}</th>
                                    <th class="p-3 text-center font-bold text-primary">${c2.flag} ${n2}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(([label, v1, v2], i) => `
                                    <tr class="${i % 2 === 0 ? 'bg-background' : 'bg-card-bg'}">
                                        <td class="p-3 text-secondary font-medium">${label}</td>
                                        <td class="p-3 text-center text-primary">${v1}</td>
                                        <td class="p-3 text-center text-primary">${v2}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                if (typeof gsap !== 'undefined') gsap.fromTo(results, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            });
        };

        // --- STATIC BLOG DATA (SEO Content) ---
        const staticBlogPosts = [
            { slug: 'vizesiz-ulkeler-2026', title: '🌍 2026\'da Türk Pasaportuyla Vizesiz Gidilen 50+ Ülke', summary: 'Vize derdi olmadan gidebileceğiniz en güzel ülkeleri ve pratik ipuçlarını keşfedin.', image: 'https://image.pollinations.ai/prompt/world%20travel%20passport%20visa%20free?width=800&height=400&nologo=true', date: '2026-03-20', category: 'Rehber', content: `<h2 class="text-2xl font-bold mt-6 mb-3">Vizesiz Seyahat Rehberi 2026</h2><p class="mb-4">Türk vatandaşları 2026 yılında 50'den fazla ülkeye vizesiz veya kapıda vize ile seyahat edebilir. İşte bölgelere göre listesi:</p><h3 class="text-xl font-bold mt-5 mb-2">🌏 Asya</h3><p class="mb-4">Japonya (90 gün), Güney Kore (90 gün), Tayland (30 gün), Malezya (90 gün), Singapur (30 gün), Endonezya (30 gün kapıda vize), Filipinler (30 gün).</p><h3 class="text-xl font-bold mt-5 mb-2">🌎 Amerika</h3><p class="mb-4">Brezilya (90 gün), Arjantin (90 gün), Meksika (e-vize), Peru (90 gün), Kolombiya, Ekvador, Şili.</p><h3 class="text-xl font-bold mt-5 mb-2">🌍 Afrika & Orta Doğu</h3><p class="mb-4">Fas (90 gün), Tunus (90 gün), BAE (90 gün), Güney Afrika (30 gün), Katar.</p><h3 class="text-xl font-bold mt-5 mb-2">🇪🇺 Balkanlar</h3><p class="mb-4">Sırbistan, Bosna-Hersek, Karadağ, Arnavutluk, Kosova — hepsi vizesiz!</p><p class="mb-4"><strong>İpucu:</strong> Pasaportunuzun geçerlilik süresinin seyahat bitiş tarihinden itibaren en az 6 ay olmasına dikkat edin.</p>` },
            { slug: 'japonya-7-gunluk-rehber', title: '🇯🇵 Japonya\'da 7 Günlük Gezi Rehberi', summary: 'Tokyo, Kyoto ve Osaka: Japon kültürünü bir haftada nasıl keşfedersiniz?', image: 'https://image.pollinations.ai/prompt/japan%20tokyo%20cherry%20blossom%20temple?width=800&height=400&nologo=true', date: '2026-03-18', category: 'Gezi Rehberi', content: `<h2 class="text-2xl font-bold mt-6 mb-3">7 Günde Japonya</h2><h3 class="text-xl font-bold mt-5 mb-2">📅 1-2. Gün: Tokyo</h3><p class="mb-4">Shibuya Geçidi, Meiji Tapınağı, Akihabara elektronik caddesi, Tsukiji Dış Pazarı. Japan Rail Pass alarak bütçenizi optimize edin.</p><h3 class="text-xl font-bold mt-5 mb-2">📅 3-4. Gün: Kyoto</h3><p class="mb-4">Fushimi Inari, Arashiyama Bambu Ormanı, Kinkaku-ji Altın Tapınak. Geleneksel bir Ryokan'da konaklama deneyimi.</p><h3 class="text-xl font-bold mt-5 mb-2">📅 5. Gün: Nara</h3><p class="mb-4">Geyik parkı ve Todai-ji Tapınağı. Kyoto'dan günübirlik gidilebilir.</p><h3 class="text-xl font-bold mt-5 mb-2">📅 6-7. Gün: Osaka</h3><p class="mb-4">Dotonbori sokak yemekleri, Osaka Kalesi, Shinsekai bölgesi. Takoyaki ve okonomiyaki mutlaka deneyin!</p><p class="mb-4"><strong>Bütçe:</strong> Günlük ortalama 80-120$ (konaklama dahil). JR Pass 7 gün ~$200.</p>` },
            { slug: 'butce-dostu-avrupa', title: '💶 Bütçe Dostu Avrupa: Günde 50€ ile Gezin', summary: 'Avrupa\'da ucuza seyahat etmenin sırları ve en uygun ülkeler.', image: 'https://image.pollinations.ai/prompt/europe%20backpacker%20budget%20travel%20train?width=800&height=400&nologo=true', date: '2026-03-15', category: 'Bütçe', content: `<h2 class="text-2xl font-bold mt-6 mb-3">Avrupa'da Bütçe Seyahati</h2><h3 class="text-xl font-bold mt-5 mb-2">🏆 En Ucuz Avrupa Ülkeleri</h3><p class="mb-4">1. Arnavutluk (günlük 25-35€) 2. Bosna-Hersek (30-40€) 3. Sırbistan (30-40€) 4. Bulgaristan (35-45€) 5. Macaristan (40-50€) 6. Romanya (35-45€) 7. Polonya (40-50€)</p><h3 class="text-xl font-bold mt-5 mb-2">💡 Tasarruf İpuçları</h3><p class="mb-4">• Hostel yerine Couchsurfing veya ev takası deneyin<br>• Yerel pazarlardan alışveriş yapın<br>• Ücretsiz yürüyüş turlarına katılın<br>• FlixBus ile şehirler arası ucuz ulaşım<br>• Müze kartları ve city pass'lerden yararlanın</p>` },
            { slug: 'solo-seyahat-rehberi', title: '🎒 Yalnız Seyahat Edenlerin Bilmesi Gereken 10 Şey', summary: 'Solo seyahate çıkmadan önce bilmeniz gereken güvenlik ve pratik ipuçları.', image: 'https://image.pollinations.ai/prompt/solo%20traveler%20backpacker%20mountain%20sunrise?width=800&height=400&nologo=true', date: '2026-03-10', category: 'İpuçları', content: `<h2 class="text-2xl font-bold mt-6 mb-3">Solo Seyahat Rehberi</h2><p class="mb-4">Yalnız seyahat, özgürlüğün ve kendini keşfetmenin en güzel yolu. Ama hazırlıklı olmanız şart:</p><ol class="list-decimal pl-6 mb-4 space-y-2"><li>Konaklama yerinizi önceden rezerve edin</li><li>Seyahat sigortası mutlaka yaptırın</li><li>Belgelerin fotokopisini dijital olarak saklayın</li><li>Yerel SIM kart alın veya eSIM kullanın</li><li>İlk gece güvenli bir bölgede konaklayın</li><li>Hostel'lerde yeni insanlarla tanışın</li><li>Acil durum kişileriyle konumunuzu paylaşın</li><li>Yerel kültüre saygı gösterin</li><li>Değerli eşyalarınızı güvenli saklayın</li><li>İnstinct'inize güvenin - bir şey yanlış hissediyorsa, yerinizi değiştirin</li></ol>` },
            { slug: 'en-iyi-sokak-yemekleri', title: '🍜 Dünyanın En İyi Sokak Yemekleri: 15 Ülke, 15 Lezzet', summary: 'Her ülkenin vazgeçilmez sokak lezzetleri ve nerede bulacağınız.', image: 'https://image.pollinations.ai/prompt/street%20food%20night%20market%20delicious?width=800&height=400&nologo=true', date: '2026-03-05', category: 'Yemek', content: `<h2 class="text-2xl font-bold mt-6 mb-3">Dünya Sokak Yemekleri Haritası</h2><p class="mb-4">Sokak yemekleri, bir ülkenin ruhunu tanımanın en lezzetli yoludur. İşte mutlaka denemeniz gereken 15 lezzet:</p><ul class="list-disc pl-6 mb-4 space-y-2"><li>🇹🇭 <strong>Tayland:</strong> Pad Thai - Bangkok sokakları</li><li>🇲🇽 <strong>Meksika:</strong> Tacos al Pastor - Mexico City</li><li>🇹🇷 <strong>Türkiye:</strong> Balık Ekmek - İstanbul Eminönü</li><li>🇯🇵 <strong>Japonya:</strong> Takoyaki - Osaka</li><li>🇮🇳 <strong>Hindistan:</strong> Samosa - Delhi</li><li>🇻🇳 <strong>Vietnam:</strong> Banh Mi - Ho Chi Minh</li><li>🇰🇷 <strong>Güney Kore:</strong> Tteokbokki - Seul</li><li>🇪🇬 <strong>Mısır:</strong> Koshary - Kahire</li><li>🇧🇷 <strong>Brezilya:</strong> Açai Bowl - Rio</li><li>🇲🇦 <strong>Fas:</strong> B'stilla - Marakeş</li></ul>` },
            { slug: 'dijital-gocebe-rehberi', title: '💻 Dijital Göçebe Olmak: En İyi 10 Şehir', summary: 'Uzaktan çalışırken dünyanın en iyi şehirlerinde yaşamak mümkün.', image: 'https://image.pollinations.ai/prompt/digital%20nomad%20laptop%20cafe%20tropical?width=800&height=400&nologo=true', date: '2026-03-01', category: 'Dijital Göçebe', content: `<h2 class="text-2xl font-bold mt-6 mb-3">Dijital Göçebeler İçin En İyi Şehirler</h2><ol class="list-decimal pl-6 mb-4 space-y-2"><li><strong>Bali, Endonezya</strong> - Ucuz yaşam, coworking alanları, tropikal cennet</li><li><strong>Lizbon, Portekiz</strong> - Avrupa'nın en uygun başkenti, mükemmel internet</li><li><strong>Chiang Mai, Tayland</strong> - Aylık 600$'a mükemmel yaşam</li><li><strong>Tiflis, Gürcistan</strong> - 1 yıl vizesiz, düşük maliyet</li><li><strong>Mexico City, Meksika</strong> - Kültürel zenginlik, lezzetli yemek</li><li><strong>Budapeşte, Macaristan</strong> - Orta Avrupa'nın gizli mücevheri</li><li><strong>Medellín, Kolombiya</strong> - Mükemmel iklim, aktif topluluk</li><li><strong>Bangkok, Tayland</strong> - Hızlı internet, uygun fiyat</li><li><strong>Barselona, İspanya</strong> - Plaj + şehir + kültür</li><li><strong>Porto, Portekiz</strong> - Dijital vize programı</li></ol>` }
        ];

        // Override blog rendering to include static posts
        const renderStaticBlogPosts = () => {
            const container = document.getElementById('blog-posts-container');
            if (!container) return;
            container.innerHTML = staticBlogPosts.map(post => `
                <div class="content-card glass-card overflow-hidden cursor-pointer group" onclick="window.history.pushState({page:'blog-detail',slug:'${post.slug}'}, '', '?page=blog&slug=${post.slug}');">
                    <div class="h-48 overflow-hidden">
                        <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">
                    </div>
                    <div class="p-6">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent mb-3">${post.category}</span>
                        <h3 class="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">${post.title}</h3>
                        <p class="text-sm text-secondary line-clamp-2">${post.summary}</p>
                        <div class="mt-4 text-xs text-secondary">${new Date(post.date).toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
            `).join('');
        };

        // --- PUSH NOTIFICATION SYSTEM ---
        const initPushNotifications = () => {
            if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
            if (Notification.permission === 'granted' || localStorage.getItem('vuelina_push_asked')) return;
            
            // Show after 30 seconds
            setTimeout(() => {
                if (Notification.permission !== 'default') return;
                localStorage.setItem('vuelina_push_asked', '1');
                
                const banner = document.createElement('div');
                banner.id = 'push-banner';
                banner.className = 'fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 z-[9999] p-5 rounded-2xl shadow-2xl border border-border-color';
                banner.style.cssText = 'background: var(--card-bg); backdrop-filter: blur(20px); animation: fadeInUp 0.5s ease;';
                banner.innerHTML = `
                    <div class="flex items-start gap-4">
                        <span class="text-3xl">🔔</span>
                        <div class="flex-1">
                            <h4 class="font-bold text-primary mb-1">Bildirimleri Aç</h4>
                            <p class="text-sm text-secondary mb-3">Yeni vize güncellemelerinden ve fırsatlardan haberdar ol!</p>
                            <div class="flex gap-2">
                                <button id="push-allow-btn" class="btn btn-primary px-4 py-2 text-sm rounded-xl">İzin Ver</button>
                                <button id="push-dismiss-btn" class="btn btn-secondary px-4 py-2 text-sm rounded-xl">Şimdi Değil</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(banner);

                document.getElementById('push-allow-btn').addEventListener('click', async () => {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                        new Notification('Vuelina 🎉', { body: 'Artık seyahat fırsatlarından haberdar olacaksın!', icon: '/favicon.ico' });
                    }
                    banner.remove();
                });
                document.getElementById('push-dismiss-btn').addEventListener('click', () => banner.remove());
            }, 30000);
        };

        // --- AI CHATBOT SYSTEM ---
        const initChatbot = () => {
            const fab = document.getElementById('chatbot-fab');
            const panel = document.getElementById('chatbot-panel');
            const closeBtn = document.getElementById('chatbot-close-btn');
            const form = document.getElementById('chatbot-form');
            const input = document.getElementById('chatbot-input');
            const messages = document.getElementById('chatbot-messages');

            if (!fab || !panel) return;

            const toggleChat = () => {
                if (panel.classList.contains('scale-0')) {
                    panel.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
                    fab.classList.add('scale-0');
                    input.focus();
                } else {
                    panel.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
                    fab.classList.remove('scale-0');
                }
            };

            fab.addEventListener('click', toggleChat);
            closeBtn.addEventListener('click', toggleChat);

            const appendMessage = (text, isUser = false) => {
                const div = document.createElement('div');
                div.className = `flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`;
                
                const avatar = document.createElement('div');
                avatar.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-primary text-background text-sm font-bold' : 'bg-indigo-100 dark:bg-indigo-900/50 text-xl'}`;
                avatar.innerHTML = isUser ? '👤' : '🤖';

                const bubble = document.createElement('div');
                bubble.className = `p-3 rounded-2xl text-sm ${isUser ? 'bg-primary text-background rounded-tr-none' : 'bg-indigo-50 dark:bg-indigo-900/20 text-primary rounded-tl-none prose prose-sm dark:prose-invert'}`;
                
                if (isUser) {
                    bubble.textContent = text;
                } else {
                    bubble.innerHTML = window.marked ? marked.parse(text) : text;
                }

                div.appendChild(avatar);
                div.appendChild(bubble);
                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
            };

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;

                appendMessage(text, true);
                input.value = '';
                
                const typingDiv = document.createElement('div');
                typingDiv.id = 'chatbot-typing';
                typingDiv.className = 'flex items-center gap-2 text-secondary text-xs ml-10';
                typingDiv.innerHTML = '<span class="animate-pulse">Vuelina yazıyor...</span>';
                messages.appendChild(typingDiv);
                messages.scrollTop = messages.scrollHeight;

                const params = new URLSearchParams(window.location.search);
                const countryParam = params.get('country');
                const pathSlug = window.location.pathname.startsWith('/ulke/') ? decodeURIComponent(window.location.pathname.split('/ulke/')[1]) : null;
                
                let contextStr = 'Kullanıcı şu an ana sayfada.';
                if (countryParam || pathSlug) {
                    contextStr = `Kullanıcı şu an "${countryParam || pathSlug}" ülkesinin detay sayfasını inceliyor. Mümkün olduğunca bu ülke özelinde cevap ver.`;
                }

                try {
                    const prompt = `[SİSTEM BİLGİSİ: Sen Vuelina platformunun kibar ve yardımcı AI seyahat asistanısın. Kısa ve net cevaplar ver. Markdown kullanabilirsin. ${contextStr}]
Müşteri Sorusu: ${text}`;
                    const reply = await callGroqAPI(prompt);
                    
                    document.getElementById('chatbot-typing')?.remove();
                    if (reply) {
                        appendMessage(reply, false);
                    } else {
                        appendMessage("Üzgünüm, şu an bağlantı kuramıyorum 😔", false);
                    }
                } catch (err) {
                    document.getElementById('chatbot-typing')?.remove();
                    appendMessage("Bir hata oluştu, lütfen tekrar deneyin.", false);
                }
            });
        };

        // --- FIREBASE & AUTH & PROFILE SYSTEM ---
        const initProfileSystem = () => {
            const profileModal = document.getElementById('profile-modal');
            const authModal = document.getElementById('auth-modal');
            let scratchMap = null;

            const firebaseConfig = {
                apiKey: "",
                authDomain: "",
                projectId: ""
            };

            let db = null;
            let auth = null;
            
            try {
                if (firebaseConfig.apiKey && window.firebase) {
                    firebase.initializeApp(firebaseConfig);
                    db = firebase.firestore();
                    auth = firebase.auth();
                    console.log('Firebase initialized');
                } else {
                    console.warn('Firebase API Keys not found. Profile is using localStorage for testing.');
                }
            } catch(e) {
                console.warn('Firebase init failed', e);
            }

            window.openProfileModal = () => {
                if (!currentUser) {
                    authModal.classList.remove('hidden');
                    return;
                }
                
                document.getElementById('profile-name').textContent = currentUser.name || currentUser.email || 'Kullanıcı';
                document.getElementById('profile-avatar').textContent = (currentUser.name || currentUser.email || '?')[0].toUpperCase();
                
                profileModal.classList.remove('hidden');
                
                setTimeout(() => {
                    if (!scratchMap) {
                        try {
                            scratchMap = L.map('profile-scratch-map', { 
                                zoomControl: true, 
                                attributionControl: false
                            }).setView([20, 0], 1.5);
                            
                            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                                subdomains: 'abcd',
                                maxZoom: 6,
                                minZoom: 1
                            }).addTo(scratchMap);

                            fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
                                .then(res => res.json())
                                .then(geoData => {
                                    const visited = getVisitedCountries();
                                    L.geoJSON(geoData, {
                                        style: function(feature) {
                                            const countryEn = feature.properties.name;
                                            const countryId = feature.id;
                                            let isVisited = false;
                                            if (visited.some(v => v.toLowerCase().slice(0,4) === countryEn.toLowerCase().slice(0,4) || v === 'Türkiye' && countryId === 'TUR')) {
                                                isVisited = true;
                                            }
                                            return {
                                                fillColor: isVisited ? '#10B981' : '#334155',
                                                weight: 1,
                                                opacity: 1,
                                                color: '#1e293b',
                                                fillOpacity: isVisited ? 0.8 : 0.4
                                            };
                                        }
                                    }).addTo(scratchMap);
                                });
                        } catch (e) { console.warn("Map init failed", e); }
                    }
                }, 300);

                const visitedCount = getVisitedCountries().length;
                document.getElementById('profile-stats-badge').textContent = `Keşfedilen: %${((visitedCount / 195) * 100).toFixed(1)} (${visitedCount}/195)`;
                
                const badgesContainer = document.getElementById('profile-badges-container');
                const badges = [
                    { name: 'İlk Adım', desc: 'Sınırları aştın!', icon: '🎒', unlocked: visitedCount >= 1 },
                    { name: 'Dünya Gezgini', desc: '5 Ülke ziyaret', icon: '🌍', unlocked: visitedCount >= 5 },
                    { name: 'Kıta Kaşifi', desc: '10 Ülke ziyaret', icon: '🧭', unlocked: visitedCount >= 10 },
                    { name: 'Sınır Tanımaz', desc: '20 Ülke ziyaret', icon: '🚀', unlocked: visitedCount >= 20 },
                ];

                badgesContainer.innerHTML = badges.map(b => `
                    <div class="content-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all ${b.unlocked ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-105' : 'opacity-40 grayscale'}">
                        <div class="text-4xl drop-shadow-md">${b.icon}</div>
                        <div class="font-bold text-primary text-sm">${b.name}</div>
                        <div class="text-xs text-secondary hidden sm:block">${b.desc}</div>
                    </div>
                `).join('');
            };

            document.getElementById('profile-modal-close-btn').addEventListener('click', () => {
                profileModal.classList.add('hidden');
            });

            document.getElementById('profile-logout-btn').addEventListener('click', async () => {
                if (auth && auth.currentUser) {
                    await auth.signOut();
                }
                localStorage.removeItem('vuelina_user');
                currentUser = null;
                updateAuthUI();
                profileModal.classList.add('hidden');
            });
        };

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

                // 6. Premium features
                initQuiz();
                initComparison();
                renderStaticBlogPosts();
                initPushNotifications();
                initChatbot();
                initProfileSystem();

            } catch (error) {
                console.error("Initialization Error:", error);
                if (preloader) preloader.remove();
            }
        };
    
    
        // Footer Links Event Listeners - Modal links removed, now using direct page navigation
        
    initApp();

    });