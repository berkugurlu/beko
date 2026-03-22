/**
 * Vuelina Visa Database - Comprehensive Edition
 * Uses rule-based defaults + specific overrides to cover ALL passport-country combos.
 * Sources: Henley Passport Index 2025-2026, IATA Timatic
 */

// Country groupings for rule-based visa logic
const SCHENGEN = ["İtalya","Fransa","İspanya","Yunanistan","Almanya","Avusturya","Belçika","Çek Cumhuriyeti","Danimarka","Estonya","Finlandiya","Hollanda","İsveç","İsviçre","Letonya","Litvanya","Lüksemburg","Macaristan","Malta","Polonya","Portekiz","Slovakya","Slovenya","Hırvatistan","Norveç"];
const EU_ONLY = ["Romanya","Bulgaristan","İrlanda"];
const SCHENGEN_ADJACENT = ["Andorra","San Marino","Vatikan","Monako"]; // Enter via Schengen
const BALKANS_VISA_FREE = ["Sırbistan","Bosna-Hersek","Karadağ","Arnavutluk","Kosova"];
const POWERFUL_PASSPORTS = ["Almanya","Fransa","İtalya","İspanya","Japonya","Güney Kore","ABD","Birleşik Krallık","Kanada","Avustralya","Brezilya"];

// Specific visa data: visaOverrides[passport][target] = {status, note}
const visaOverrides = {
  "Türkiye": {
    "Japonya":{s:"Vizesiz",n:"90 gün"},"Brezilya":{s:"Vizesiz",n:"90 gün"},"Güney Kore":{s:"Vizesiz",n:"90 gün"},
    "Singapur":{s:"Vizesiz",n:"30 gün"},"Malezya":{s:"Vizesiz",n:"90 gün"},"Filipinler":{s:"Vizesiz",n:"30 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"90 gün"},"Katar":{s:"Vizesiz",n:"30 gün"},
    "Fas":{s:"Vizesiz",n:"90 gün"},"Tunus":{s:"Vizesiz",n:"90 gün"},"Peru":{s:"Vizesiz",n:"90 gün"},
    "Arjantin":{s:"Vizesiz",n:"90 gün"},"Gürcistan":{s:"Vizesiz",n:"1 yıl"},"Ukrayna":{s:"Vizesiz",n:"90 gün"},
    "Moldova":{s:"Vizesiz",n:"90 gün"},"Kazakistan":{s:"Vizesiz",n:"30 gün"},"Ermenistan":{s:"Vizesiz",n:"180 gün"},
    "Sırbistan":{s:"Vizesiz",n:"90 gün"},"Bosna-Hersek":{s:"Vizesiz",n:"90 gün"},"Karadağ":{s:"Vizesiz",n:"90 gün"},
    "Arnavutluk":{s:"Vizesiz",n:"90 gün"},"Kosova":{s:"Vizesiz",n:"90 gün"},
    "Mısır":{s:"e-Vize",n:"30 gün"},"Hindistan":{s:"e-Vize",n:"60 gün"},"Vietnam":{s:"e-Vize",n:"30 gün"},
    "Sri Lanka":{s:"e-Vize",n:"30 gün"},"Tanzanya":{s:"e-Vize",n:"90 gün"},"Bahreyn":{s:"e-Vize",n:"14 gün"},
    "Kuveyt":{s:"e-Vize",n:"90 gün"},"Umman":{s:"e-Vize",n:"30 gün"},"Rusya":{s:"e-Vize",n:"16 gün"},
    "Avustralya":{s:"e-Vize",n:"ETA gerekli"},"Yeni Zelanda":{s:"e-Vize",n:"NZeTA gerekli"},
    "Tayland":{s:"Vizesiz",n:"30 gün"},"Endonezya":{s:"Kapıda Vize",n:"30 gün"},
    "Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "ABD":{s:"Vize Gerekli",n:"B1/B2 vizesi"},"Birleşik Krallık":{s:"Vize Gerekli",n:"UK vizesi"},
    "Kanada":{s:"Vize Gerekli",n:"Kanada vizesi"},"Çin":{s:"Vize Gerekli",n:"Çin vizesi"},
    "İrlanda":{s:"Vize Gerekli",n:"İrlanda vizesi"},"Güney Afrika":{s:"Vizesiz",n:"30 gün"},
    "Meksika":{s:"Vize Gerekli",n:"Meksika vizesi veya ABD vizesi ile"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},
    "Romanya":{s:"Vize Gerekli",n:"Schengen/Romanya vizesi"},"Bulgaristan":{s:"Vize Gerekli",n:"Schengen/Bulgaristan vizesi"},
    // All Schengen countries → Vize Gerekli (handled by default rule)
  },
  "Almanya": {
    "ABD":{s:"Vizesiz",n:"ESTA - 90 gün"},"Birleşik Krallık":{s:"Vizesiz",n:"180 gün"},
    "Japonya":{s:"Vizesiz",n:"90 gün"},"Güney Kore":{s:"Vizesiz",n:"90 gün"},
    "Kanada":{s:"Vizesiz",n:"eTA - 180 gün"},"Avustralya":{s:"Vizesiz",n:"ETA - 90 gün"},
    "Yeni Zelanda":{s:"Vizesiz",n:"90 gün"},"Brezilya":{s:"Vizesiz",n:"90 gün"},
    "Meksika":{s:"Vizesiz",n:"180 gün"},"Arjantin":{s:"Vizesiz",n:"90 gün"},
    "Peru":{s:"Vizesiz",n:"90 gün"},"Güney Afrika":{s:"Vizesiz",n:"90 gün"},
    "Singapur":{s:"Vizesiz",n:"90 gün"},"Malezya":{s:"Vizesiz",n:"90 gün"},
    "Tayland":{s:"Vizesiz",n:"30 gün"},"Endonezya":{s:"Vizesiz",n:"30 gün"},
    "Filipinler":{s:"Vizesiz",n:"30 gün"},"Fas":{s:"Vizesiz",n:"90 gün"},
    "Türkiye":{s:"Vizesiz",n:"90 gün"},"Ukrayna":{s:"Vizesiz",n:"90 gün"},
    "Gürcistan":{s:"Vizesiz",n:"1 yıl"},"Kazakistan":{s:"Vizesiz",n:"30 gün"},
    "Moldova":{s:"Vizesiz",n:"90 gün"},"Tunus":{s:"Vizesiz",n:"90 gün"},
    "Ermenistan":{s:"Vizesiz",n:"180 gün"},"Katar":{s:"Vizesiz",n:"180 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"90 gün"},
    "Mısır":{s:"e-Vize",n:"30 gün"},"Hindistan":{s:"e-Vize",n:"60 gün"},
    "Vietnam":{s:"e-Vize",n:"30 gün"},"Sri Lanka":{s:"e-Vize",n:"30 gün"},
    "Tanzanya":{s:"e-Vize",n:"90 gün"},"Kuveyt":{s:"e-Vize",n:"90 gün"},
    "Umman":{s:"e-Vize",n:"30 gün"},"Bahreyn":{s:"Vizesiz",n:"90 gün"},
    "Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "Çin":{s:"Vize Gerekli",n:"Çin vizesi"},"Rusya":{s:"Vize Gerekli",n:"Rusya vizesi"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},
    // Schengen+EU → Serbest Dolaşım (handled by default rule)
  },
  "ABD": {
    "Birleşik Krallık":{s:"Vizesiz",n:"180 gün"},"Japonya":{s:"Vizesiz",n:"90 gün"},
    "Güney Kore":{s:"Vizesiz",n:"90 gün"},"Kanada":{s:"Vizesiz",n:"180 gün"},
    "Avustralya":{s:"Vizesiz",n:"ETA - 90 gün"},"Yeni Zelanda":{s:"Vizesiz",n:"90 gün"},
    "Brezilya":{s:"Vizesiz",n:"90 gün"},"Meksika":{s:"Vizesiz",n:"180 gün"},
    "Arjantin":{s:"Vizesiz",n:"90 gün"},"Peru":{s:"Vizesiz",n:"183 gün"},
    "Güney Afrika":{s:"Vizesiz",n:"90 gün"},"Singapur":{s:"Vizesiz",n:"90 gün"},
    "Malezya":{s:"Vizesiz",n:"90 gün"},"Tayland":{s:"Vizesiz",n:"30 gün"},
    "Endonezya":{s:"Vizesiz",n:"30 gün"},"Filipinler":{s:"Vizesiz",n:"30 gün"},
    "Fas":{s:"Vizesiz",n:"90 gün"},"Türkiye":{s:"Vizesiz",n:"90 gün"},
    "İrlanda":{s:"Vizesiz",n:"90 gün"},"Ukrayna":{s:"Vizesiz",n:"90 gün"},
    "Gürcistan":{s:"Vizesiz",n:"1 yıl"},"Kazakistan":{s:"Vizesiz",n:"30 gün"},
    "Moldova":{s:"Vizesiz",n:"90 gün"},"Tunus":{s:"Vizesiz",n:"90 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"90 gün"},"Katar":{s:"Vizesiz",n:"30 gün"},
    "Ermenistan":{s:"Vizesiz",n:"180 gün"},
    "Mısır":{s:"e-Vize",n:"30 gün"},"Hindistan":{s:"e-Vize",n:"60 gün"},
    "Vietnam":{s:"e-Vize",n:"30 gün"},"Sri Lanka":{s:"e-Vize",n:"30 gün"},
    "Tanzanya":{s:"e-Vize",n:"90 gün"},"Bahreyn":{s:"Vizesiz",n:"90 gün"},
    "Kuveyt":{s:"e-Vize",n:"90 gün"},"Umman":{s:"e-Vize",n:"30 gün"},
    "Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "Çin":{s:"Vize Gerekli",n:"Çin vizesi"},"Rusya":{s:"Vize Gerekli",n:"Rusya vizesi"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},
    // Schengen → Vizesiz 90 gün (handled by default rule)
  },
  "Birleşik Krallık": {
    "ABD":{s:"Vizesiz",n:"ESTA - 90 gün"},"Japonya":{s:"Vizesiz",n:"90 gün"},
    "Güney Kore":{s:"Vizesiz",n:"90 gün"},"Kanada":{s:"Vizesiz",n:"eTA - 180 gün"},
    "Avustralya":{s:"Vizesiz",n:"ETA - 90 gün"},"Yeni Zelanda":{s:"Vizesiz",n:"90 gün"},
    "Brezilya":{s:"Vizesiz",n:"90 gün"},"Meksika":{s:"Vizesiz",n:"180 gün"},
    "Arjantin":{s:"Vizesiz",n:"90 gün"},"Peru":{s:"Vizesiz",n:"183 gün"},
    "Güney Afrika":{s:"Vizesiz",n:"90 gün"},"Singapur":{s:"Vizesiz",n:"90 gün"},
    "Malezya":{s:"Vizesiz",n:"90 gün"},"Tayland":{s:"Vizesiz",n:"30 gün"},
    "Endonezya":{s:"Vizesiz",n:"30 gün"},"Filipinler":{s:"Vizesiz",n:"30 gün"},
    "Fas":{s:"Vizesiz",n:"90 gün"},"Türkiye":{s:"Vizesiz",n:"90 gün"},
    "İrlanda":{s:"Vizesiz",n:"CTA - sınırsız"},"Ukrayna":{s:"Vizesiz",n:"90 gün"},
    "Gürcistan":{s:"Vizesiz",n:"1 yıl"},"Kazakistan":{s:"Vizesiz",n:"30 gün"},
    "Moldova":{s:"Vizesiz",n:"90 gün"},"Tunus":{s:"Vizesiz",n:"90 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"90 gün"},"Katar":{s:"Vizesiz",n:"30 gün"},
    "Ermenistan":{s:"Vizesiz",n:"180 gün"},"Bahreyn":{s:"Vizesiz",n:"90 gün"},
    "Mısır":{s:"e-Vize",n:"30 gün"},"Hindistan":{s:"e-Vize",n:"60 gün"},
    "Vietnam":{s:"e-Vize",n:"30 gün"},"Sri Lanka":{s:"e-Vize",n:"30 gün"},
    "Tanzanya":{s:"e-Vize",n:"90 gün"},"Kuveyt":{s:"e-Vize",n:"90 gün"},
    "Umman":{s:"e-Vize",n:"30 gün"},"Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "Çin":{s:"Vize Gerekli",n:"Çin vizesi"},"Rusya":{s:"Vize Gerekli",n:"Rusya vizesi"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},
  },
  "Japonya": {
    "ABD":{s:"Vizesiz",n:"ESTA - 90 gün"},"Birleşik Krallık":{s:"Vizesiz",n:"180 gün"},
    "Güney Kore":{s:"Vizesiz",n:"90 gün"},"Kanada":{s:"Vizesiz",n:"eTA - 180 gün"},
    "Avustralya":{s:"Vizesiz",n:"ETA - 90 gün"},"Yeni Zelanda":{s:"Vizesiz",n:"90 gün"},
    "Brezilya":{s:"Vizesiz",n:"90 gün"},"Meksika":{s:"Vizesiz",n:"180 gün"},
    "Arjantin":{s:"Vizesiz",n:"90 gün"},"Peru":{s:"Vizesiz",n:"183 gün"},
    "Güney Afrika":{s:"Vizesiz",n:"90 gün"},"Singapur":{s:"Vizesiz",n:"90 gün"},
    "Malezya":{s:"Vizesiz",n:"90 gün"},"Tayland":{s:"Vizesiz",n:"30 gün"},
    "Endonezya":{s:"Vizesiz",n:"30 gün"},"Filipinler":{s:"Vizesiz",n:"30 gün"},
    "Fas":{s:"Vizesiz",n:"90 gün"},"Türkiye":{s:"Vizesiz",n:"90 gün"},
    "İrlanda":{s:"Vizesiz",n:"90 gün"},"Ukrayna":{s:"Vizesiz",n:"90 gün"},
    "Gürcistan":{s:"Vizesiz",n:"1 yıl"},"Kazakistan":{s:"Vizesiz",n:"30 gün"},
    "Moldova":{s:"Vizesiz",n:"90 gün"},"Tunus":{s:"Vizesiz",n:"90 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"90 gün"},"Katar":{s:"Vizesiz",n:"30 gün"},
    "Ermenistan":{s:"Vizesiz",n:"180 gün"},"Bahreyn":{s:"Vizesiz",n:"90 gün"},
    "Çin":{s:"Vizesiz",n:"15 gün transit"},"Mısır":{s:"e-Vize",n:"30 gün"},
    "Hindistan":{s:"e-Vize",n:"60 gün"},"Vietnam":{s:"e-Vize",n:"30 gün"},
    "Sri Lanka":{s:"e-Vize",n:"30 gün"},"Tanzanya":{s:"e-Vize",n:"90 gün"},
    "Kuveyt":{s:"e-Vize",n:"90 gün"},"Umman":{s:"e-Vize",n:"30 gün"},
    "Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "Rusya":{s:"Vize Gerekli",n:"Rusya vizesi"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},
  },
  "Rusya": {
    "Türkiye":{s:"Vizesiz",n:"60 gün"},"Gürcistan":{s:"Vizesiz",n:"1 yıl"},
    "Sırbistan":{s:"Vizesiz",n:"30 gün"},"Bosna-Hersek":{s:"Vizesiz",n:"30 gün"},
    "Karadağ":{s:"Vizesiz",n:"30 gün"},"Brezilya":{s:"Vizesiz",n:"90 gün"},
    "Arjantin":{s:"Vizesiz",n:"90 gün"},"Tayland":{s:"Vizesiz",n:"30 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"90 gün"},"Katar":{s:"Vizesiz",n:"30 gün"},
    "Kazakistan":{s:"Vizesiz",n:"30 gün"},"Moldova":{s:"Vizesiz",n:"90 gün"},
    "Ermenistan":{s:"Vizesiz",n:"180 gün"},"Ukrayna":{s:"Vizesiz",n:"90 gün"},
    "Arnavutluk":{s:"Vizesiz",n:"90 gün"},"Kosova":{s:"Vizesiz",n:"90 gün"},
    "Peru":{s:"Vizesiz",n:"90 gün"},"Meksika":{s:"Vizesiz",n:"180 gün"},
    "Endonezya":{s:"Vizesiz",n:"30 gün"},"Filipinler":{s:"Vizesiz",n:"30 gün"},
    "Singapur":{s:"Vizesiz",n:"30 gün"},"Malezya":{s:"Vizesiz",n:"30 gün"},
    "Güney Afrika":{s:"Vizesiz",n:"90 gün"},"Fas":{s:"Vizesiz",n:"90 gün"},
    "Tunus":{s:"Vizesiz",n:"90 gün"},
    "Hindistan":{s:"e-Vize",n:"60 gün"},"Mısır":{s:"e-Vize",n:"30 gün"},
    "Vietnam":{s:"e-Vize",n:"30 gün"},"Sri Lanka":{s:"e-Vize",n:"30 gün"},
    "Tanzanya":{s:"e-Vize",n:"90 gün"},"Bahreyn":{s:"e-Vize",n:"14 gün"},
    "Kuveyt":{s:"e-Vize",n:"90 gün"},"Umman":{s:"e-Vize",n:"30 gün"},
    "Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "ABD":{s:"Vize Gerekli",n:"ABD vizesi"},"Birleşik Krallık":{s:"Vize Gerekli",n:"UK vizesi"},
    "Kanada":{s:"Vize Gerekli",n:"Kanada vizesi"},"Avustralya":{s:"Vize Gerekli",n:"Avustralya vizesi"},
    "Yeni Zelanda":{s:"Vize Gerekli",n:"NZ vizesi"},"Japonya":{s:"Vize Gerekli",n:"Japonya vizesi"},
    "Güney Kore":{s:"Vize Gerekli",n:"Kore vizesi"},"Çin":{s:"Vize Gerekli",n:"Çin vizesi"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},"İrlanda":{s:"Vize Gerekli",n:"İrlanda vizesi"},
    // All Schengen → Vize Gerekli (handled by default rule for Rusya)
  },
  "Çin": {
    "Güney Kore":{s:"Vizesiz",n:"K-ETA 30 gün"},"Tayland":{s:"Vizesiz",n:"30 gün"},
    "Singapur":{s:"Vizesiz",n:"30 gün"},"Malezya":{s:"Vizesiz",n:"30 gün"},
    "Endonezya":{s:"Vizesiz",n:"30 gün"},"Filipinler":{s:"Vizesiz",n:"30 gün"},
    "Birleşik Arap Emirlikleri":{s:"Vizesiz",n:"30 gün"},"Sırbistan":{s:"Vizesiz",n:"30 gün"},
    "Gürcistan":{s:"Vizesiz",n:"30 gün"},"Fas":{s:"Vizesiz",n:"90 gün"},
    "Rusya":{s:"Vizesiz",n:"30 gün"},"Kazakistan":{s:"Vizesiz",n:"30 gün"},
    "Bosna-Hersek":{s:"Vizesiz",n:"30 gün"},"Arnavutluk":{s:"Vizesiz",n:"90 gün"},
    "Karadağ":{s:"Vizesiz",n:"30 gün"},"Moldova":{s:"Vizesiz",n:"90 gün"},
    "Ermenistan":{s:"Vizesiz",n:"90 gün"},"Ukrayna":{s:"e-Vize",n:"30 gün"},
    "Türkiye":{s:"e-Vize",n:"30 gün"},"Mısır":{s:"e-Vize",n:"30 gün"},
    "Hindistan":{s:"e-Vize",n:"60 gün"},"Vietnam":{s:"e-Vize",n:"30 gün"},
    "Sri Lanka":{s:"e-Vize",n:"30 gün"},"Tanzanya":{s:"e-Vize",n:"90 gün"},
    "Bahreyn":{s:"e-Vize",n:"14 gün"},"Kuveyt":{s:"e-Vize",n:"90 gün"},
    "Umman":{s:"e-Vize",n:"30 gün"},"Ürdün":{s:"Kapıda Vize",n:"30 gün"},
    "ABD":{s:"Vize Gerekli",n:"ABD vizesi"},"Birleşik Krallık":{s:"Vize Gerekli",n:"UK vizesi"},
    "Kanada":{s:"Vize Gerekli",n:"Kanada vizesi"},"Avustralya":{s:"Vize Gerekli",n:"Avustralya vizesi"},
    "Yeni Zelanda":{s:"Vize Gerekli",n:"NZ vizesi"},"Japonya":{s:"Vize Gerekli",n:"Japonya vizesi"},
    "Brezilya":{s:"Vize Gerekli",n:"Brezilya vizesi"},"Meksika":{s:"Vize Gerekli",n:"Meksika vizesi"},
    "Güney Afrika":{s:"Vize Gerekli",n:"G. Afrika vizesi"},"İrlanda":{s:"Vize Gerekli",n:"İrlanda vizesi"},
    "Cezayir":{s:"Vize Gerekli",n:"Cezayir vizesi"},"Libya":{s:"Vize Gerekli",n:"Libya vizesi"},
    "Yemen":{s:"Vize Gerekli",n:"Yemen vizesi"},
    // All Schengen → Vize Gerekli (handled by default)
  }
};

// Copy rules for passports that share similar privileges
// Fransa, İtalya, İspanya → same as Almanya (EU/Schengen passport)
["Fransa","İtalya","İspanya"].forEach(p => { visaOverrides[p] = {...visaOverrides["Almanya"]}; });
// Güney Kore → very similar to Japonya
visaOverrides["Güney Kore"] = {...visaOverrides["Japonya"]};
visaOverrides["Güney Kore"]["Japonya"] = {s:"Vizesiz",n:"90 gün"};
// Kanada, Avustralya → similar to ABD
visaOverrides["Kanada"] = {...visaOverrides["ABD"]};
visaOverrides["Kanada"]["ABD"] = {s:"Vizesiz",n:"180 gün"};
visaOverrides["Avustralya"] = {...visaOverrides["ABD"]};
visaOverrides["Avustralya"]["ABD"] = {s:"Vizesiz",n:"ESTA - 90 gün"};
visaOverrides["Avustralya"]["Yeni Zelanda"] = {s:"Vizesiz",n:"Sınırsız"};
// Brezilya → similar to ABD but some differences
visaOverrides["Brezilya"] = {...visaOverrides["ABD"]};
visaOverrides["Brezilya"]["ABD"] = {s:"Vizesiz",n:"ESTA - 90 gün"};

/**
 * Master lookup function. Covers ALL passport-country combinations.
 */
function getVisaForPassport(passport, target, fallbackStatus) {
  // Same country
  if (passport === target) {
    return { status: "Vatandaş", note: "Kendi ülkeniz", colorClass: "text-blue-400" };
  }

  // 1. Check specific overrides first
  const ov = visaOverrides[passport];
  if (ov && ov[target]) {
    const e = ov[target];
    return { status: e.s, note: e.n, colorClass: colorFor(e.s) };
  }

  // 2. Rule-based defaults
  const isSchengenPassport = SCHENGEN.includes(passport);
  const isEUPassport = isSchengenPassport || EU_ONLY.includes(passport);
  const isPowerful = POWERFUL_PASSPORTS.includes(passport);

  // EU/Schengen passport holders → Serbest Dolaşım within Schengen+EU
  if (isEUPassport && (SCHENGEN.includes(target) || EU_ONLY.includes(target) || SCHENGEN_ADJACENT.includes(target))) {
    return { status: "Serbest Dolaşım", note: "AB/Schengen", colorClass: "text-green-400" };
  }

  // Powerful passport → Vizesiz for Schengen (non-EU holders like US, JP, etc)
  if (isPowerful && !isEUPassport && SCHENGEN.includes(target)) {
    return { status: "Vizesiz", note: "90 gün Schengen", colorClass: "text-green-400" };
  }
  if (isPowerful && !isEUPassport && SCHENGEN_ADJACENT.includes(target)) {
    return { status: "Vizesiz", note: "Schengen ile giriş", colorClass: "text-green-400" };
  }
  // Powerful passport → Vizesiz for Balkans
  if (isPowerful && BALKANS_VISA_FREE.includes(target)) {
    return { status: "Vizesiz", note: "90 gün", colorClass: "text-green-400" };
  }
  // Powerful passport → Vizesiz for Romania/Bulgaria
  if (isPowerful && EU_ONLY.includes(target)) {
    return { status: "Vizesiz", note: "90 gün", colorClass: "text-green-400" };
  }

  // Turkey-specific defaults for Schengen
  if (passport === "Türkiye" && (SCHENGEN.includes(target) || SCHENGEN_ADJACENT.includes(target))) {
    return { status: "Vize Gerekli", note: "Schengen vizesi gerekli", colorClass: "text-red-400" };
  }

  // Rusya defaults for Schengen
  if (passport === "Rusya" && (SCHENGEN.includes(target) || SCHENGEN_ADJACENT.includes(target))) {
    return { status: "Vize Gerekli", note: "Schengen vizesi gerekli", colorClass: "text-red-400" };
  }

  // Çin defaults for Schengen
  if (passport === "Çin" && (SCHENGEN.includes(target) || SCHENGEN_ADJACENT.includes(target))) {
    return { status: "Vize Gerekli", note: "Schengen vizesi gerekli", colorClass: "text-red-400" };
  }

  // 3. Final fallback → use existing static data from data.js (for Turkey passport)
  if (passport === "Türkiye" && fallbackStatus) {
    return { status: fallbackStatus, note: "", colorClass: colorFor(fallbackStatus) };
  }

  // 4. Unknown → provide specific message
  return { status: "Vize Gerekli", note: "Detay için konsolosluğa danışın", colorClass: "text-red-400" };
}

function colorFor(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("vizesiz") || s.includes("serbest") || s.includes("muaf")) return "text-green-400";
  if (s.includes("e-vize") || s.includes("kapıda")) return "text-orange-400";
  if (s.includes("gerekli")) return "text-red-400";
  if (s.includes("vatandaş")) return "text-blue-400";
  return "text-primary";
}
