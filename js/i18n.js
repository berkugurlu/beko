const translations = {
    tr: {
        "nav.blog": "Blog",
        "nav.what": "Nedir?",
        "nav.about": "Hakkımızda",
        "hero.title": "Hayalindeki Macerayı Bul",
        "hero.subtitle": "Sekmelerde Kaybolma, Sokaklarda Kaybol.",
        "search.placeholder": "Nereye gitmek istersin? (örn: Japonya, İtalya)...",
        "btn.list": "Liste Görünümü",
        "btn.map": "Harita Görünümü",
        "no_results.title": "Aradığınız yeri bulamadık",
        "no_results.desc": "Yazım hatası yapmış olabilir misiniz? Veya listemizde henüz bu ülke olmayabilir.",
        "no_results.btn": "Listeyi Sıfırla",
        "modal.itinerary": "🗺️ Seyahat Planı Oluştur",
        "modal.duration": "Seyahat süresi (gün)",
        "modal.interests": "İlgi alanların (örn: tarih, yemek)",
        "modal.generate": "Planı Oluştur",
        "cookie.title": "🍪 Gizliliğinize Önem Veriyoruz",
        "cookie.reject": "Reddet",
        "cookie.accept": "Kabul Et",
        "auth.title": "Vuelina'ya Hoş Geldin",
        "auth.subtitle": "Favorilerini kaydet, planlarını yönet.",
        "auth.email": "E-posta",
        "auth.pass": "Şifre",
        "auth.submit": "Giriş Yap / Üye Ol",
        "auth.or": "veya",
        "auth.google": "Google ile Devam Et",
        "auth.terms_hint": "Giriş yaparak",
        "nav.login": "Giriş Yap",
        "nav.profile": "Profilim",
        "nav.logout": "Çıkış Yap",
        "filter.all": "Tümü",
        "filter.avrupa": "Avrupa",
        "filter.asya": "Asya",
        "filter.deniz": "Deniz",
        "filter.vizesiz": "Vizesiz",
        "filter.tarih": "Tarih",
        "filter.safari": "Safari",
        "filter.kayak": "Kayak",
        "filter.tropik": "Tropikal",
        "filter.luks": "Lüks",
        "filter.amerika": "Amerika",
        "card.explore": "Keşfet",
        "card.days": "gün"
    },
    en: {
        "nav.blog": "Blog",
        "nav.what": "What is it?",
        "nav.about": "About Us",
        "hero.title": "Find Your Dream Adventure",
        "hero.subtitle": "Don't get lost in tabs, get lost in streets.",
        "search.placeholder": "Where to? (e.g. Japan, Italy)...",
        "btn.list": "List View",
        "btn.map": "Map View",
        "no_results.title": "We couldn't find what you are looking for",
        "no_results.desc": "Could there be a typo? Or maybe we haven't added this country yet.",
        "no_results.btn": "Reset List",
        "modal.itinerary": "🗺️ Create Itinerary",
        "modal.duration": "Duration (days)",
        "modal.interests": "Your interests (e.g. history, food)",
        "modal.generate": "Generate Plan",
        "cookie.title": "🍪 We Value Your Privacy",
        "cookie.reject": "Reject",
        "cookie.accept": "Accept",
        "auth.title": "Welcome to Vuelina",
        "auth.subtitle": "Save favorites, manage your plans.",
        "auth.email": "Email",
        "auth.pass": "Password",
        "auth.submit": "Login / Sign Up",
        "auth.or": "or",
        "auth.google": "Continue with Google",
        "auth.terms_hint": "By logging in, you agree to",
        "nav.login": "Login",
        "nav.profile": "My Profile",
        "nav.logout": "Logout",
        "filter.all": "All",
        "filter.avrupa": "Europe",
        "filter.asya": "Asia",
        "filter.deniz": "Beach",
        "filter.vizesiz": "Visa-Free",
        "filter.tarih": "History",
        "filter.safari": "Safari",
        "filter.kayak": "Ski",
        "filter.tropik": "Tropical",
        "filter.luks": "Luxury",
        "filter.Amerika": "Americas",
        "card.explore": "Explore",
        "card.days": "days"
    }
};

let currentLang = localStorage.getItem('vuelina_lang') || 'tr';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('vuelina_lang', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translations[lang][key];
            } else if (el.tagName === 'INPUT' && el.type === 'number') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });

    // Dispatch event so other scripts can re-render dynamic content (e.g., country lists)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    if (langToggleBtn) {
        langToggleBtn.textContent = currentLang === 'tr' ? 'EN' : 'TR';
        langToggleBtn.addEventListener('click', () => {
            const newLang = currentLang === 'tr' ? 'en' : 'tr';
            langToggleBtn.textContent = newLang === 'tr' ? 'EN' : 'TR';
            setLanguage(newLang);
        });
    }
});
