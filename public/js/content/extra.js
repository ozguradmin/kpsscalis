// Ekstra konular (günlük plan dışı) ve sınav stratejisi sayfası.

export const STRATEGY = [
  {
    id: 'net',
    h: 'Gerçekçi hedef: 50 civarı net',
    b: 'Sıfırdan 9 günde her şeyi öğrenmek mümkün değil, ama **doğru yerden net toplamak** mümkün. Senin avantajın **yorum gücün**: Türkçe paragraf, sözel mantık, grafik ve kural soruları bilgi değil dikkat ister.\nNet-puan ilişkisi her yıl biraz değişir. 2024 Ön Lisans’ta kabaca **35 net ≈ 67**, **45 net ≈ 71**, **60 net ≈ 80** puan oldu.',
    viz: { type: 'bars', items: [['Türkçe', 20, '~20 net'], ['Tarih', 11, '~11'], ['Coğrafya', 7, '~7'], ['Matematik', 7, '~7'], ['Vatandaşlık', 4, '~4'], ['Güncel', 3, '~3']], c: 'ink', caption: 'Örnek hedef dağılımı: toplam ~52 net' },
  },
  {
    id: 'order',
    h: 'Salonda soru sırası ve süre planı',
    b: '130 dakikada 120 soru var. Kitapçıkta önce Genel Yetenek (Türkçe + Matematik), sonra Genel Kültür gelir. Sen şu sırayla git:\n- **1. Türkçe** (1-30): **~40 dk**. En güçlü alanın, sağlam başla.\n- **2. Genel Kültür** (GK 1-60): **~35 dk**. Bildiğini hemen işaretle, bilmediğinde bir şık eleyebiliyorsan işaretle, eleyemiyorsan geç.\n- **3. Matematik** (31-60): **~35 dk**. İşlem soruları, grafik, kural soruları, şıklardan denenebilen problemler. Geometriyi boş bırak.\n- **4. Kalan ~20 dk**: işaretleyip geçtiğin sorulara dön.',
    viz: { type: 'flow', items: ['**Türkçe** · 40 dk', '**Genel Kültür** · 35 dk', '**Matematik** (seçerek) · 35 dk', '**Geri dönüş** · 20 dk'] },
    note: { h: 'Unutma', t: 'Sınav **10.15**’te başlar, bina kapısı **10.00**’da kapanır. Yanında **kimlik** olmadan sınava alınmazsın.' },
  },
  {
    id: 'guess',
    h: '4 yanlış 1 doğruyu götürür: ne zaman işaretlemeli?',
    b: 'Beş şıktan rastgele birini seçersen, ortalamada **ne kazanır ne kaybedersin** (5 soruda 1 doğru = +1, 4 yanlış = −1).\nAma **tek bir şıkkı bile** kesin eleyebiliyorsan, tahmin artık **ortalamada kazandırır**. İki şık eleyebiliyorsan daha da çok kazandırır.\n**Kural:** en az bir şıkkı eleyebiliyorsan işaretle; hiçbirini eleyemiyorsan boş bırak.',
    note: { h: 'Pratik', t: 'Aşağıdaki hesaplayıcıdan kaç şık elediğini seç, kazancını gör.' },
  },
  {
    id: 'optik',
    h: 'Optik form: puanını kaybetme',
    b: '- Cevapları **her sayfa bitince** forma geçir. Sona bırakırsan süre yetmeyebilir.\n- Soru numarası ile form numarasının **aynı** olduğunu 10 soruda bir kontrol et. Bir kayma bütün sayfayı yakar.\n- Boş bıraktığın soruyu kitapçıkta **yuvarlak içine al**, forma işaretleme.\n- Değiştireceğin cevabı **iyice sil**; iki işaretli soru yanlış sayılır.\n- Kalemi ÖSYM verir, yanına kalem alma.',
  },
  {
    id: 'memory',
    h: 'Bu uygulama neden böyle çalışıyor?',
    b: 'Her ders, öğrenme bilimindeki en güçlü bulgulara göre tasarlandı:\n- **Hatırlamaya çalışmak** (geri çağırma), tekrar okumaktan çok daha kalıcıdır. Bu yüzden her dersin ortasında “kendini yokla” ve sonunda sorular var.\n- **Aralıklı tekrar**: bilgi unutulmadan hemen önce tekrar edilirse kalıcı olur. Bu yüzden kartlar 1, 2, 4 gün sonra tekrar geliyor.\n- **Görsel + kelime** birlikte (ikili kodlama): harita, zaman çizgisi ve tablolar bilgiyi iki yoldan kaydeder.\n- **Kodlamalar** (MuMi BaMo SaHa gibi) ezberi kısa yola bağlar.\n- **Kısa oturumlar**: 10-15 dakika odak, sonra kısa mola. Dikkat en iyi böyle çalışır.\n- **Uyku**: beyin gün içinde öğrendiklerini uykuda yerleştirir. Son gece erken yat.',
  },
  {
    id: 'morning',
    h: 'Son gece ve sınav sabahı',
    b: '- **Son gece yeni konu çalışma.** Sadece tekrar kartlarını çevir ve hata defterine bak.\n- **7-8 saat uyu.** Uykusuz bir beyin bildiğini bile hatırlamakta zorlanır.\n- Sabah **hafif ve doyurucu kahvaltı**; su iç.\n- **Kimlik** (nüfus cüzdanı/kimlik kartı ya da geçerli pasaport) yanında olsun. Giriş belgeni önceden kontrol et: bina ve salonunu öğren.\n- Binaya **en geç 09.30** civarında varmayı hedefle. Kapı **10.00**’da kapanır.\n- Salona girince **3 derin nefes**: 4 saniye al, 4 tut, 6 ver.',
  },
];

export const EXTRA_LESSONS = [
  {
    id: 'ex-tr1', s: 'turkce', min: 12,
    title: 'Ekstra paragraf antrenmanı (8 soru)',
    why: 'Türkçe netini sağlamlaştırır',
    cards: [
      { h: 'Hızlı hatırlatma', b: '**Kök oku → ama/oysa ara → şıkları süz (dar, geniş, konu dışı).** Bu 8 soruda her birine en fazla 1,5 dakika ayır.' },
    ],
    quiz: [
      { q: 'Eski evlerin kapı tokmakları bile bir dil taşırdı: Büyük tokmak erkeklerin, küçük tokmak kadınların gelişini haber verirdi. Böylece evdekiler kapıyı kimin açacağını önceden bilirdi. Bugün zile basan parmağın kime ait olduğunu tahmin etmek ise imkânsız.\nBu parçada vurgulanan düşünce hangisidir?', o: ['Eski evler daha güzeldi.', 'Geçmişte gündelik eşyalar bile bir iletişim işlevi görürdü.', 'Kapı zilleri gereksizdir.', 'Kadınlar kapıyı açmazdı.', 'Bugün misafir azaldı.'], a: 1, ex: 'Tokmakların “bir dil taşıması” = gündelik eşyanın **iletişim** işlevi.' },
      { q: 'Kalabalık bir sınıfta öğretmenin sorusuna ilk parmak kaldıran öğrenci her zaman konuyu en iyi bilen değildir. Bazen en iyi bilen, cevabından emin olmak için bir an durup düşünendir.\nBu parçadan hangisi çıkarılabilir?', o: ['Hızlı cevap vermek her zaman doğruluğun göstergesi değildir.', 'Öğrenciler parmak kaldırmamalıdır.', 'Kalabalık sınıflar verimsizdir.', 'Öğretmenler soru sormamalıdır.', 'Düşünen öğrenciler başarısızdır.'], a: 0, ex: 'Parça, hız ile bilgiyi eşitlememek gerektiğini söylüyor.' },
      { q: 'Bir şehrin kimliği yalnızca büyük meydanlarında ve anıtlarında değil, küçük esnafında da saklıdır. Köşedeki kunduracı, mahalle fırını, eski bir kırtasiye kapandığında şehir de bir parçasını kaybeder.\nBu parçada asıl anlatılmak istenen nedir?', o: ['Küçük esnafın şehir kimliğindeki yeri büyüktür.', 'Anıtlar gereksizdir.', 'Fırınlar sabah erken açılır.', 'Kunduracılık zor bir meslektir.', 'Meydanlar kalabalıktır.'], a: 0, ex: '“…değil, küçük esnafında da saklıdır” vurgusu ana düşüncedir.' },
      { q: 'Bazı insanlar yeni bir işe başlamadan önce her şeyin mükemmel olmasını bekler: doğru zaman, doğru ortam, doğru araçlar… Bu bekleyiş çoğu zaman hiç başlamamakla sonuçlanır. Oysa başlamak, mükemmel koşulları beklemekten daha öğretici bir yoldur.\nBu parçaya göre hangisi söylenebilir?', o: ['Mükemmel koşullar mutlaka gelir.', 'Harekete geçmek, koşulları beklemekten daha değerlidir.', 'İyi araçlar başarıyı garanti eder.', 'Herkes yeni işe başlamalıdır.', 'Doğru zaman her zaman sabahtır.'], a: 1, ex: '“Oysa” sonrası: **başlamak** daha öğretici.' },
      { q: '(I) Kütüphaneler sessiz çalışma alanı olmanın ötesine geçiyor. (II) Pek çok kütüphane artık atölyeler, söyleşiler ve çocuk etkinlikleri düzenliyor. (III) Bazılarında bilgisayar ve üç boyutlu yazıcı bile bulunuyor. (IV) Kitap fiyatları son yıllarda oldukça arttı. (V) Kütüphaneler böylece mahallenin buluşma noktasına dönüşüyor.\nHangi cümle akışı bozmaktadır?', o: ['I', 'II', 'III', 'IV', 'V'], a: 3, ex: '(IV) kitap fiyatlarından söz ediyor; parça kütüphanelerin değişen işlevini anlatıyor.' },
      { q: 'Usta bir anlatıcı, dinleyicisine her şeyi söylemez; bazı boşlukları bilerek bırakır ki dinleyici o boşlukları kendi hayal gücüyle doldursun.\nBu cümlede anlatılmak istenen nedir?', o: ['Anlatıcı eksik bilgi vermemelidir.', 'İyi anlatım, dinleyicinin hayal gücüne de alan tanır.', 'Dinleyiciler dikkatsizdir.', 'Hikâyeler kısa olmalıdır.', 'Hayal gücü öğrenilemez.'], a: 1, ex: 'Bilerek bırakılan boşluk = dinleyicinin hayal gücüne alan.' },
      { q: 'Çocukken dedemin bahçesindeki incir ağacının altında saatlerce kitap okurdum. Yaprakların arasından süzülen ışık sayfalara benekler düşürür, uzaktan bir kumrunun sesi gelirdi.\nBu parçanın anlatımında aşağıdakilerden hangisi ağır basmaktadır?', o: ['Tartışma', 'Açıklama', 'Betimleme', 'Tanımlama', 'Sayısal veri'], a: 2, ex: 'Işık, benek, kumru sesi: duyulara hitap eden **betimleme**.' },
      { q: 'Teknoloji şirketleri ürünlerini her yıl yeniliyor. Ancak araştırmalar, kullanıcıların telefon özelliklerinin yalnızca küçük bir kısmını kullandığını gösteriyor. Buna rağmen pek çok kişi, eski cihazı sorunsuz çalışsa da yenisini almak için sıraya giriyor.\nBu parçadan hangisine ulaşılabilir?', o: ['Yeni telefonlar daha ucuzdur.', 'Tüketiciler ihtiyaçtan çok yenilik isteğiyle hareket edebilmektedir.', 'Eski cihazlar hep bozulur.', 'Şirketler ürün yenilemeyi bırakmalıdır.', 'Kullanıcılar tüm özellikleri kullanır.'], a: 1, ex: 'Özellikleri kullanmıyorlar ama yine de yenisini alıyorlar: **ihtiyaç değil istek**.' },
    ],
    flash: [],
  },
  {
    id: 'ex-mat1', s: 'matematik', min: 13,
    title: 'İşçi-havuz ve hareket problemleri: şıklardan pratik',
    why: '1-2 soru daha',
    cards: [
      {
        h: 'İş problemi: “1 saatte ne kadarı?”',
        b: 'Bir işi **A 6 saatte**, **B 3 saatte** bitiriyorsa:\n- A 1 saatte işin **1/6**’sını, B **1/3**’ünü yapar.\n- Birlikte 1 saatte: 1/6 + 1/3 = 1/6 + 2/6 = **3/6 = 1/2** → iş **2 saatte** biter.',
        viz: { type: 'fraction', items: [[1, 6, 'A: 1/6'], [2, 6, 'B: 2/6'], [3, 6, 'Birlikte: 3/6']] },
        mn: { code: '1/A + 1/B = 1/T', t: 'Saatleri ters çevir, topla, sonucu tekrar ters çevir.' },
      },
      {
        h: 'Hareket: yol = hız × zaman',
        viz: { type: 'cards', items: [['Formül', '**Yol = Hız × Zaman**', 'mat'], ['Örnek', '80 km/sa hızla 3 saat → **240 km**', 'ink'], ['Karşılıklı', 'Hızlar **toplanır**: 60 + 40 = 100 km/sa yaklaşma', 'teal'], ['Aynı yönde', 'Hızlar **çıkarılır**: 60 − 40 = 20 km/sa yaklaşma', 'gray']] },
      },
    ],
    quiz: [
      { q: 'Bir işi Ali 6 günde, Veli 12 günde bitirebiliyor. İkisi birlikte bu işi kaç günde bitirir?', o: ['3', '4', '5', '6', '9'], a: 1, ex: '1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 → **4 gün**.' },
      { q: 'Bir havuzu A musluğu 4 saatte, B musluğu 12 saatte dolduruyor. İki musluk birlikte açılırsa havuz kaç saatte dolar?', o: ['2', '3', '4', '6', '8'], a: 1, ex: '1/4 + 1/12 = 3/12 + 1/12 = 4/12 = 1/3 → **3 saat**.' },
      { q: 'Saatte 90 km hızla giden bir otobüs 360 km’lik yolu kaç saatte alır?', o: ['3', '3,5', '4', '4,5', '5'], a: 2, ex: '360 ÷ 90 = **4 saat**.' },
      { q: 'Aralarında 300 km bulunan iki şehirden saatte 70 km ve 80 km hızla aynı anda birbirine doğru hareket eden iki araç kaç saat sonra karşılaşır?', o: ['1', '2', '3', '4', '5'], a: 1, ex: 'Hızlar toplanır: 150 km/sa. 300 ÷ 150 = **2 saat**.' },
    ],
    flash: [
      ['İş probleminde birlikte çalışma?', '**1/A + 1/B = 1/T**'],
      ['Yol formülü?', '**Yol = Hız × Zaman**'],
      ['Karşılıklı hareket?', 'Hızlar **toplanır**'],
    ],
  },
  // ── Az hesaplı matematik: kesir, uzun bölme ve tek-çift gerektirmeyen, ama KPSS seviyesinde soru tipleri.
  // Soru sayıları 2010-2020 Ön Lisans kitapçıklarının (6 sınav) elle sınıflandırılmasından; ders sonunda o tipin gerçek ÖSYM soruları gelir.
  {
    id: 'ex-mat2', s: 'matematik', min: 14,
    title: 'Az hesaplı matematik 1: grafik ve tablo',
    why: 'Ön Lisans 2010–2020: sınav başına ort. 2,2 soru (0–4) · ÖSYM seviyesinde',
    real: ['onl2020-GY-52', 'onl2020-GY-53', 'onl2018-GY-55', 'onl2018-GY-56', 'onl2016-GY-56', 'onl2016-GY-57', 'onl2012-GY-52', 'onl2012-GY-55', 'onl2012-GY-56', 'onl2012-GY-57', 'onl2010-GY-58', 'onl2010-GY-59', 'onl2010-GY-60', 'ort2020-GY-52', 'ort2020-GY-53', 'lis2019-GY-52', 'lis2019-GY-53'],
    cards: [
      {
        h: 'ÖSYM grafik sorusunun iskeleti',
        b: 'Ön lisansta grafik soruları hep aynı kalıpta gelir: **bir grafik** (çubuk, daire ya da tablo) + **bir ek bilgi** (“toplam 9000’dir”) → bir sayı istenir. Yol üç adım:\n- **1. Grafik neyi gösteriyor?** Doğrudan sayıyı mı, yoksa **payı** mı (açı, yüzde)?\n- **2. Ek bilgiyi grafiğe bağla:** “**1 birim kaç kişi?**” sorusunu cevapla.\n- **3. İstenen parçayı** bu birimle çarp.',
        mn: { code: '1 BİRİM KAÇ?', t: 'Her grafik sorusunda önce “1 derece / %1 / 1 kare kaç kişi?” bul.' },
      },
      {
        h: 'Daire grafiği: tüm daire 360°',
        b: 'Daire grafiğinde açılar **pay** gösterir. Toplam verilince önce **1° kaç kişi** bulunur.\n- Örnek: A 90°, B 150°, C 120°. Toplam **7200** ürün.\n- 1° = 7200 ÷ 360 = **20** ürün.\n- C = 120 × 20 = **2400**.\nKısayol: **90° = 4’te 1**, **120° = 3’te 1**, **180° = yarısı**, **60° = 6’da 1**.',
        viz: { type: 'table', s: 'matematik', head: ['Ürün', 'Açı', '× 20'], rows: [['A', '90°', '1800'], ['B', '150°', '3000'], ['C', '120°', '**2400**']] },
      },
      { k: 'check', q: 'Bir okuldaki 720 öğrencinin sınıflara dağılımı daire grafiğinde verilmiştir: A 100°, B 140°, C 120°.\nBuna göre B sınıfında kaç öğrenci vardır?', o: ['200', '240', '280', '300'], a: 2, ex: '1° = 720 ÷ 360 = **2** öğrenci. B = 140 × 2 = **280**.' },
      {
        k: 'steps', h: 'Yüzde tablosu + “%20 arttı” bilgisi (2010 tipi)',
        b: 'Tablo: çalışanların sektörlere göre **yüzde** payları. Ek bilgi: “2023’te çalışan sayısı 2022’ye göre **%20 artarak 600** olmuştur.” 2022’de paketlemede (%30) kaç kişi çalışıyordu?',
        steps: [
          { t: '**100 modeli:** 2022’deki toplamı 100 birim say. %20 artınca **120 birim** olur.' },
          { t: '120 birim = 600 kişi → **1 birim = 5 kişi** → 2022 toplamı 100 × 5 = **500**.' },
          { t: 'Paketleme %30 → 500’ün %10’u 50 → %30’u **150**.' },
          { m: 'Cevap: 150 · Tuzak: 600’ün %30’u (180) 2023’ün sayısıdır, 2022’nin değil.' },
        ],
      },
      {
        h: 'İki grafik birlikte (2012, 2020 tipi)',
        b: 'ÖSYM son yıllarda **iki grafiği** birlikte verir: biri bir yılın **dağılımını** (daire), öbürü sonraki yılın **değişimini** (+250, −180 gibi çubuklar) gösterir.\n- Önce hangi yılın toplamı verildiyse **o yılın grafiğinden** başla.\n- Değişim grafiğindeki sayıları **topla**: toplam değişim, iki yılın toplamı arasındaki farktır.',
        note: { h: 'En sık tuzak', t: '“Yüzde kaç arttı?” sorusunda artışı **eski** değere bölersin: 1200’den 1500’e artış 300 → 300 ÷ 1200 = **%25**. En çok artan (sayıca) ile yüzdece en çok artan **farklı** olabilir.' },
      },
      { k: 'check', q: 'Bir şirkette 2022’de yapılan 7200 sigortanın dağılımında kasko 75°’dir. 2023’te kasko sigortası sayısı 2022’ye göre 250 artmıştır.\nBuna göre 2023’te kaç kasko sigortası yapılmıştır?', o: ['1500', '1650', '1750', '1850'], a: 2, ex: '1° = 7200 ÷ 360 = 20 → 2022 kasko = 75 × 20 = 1500 → 2023 = 1500 + 250 = **1750**.' },
    ],
    quiz: [
      { q: 'Bir okuldaki dört kulübün üye sayılarının dağılımı daire grafiğinde verilmiştir: Satranç 90°, Müzik 100°, Spor 120°, Tiyatro 50°.\nSpor kulübünde 240 üye olduğuna göre, müzik kulübünün üye sayısı tiyatro kulübünün üye sayısından kaç fazladır?', o: ['40', '60', '80', '100', '120'], a: 3, ex: '1° = 240 ÷ 120 = **2** üye. Müzik ile tiyatro arasındaki fark 100° − 50° = 50° → 50 × 2 = **100**.' },
      { q: 'Bir ilçedeki üç köyün nüfusları şöyledir:\nA köyü: 2022’de 1200, 2023’te 1500\nB köyü: 2022’de 800, 2023’te 1040\nC köyü: 2022’de 2000, 2023’te 2200\nBuna göre nüfusu yüzde olarak en çok artan köy ve artış oranı aşağıdakilerin hangisinde birlikte verilmiştir?', o: ['A, %25', 'B, %30', 'C, %10', 'A, %30', 'B, %25'], a: 1, ex: 'Artış ÷ eski: A 300 ÷ 1200 = %25, B 240 ÷ 800 = **%30**, C 200 ÷ 2000 = %10. Tuzak: sayıca en çok artan A’dır (300) ama yüzdece B.' },
      { q: 'Bir fabrikada çalışanların bölümlere göre yüzde dağılımı şöyledir:\n2022: Üretim %50, Paketleme %30, Yönetim %20\n2023: Üretim %45, Paketleme %35, Yönetim %20\n2023’te çalışan sayısı 2022’ye göre %20 artarak 600 olmuştur.\nBuna göre paketleme bölümünde çalışan sayısı kaç artmıştır?', o: ['45', '60', '75', '90', '105'], a: 1, ex: '2022 toplamı: 120 birim = 600 → 100 birim = **500**. Paketleme 2022: 500’ün %30’u = 150. 2023: 600’ün %35’i = 210. Artış **60**.' },
      { q: 'Yukarıdaki fabrika bilgilerine göre,\nI. Yönetim bölümünde çalışan sayısı değişmemiştir.\nII. Üretim bölümünde çalışan sayısı artmıştır.\nIII. 2023’te paketlemede çalışan sayısı üretimdekinden azdır.\nyargılarından hangileri doğrudur?', o: ['Yalnız I', 'Yalnız II', 'I ve II', 'II ve III', 'I, II ve III'], a: 3, ex: 'Yönetim: 500’ün %20’si 100 → 600’ün %20’si 120, **arttı** (I yanlış; yüzde aynı ama toplam büyüdü). Üretim: 250 → 270, **arttı** (II doğru, yüzdesi düşse bile). III: 210 < 270 doğru.' },
      { q: 'Bir kırtasiyede 2023’te satılan ürünlerin dağılımı daire grafiğinde verilmiştir: Defter 150°, Kalem 120°, Silgi 90°. 2024’te 2023’e göre satış değişimleri: Defter +60, Kalem −40, Silgi +20.\n2024’te toplam 1480 ürün satıldığına göre 2023’te kaç kalem satılmıştır?', o: ['400', '440', '480', '520', '560'], a: 2, ex: 'Toplam değişim: 60 − 40 + 20 = +40 → 2023 toplamı 1480 − 40 = **1440**. 1° = 1440 ÷ 360 = 4 → kalem 120 × 4 = **480**.' },
    ],
    flash: [['Daire grafiğinde ilk iş?', 'Toplamı 360’a bölüp **1° kaç** bul'], ['“Yüzde kaç arttı?”', 'Artış ÷ **eski** değer × 100'], ['Yüzde tablosunda yüzde aynı kaldıysa sayı da aynı mı?', 'Hayır! Toplam değiştiyse **sayı değişir**']],
  },
  {
    id: 'ex-mat3', s: 'matematik', min: 14,
    title: 'Az hesaplı matematik 2: kuralı oku, uygula',
    why: 'Ön Lisans 2010–2020: sınav başına ort. 2 soru (1–4), son yıllarda artıyor',
    real: ['onl2020-GY-50', 'onl2020-GY-54', 'onl2020-GY-55', 'onl2020-GY-56', 'onl2018-GY-53', 'onl2018-GY-54', 'onl2016-GY-46', 'onl2014-GY-42', 'onl2014-GY-56', 'onl2014-GY-57', 'onl2012-GY-36', 'onl2012-GY-40'],
    cards: [
      {
        h: 'Soru kendi kuralını öğretir',
        b: 'Bu tip sorular ezber istemez; kuralı **sorunun içinde** verir. ÖSYM’de gördüğümüz dört şekli:\n- **Tanımlı işlem:** a ⊗ b = …\n- **Yeni sayı tanımı:** “uyumlu sayı”, “artıl sayı” gibi uydurma adlar\n- **Dijital saat:** saat ve dakika rakamları arasında bir eşitlik\n- **Hücre doldurma:** “komşu hücrelerin farkı en az 2” gibi bir kural\nYol: **1)** Kuralı kendi cümlenle söyle. **2)** Sorudaki **örnekle** kuralı dene (ÖSYM hep örnek verir). **3)** Sayma sorusunda **sistemli liste** yap.',
        mn: { code: 'SÖYLE → DENE → LİSTELE', t: 'Kuralı kendi sözünle söyle, örnekte dene, sonra sırayla yaz.' },
      },
      {
        h: 'Tanımlı işlem: harf yerine sayı',
        b: 'a ◆ b = a × b + a − b ise:\n- 4 ◆ 5 = 20 + 4 − 5 = **19**\n- **Parantez önce:** (3 ◆ 2) ◆ 4 → 3 ◆ 2 = 6 + 3 − 2 = 7 → 7 ◆ 4 = 28 + 7 − 4 = **31**\n- **Ters soru:** x ◆ 2 = 25 ise x? Şıkları dene: x = 9 → 18 + 9 − 2 = **25** ✓\n(a² demek a × a demek: 5² = 25.)',
      },
      { k: 'check', q: 'a ▲ b = a² − 2b olarak tanımlanıyor.\nx pozitif bir sayı ve x ▲ 4 = 17 olduğuna göre, x kaçtır?', o: ['3', '4', '5', '6'], a: 2, ex: 'Şık dene: x = 5 → 25 − 8 = **17** ✓.' },
      {
        h: 'Sayma kuralı: sistemli liste',
        b: '“Rakamları toplamı 3 olan **üç basamaklı** kaç sayı vardır?” İlk basamaktan başla, **büyükten küçüğe** in:\n- İlk rakam 3: 300\n- İlk rakam 2: 210, 201\n- İlk rakam 1: 120, 102, 111\nToplam **6**. **İlk basamak 0 olamaz!** (012 üç basamaklı değildir.)',
      },
      { k: 'check', q: 'Dijital bir saatte saati gösteren iki rakamın toplamı, dakikayı gösteren iki rakamın toplamına eşit olan durumlara “dengeli saat” denir (ör. 12:03, 12:30).\nSaat 12:00 ile 13:00 arasında kaç dengeli saat vardır?', o: ['3', '4', '5', '6'], a: 1, ex: '1 + 2 = 3 → dakika rakamları toplamı 3: **03, 12, 21, 30** → 4. (Dakikanın ilk rakamı en fazla 5’tir.)' },
      {
        k: 'steps', h: 'Hücre kuralı (2018 tipi)',
        b: '1, 2, 3, 4 rakamları birer kez kullanılarak 4 hücre doldurulacak. **Kural:** yan yana iki hücredeki rakamların farkı **en az 2**. 1. hücrede 2 varsa 4. hücrede ne vardır?',
        steps: [
          { t: '2’nin yanına farkı en az 2 olan tek rakam: **4** (1 ve 3’ün farkı 1). → 2, 4, _, _' },
          { t: '4’ün yanına: **1** (farkı 3) ya da 2 (kullanıldı). → 2, 4, 1, _' },
          { t: 'Kalan **3**; 1 ile farkı 2 ✓ → 2, 4, 1, 3' },
          { m: 'Cevap: 3 · Kısıtı en çok olan hücreden başla, her adımda kuralı kontrol et.' },
        ],
      },
    ],
    quiz: [
      { q: 'a ⊕ b = a × b − (a + b) olarak tanımlanıyor.\nBuna göre, (4 ⊕ 3) ⊕ 2 işleminin sonucu kaçtır?', o: ['2', '3', '4', '5', '6'], a: 1, ex: 'Önce parantez: 4 ⊕ 3 = 12 − 7 = 5. Sonra 5 ⊕ 2 = 10 − 7 = **3**.' },
      { q: 'a ■ b = 2a + 3b olarak tanımlanıyor.\nx ■ (2 ■ 1) = 29 olduğuna göre, x kaçtır?', o: ['1', '2', '3', '4', '5'], a: 3, ex: 'Önce parantez: 2 ■ 1 = 4 + 3 = 7. Sonra x ■ 7 = 2x + 21 = 29 → şık dene: x = 4 → 8 + 21 = **29** ✓.' },
      { q: 'Rakamlarının çarpımı 6 olan üç basamaklı doğal sayılara “altılı sayı” denir.\nBuna göre kaç tane altılı sayı vardır?', o: ['6', '8', '9', '10', '12'], a: 2, ex: 'Çarpımı 6 veren rakam üçlüleri: **1, 1, 6** → 116, 161, 611 (3 sayı); **1, 2, 3** → 123, 132, 213, 231, 312, 321 (6 sayı). Toplam **9**. (0 olamaz, çarpım 0 olurdu.)' },
      { q: 'Dijital bir saatte saati gösteren iki rakamın toplamının, dakikayı gösteren iki rakamın toplamına eşit olduğu durumlar sayılıyor (ör. 10:01).\nSaat 10:00 ile 12:00 arasında bu eşitliği sağlayan kaç durum vardır?', o: ['4', '5', '6', '7', '8'], a: 1, ex: '10:xx → toplam 1: **01, 10** (2 durum). 11:xx → toplam 2: **02, 11, 20** (3 durum). Toplam **5**.' },
      { q: '5 hücreye 1, 2, 3, 4 ve 5 rakamları birer kez yazılacaktır. Kural: yan yana iki hücredeki rakamların farkı en az 2 olacaktır.\n1. hücreye 2 yazıldığına göre, 5. hücreye yazılabilecek rakamların toplamı kaçtır?', o: ['7', '9', '10', '12', '15'], a: 3, ex: '2’nin yanına 4 ya da 5 gelir. 2, 4, 1, 3, 5 · 2, 4, 1, 5, 3 · 2, 5, 3, 1, 4 → 5. hücre **5, 3 veya 4** → 5 + 3 + 4 = **12**.' },
    ],
    flash: [['Tanımlı işlemde parantez varsa?', '**Önce parantezi** çöz'], ['“x ◆ 2 = 25 ise x?”', '**Şıkları dene**'], ['Sayma sorusunda ilk basamak?', '**0 olamaz**; büyükten küçüğe sistemli yaz']],
  },
  {
    id: 'ex-mat5', s: 'matematik', min: 14,
    title: 'Az hesaplı matematik 3: şıklardan deneyerek problem',
    why: 'Ön Lisans 2010–2020: sınav başına ort. 2,5 problem bu yolla çözülüyor (1–3)',
    real: ['onl2020-GY-49', 'onl2020-GY-45', 'onl2018-GY-44', 'onl2018-GY-45', 'onl2018-GY-50', 'onl2016-GY-47', 'onl2016-GY-48', 'onl2016-GY-50', 'onl2014-GY-45', 'onl2014-GY-50', 'onl2014-GY-52', 'onl2012-GY-47', 'onl2010-GY-46', 'onl2010-GY-48', 'onl2010-GY-49'],
    cards: [
      {
        h: 'Denklem kurmadan KPSS problemi',
        b: 'KPSS’de sayısal şıklar **küçükten büyüğe** sıralıdır. Denklem kurmak yerine şıkkı soruya koyup **hikâyeyi baştan sona hesaplarsın**; tutan şık cevaptır.\n**Ne zaman işe yarar?** Soru tek bir sayı soruyorsa ve o sayı bilinince her şey hesaplanabiliyorsa: yaş, para, top sayısı, ortalama, sınav sayısı…',
        mn: { code: 'C’DEN BAŞLA', t: 'Ortadaki şıkla dene; sonuç büyük çıkarsa küçük şıklara, küçük çıkarsa büyüklere geç.' },
      },
      {
        h: 'Dört adım',
        b: '- **1. Sorulanı işaretle:** kim, ne, ne zaman? (bugün mü, başlangıçta mı?)\n- **2. C şıkkını koy**, verilen her bilgiyi sırayla kontrol et.\n- **3. Tutmazsa** yön seç: sonuç fazla mı az mı çıktı?\n- **4. Son bakış:** şık **sorulan şeyin** kendisi mi? ÖSYM bazen “fark”, “toplam” ya da “başlangıçtaki” sayıyı sorar.',
      },
      {
        k: 'steps', h: 'Örnek: yaş problemi (2016 tipi)',
        b: '“Ayşe 4 yıl önce doğmuş olsaydı, annesinin bugünkü yaşı Ayşe’nin o durumdaki yaşının 3 katı olacaktı. Ayşe doğduğunda annesi 28 yaşındaydı. Ayşe bugün kaç yaşındadır?” Şıklar: 6, 7, 8, 9, 10',
        steps: [
          { t: '**C) 8 dene:** Ayşe 8 → anne 8 + 28 = **36**.' },
          { t: '4 yıl önce doğmuş olsaydı Ayşe 8 + 4 = **12** yaşında olurdu.' },
          { t: '3 × 12 = 36 = annenin yaşı ✓' },
          { m: 'Cevap: 8 · Tek deneme, denklem yok.' },
        ],
      },
      { k: 'check', q: 'Bir kumbarada eşit sayıda 1 TL’lik, 50 kuruşluk ve 10 kuruşluk madenî para vardır. Kumbaradaki paraların toplam değeri 32 TL’dir.\nKumbarada her türden kaç madenî para vardır?', o: ['16', '18', '20', '24'], a: 2, ex: '20 dene: 20 × 1 TL = 20 TL, 20 × 50 kr = 10 TL, 20 × 10 kr = 2 TL → 20 + 10 + 2 = **32 TL** ✓.' },
      {
        h: 'Güçlü kısayol: “hepsi aynı olsaydı”',
        b: '“30 öğrencinin bir kısmı 2’şer, diğerleri 3’er kitap okumuş; toplam 76 kitap. Kaç öğrenci 3’er okumuş?”\n- **Hepsi 2’şer** okusaydı: 30 × 2 = 60 kitap.\n- Fazla: 76 − 60 = **16**. Her 3’er okuyan 1 fazla getirir → **16 öğrenci** 3’er okumuş.\n- Kontrol: 16 × 3 + 14 × 2 = 48 + 28 = **76** ✓\nAraba-motosiklet tekerleği, 1’er-2’şer fidan (2020’de soruldu) hep bu kalıptır.',
      },
      { k: 'check', q: 'Bir otoparktaki 40 aracın bir kısmı otomobil (4 teker), diğerleri motosiklettir (2 teker). Toplam tekerlek sayısı 124’tür.\nBuna göre otomobil sayısı motosiklet sayısından kaç fazladır?', o: ['2', '4', '6', '8'], a: 1, ex: 'Hepsi motosiklet olsaydı 80 teker; fazla 44. Her otomobil 2 fazla getirir → **22 otomobil**, 18 motosiklet. Soru **farkı** soruyor: 22 − 18 = **4**.' },
    ],
    quiz: [
      { q: 'Bir babanın yaşı, iki çocuğunun yaşları toplamının 3 katıdır. 6 yıl sonra babanın yaşı, çocuklarının o zamanki yaşları toplamının 2 katı olacaktır.\nBuna göre baba bugün kaç yaşındadır?', o: ['36', '42', '48', '54', '60'], a: 3, ex: '54 dene: çocukların toplamı 18. 6 yıl sonra baba 60; **iki** çocuk 6’şar yaş alır → 18 + 12 = 30 → 60 = 2 × 30 ✓. Tuzak: çocuk toplamına 6 değil **12** eklenir.' },
      { q: 'Bir öğrenci girdiği sınavların sonuncusundan 90 alırsa not ortalaması 75, 60 alırsa not ortalaması 70 oluyor.\nBuna göre öğrenci toplam kaç sınava girmiştir?', o: ['5', '6', '7', '8', '9'], a: 1, ex: '6 dene: diğer sınavların toplamı S. (S + 90) ÷ 6 = 75 → S + 90 = 450 → S = 360. (360 + 60) ÷ 6 = 70 ✓. Kısayol: puan 30 düşünce ortalama 5 düştü → 30 ÷ 5 = **6** sınav.' },
      { q: 'Bir satıcı elindeki kalemlerin tanesini 12 TL’den satarsa 60 TL kâr, 9 TL’den satarsa 30 TL zarar ediyor.\nBuna göre satıcının kaç kalemi vardır?', o: ['20', '24', '27', '30', '36'], a: 3, ex: '30 dene: 12 × 30 = 360, 9 × 30 = 270 → fark 90. Kâr 60 ile zarar 30 arası da **90** ✓. (Maliyet 300 TL.)' },
      { q: 'Bir kutudaki mavi topların sayısı kırmızı topların sayısının 3 katıdır. Kutuya 10 kırmızı top eklenirse mavi topların sayısı kırmızı topların sayısının 2 katı olur.\nBuna göre kutuda başlangıçta kaç mavi top vardır?', o: ['30', '60', '80', '90', '120'], a: 1, ex: '60 dene: kırmızı 20. 10 eklenince kırmızı 30 → 60 = 2 × 30 ✓. Soru **mavi** topu soruyor (toplam 80 değil).' },
      { q: 'Bir grup öğrencinin bir kısmı 1’er, diğerleri 2’şer fidan dikmiş ve toplam 50 fidan dikilmiştir. 2’şer fidan diken öğrenci sayısı, 1’er fidan diken öğrenci sayısından 4 fazladır.\nBuna göre grupta kaç öğrenci vardır?', o: ['24', '28', '32', '36', '40'], a: 2, ex: '32 dene: 1’er diken x, 2’şer diken x + 4 → 2x + 4 = 32 → x = 14, 2’şer diken 18. Fidan: 14 + 36 = **50** ✓.' },
    ],
    flash: [['Sayısal şıklarla denemeye nereden başlanır?', '**C** şıkkından (ortadan)'], ['“Hepsi aynı olsaydı” kısayolu?', 'Hepsi küçük değerde olsaydı → **fazla** ÷ fark = büyük grubun sayısı'], ['Deneme bitince son kontrol?', 'Şık **sorulan şey** mi? (fark / toplam / başlangıç)']],
  },
  {
    id: 'ex-mat6', s: 'matematik', min: 14,
    title: 'Az hesaplı matematik 4: yüzde ve 100 modeli',
    why: 'Ön Lisans 2010–2020: sınav başına ort. 2 soru (1–5)',
    real: ['onl2020-GY-46', 'onl2016-GY-47', 'onl2016-GY-49', 'onl2016-GY-56', 'onl2014-GY-45', 'onl2014-GY-46', 'onl2012-GY-44', 'onl2012-GY-50', 'onl2010-GY-50'],
    cards: [
      {
        h: 'Bilinmeyene 100 de',
        b: 'Yüzde sorularında fiyat, toplam ya da maaş verilmemişse **100** kabul et. Yüzdeler düz sayıya döner:\n- %20 zam: 100 → **120**\n- Sonra %20 indirim: 120’nin %10’u 12 → %20’si 24 → 120 − 24 = **96**\n- Sonuç: ilk fiyattan **%4 ucuz**. (Zam ve indirim aynı yüzde olsa da eski fiyata dönmez.)',
        mn: { code: 'BİLİNMEYEN = 100', t: 'Fiyat, toplam, tüketim… ne bilinmiyorsa 100 de; sonra yüzdeyi sayı gibi kullan.' },
      },
      {
        h: 'Kafadan yüzde araçları',
        viz: { type: 'table', s: 'matematik', head: ['Yüzde', 'Nasıl?', '400’ün…'], rows: [['%10', 'Sondaki sıfırı sil', '**40**'], ['%20', '%10’un 2 katı', '**80**'], ['%5', '%10’un yarısı', '**20**'], ['%25', 'Dörde böl', '**100**'], ['%50', 'Yarısı', '**200**']] },
      },
      { k: 'check', q: 'Bir ürünün fiyatına önce %25 zam, sonra zamlı fiyat üzerinden %20 indirim yapılıyor.\nÜrünün son fiyatı ilk fiyatına göre nasıl değişmiştir?', o: ['%5 artmıştır', '%5 azalmıştır', 'Değişmemiştir', '%45 artmıştır'], a: 2, ex: '100 → %25 zam → 125 → 125’in %20’si 25 → 125 − 25 = **100**. Değişmedi.' },
      {
        k: 'steps', h: 'Pay sorusu (2020 tipi)',
        b: '“Evde sadece buzdolabının tüketimi %20 azalsaydı evin toplam tüketimi %4 azalacaktı. Buzdolabı toplam tüketimin yüzde kaçıdır?”',
        steps: [
          { t: 'Toplam tüketim **100** birim olsun. Toplam %4 azalınca **4 birim** düşer.' },
          { t: 'Bu 4 birim, buzdolabının **%20’si**. Buzdolabı B ise B’nin %20’si = 4.' },
          { t: 'Şık dene ya da düşün: 20’nin %20’si 4 → **B = 20**.' },
          { m: 'Cevap: %20 · 100 dediğin için birim = yüzde.' },
        ],
      },
      {
        h: 'İki grup karışınca: şıktan dene (2016 tipi)',
        b: '“400 kişilik ankette A grubunun %50’si, B grubunun %25’i kadın; toplam 140 kadın. A grubu kaç kişi?”\n- **160 dene:** A’nın %50’si **80**. B = 400 − 160 = 240 → %25’i (dörde böl) **60**.\n- 80 + 60 = **140** ✓\n%10, %25, %50 kısayolları sayesinde hiç bölme işlemi yapmadın.',
      },
    ],
    quiz: [
      { q: 'Bir mağaza aynı ürün için üç kampanya düzenliyor:\nK: %30 indirim\nL: %20 indirimli fiyat üzerinden %10 indirim\nM: 3 al 2 öde\nBu kampanyalardaki birim fiyatlar ucuzdan pahalıya doğru nasıl sıralanır?', o: ['K - L - M', 'M - K - L', 'M - L - K', 'K - M - L', 'L - K - M'], a: 1, ex: 'Fiyat 100 olsun; **3 ürünün** fiyatını karşılaştır. K: 70 × 3 = 210. L: 100 → 80 → 72 → 72 × 3 = 216. M: 2 × 100 = **200**. Ucuzdan pahalıya: **M, K, L**.' },
      { q: 'Bir ürünün fiyatına önce %40 zam, sonra zamlı fiyat üzerinden %20 indirim yapılıyor ve ürünün son fiyatı 336 TL oluyor.\nBuna göre ürünün ilk fiyatı kaç TL’dir?', o: ['280', '300', '320', '336', '350'], a: 1, ex: '100 → 140 → 140’ın %20’si 28 → **112**. 112 birim = 336 TL → 1 birim = 3 TL → ilk fiyat 100 × 3 = **300**. (Şıktan: 300 → 420 → 336 ✓)' },
      { q: 'Bir ailenin aylık harcamalarında yalnızca kira %10 artsaydı toplam harcama %3 artacaktı; yalnızca gıda harcaması %20 azalsaydı toplam harcama %5 azalacaktı.\nBuna göre kira ve gıda harcamalarının toplamı, aylık toplam harcamanın yüzde kaçıdır?', o: ['45', '50', '55', '60', '65'], a: 2, ex: 'Toplam 100. Kiranın %10’u = 3 → kira **30**. Gıdanın %20’si = 5 → gıda **25**. 30 + 25 = **%55**.' },
      { q: 'Bir fabrikadaki 300 çalışanın bir kısmı A vardiyasında, geri kalanı B vardiyasında çalışmaktadır. A vardiyasındakilerin %40’ı, B vardiyasındakilerin %20’si kadındır. Fabrikadaki çalışanların %30’u kadın olduğuna göre, A vardiyasında kaç kişi çalışmaktadır?', o: ['60', '90', '120', '150', '180'], a: 3, ex: 'Toplam kadın: 300’ün %30’u = 90. **150 dene:** A’nın %40’ı 60, B = 150’nin %20’si 30 → 60 + 30 = **90** ✓.' },
      { q: 'Bir yatırımcı A ve B şirketlerinin hisselerinden eşit sayıda alıyor; A’nın tanesi 40 TL, B’nin tanesi 10 TL’dir. Bir süre sonra A hisselerinin değeri %25 azalıyor, B hisselerinin değeri %150 artıyor ve yatırımcı hepsini satıyor.\nYatırımcının bu işlemdeki kâr ya da zararı yüzde kaçtır?', o: ['%10 zarar', '%5 zarar', 'Kâr ya da zarar yok', '%10 kâr', '%25 kâr'], a: 3, ex: 'Birer tane düşün: alış 40 + 10 = **50**. A: 40’ın %25’i 10 → 30. B: 10’un %150’si 15 → 25. Satış 30 + 25 = **55** → 5 kâr → 50’de 5 = **%10 kâr**.' },
    ],
    flash: [['Yüzde sorusunda bilinmeyen fiyat?', '**100** kabul et'], ['%20 zam + %20 indirim?', '100 → 120 → 96: **%4 zarar**'], ['“Yalnız X %20 azalsaydı toplam %4 azalırdı”', 'Toplam 100 → X’in %20’si 4 → **X = 20**']],
  },
  {
    id: 'ex-tar2', s: 'tarih', min: 14,
    title: 'Çok sorulan dönem: Osmanlı’da yenileşme ve çok partili hayat',
    why: '2014-2020 sınavlarında tarih sorularının ~üçte biri bu dönemden',
    cards: [
      {
        h: 'Neden bu ders?',
        b: '2014, 2018 ve 2020 ön lisans kitapçıklarını tek tek inceledik: tarih sorularının **yaklaşık üçte biri** 19. yüzyıl Osmanlı yenileşmesinden ve **1945 sonrası** Türkiye’den geldi. Bu derste her olaydan **tek bir anahtar bilgi** öğreneceksin; ÖSYM tam olarak onu soruyor.',
        viz: { type: 'bars', s: 'tarih', items: [['Son dönem Osmanlı + çağdaş', 24, '24 soru'], ['Millî Mücadele', 12, '12'], ['Cumhuriyet + inkılaplar', 21, '21'], ['İlk Türk-İslam', 7, '7'], ['Osmanlı kuruluş-klasik', 10, '10']], caption: '3 sınav, 74 tarih sorusu (sınıflandırma: uygulamanın analiz betiği)' },
      },
      {
        h: 'Islahat padişahları: kim ne yaptı?',
        viz: { type: 'table', s: 'tarih', head: ['Padişah', 'Akılda kalacak tek şey'], rows: [
          ['**III. Selim**', '**Nizam-ı Cedid** ordusu; Avrupa’da **ilk daimi elçilikler**'],
          ['**II. Mahmut**', '**Sened-i İttifak** (1808, padişah yetkisi ilk kez sınırlandı); **Yeniçeri Ocağı kaldırıldı** (1826); **Takvim-i Vekayi** (ilk resmî gazete); ilk **nüfus sayımı** (1831)'],
          ['**Abdülmecit**', '**Tanzimat Fermanı** (1839) ve **Islahat Fermanı** (1856)'],
          ['**II. Abdülhamit**', '**Kanun-i Esasi** (1876) ile **I. Meşrutiyet**; **Muharrem Kararnamesi** (1881) ile **Duyun-u Umumiye**'],
        ] },
        mn: { code: 'SEÇİM-MAHMUT-MECİT-HAMİT', t: 'Sıra hep aynı: **III. Selim → II. Mahmut → Abdülmecit → II. Abdülhamit**. Asker, sonra ferman, sonra anayasa.' },
      },
      {
        h: 'Fermanlar ve anayasa: farkı nerede?',
        viz: { type: 'compare', cols: [
          { h: 'Tanzimat (1839)', c: 'tar', items: ['Can, mal, namus güvencesi', '**Kanun üstünlüğü** ilk kez kabul', 'Yargılanmadan ceza yok', 'Vergi gelire göre'] },
          { h: 'Islahat (1856)', c: 'orange', items: ['Özellikle **gayrimüslimlere** yeni haklar', 'Yabancılara **mülk edinme** hakkı', 'Kırım Savaşı sonrası Avrupa baskısı'] },
          { h: 'Kanun-i Esasi (1876)', c: 'vat', items: ['**İlk anayasa**, I. Meşrutiyet', 'Meclis-i Mebusan + Meclis-i Âyan', '1878’de 93 Harbi bahanesiyle meclis kapatıldı'] },
        ] },
        note: { h: 'Sınavda', t: '“Padişahın yetkisini ilk kez sınırlayan” → **Sened-i İttifak**. “İlk anayasa / meşrutiyet” → **Kanun-i Esasi**. “Dış borçlar, gelirlere el konması” → **Muharrem Kararnamesi**.', exam: true },
      },
      {
        k: 'check',
        h: 'Kendini yokla',
        q: 'Osmanlı Devleti’nde padişahın yetkilerinin ilk kez sınırlandırılmasını sağlayan belge hangisidir?',
        o: ['Tanzimat Fermanı', 'Sened-i İttifak', 'Islahat Fermanı', 'Kanun-i Esasi', 'Muharrem Kararnamesi'], a: 1,
        ex: '**Sened-i İttifak** (1808): II. Mahmut ile ayanlar arasında imzalandı; padişah yetkisi ilk kez bir belgeyle sınırlandı. Tanzimat “kanun üstünlüğü”, Kanun-i Esasi “ilk anayasa” diye sorulur.',
      },
      {
        h: 'Son dönem: Meşrutiyet ve fikir akımları',
        viz: { type: 'timeline', s: 'tarih', items: [
          { y: '1865', t: '**Yeni (Genç) Osmanlılar**', d: 'Namık Kemal, Ziya Paşa: meşrutiyet istediler' },
          { y: '1876', t: '**I. Meşrutiyet**', d: 'Kanun-i Esasi' },
          { y: '1908', t: '**II. Meşrutiyet**', d: 'İttihat ve Terakki’nin baskısıyla meclis yeniden açıldı', key: true },
          { y: '1909', t: '**31 Mart Olayı**', d: 'Hareket Ordusu bastırdı; II. Abdülhamit tahttan indirildi' },
          { y: '1912', t: '**Arnavutluk bağımsız**', d: 'Osmanlı’dan ayrılan son Balkan devleti' },
        ] },
        b: 'Fikir akımları: **Osmanlıcılık** (tüm unsurları birleştirmek), **İslamcılık**, **Türkçülük**, **Batıcılık**. Hiçbiri dağılmayı durduramadı.',
      },
      {
        h: 'Çok partili hayat ve 1945 sonrası',
        viz: { type: 'timeline', s: 'tarih', items: [
          { y: '1946', t: '**Demokrat Parti** kuruldu', d: 'Celal Bayar, Adnan Menderes, Refik Koraltan, Fuat Köprülü' },
          { y: '1950', t: '**DP iktidara geldi**', d: 'Gizli oy, açık sayım ile yapılan seçim' },
          { y: '1950', t: '**Kore Savaşı**’na asker gönderildi', d: 'NATO üyeliğinin yolunu açtı' },
          { y: '1952', t: '**NATO** üyeliği', key: true },
          { y: '1960', t: '**27 Mayıs** askerî darbesi', d: 'Ardından **1961 Anayasası**: Anayasa Mahkemesi kuruldu' },
          { y: '1974', t: '**Kıbrıs Barış Harekâtı**' },
          { y: '1983', t: '**KKTC** ilan edildi' },
        ] },
        note: { h: 'Sınavda', t: '2020’de sorulan: DP döneminde **Dışişleri Bakanı** olan ve halk edebiyatı-tarih çalışmalarıyla tanınan isim → **Mehmet Fuat Köprülü**.', exam: true },
      },
    ],
    quiz: [
      { q: 'Osmanlı Devleti’nin dış borçlarını ödeyememesi üzerine bazı gelirlerine alacaklı devletlerce el konulması ve Duyun-u Umumiye’nin kurulması aşağıdakilerden hangisiyle gerçekleşmiştir?', o: ['Islahat Fermanı', 'Muharrem Kararnamesi', 'Sened-i İttifak', 'Tanzimat Fermanı', 'Kanun-i Esasi'], a: 1, ex: '**Muharrem Kararnamesi** (1881). Bu soru 2020 ön lisans sınavında da soruldu.', tip: 'Borç, vergi, gelir → Muharrem Kararnamesi.' },
      { q: 'Osmanlı Devleti’nde ilk anayasanın ilan edilmesiyle başlayan dönem aşağıdakilerden hangisidir?', o: ['Tanzimat Dönemi', 'Lale Devri', 'I. Meşrutiyet', 'II. Meşrutiyet', 'Islahat Dönemi'], a: 2, ex: 'Kanun-i Esasi (1876) ile **I. Meşrutiyet** başladı. II. Meşrutiyet 1908’dir.' },
      { q: 'Aşağıdakilerden hangisi II. Mahmut döneminde gerçekleştirilen yeniliklerden biri değildir?', o: ['Yeniçeri Ocağı’nın kaldırılması', 'Takvim-i Vekayi’nin çıkarılması', 'İlk nüfus sayımının yapılması', 'Sened-i İttifak’ın imzalanması', 'Kanun-i Esasi’nin ilan edilmesi'], a: 4, ex: 'Kanun-i Esasi 1876’da **II. Abdülhamit** döneminde ilan edildi. Diğerleri II. Mahmut döneminindir.', tip: 'Olumsuz köke dikkat: “değildir”.' },
      { q: 'Türkiye’nin Kore Savaşı’na asker göndermesi, aşağıdakilerden hangisine üye olmasını kolaylaştırmıştır?', o: ['Birleşmiş Milletler', 'Balkan Antantı', 'NATO', 'Sadabat Paktı', 'Avrupa Konseyi'], a: 2, ex: 'Kore Savaşı’ndaki başarı, **NATO** üyeliğinin (1952) yolunu açtı.' },
      { q: 'Aşağıdakilerden hangisi 1961 Anayasası ile kurulan kurumlardan biridir?', o: ['Danıştay', 'Yargıtay', 'Sayıştay', 'Anayasa Mahkemesi', 'Türkiye Büyük Millet Meclisi'], a: 3, ex: '**Anayasa Mahkemesi** ilk kez 1961 Anayasası ile kuruldu. Danıştay, Yargıtay ve Sayıştay Osmanlı döneminden beri vardır.' },
      { q: 'Osmanlı Devleti’nden ayrılarak bağımsızlığını kazanan son Balkan devleti aşağıdakilerden hangisidir?', o: ['Yunanistan', 'Arnavutluk', 'Sırbistan', 'Karadağ', 'Romanya'], a: 1, ex: '**Arnavutluk** (1912). Bu soru 2020 ön lisans sınavında soruldu.' },
    ],
    flash: [
      ['Padişah yetkisini ilk kez sınırlayan belge?', '**Sened-i İttifak** (1808, II. Mahmut)'],
      ['Kanun üstünlüğünü ilk kez kabul eden?', '**Tanzimat Fermanı** (1839)'],
      ['Gayrimüslimlere geniş haklar veren ferman?', '**Islahat Fermanı** (1856)'],
      ['İlk Osmanlı anayasası?', '**Kanun-i Esasi** (1876) → I. Meşrutiyet'],
      ['Duyun-u Umumiye hangi belgeyle kuruldu?', '**Muharrem Kararnamesi** (1881)'],
      ['Yeniçeri Ocağı ne zaman, kim kaldırdı?', '**1826, II. Mahmut**'],
      ['Türkiye NATO’ya ne zaman girdi?', '**1952** (Kore Savaşı sonrası)'],
      ['Anayasa Mahkemesi hangi anayasayla kuruldu?', '**1961 Anayasası**'],
    ],
  },
  {
    id: 'ex-tar1', s: 'tarih', min: 12,
    title: 'Millî Mücadele’nin önemli isimleri ve TBMM’ye karşı isyanlar',
    why: '1-2 soru daha',
    cards: [
      {
        h: 'Kim kimdir?',
        viz: { type: 'table', s: 'tarih', head: ['Kişi', 'Hatırla'], rows: [
          ['**İsmet İnönü**', 'I. ve II. İnönü; Mudanya ve **Lozan**’da heyet başkanı; ilk başbakan'],
          ['**Kâzım Karabekir**', '**Doğu Cephesi**; Gümrü; Terakkiperver Cumhuriyet Fırkası'],
          ['**Fevzi Çakmak**', 'Genelkurmay Başkanı; Mareşal'],
          ['**Rauf Orbay**', 'Mondros’ta Osmanlı heyet başkanı; Amasya Genelgesi’ni imzaladı'],
          ['**Refet Bele**', 'Mudanya sonrası İstanbul’a giden birliğin komutanı'],
          ['**Ali Fuat Cebesoy**', 'Batı Cephesi ilk komutanı; Amasya Genelgesi’ni imzaladı'],
          ['**Hasan Tahsin**', 'İzmir’in işgalinde **ilk kurşun** (15 Mayıs 1919)'],
          ['**Kara Fatma, Nene Hatun**', 'Kurtuluş Savaşı’nın kadın kahramanları'],
        ] },
      },
      {
        h: 'TBMM’ye karşı isyanlar',
        b: 'TBMM açıldıktan sonra birçok isyan çıktı. Sebepler: İstanbul hükümetinin kışkırtmaları, halifeye bağlılık propagandası, düzenli orduya katılmak istemeyen gruplar, yabancı devletlerin desteği.\nÖnemli isyanlar: **Kuvâ-yı İnzibatiye**, **Anzavur**, **Delibaş**, **Çerkez Ethem** (düzenli orduya katılmak istemedi), **Koçgiri**.\nÖnlem: **Hıyanet-i Vataniye Kanunu** (Nisan 1920) ve **İstiklal Mahkemeleri** (Eylül 1920).',
      },
    ],
    quiz: [
      { q: 'Mondros Ateşkes Antlaşması’nda Osmanlı heyetine başkanlık eden ve Amasya Genelgesi’ni imzalayanlardan biri olan kişi kimdir?', o: ['İsmet İnönü', 'Rauf Orbay', 'Fevzi Çakmak', 'Kâzım Karabekir', 'Refet Bele'], a: 1, ex: '**Rauf (Orbay) Bey**.' },
      { q: 'Düzenli orduya katılmak istemeyerek TBMM’ye karşı ayaklanan Kuvâ-yı Millîye lideri kimdir?', o: ['Anzavur Ahmet', 'Çerkez Ethem', 'Delibaş Mehmet', 'Şeyh Sait', 'Topal Osman'], a: 1, ex: '**Çerkez Ethem**.' },
      { q: 'TBMM’ye karşı çıkan isyanlarla daha etkili mücadele etmek amacıyla 1920’de kurulan olağanüstü mahkemeler hangileridir?', o: ['Divan-ı Harp', 'İstiklal Mahkemeleri', 'Yüce Divan', 'Şer’iye Mahkemeleri', 'Nizamiye Mahkemeleri'], a: 1, ex: '**İstiklal Mahkemeleri** (Eylül 1920).' },
    ],
    flash: [
      ['Lozan’da Türk heyet başkanı?', '**İsmet Paşa**'],
      ['İzmir’de ilk kurşun?', '**Hasan Tahsin**'],
      ['Düzenli orduya karşı çıkan?', '**Çerkez Ethem**'],
    ],
  },
  {
    id: 'ex-cog1', s: 'cografya', min: 10,
    title: 'Koruma alanları: millî park, tabiat anıtı, sulak alan',
    why: '1 soru olabilir',
    cards: [
      {
        h: 'Koruma statüleri',
        viz: { type: 'cards', items: [
          ['Millî park', 'Doğal, tarihî ve kültürel değerlerin **en geniş** koruma alanı. **İlk: Yozgat Çamlığı (1958)**. Sayı: 50 (2025).', 'cog'],
          ['Tabiat parkı', 'Bitki örtüsü ve yaban hayatı özelliğine sahip, **dinlenme-rekreasyon** alanları.', 'teal'],
          ['Tabiat anıtı', '**Tek bir doğal oluşum**: kaya, anıt ağaç, şelale. En yenisi Dilim Kayalar (Tokat).', 'violet'],
          ['Sulak alan (Ramsar)', 'Kuşlar için önemli sulak alanlar: **Kuşcenneti (Manyas)**, **Göksu Deltası**, **Sultan Sazlığı**.', 'blue'],
        ] },
      },
      {
        h: 'Tanınmış millî parklar',
        b: '**Yozgat Çamlığı** (ilk), **Kuşcenneti** (Balıkesir), **Göreme** (Nevşehir), **Nemrut Dağı** (Adıyaman), **Olimpos-Beydağları** (Antalya), **Köprülü Kanyon** (Antalya), **Kaçkar Dağları** (Rize), **Munzur Vadisi** (Tunceli), **Gelibolu Yarımadası Tarihî Alanı** (Çanakkale), **Sakarya Meydan Muharebesi Tarihî Millî Parkı**.',
      },
    ],
    quiz: [
      { q: 'Türkiye’nin ilk millî parkı hangisidir?', o: ['Kuşcenneti', 'Yozgat Çamlığı', 'Göreme', 'Uludağ', 'Köprülü Kanyon'], a: 1, ex: '**Yozgat Çamlığı** (1958).' },
      { q: 'Tek bir kaya oluşumu, anıt ağaç veya şelale gibi doğal oluşumların korunduğu statü hangisidir?', o: ['Millî park', 'Tabiat parkı', 'Tabiat anıtı', 'Yaban hayatı geliştirme sahası', 'Sulak alan'], a: 2, ex: '**Tabiat anıtı**.' },
    ],
    flash: [
      ['İlk millî park?', '**Yozgat Çamlığı** (1958)'],
      ['Tabiat anıtı?', '**Tek bir doğal oluşum** (kaya, ağaç, şelale)'],
    ],
  },
  {
    id: 'ex-vat1', s: 'vatandaslik', min: 10,
    title: 'Olağanüstü hâl, siyasi partiler ve seçim sistemi',
    why: '1 soru olabilir',
    cards: [
      {
        h: 'Olağanüstü hâl',
        b: '**Cumhurbaşkanı** ilan eder; süre **en fazla 6 ay**. Karar Resmî Gazete’de yayımlanır ve **aynı gün TBMM onayına** sunulur. TBMM uzatabilir (her seferinde en fazla 4 ay; savaş hâlinde süre sınırı yok). OHAL’de bile **çekirdek haklara** dokunulamaz.',
      },
      {
        h: 'Siyasi partiler',
        b: '- Parti kurmak için **izin gerekmez**.\n- Parti üyesi olmak için **18 yaş** yeterli.\n- Partilerin kapatılması davasını **Yargıtay Cumhuriyet Başsavcısı** açar, **Anayasa Mahkemesi** karar verir (üye tamsayısının **beşte üçü**, yani 15 üyeden 9’u; 2010’a kadar üçte ikiydi).\n- **Hâkimler, savcılar, yüksek yargı mensupları, TSK mensupları, kamu görevlileri (memurlar) ve yükseköğretim öncesi öğrenciler** partiye üye olamaz.',
      },
    ],
    quiz: [
      { q: 'Siyasi partilerin kapatılmasına hangi kurum karar verir?', o: ['Yargıtay', 'Danıştay', 'Anayasa Mahkemesi', 'Yüksek Seçim Kurulu', 'TBMM'], a: 2, ex: 'Davayı Yargıtay Cumhuriyet Başsavcısı açar, **Anayasa Mahkemesi** karar verir.' },
      { q: 'Olağanüstü hâl en fazla kaç ay süreyle ilan edilebilir?', o: ['1', '3', '4', '6', '12'], a: 3, ex: 'En fazla **6 ay**; TBMM uzatabilir.' },
    ],
    flash: [
      ['Parti kapatma kararı?', '**Anayasa Mahkemesi**'],
      ['OHAL süresi?', 'En fazla **6 ay**'],
    ],
  },
];
