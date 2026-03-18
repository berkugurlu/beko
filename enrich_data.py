import re

popular_foods = {
    "Türkiye": [
        "Adana Kebap: Zırhla elde çekilmiş kuzu etinin kuyruk yağıyla harmanlanıp meşe kömüründe pişirildiği efsanevi lezzet.",
        "Antep Baklavası: 40 kat incecik yufkanın arasına serpilen boz fıstık ve sıcak şerbetin buluşması.",
        "Serpme Kahvaltı: Sucuklu yumurta, çeşit çeşit peynir, menemen ve taze demlenmiş çay ile tam bir sabah şöleni.",
        "Meze Kültürü: Haydari, fava, humus ve şakşuka gibi taze zeytinyağlıların paylaşıldığı uzun akşam yemekleri."
    ],
    "İtalya": [
        "Pizza Napoletana: Odun ateşinde 90 saniyede pişen, ince hamurlu, taze mozzarella ve fesleğenli klasik.",
        "Pasta Carbonara: Roma'ya özgü; krema kullanılmadan sadece yumurta sarısı, pecorino peyniri ve guanciale (domuz yanağı) ile yapılan makarna.",
        "Gelato: Endüstriyel dondurmalara kıyasla daha az hava içeren, yoğun aromalı ve taze meyvelerle yapılan İtalyan dondurması.",
        "Tiramisu: Espresso ve liköre batırılmış savoiardi bisküvilerinin mascarpone peyniriyle kat kat dizildiği tatlı."
    ],
    "Japonya": [
        "Sushi ve Sashimi: Taze çiğ balığın, sirke ile tatlandırılmış özel pirinç üzerinde sanat eseri gibi sunulduğu dünyaca ünlü lezzet.",
        "Ramen: Soya, miso veya tonkotsu (domuz kemiği) suyu içinde sunulan, taze erişte, dilimlenmiş et ve taze soğanlı sıcak çorba.",
        "Tempura: Karides, kalamar veya taze sebzelerin hafif bir hamura bulanıp derin ve kızgın yağda çıtır çıtır kızartılması.",
        "Takoyaki: Osaka sokaklarının vazgeçilmezi; içi ahtapot parçacıklı, dışı çıtır, üzeri mayonez ve kurutulmuş palamut balığı kaplı toplar."
    ],
    "Fransa": [
        "Kruvasan & Pain au Chocolat: Bol tereyağlı, dışı pul pul dökülen, içi yumuşacık ve sıcak fırın lezzetleri.",
        "Soupe à l'Oignon (Soğan Çorbası): Karamelize soğanların et suyunda kaynatılıp, üzeri kızarmış ekmek ve eritilmiş gruyère peyniriyle sunumu.",
        "Boeuf Bourguignon: Burgonya şarabı, mantar ve taze otlarla saatlerce ağır ateşte pişen, ağızda dağılan dana yahnisi.",
        "Makaron: Badem unu ve mereng (bezex) ile yapılan, arası çeşitli kremalarla doldurulan renkli ve narin tatlılar."
    ],
    "ABD": [
        "Texas BBQ (Barbekü): Saatlerce düşük ısıda fümelenerek (hickory veya meşe odunuyla) pişen, kemikten kendiliğinden ayrılan kaburga ve briskets.",
        "Deep-Dish Pizza: Chicago usulü, kenarları yüksek bir tava içinde bol peynir ve domates sosuyla adeta bir turta gibi hazırlanan pizza.",
        "Hamburger & Cheeseburger: Taze çekilmiş sığır etinden sulu köftelerin, eritilmiş çedar, turşu ve özel soslarla yumuşak ekmekte buluşması.",
        "Pancakes: Üzerinden akçaağaç şurubu (maple syrup) süzülen, yanında çıtır pastırma ile servis edilen kalın ve pofuduk krep kuleleri."
    ],
    "İngiltere": [
        "Fish and Chips: Gevrek bira hamuruna bulanarak kızartılmış taze mezgit veya morina balığı, yanında kalın patates kızartması ve tartar sos.",
        "Sunday Roast (Pazar Yemegi): Fırınlanmış et (genelde dana), yanında Yorkshire pudingi, kavrulmuş patates, sebzeler ve yoğun et suyu (gravy).",
        "Full English Breakfast: Sosis, pastırma, fırın fasulye, yumurta, sote mantar, ızgara domates ve kan sosisi (black pudding) ile devasa kahvaltı.",
        "Afternoon Tea: Scone (İngiliz çöreği), kaymak (clotted cream), çilek reçeli ve ince kesilmiş sandviçler eşliğinde geleneksel çay saati."
    ],
    "Yunanistan": [
        "Moussaka (Musakka): Patlıcan, patates ve baharatlı kıymanın katmanlar halinde dizilip, üzeri kalın bir beşamel sosla fırınlandığı başyapıt.",
        "Souvlaki ve Gyros: Özel baharatlarla marine edilmiş et parçalarının şişte (souvlaki) veya döner (gyros) şeklinde pita ekmeği, cacık (tzatziki) ve domatesle sunumu.",
        "Horiatiki (Yunan Salatası): İri doğranmış domates, salatalık, zeytin ve kırmızı soğanın üzerine koca bir dilim gerçek Feta peyniri ve sızma zeytinyağı gezdirmesi.",
        "Loukoumades: Üzerine bolca bal dökülen ve tarçın serpilen, lokmaya benzeyen sıcak ve çıtır hamur topları."
    ],
    "İspanya": [
        "Paella: Valensiya kökenli; safranlı pirinç, taze deniz ürünleri (karides, midye, kalamar) veya tavuk/tavşan etiyle devasa tavalarda pişen şölen yemeği.",
        "Tapas Kültürü: Patatas Bravas (acılı patates), Jamón (kurutulmuş İspanyol jambonu) ve sarımsaklı karides gibi masayı donatan küçük porsiyonlu lezzetler.",
        "Churros con Chocolate: Özellikle sabah erken saatlerde veya gece sonunda, koyu ve sıcak çikolataya batırılarak yenilen uzun, kızarmış hamur çubukları.",
        "Gazpacho: Endülüs bölgesinin kavurucu yaz günlerinde serinlemek için içilen; domates, biber, sarımsak ve zeytinyağından yapılan soğuk çorba."
    ],
    "Tayland": [
        "Pad Thai: Demirhindi sosu, yer fıstığı, soya filizi, yumurta ve karides (veya tavuk) ile wok tavada hızla çevrilen, ülkenin en ünlü erişte yemeği.",
        "Tom Yum Goong: Limon otu, galangal, kaffir lime yaprakları ve taze karidesle yapılan; hem acı, hem ekşi, hem de aromatik şifa deposu çorba.",
        "Köriler (Green/Red Curry): Hindistan cevizi sütü tabanında, taze fesleğen ve bambu filizleriyle zenginleştirilmiş acı ve tatlı dengesine sahip tavuk/et körileri.",
        "Mango Sticky Rice: Taze ve tatlı dilimlenmiş mangonun, yapışkan pirinç (sticky rice) ve ılık hindistan cevizi kremasıyla sunulduğu sokak tatlısı."
    ],
    "Güney Kore": [
        "Korean BBQ (Samgyeopsal): Masanızın ortasındaki ızgarada cızırdayan ince dilimlenmiş domuz veya dana etlerinin, marul yaprağına sarılıp sarmısak ve ssamjang sosuyla yenmesi.",
        "Bibimbap: Sıcak bir taş kasede sunulan; pirinç, çeşitli sotelenmiş sebzeler, et, üzeri az pişmiş yumurta ve acı gochujang ezmesiyle karıştırılarak yenilen yemek.",
        "Tteokbokki: Sokak lezzetlerinin kralı; silindir şeklindeki pirinç keklerinin ve balık keklerinin bol acılı, tatlı ve kırmızı bir sosta kaynatılması.",
        "Kimchi: Fermente edilmiş Çin lahanası ve Kore turpunun bol sarımsak, zencefil ve kırmızı toz biberle harmanlandığı, her öğünün vazgeçilmez probiyotik garnitürü."
    ],
    "Meksika": [
        "Tacos al Pastor: Lübnanlı göçmenlerden ilham alan; dikey şişte pişen ananas marineli domuz veya tavuk etinin, minik mısır tortillalarında taze kişniş ve soğanla sunumu.",
        "Guacamole ve Nachos: Olgunlaşmış avokado, lime suyu, jalapeño ve taze domatesin ezilmesiyle yapılan dip sosun, çıtır mısır cipsleriyle (totopos) buluşması.",
        "Mole Poblano: İçinde çikolata (kakao), onlarca farklı biber ve baharatın bulunduğu, günlerce kaynatılarak hazırlanan efsanevi koyu sos ve tavuk eti.",
        "Enchiladas: İçi et veya tavuk dolu tortillaların rulo yapılıp, üzerine acı domates veya yeşil tomatillo sosu ve bol peynir dökülerek fırınlanması."
    ],
    "Almanya": [
        "Bratwurst & Currywurst: Kızarmış sosislerin özel köri sosu ve fırın patates eşliğinde tüketildiği Alman sokak klasiği.",
        "Pretzel (Bretzel): Dışı çıtır, içi yumuşacık ve tuzlu, düğüm şeklindeki geleneksel Alman simidi.",
        "Schnitzel: Ekmek kırıntısıyla kaplanıp tereyağında kızartılmış, yanında limon ve patates salatasıyla sunulan ince dövülmüş et.",
        "Black Forest Cake (Kara Orman Pastası): Vişne likörü, taze krema, çikolata sosu ve vişne kirazlarıyla hazırlanan görkemli pasta."
    ],
    "Çin": [
        "Pekin Ördeği (Peking Duck): İncecik dilimlenmiş gevrek derili ördek etinin pırasa, salatalık ve tatlı fasulye sosuyla krep benzeri ince hamurlara sarılması.",
        "Dim Sum: Bambu sepetlerinde buharda pişen içi et, deniz ürünleri veya sebze dolu ufak mantılar ve çörekler.",
        "Kung Pao Tavuğu: Küp doğranmış tavuk etinin yer fıstığı, kuru kırmızı biber ve sebzelerle yüksek ateşte wok tavada sotelenmesi.",
        "Hot Pot (Huo Guo): Kaynayan aromatik et suyuna masadakiler tarafından anlık atılıp pişirilen ince et dilimleri, sebze ve erişteler."
    ],
    "Hindistan": [
        "Chicken Tikka Masala: Yoğurt ve baharatla marine edilip tandırda pişen tavuk parçalarının domatesli, kremalı yoğun bir sosta servis edilmesi.",
        "Biryani: Safran, kakule, karanfil ve etin (tavuk/kuzu) uzun taneli basmati pirinciyle kat kat ağır ağır fırınlandığı şölen yemeği.",
        "Samosa: İçi patates, bezelye ve taze baharatlarla doldurulmuş üçgen şeklindeki çıtır Hint böreği.",
        "Naan Ekmeği: Tandır (tandoor) fırınının duvarına yapıştırılarak pişirilen, tereyağlı veya sarımsaklı yumuşak yassı ekmek."
    ]
}

def enrich_data():
    with open("js/data.js", "r", encoding="utf-8") as f:
        content = f.read()

    for country, foods in popular_foods.items():
        formatted_foods = ", ".join([f'"{food}"' for food in foods])
        new_what_to_eat = f'whatToEat: [{formatted_foods}]'
        
        # Regex to find the block for the country
        # (?s) makes . match newline
        # find whatToEat array for that specific country block
        pattern = re.compile(rf'("{country}"\s*:\s*{{.*?)(whatToEat\s*:\s*\[.*?\])(.*?(?:}}|, *"))', flags=re.DOTALL)
        
        def replacer(match):
            prefix = match.group(1)
            suffix = match.group(3)
            return prefix + new_what_to_eat + suffix

        content = pattern.sub(replacer, content)

    with open("js/data.js", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("js/data.js successfully enriched for popular countries!")

if __name__ == "__main__":
    enrich_data()
