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
        b: '- Parti kurmak için **izin gerekmez**.\n- Parti üyesi olmak için **18 yaş** yeterli.\n- Partilerin kapatılması davasını **Yargıtay Cumhuriyet Başsavcısı** açar, **Anayasa Mahkemesi** karar verir (üçte iki çoğunlukla).\n- **Hâkimler, savcılar, yüksek yargı mensupları, TSK mensupları, kamu görevlileri (memurlar) ve yükseköğretim öncesi öğrenciler** partiye üye olamaz.',
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
