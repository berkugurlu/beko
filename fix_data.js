const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'js/data.js');
let dataContent = fs.readFileSync(dataFilePath, 'utf8');

const descriptions = [
    "Bu bölgenin gastronomi mirasını en saf ve otantik haliyle yansıtan, hem yerel halkın hem de lezzet avcılarının favorisi olan enfes bir yemek.",
    "Yöresel malzemelerin eşsiz bir uyumla harmanlandığı, yapımında geleneksel mutfak sırlarının gizlendiği özel bir tabak.",
    "Bölge coğrafyasının sunduğu taze ürünlerle hazırlanan, asırlar boyu nesilden nesile aktarılmış gerçek bir şölen lezzeti.",
    "Damak çatlatan dokusu ve kendine has baharatlarıyla, bu kültürün karakterini en iyi yansıtan ikonik tatlardan biri.",
    "Tadı damağınızda uzun süre kalacak, yörenin en sevilen malzemelerinin usta ellerde hayat bulduğu bir ziyafet unsuru.",
    "Tarihsel mutfak geleneğinin günümüze ulaşan en leziz örneklerinden olan, samimi ve doyurucu bir yöresel reçete.",
    "Yerel kültürün özgün baharat harmanını ve karakteristik pişirme tekniklerini bir araya getiren başyapıt niteliğinde bir yemek.",
    "Hem göze hem damağa hitap eden, bölgeye özgü taze malzemelerin özenle işlendiği karşı konulamaz bir tat.",
    "Yöre insanının gündelik yaşamından özel sofralarına kadar uzanan oldukça zengin aromalara sahip geleneksel bir lezzet.",
    "Özel günlerin ve yöre mutfağının vazgeçilmezi olan, her lokmasında bu toprakların zengin tarihini hissettiren muazzam bir klasiktir.",
    "Köklü bir mutfak kültürünün eseri olarak günümüze dek ulaşan, özel ritüellerle pişirilip sunulan ikonik ve aromatik bir seçenektir.",
    "Aperitiflerden ana yemek sofralarına kadar her yerde aranan, bölgenin iklim ve doğasından ilham alan baş döndürücü bir tatlı/tuzlu şöleni.",
    "Sadece lezzetiyle değil, hazırlanışındaki özen ve taze yöresel bileşenleriyle de adından söz ettiren yöreye has özel bir reçetedir.",
    "Her çatalda mutfak kültürünün yoğunluğunu, yerel insanların emeğini ve coğrafyanın sıcak dokusunu hissedeceğiniz eşsiz bir spesiyal.",
    "Karakteristik yöre mutfağının olmazsa olmazı kabul edilen, gerek malzemesi gerek sunumuyla adeta bir gastronomi mirası niteliğinde.",
    "Bu ülkenin ruhunu ve tarımını yansıtan, yoğun aromasını yerel topraklardan alan tescilli ve benzersiz otantik bir tarif.",
    "Nesillerdir bozulmayan orjinal reçetesiyle restoranların menülerini süsleyen, doyurucu özellikleri yüksek popüler bir lezzet.",
    "Doğal ürünlerin ahengiyle ortaya çıkan, yöre halkının gururla tanıttığı ve mutlaka denenmesi gereken baş döndürücü bir lezzet harikası.",
    "Uzak ufukların ve köklü bir geçmişin hikayesini taşıyan, kendine özgü sunumuyla yeme-içme kültürünün vazgeçilmez bir öğesi.",
    "Sıcacık ve içten tatlarıyla yerel yaşantının izlerini barındıran, farklı kültür etkileşimlerinin harmanlandığı gurme bir tabağı temsil eder."
];

let replacedCount = 0;

// The regex matches ": Ülkenin geleneksel mutfak kültüründen izler taşıyan, lezzetli ve otantik yerel bir tat."
// and replaces it with a random description from the array.
const targetSuffix = "Ülkenin geleneksel mutfak kültüründen izler taşıyan, lezzetli ve otantik yerel bir tat.";

const updatedContent = dataContent.replace(/(:\s*)(Ülkenin geleneksel mutfak kültüründen izler taşıyan, lezzetli ve otantik yerel bir tat\.)/g, (match, p1) => {
    replacedCount++;
    const randomDesc = descriptions[replacedCount % descriptions.length];
    return p1 + randomDesc;
});

fs.writeFileSync(dataFilePath, updatedContent, 'utf8');

console.log(`Successfully replaced ${replacedCount} boilerplate descriptions in data.js!`);
