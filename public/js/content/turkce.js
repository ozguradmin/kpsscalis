// TÜRKÇE — 30 soru. ~16 paragraf, ~4 sözel mantık, ~4 sözcük/cümle anlamı, ~6 dil bilgisi.
// Özgür yorum sorularında iyi; amaç: teknikle hızlandırmak ve dil bilgisinde “kolay netleri” toplamak.

export default [
  // ───────────────────────── 1. GÜN ─────────────────────────
  {
    id: 'tr1', s: 'turkce', day: 1, min: 11,
    title: 'Paragrafta ana düşünce: 3 adımlık teknik',
    why: 'Türkçenin yarısı paragraf',
    cards: [
      {
        h: 'Türkçe’de puanın yarısı buradan',
        b: 'Türkçe testindeki 30 sorunun yaklaşık **16’sı paragraf** sorusudur. Sen yorum yapabildiğin için burası senin güçlü alanın. Bu derste amacımız **hızlanmak** ve **tuzaklara düşmemek**.',
        viz: { type: 'pie', items: [['Paragraf', 16], ['Sözel mantık', 4], ['Sözcük ve cümle anlamı', 4], ['Dil bilgisi', 6]], center: '30 soru', colors: ['tr', 'ink', 'teal', 'gray'] },
      },
      {
        h: 'Adım 1: önce soru kökünü oku',
        b: 'Parçaya başlamadan **soru kökünü** oku. Ne aradığını bilirsen parçayı daha hızlı okursun.\n- “**asıl anlatılmak istenen / ana düşünce**” → yazarın vermek istediği tek mesaj.\n- “**değinilmemiştir / söylenemez / ulaşılamaz**” → olumsuz soru. Kökteki olumsuz kelimenin **altını çiz** ya da yanına **büyük bir X** koy. Sınavda en çok yapılan hata, olumsuz kökü unutmaktır.',
        note: { h: 'Sınavda', t: 'Kitapçıkta soru köklerindeki olumsuz kelimeler zaten **koyu** yazılır. Gördüğün an kalemle yuvarlak içine al.', exam: true },
      },
      {
        h: 'Adım 2: ana düşünce nerede saklanır?',
        b: 'Ana düşünce çoğunlukla şu üç yerden birindedir:\n- **İlk ya da son cümle**\n- **“ama, ancak, fakat, oysa, yine de”** gibi bağlaçlardan **sonraki** kısım (yazar asıl fikrini bağlaçtan sonra söyler)\n- **“bence, aslında, kısacası, demek ki, önemli olan”** gibi ifadelerin olduğu cümle',
        viz: { type: 'flow', items: ['Herkes başarının yetenekle geldiğini düşünür.', '**Oysa** asıl belirleyici olan, her gün az da olsa çalışmaktır. ← **ana düşünce burada**', 'Yetenek sadece başlangıçta avantaj sağlar.'] },
        mn: { code: 'AMA’DAN SONRA ALTIN VAR', t: '“ama / ancak / oysa”dan sonra gelen cümle, yazarın asıl fikridir.' },
      },
      {
        h: 'Adım 3: şıkları üç süzgeçten geçir',
        b: 'Doğru şık **parçanın tamamını** kapsar. Yanlış şıklar genelde şu üç hatadan birini yapar:',
        viz: { type: 'cards', items: [['Çok dar', 'Parçanın sadece bir cümlesini anlatır (yardımcı düşünce).', 'orange'], ['Çok geniş', 'Parçanın söylemediği genellemeler yapar (“her zaman, hiçbir zaman, bütün”).', 'red'], ['Konu dışı', 'Doğru bir bilgi olabilir ama parçada yoktur.', 'gray'], ['Doğru', 'Parçanın **tümünü** kapsar, yazarın bakış açısını taşır.', 'green']] },
        note: { h: 'Altın kural', t: 'Kendi bildiğini değil, **parçada yazanı** işaretle. “Doğru ama parçada yok” şıkkı en tehlikeli tuzaktır.' },
      },
      {
        k: 'steps', h: 'Birlikte çözelim',
        b: '“Bir şehri tanımanın yolu müzelerinden geçmez. Rehber kitaplar bize hangi binanın kaç yılında yapıldığını söyler; **ancak** o şehrin ruhunu, sabah fırından çıkan ekmeğin kokusunda, pazarda pazarlık eden kadınların sesinde buluruz.”\nSoru: Bu parçada asıl anlatılmak istenen nedir?',
        steps: [
          { t: 'Soru kökü olumlu: “asıl anlatılmak istenen”. Tek mesajı arıyoruz.' },
          { t: '“**ancak**” kelimesini buldum. Sonrasına bakıyorum: şehrin ruhu, **gündelik hayatta** bulunur.' },
          { t: 'İlk cümle de bunu destekliyor: müzeler yetmez.' },
          { m: 'Ana düşünce: Bir şehri tanımak için oranın gündelik yaşamını gözlemlemek gerekir.' },
          { t: 'Şıklardan “Müzeler gereksizdir.” olanı **çok geniş/yanlış**; “Rehber kitaplar tarih bilgisi verir.” olanı **çok dar**. İkisini ele.' },
        ],
      },
      {
        k: 'check',
        q: '“Kitap okumayı sevdirmenin yolu yasaklardan geçmez. Çocuğa ‘oku’ diye emretmek, okumayı bir ödeve dönüştürür. **Oysa** evde kitap okuyan bir anne babayı gören çocuk, okumayı kendiliğinden hayatın doğal bir parçası sayar.”\nAna düşünce hangisidir?',
        o: ['Çocuklara kitap almak gerekir.', 'Okuma alışkanlığı en iyi örnek olarak kazandırılır.', 'Çocuklar ödev yapmayı sevmez.', 'Anne babalar çok kitap okumalıdır.'],
        a: 1,
        ex: '“Oysa”dan sonrası: çocuk, **gördüğü örnekten** öğrenir. B parçanın tamamını kapsar. D çok dar, A ve C parçada yok.',
      },
    ],
    quiz: [
      { q: 'İnsanlar genellikle mutluluğu büyük olaylarda arar: bir terfi, bir tatil, yeni bir ev… Bu beklentiyle yaşayanlar, o büyük gün gelene kadar hayatı ertelerler. Oysa mutluluk çoğu zaman bir dostla içilen çayda, akşamüstü yapılan kısa bir yürüyüşte saklıdır. Onu görmek için sadece durup bakmayı bilmek gerekir.\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?', o: ['Büyük hedefler insanı mutsuz eder.', 'Mutluluk, gündelik hayatın küçük anlarında fark edilebilir.', 'Tatiller insanın dinlenmesini sağlar.', 'Dostlarla vakit geçirmek önemlidir.', 'İnsanlar hayatı sürekli erteler.'], a: 1, ex: '“Oysa”dan sonrası mesajı verir: mutluluk **küçük anlarda**. A çok geniş ve olumsuz; D ve E sadece birer cümleyi anlatır.', tip: 'Oysa’dan sonrasına bak.' },
      { q: 'Bir yazarın ilk kitabı çoğu zaman kendi hayatından izler taşır. Yazar, en iyi bildiği şeyi, yani kendi çocukluğunu, mahallesini, ailesini anlatır. Bu doğaldır; çünkü yazmaya cesaret etmek için insanın önce sağlam bir zemine basması gerekir. Asıl sınav ikinci kitapta başlar: Yazar artık kendi hikâyesinin dışına çıkıp başka hayatları inandırıcı biçimde kurabilmelidir.\nBu parçaya göre yazarlığın asıl sınavı nedir?', o: ['Çocukluk anılarını etkileyici anlatmak', 'İlk kitabı hızlıca yayımlatmak', 'Kendi yaşantısı dışındaki hayatları inandırıcı biçimde yazabilmek', 'Okurun beğenisini kazanmak', 'Ailesini ve mahallesini tanıtmak'], a: 2, ex: 'Parçanın sonunda açıkça söyleniyor: **ikinci kitapta** başka hayatları inandırıcı kurmak.' },
      { q: 'Teknoloji hayatımızı kolaylaştırdı; artık bir tıkla alışveriş yapıyor, dünyanın öbür ucundaki biriyle konuşabiliyoruz. Ancak bu kolaylık, sabretme yeteneğimizi de aşındırıyor. Birkaç saniye yüklenmeyen bir sayfa bizi sinirlendiriyor, bir mesajın cevabını beklemek işkenceye dönüşüyor.\nBu parçada asıl vurgulanan düşünce aşağıdakilerden hangisidir?', o: ['Teknoloji iletişimi kolaylaştırmıştır.', 'İnternetten alışveriş yaygınlaşmıştır.', 'Teknolojinin sağladığı hız, insanların sabrını azaltmaktadır.', 'Mesajlara hızlı cevap verilmelidir.', 'Teknolojiden uzak durmak gerekir.'], a: 2, ex: '“**Ancak**”tan sonraki kısım ana düşüncedir: kolaylık sabrı aşındırıyor. A ilk cümleyi anlatır (dar), E parçada yok (geniş).', tip: 'Ama/ancak’tan önceki kısım genelde “herkesin bildiği”, sonrası “yazarın asıl söylediği”dir.' },
      { q: 'Eski ustalar bir çırağa işi öğretirken önce süpürge verirlerdi. Çırak aylarca dükkânı süpürür, ustasını izler, sorular sorardı. Bu bekleme süresi bir zaman kaybı değildi; çırak bu sürede sabrı, dikkati ve mesleğin görünmeyen inceliklerini öğrenirdi.\nBu parçadan aşağıdakilerin hangisine **ulaşılamaz**?', o: ['Eski ustalar çırağa işi hemen öğretmezdi.', 'Çıraklık döneminde gözlem önemliydi.', 'Bekleme süresi çırağın gelişimine katkı sağlardı.', 'Çıraklar zamanla ustalarından daha iyi olurdu.', 'Meslekte görünmeyen incelikler de vardır.'], a: 3, ex: 'Çırağın ustasını **geçtiğine** dair hiçbir bilgi yok. Olumsuz kökü (ulaşılamaz) gördün mü? Parçada **olmayanı** arıyoruz.', tip: 'Olumsuz kökü yuvarlak içine al; parçada olanları tek tek ele.' },
      { q: 'Bir fotoğrafçı için en zor iş, deklanşöre basmak değil, neyi kadrajın dışında bırakacağına karar vermektir. Çünkü iyi bir fotoğraf, her şeyi göstermeye çalışan değil, bakanın gözünü tek bir noktaya yönlendirendir.\nBu parçada iyi fotoğrafla ilgili olarak asıl vurgulanan hangisidir?', o: ['Pahalı makinelerle çekilmesi', 'Seçici davranılarak dikkati tek noktada toplaması', 'Her ayrıntıyı göstermesi', 'Hızlı çekilmesi', 'Renkli olması'], a: 1, ex: 'Parça: iyi fotoğraf = neyi **dışarıda bırakacağını** bilmek, gözü **tek noktaya** yönlendirmek.' },
    ],
    flash: [
      ['Paragrafta ilk adım nedir?', 'Önce **soru kökünü** oku; olumsuz kelimeyi yuvarlak içine al.'],
      ['Ana düşünce en çok nerede saklanır?', 'İlk/son cümlede ve **ama, ancak, oysa**dan sonra.'],
      ['Yanlış şıkların 3 türü?', '**Çok dar**, **çok geniş**, **konu dışı** (doğru ama parçada yok)'],
      ['“Ulaşılamaz” sorusunda ne ararsın?', 'Parçada **olmayan**, parçadan çıkmayan bilgiyi'],
    ],
  },

  // ───────────────────────── 2. GÜN ─────────────────────────
  {
    id: 'tr2', s: 'turkce', day: 2, min: 11,
    title: 'Altı çizili söz ne demek istiyor? Sözcük ve söz anlamı',
    why: 'her yıl 3-4 soru',
    cards: [
      {
        h: 'ÖSYM’nin sevdiği soru tipi',
        b: '2020 ve 2024 sınavlarının **ilk soruları** hep aynı tipteydi: parçada **altı çizili bir söz** var, “bu sözle anlatılmak istenen nedir?” diye soruyor.\nBu sözler hep **mecaz**dır: kelimenin gerçek anlamı değil, **benzetme** yoluyla kazandığı anlam kastedilir.',
        viz: { type: 'compare', cols: [{ h: 'Gerçek anlam', c: 'tr', items: ['“Çayı **şekersiz** içmek” → çaya şeker atmamak', '“**Buzlu** bir cam” → üstü buz tutmuş cam'] }, { h: 'Mecaz anlam', c: 'ink', items: ['“Çayı şekersiz içebilmeli” → **yalnızlığa, eksikliğe alışabilmeli**', '“Buzlu bir camın ardına hapseder” → **insanlardan uzaklaştırır, yabancılaştırır**'] }] },
      },
      {
        h: 'Teknik: somut resmi soyut duyguya çevir',
        b: 'Altı çizili söz bir **resim** çizer. Sen o resmin **duygusunu** bul:\n1. Sözü gerçekten gözünün önüne getir (ne görüyorsun?).\n2. Bu resim hangi duyguyu/durumu anlatıyor? (yalnızlık mı, emek mi, uzaklık mı?)\n3. Parçanın **bağlamına** uyan şıkkı seç. Aynı söz farklı parçada farklı anlam taşıyabilir.',
        viz: { type: 'flow', items: ['**Söz:** “Sayfalara ekmeğinizi bandığınızda toprağın kokusunu alırsınız.”', '**Resim:** kitaba ekmek banmak, toprak kokusu', '**Duygu:** eser o coğrafyanın zenginliğini, özünü taşıyor', '**Cevap:** Coğrafyanın sunduğu zengin malzemeyle değerli eserler oluşturmak (2024, 1. soru)'] },
      },
      {
        k: 'check',
        q: '“Bir noktadan sonra **değişen gözlük camlarımız** kimi detayları bize göstermez olur.” Altı çizili sözle anlatılmak istenen nedir?',
        o: ['Yaşlanınca gözlerin bozulması', 'Mesleki hayatın etkisiyle bazı konulardaki duyarlılığın azalması', 'Gözlük kullanmanın zorluğu', 'Detaylara aşırı önem verilmesi'],
        a: 1,
        ex: 'Gözlük = **bakış açısı**. Camın değişmesi = bakış açımızın (mesleğin etkisiyle) değişmesi. 2020 sorusu buydu: cevap “bazı konulara yönelik hassasiyetlerin mesleki yaşamın etkisiyle zayıflaması”.',
      },
      {
        h: 'Boşluk doldurma: iki kelimeyi birlikte dene',
        b: 'Bir diğer sık soru: “parçada boş bırakılan yerlere hangisi **sırasıyla** getirilmelidir?”\nTeknik:\n- Önce **daha kolay** olan boşluğu bul, oraya uymayan şıkları ele.\n- Kalan şıkları diğer boşlukta dene.\n- Boşluğun hemen **sonraki cümlesi** genelde ipucu verir (“Bununla kastettiğim…”).',
        note: { h: '2020’den örnek', t: '“Ben mümkün olduğunca ---- bir yazar olmayı isterdim. Bununla kastettiğim, konularını **kendini hiç hesaba katmadan** seçen yazardır.” → kendini katmayan = **nesnel**. İkinci boşluk da “yazarın değil, gözlemlediği şeylerin öyküsü” → **gözlemlediği**.', exam: true },
      },
      {
        h: 'Sık çıkan deyim ve sözler',
        b: 'Bunlar hem sözcük anlamı sorularında hem paragraflarda karşına çıkar:',
        viz: { type: 'table', s: 'turkce', head: ['Söz', 'Anlamı'], rows: [
          ['Yaka silkmek', 'Bıkmak, usanmak, uzak durmak'],
          ['Göz ardı etmek', 'Önemsememek'],
          ['Kulak asmamak', 'Dikkate almamak'],
          ['Ağzı kulaklarına varmak', 'Çok sevinmek'],
          ['Eli kulağında', 'Çok yakında olacak'],
          ['Kaş yapayım derken göz çıkarmak', 'İyi yapayım derken bozmak'],
          ['Taşı gediğine koymak', 'Yerinde ve etkili söz söylemek'],
          ['Burnundan kıl aldırmamak', 'Kimseye boyun eğmemek, kibirli olmak'],
          ['Sütten ağzı yanan yoğurdu üfleyerek yer', 'Bir kez zarar gören aşırı temkinli olur'],
        ] },
      },
    ],
    quiz: [
      { q: 'Usta bir aşçı, yemeğin tuzunu tadına bakmadan bilir derler. Çünkü o, yıllar içinde **elinin ayarını** öyle bir oturtmuştur ki ölçü kabına ihtiyaç duymaz.\nAltı çizili sözle anlatılmak istenen aşağıdakilerden hangisidir?', o: ['Yemeğe az tuz atmak', 'Deneyimle kazanılan sezgisel ustalık', 'Mutfakta hızlı çalışmak', 'Ölçü kabı kullanmamak', 'Yemeğin tadına bakmak'], a: 1, ex: '“Elinin ayarı” mecazdır: yıllar içinde oluşan **ustalık ve sezgi**.', tip: 'Resmi hayal et: ölçüsüz tuz atan el → deneyim.' },
      { q: 'Bazı kitaplar vardır, okurken **kalemi elinizden bırakamazsınız**; her sayfada altını çizecek bir cümle bulursunuz.\nAltı çizili sözle anlatılmak istenen nedir?', o: ['Kitabın çok uzun olması', 'Kitabın, üzerinde düşünülecek çok sayıda etkileyici ifade içermesi', 'Kitabın zor anlaşılması', 'Okurun not tutmayı sevmesi', 'Kitabın yazım hatalarıyla dolu olması'], a: 1, ex: 'Her sayfada altını çizecek cümle = **etkileyici, düşündüren ifadeler**.' },
      { q: 'Şehrin kalabalığında insanlar birbirine çarpıp geçiyor ama kimse kimseyi görmüyor. Herkes kendi hayatının ---- kapanmış, başkasının derdine ---- kalmış.\nBu parçada boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?', o: ['içine – duyarsız', 'dışına – ilgili', 'sonuna – yakın', 'önüne – açık', 'başına – meraklı'], a: 0, ex: '“Kimse kimseyi görmüyor” → insanlar kendi hayatlarının **içine** kapanmış, başkalarına **duyarsız** kalmış. Diğer şıklar anlamı tersine çeviriyor.', tip: 'Parçanın genel havası (olumsuz: kimse görmüyor) ile uyumlu kelime çiftini seç.' },
      { q: '“Tecrübeli bir öğretmen, sınıftaki sessizliğin bile bir dili olduğunu bilir.” cümlesinde anlatılmak istenen hangisidir?', o: ['Sınıflar sessiz olmalıdır.', 'Öğrencilerin tepkisizliği de anlam taşıyan bir durumdur.', 'Öğretmenler çok konuşmamalıdır.', 'Sessiz öğrenciler başarılıdır.', 'Tecrübe zamanla kazanılır.'], a: 1, ex: 'Sessizliğin “dili olması” mecazdır: sessizlik de bir şey **anlatır** (sıkılma, anlamama vb.).' },
    ],
    flash: [
      ['Altı çizili söz sorularında 3 adım?', 'Resmi hayal et → **duyguyu** bul → **bağlama** uyan şıkkı seç'],
      ['“Yaka silkmek” ne demek?', 'Bıkmak, usanmak, uzak durmak'],
      ['“Göz ardı etmek”?', 'Önemsememek'],
      ['Boşluk doldurmada ipucu nerede?', 'Boşluktan hemen **sonraki cümlede**'],
    ],
  },

  // ───────────────────────── 3. GÜN ─────────────────────────
  {
    id: 'tr3', s: 'turkce', day: 3, min: 12,
    title: 'Paragrafın yapısı: akışı bozan cümle, bölme, tamamlama',
    why: 'her yıl 3-4 soru',
    cards: [
      {
        h: 'Paragraf bir zincirdir',
        b: 'Her cümle bir öncekine bağlanır. Üç soru tipi bu zinciri test eder:\n- **Akışı bozan cümle**: zincirden kopan halka\n- **İki paragrafa bölme**: konunun değiştiği yer\n- **Boşluğa cümle getirme**: eksik halka',
      },
      {
        h: 'Akışı bozan cümleyi bulma',
        b: 'Her cümlenin **konusunu** 2-3 kelimeyle kenara yaz. Farklı konudan bahseden cümle, akışı bozandır.\nDikkat: akışı bozan cümle genelde **konuyla ilgili gibi görünür** ama konunun **başka bir yönünden** bahseder.',
        viz: { type: 'flow', items: ['(I) Müzik insanlık kadar eskidir. → **müziğin eskiliği**', '(II) Ne zaman ortaya çıktığı bilinmez. → **müziğin eskiliği**', '(III) Belki ilk müzik aleti ellerdi. → **ilk müzik**', '(IV) Sümerler müziğe dair ilk yazılı örnekleri bıraktı. → **ilk müzik belgesi**', '(V) Sümerler yazıyı MÖ 3200’lerde icat etti. → **Sümerlerin yazısı** ✗ müzik değil!'] },
        note: { h: '2020 sorusu', t: 'Bu örnek 2020 KPSS Ön Lisans’taki müzik paragrafından uyarlandı. Son cümle müzikten değil, Sümerlerin göçünden ve yazısından bahsediyordu.', exam: true },
      },
      {
        h: 'İki paragrafa bölme',
        b: 'İkinci paragraf, **bakış açısının ya da konunun değiştiği** cümleyle başlar. İpuçları:\n- “**Oysa, ise, buna karşın, öte yandan**” ile başlayan cümle\n- Özne veya zamanın değişmesi (önce “gazeteler”, sonra “üniversiteler” gibi)\n**Dikkat:** “Bu, bunun sebebi, bu yüzden” gibi **geri gönderme** yapan cümle yeni paragrafa başlayamaz. Çünkü önceki cümleye bağlıdır.',
      },
      {
        k: 'check',
        q: 'Aşağıdaki cümlelerden hangisi bir paragrafın **ilk cümlesi olamaz**?',
        o: ['Kış aylarında göçmen kuşlar güneye gider.', 'Bu yüzden onları yazın göremeyiz.', 'Kuşların yön bulma yeteneği hâlâ araştırılıyor.', 'Leylekler her yıl aynı yuvaya döner.'],
        a: 1,
        ex: '“**Bu yüzden**” önceki bir cümleye bağlanır; paragrafı başlatamaz. İlk cümle kendi başına anlaşılır olmalıdır.',
      },
      {
        h: 'Boşluğa cümle getirme',
        b: 'Boşluk **başta** ise: konuyu tanıtan genel bir cümle ara.\nBoşluk **ortada** ise: hem önceki hem sonraki cümleyle bağ kuran cümle ara; boşluktan sonraki cümle “ama, bu, oysa” ile başlıyorsa ona uyan cümleyi seç.\nBoşluk **sonda** ise: parçayı **özetleyen** ya da sonuç bildiren cümle ara.',
        note: { h: '2024’ten örnek', t: 'Parça, ezber tepkilerin duygularımızı anlatmakta yetersiz kaldığını söylüyor ve “Verdiğimiz tepkiler bizi ----” diye bitiyor. Cevap: “etrafımıza yabancılaştıran **buzlu bir camın ardına hapseder**.” Parçanın olumsuz tonunu devam ettiren tek şık buydu.', exam: true },
      },
      {
        h: 'Yardımcı düşünce soruları',
        b: '“Bu parçada aşağıdakilerden hangisine **değinilmemiştir**?” sorusu için en hızlı yöntem **eleme**:\nHer şıkkı parçada ara. Bulduğun şıkkın yanına küçük bir ✓ koy. ✓ almayan tek şık cevaptır. Bu tip sorular yorum istemez, **dikkat** ister. Acele etme.',
        mn: { code: 'BUL-İŞARETLE-ELE', t: 'Şıkkı parçada bul, ✓ koy, ele. Kalan cevaptır.' },
      },
    ],
    quiz: [
      { q: '(I) Balkonda sebze yetiştirmek son yıllarda şehirlerde yaygınlaştı. (II) Domates, biber ve maydanoz gibi bitkiler küçük saksılarda bile iyi ürün verebiliyor. (III) Bunun için günde en az altı saat güneş alan bir yer seçmek yeterli. (IV) Şehirlerdeki hava kirliliği son yıllarda ciddi bir sağlık sorunu hâline geldi. (V) Düzenli sulama yapıldığında birkaç ay içinde ilk ürünler toplanabiliyor.\nBu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?', o: ['I', 'II', 'III', 'IV', 'V'], a: 3, ex: 'Parça balkonda sebze yetiştirmeyi anlatıyor. (IV) **hava kirliliğinden** bahsediyor; konudan kopuyor.', tip: 'Her cümlenin yanına 2 kelimelik konusunu yaz.' },
      { q: '(I) Eskiden mahallelerde herkes birbirini tanırdı. (II) Bakkal, müşterisinin ne alacağını daha kapıdan girerken bilirdi. (III) Çocuklar sokakta güvenle oynar, akşam ezanıyla evlerine dağılırdı. (IV) Bugün ise apartman dairelerinde yıllarca yan yana oturup birbirinin adını bilmeyen komşular var. (V) Kalabalıklar içinde yalnızlaşan insan, eski mahalle kültürünü özlemle anıyor.\nBu parça iki paragrafa ayrılmak istense ikinci paragraf hangi cümleyle başlar?', o: ['II', 'III', 'IV', 'V', 'I'], a: 2, ex: '(IV) “**Bugün ise**” ile zaman ve bakış açısı değişiyor: eskiden → bugün.', tip: '“ise, oysa, öte yandan” paragraf değiştirir.' },
      { q: 'Yeni bir dil öğrenmenin en zor kısmı ilk birkaç haftadır. ---- Bu dönemi atlatanlar ise dili öğrenmenin aslında bir alışkanlık meselesi olduğunu fark eder.\nBu parçada boş bırakılan yere hangisi getirilmelidir?', o: ['Dil öğrenmek için yurt dışına gitmek gerekir.', 'Bu sürede kelimeler akılda kalmaz, gramer kuralları karışır ve pek çok kişi vazgeçer.', 'İngilizce dünyada en çok konuşulan dildir.', 'Dil kursları oldukça pahalıdır.', 'Çocuklar dil öğrenmede yetişkinlerden daha başarılıdır.'], a: 1, ex: 'Boşluk “en zor kısım”ı açıklamalı ve sonraki cümledeki “**bu dönemi atlatanlar ise**” ifadesine bağlanmalı. B tam olarak zorluğu ve vazgeçenleri anlatıyor.' },
      { q: 'Gezginler için harita, yalnızca yol gösteren bir kâğıt değildir. Haritaya bakan kişi, henüz görmediği dağları, nehirleri, şehirleri zihninde canlandırır. Böylece yolculuk, daha yola çıkmadan başlar.\nBu parçada aşağıdakilerden hangisine **değinilmemiştir**?', o: ['Haritanın hayal gücünü harekete geçirdiğine', 'Haritanın yol göstermenin ötesinde bir işlevi olduğuna', 'Yolculuğun zihinde önceden başlayabileceğine', 'Dijital haritaların kâğıt haritaların yerini aldığına', 'Gezginlerin haritalara farklı anlamlar yüklediğine'], a: 3, ex: 'Parçada **dijital harita** hiç geçmiyor. Diğer dört şıkkın her biri parçada bir cümleye karşılık geliyor.', tip: 'Bul-işaretle-ele: ✓ almayan şık cevap.' },
    ],
    flash: [
      ['Akışı bozan cümleyi nasıl bulursun?', 'Her cümlenin **konusunu** kısaca yaz; farklı olanı bul.'],
      ['İkinci paragraf hangi cümleyle başlar?', 'Bakış açısının/zamanın değiştiği cümle (“**oysa, ise, bugün**”)'],
      ['Hangi cümle paragrafa başlayamaz?', '“**Bu, bu yüzden, bunun için**” gibi önceki cümleye bağlı olan'],
      ['“Değinilmemiştir” sorusunun yöntemi?', '**Bul-işaretle-ele**'],
    ],
  },

  // ───────────────────────── 4. GÜN ─────────────────────────
  {
    id: 'tr4', s: 'turkce', day: 4, min: 14,
    title: 'Sözel mantık: tabloyu kur, soruları topla',
    why: 'her yıl 4 soru, tek tabloyla',
    cards: [
      {
        h: 'Neden bu konu altın değerinde?',
        b: 'Türkçe testinin sonlarında **4 soruluk bir sözel mantık grubu** gelir (2020’de 27-30. sorular). Hepsi **aynı bilgilere** bağlıdır. Tabloyu bir kez doğru kurarsan **4 net** birden gelir.\nBilgi gerektirmez; sadece **dikkat ve düzen** ister. Tam sana göre.',
      },
      {
        h: 'Yöntem: 4 adım',
        viz: { type: 'flow', items: ['**1. Tablo çiz:** satırlara kişileri, sütunlara sıra/özellik yaz.', '**2. Kesin bilgileri yerleştir:** “Erdal altıncı sırada” gibi. Önce bunlar!', '**3. Bağlantılı bilgileri kullan:** “A, B’den hemen önce” → yan yana kutu ikilisi olarak düşün.', '**4. Olasılıkları dene:** kalan yerleri yerleştirip çelişki var mı bak.'] },
        mn: { code: 'KESİN → BAĞLI → DENE', t: 'Önce kesin bilgiler, sonra birbirine bağlı olanlar, en son deneme yanılma.' },
      },
      {
        k: 'steps', h: 'Birlikte çözelim',
        b: 'Ali, Banu, Can, Deniz ve Ece bir sırada bekliyor (1. en önde).\n- Can **üçüncü** sırada.\n- Banu, Ali’den **hemen sonra**.\n- Ece **en sonda** değil.\n- Deniz, Can’dan **sonra**.\nSoru: Birinci sırada kim var?',
        steps: [
          { t: 'Tabloyu çiz: 1-2-3-4-5 kutuları.', viz: { type: 'grid', cols: ['1', '2', '3', '4', '5'], rows: ['Kişi'], cells: {} } },
          { t: 'Kesin bilgi: **Can = 3**.', viz: { type: 'grid', cols: ['1', '2', '3', '4', '5'], rows: ['Kişi'], cells: { 'Kişi|3': 'Can' } } },
          { t: 'Deniz, Can’dan sonra → Deniz 4 veya 5. Ece en sonda değil → 5’te **Ece olamaz**.' },
          { t: '“Ali-Banu” yan yana ikili: ya (1-2) ya (4-5). Eğer (4-5) olursa Deniz’e yer kalmaz (Deniz 4 ya da 5 olmalı). Demek ki **Ali=1, Banu=2**.', viz: { type: 'grid', cols: ['1', '2', '3', '4', '5'], rows: ['Kişi'], cells: { 'Kişi|1': 'Ali', 'Kişi|2': 'Banu', 'Kişi|3': 'Can' } } },
          { t: 'Kalan 4 ve 5: Deniz ve Ece. Ece 5 olamaz → **Ece=4, Deniz=5**.', viz: { type: 'grid', cols: ['1', '2', '3', '4', '5'], rows: ['Kişi'], cells: { 'Kişi|1': 'Ali', 'Kişi|2': 'Banu', 'Kişi|3': 'Can', 'Kişi|4': 'Ece', 'Kişi|5': 'Deniz' } } },
          { m: 'Cevap: Birinci sırada Ali var.' },
        ],
      },
      {
        h: 'İki özellikli tablolar (kişi + film, kişi + renk…)',
        b: 'Sorular bazen iki şeyi birlikte sorar: “Kim kaçıncı sırada **ve** hangi filme bilet aldı?” O zaman tabloya **ikinci bir satır** ekle.\nİki kelimeye dikkat:\n- “**kesinlikle**” → tek ihtimal kalmalı.\n- “**olabilir**” → en az bir yerleşimde mümkün olması yeter.',
        viz: { type: 'grid', cols: ['1', '2', '3', '4', '5', '6', '7'], rows: ['Kişi', 'Film'], cells: { 'Kişi|6': 'Erdal', 'Film|6': 'K' } },
        note: { h: 'Sınavda', t: 'Tabloyu kitapçığın boş yerine **büyük** çiz. Her soruda yeni bir koşul gelirse (“…biliniyorsa”) ana tabloyu bozma, yanına küçük bir kopya çiz.', exam: true },
      },
      {
        k: 'check',
        q: 'Dört arkadaş (K, L, M, N) yan yana oturuyor. K en solda. M, N’nin hemen sağında. L en sağda değil. Soldan ikinci kim?',
        o: ['L', 'M', 'N', 'K'],
        a: 0,
        ex: 'K=1. N-M yan yana ikili: (2-3) ya da (3-4). L en sağda (4) değil → L 2 ya da 3. İkili (3-4) olursa L=2 olur ✓. İkili (2-3) olursa L=4 olurdu ✗. Yani **K, L, N, M** → soldan ikinci **L**.',
      },
    ],
    quiz: [
      {
        q: 'Ayşe, Bora, Cem, Dilek ve Emre bir yarışmayı 1’den 5’e kadar farklı sıralarda bitirmiştir.\n- Cem, Ayşe’den hemen önce bitirmiştir.\n- Bora ikinci olmuştur.\n- Emre, Dilek’ten önce bitirmiştir.\n- Dilek son sırada değildir.\nBuna göre birinci kimdir?',
        o: ['Ayşe', 'Bora', 'Cem', 'Dilek', 'Emre'], a: 4,
        ex: 'Bora=2. Cem-Ayşe ikilisi (3-4) veya (4-5) olabilir. Dilek son değil ve Emre ondan önce. (4-5) olursa 1 ve 3 kalır: Emre=1, Dilek=3 ✓. (3-4) olursa 1 ve 5 kalır: Dilek 5 olamaz → Dilek=1, ama Emre Dilek’ten önce olamaz ✗. Sıra: **Emre, Bora, Dilek, Cem, Ayşe**. Birinci **Emre**.', tip: 'Yan yana ikilileri (Cem-Ayşe) blok olarak kaydır, her konumu dene.',
      },
      {
        q: 'Ayşe, Bora, Cem, Dilek ve Emre bir yarışmayı 1’den 5’e kadar farklı sıralarda bitirmiştir.\n- Cem, Ayşe’den hemen önce bitirmiştir.\n- Bora ikinci olmuştur.\n- Emre, Dilek’ten önce bitirmiştir.\n- Dilek son sırada değildir.\nBuna göre Cem kaçıncı olmuştur?',
        o: ['1', '2', '3', '4', '5'], a: 3,
        ex: 'Tablo: 1 Emre, 2 Bora, 3 Dilek, **4 Cem**, 5 Ayşe. Aynı tablo birden fazla soruyu cevaplar. İşte sözel mantığın güzelliği bu!',
      },
      {
        q: 'Bir apartmanın 1, 2 ve 3. katlarında Fatma, Gül ve Hakan birer dairede oturuyor. Her birinin farklı bir evcil hayvanı var: kedi, köpek, kuş.\n- Köpek sahibi en üst katta oturuyor.\n- Gül birinci katta oturuyor.\n- Hakan’ın kedisi var.\nBuna göre aşağıdakilerden hangisi **kesinlikle doğrudur**?',
        o: ['Hakan birinci katta oturur.', 'Gül’ün kedisi vardır.', 'Fatma üçüncü katta oturur.', 'Hakan’ın köpeği vardır.', 'Kuş sahibi ikinci katta oturur.'], a: 2,
        ex: 'Kedi Hakan’da. Köpek sahibi 3. katta, Gül ise 1. katta → Gül köpek sahibi olamaz → **Gül = kuş**. Geriye köpek kalır → **Fatma = köpek** → Fatma 3. katta. Hakan da 2. katta. Tablo: 1 Gül-kuş, 2 Hakan-kedi, 3 **Fatma**-köpek.', tip: 'Kişi-hayvan-kat için 3 satırlı küçük bir tablo çiz; her bilgiyi tek tek işle.',
      },
    ],
    flash: [
      ['Sözel mantıkta sıra?', '**Kesin → Bağlı → Dene**'],
      ['“Hemen önce/sonra” bilgisi nasıl kullanılır?', 'İki kişiyi **yan yana blok** gibi düşün, konumlarını dene.'],
      ['“Kesinlikle” ile “olabilir” farkı?', 'Kesinlikle = **tek ihtimal**; olabilir = **en az bir** yerleşimde mümkün'],
      ['Yeni koşullu sorularda ne yaparsın?', 'Ana tabloyu bozma, **yanına kopya** çiz.'],
    ],
  },

  // ───────────────────────── 5. GÜN ─────────────────────────
  {
    id: 'tr5', s: 'turkce', day: 5, min: 13,
    title: 'Cümlenin ögeleri: 5 soruyla her cümleyi çöz',
    why: 'her yıl 1 kesin soru',
    cards: [
      {
        h: 'Önce yüklem, sonra sorular',
        b: 'Cümlenin ögelerini bulmak bir **sorgu oyunu**dur. Sıra hep aynı:\n1. **Yüklemi** bul (iş, hareket, yargı; genelde sondadır).\n2. Yükleme soru sor, cevap gelen kısım o ögedir.',
        viz: { type: 'table', s: 'turkce', head: ['Öge', 'Yükleme sorulan soru'], rows: [
          ['**Özne**', '**kim? ne?** (işi yapan)'],
          ['**Belirtili nesne**', '**neyi? kimi?** (-ı, -i, -u, -ü eki var)'],
          ['**Belirtisiz nesne**', '**ne?** (öznenin dışında, ek yok)'],
          ['**Yer tamlayıcısı**', '**nereye? nerede? nereden? kime? kimde? kimden?** (-e, -de, -den ekleri)'],
          ['**Zarf tümleci**', '**nasıl? ne zaman? niçin? ne kadar?**'],
        ] },
      },
      {
        h: 'Renklerle gör',
        b: 'Örnek: “Hubble Uzay Teleskobu yaklaşık 8000 yıl önce patlayan devasa bir yıldıza ait kalıntıların küçük bir bölümünü geçtiğimiz günlerde keşfetti.” (2024 sorusu)',
        viz: { type: 'sentence', parts: [['Hubble Uzay Teleskobu', 'Özne'], ['yaklaşık 8000 yıl önce patlayan devasa bir yıldıza ait kalıntıların küçük bir bölümünü', 'Belirtili nesne'], ['geçtiğimiz günlerde', 'Zarf tümleci'], ['keşfetti', 'Yüklem']] },
        note: { h: 'Püf nokta', t: 'Uzun kelime gruplarını **bölme**! “yaklaşık 8000 yıl önce patlayan devasa bir yıldıza ait kalıntıların küçük bir bölümünü” tek parçadır; sonundaki **-ü** eki onu belirtili nesne yapar. Cevap: **Özne – belirtili nesne – zarf tümleci – yüklem**.', exam: true },
      },
      {
        h: 'Adım adım sorgula',
        b: 'Cümle: “Barış Manço, 1974 yılına ait siyah beyaz bir klipte, elinde sazıyla bu şarkıyı okuyor.” (2020 sorusundan)',
        viz: { type: 'sentence', parts: [['Barış Manço', 'Özne'], ['1974 yılına ait siyah beyaz bir klipte', 'Yer tamlayıcısı'], ['elinde sazıyla', 'Zarf tümleci'], ['bu şarkıyı', 'Belirtili nesne'], ['okuyor', 'Yüklem']] },
        b2: '',
      },
      {
        h: 'En sık karışan iki şey',
        viz: { type: 'compare', cols: [
          { h: 'Belirtisiz nesne mi, özne mi?', c: 'tr', items: ['“Bahçede **çocuklar** oynuyor.” → kim oynuyor? **Özne**', '“Annem **ekmek** aldı.” → ne aldı? (işi yapan annem) → **Belirtisiz nesne**', 'Kural: işi **yapan** özne, işten **etkilenen** nesnedir.'] },
          { h: 'Yer tamlayıcısı mı, zarf tümleci mi?', c: 'ink', items: ['**-e, -de, -den** ekini alan → **yer tamlayıcısı**: “okula gitti”', 'Ek yoksa ve “ne zaman, nasıl” cevabıysa → **zarf tümleci**: “**yarın** gitti”, “**hızlıca** gitti”', '“Eve doğru” gibi edatlı yön bildiren kalıplar **zarf tümleci** sayılır.'] },
        ] },
      },
      {
        k: 'check',
        q: '“Dedem her sabah bahçedeki ağaçları sular.” cümlesinde “bahçedeki ağaçları” hangi ögedir?',
        o: ['Özne', 'Belirtili nesne', 'Yer tamlayıcısı', 'Zarf tümleci'],
        a: 1,
        ex: 'Neyi sular? **Bahçedeki ağaçları** (-ı eki var) → **belirtili nesne**. “bahçedeki” kelimesindeki -de sizi yanıltmasın; grup bir bütündür ve sonu -ı ile biter.',
      },
    ],
    quiz: [
      { q: '“Kardeşim dün akşam kütüphaneden iki kitap aldı.” cümlesinin ögeleri sırasıyla hangisidir?', o: ['Özne – zarf tümleci – yer tamlayıcısı – belirtisiz nesne – yüklem', 'Özne – yer tamlayıcısı – zarf tümleci – belirtili nesne – yüklem', 'Özne – zarf tümleci – yer tamlayıcısı – belirtili nesne – yüklem', 'Belirtisiz nesne – zarf tümleci – yer tamlayıcısı – özne – yüklem', 'Özne – zarf tümleci – zarf tümleci – belirtisiz nesne – yüklem'], a: 0, ex: 'Kim? **kardeşim** (özne). Ne zaman? **dün akşam** (zarf t.). Nereden? **kütüphaneden** (yer t.). Ne? **iki kitap** (ek yok → belirtisiz nesne). **aldı** (yüklem).' },
      { q: '“Sabahın erken saatlerinde balıkçılar ağlarını denize bıraktı.” cümlesinde aşağıdaki ögelerden hangisi **yoktur**?', o: ['Özne', 'Belirtili nesne', 'Yer tamlayıcısı', 'Zarf tümleci', 'Belirtisiz nesne'], a: 4, ex: 'Zarf t.: sabahın erken saatlerinde · Özne: balıkçılar · Belirtili nesne: ağlarını · Yer t.: denize · Yüklem: bıraktı. **Belirtisiz nesne yok.**', tip: 'Her ögeyi bulunca şıkkın yanına ✓ koy.' },
      { q: '“Bu şehirde herkes birbirine güler yüzle selam verir.” cümlesinde “güler yüzle” hangi ögedir?', o: ['Özne', 'Belirtisiz nesne', 'Yer tamlayıcısı', 'Zarf tümleci', 'Yüklem'], a: 3, ex: 'Nasıl selam verir? **Güler yüzle** → nasıl sorusu = **zarf tümleci**.' },
      { q: '“Yıllardır görmediği arkadaşına uzun bir mektup yazdı.” cümlesinde “yıllardır görmediği arkadaşına” hangi ögedir?', o: ['Özne', 'Belirtili nesne', 'Yer tamlayıcısı', 'Zarf tümleci', 'Belirtisiz nesne'], a: 2, ex: 'Kime yazdı? **arkadaşına** (-a eki) → **yer tamlayıcısı**. “Yıllardır” kelimesi grubun içindedir, ayrı öge değildir.' },
    ],
    flash: [
      ['Ögeleri bulmada ilk adım?', '**Yüklemi** bul, sonra yükleme soru sor.'],
      ['Belirtili nesnenin sorusu ve eki?', '**neyi / kimi?** · -ı, -i, -u, -ü'],
      ['Yer tamlayıcısının ekleri?', '**-e, -de, -den** (nereye, nerede, nereden)'],
      ['Zarf tümlecinin soruları?', '**nasıl, ne zaman, niçin, ne kadar**'],
      ['Özne ile belirtisiz nesne farkı?', 'İşi **yapan** özne, işten **etkilenen** nesne'],
    ],
  },

  // ───────────────────────── 6. GÜN ─────────────────────────
  {
    id: 'tr6', s: 'turkce', day: 6, min: 13,
    title: 'Yazım ve noktalama: en çok sorulan 12 kural',
    why: 'her yıl 2 soru',
    cards: [
      {
        h: 'Bağlaç “de” ve “ki”, soru eki “mi”',
        b: 'Yazım sorularının yarısı bu üç küçük kelimeden gelir.',
        viz: { type: 'table', s: 'turkce', head: ['Kural', 'Doğru', 'Yanlış'], rows: [
          ['Bağlaç **de/da** ayrı yazılır (“dahi” anlamı; çıkarınca anlam bozulmaz).', 'Ben **de** geldim.', 'Bende geldim.'],
          ['Ek **-de/-da** bitişik yazılır (yer bildirir).', 'Kitap **bende**.', 'Kitap ben de.'],
          ['Bağlaç **ki** ayrı yazılır.', 'Duydum **ki** gelmişsin.', 'Duydumki…'],
          ['Sıfat yapan **-ki** bitişik yazılır.', '**Evdeki**, **yarınki**', 'Evde ki'],
          ['Soru eki **mi** her zaman ayrı yazılır.', 'Geldin **mi**?', 'Geldinmi?'],
        ] },
        mn: { code: 'ÇIKAR-OKU', t: '“de”yi çıkar, cümleyi oku. Anlam bozulmuyorsa **bağlaçtır, ayrı yazılır**.' },
      },
      {
        h: 'Büyük harf ve kesme işareti',
        b: '- **Özel adlara** gelen ekler **kesme işaretiyle** ayrılır: Ankara’da, Özgür’ün, Türkiye’ye.\n- Kurum adlarına gelen ekler **ayrılmaz**: Türk Dil Kurumuna, Millî Eğitim Bakanlığından.\n- Belirli bir tarih bildiren **ay ve gün adları büyük** yazılır: **29 Ekim 1923 Pazartesi**. Tarih belirtmiyorsa küçük: “ekim ayında yağmur yağar.”\n- Yön adları **özel ada dahilse** büyük: **Doğu Anadolu**; değilse küçük: “şehrin doğusu”.',
      },
      {
        h: 'Birleşik ve ayrı yazılanlar (sık sorulanlar)',
        viz: { type: 'compare', cols: [
          { h: 'Bitişik', c: 'tr', items: ['**hiçbir**, hiçbiri', 'birkaç, birçok', 'Anlam kayması: **kuşburnu**, **hanımeli**, **aslanağzı**', '**-ever, -iver** ile: gidiverdi, yapıver', 'Etmek/olmak ile ses düşmesi: **hissetmek**, **kaybolmak**'] },
          { h: 'Ayrı', c: 'ink', items: ['**her şey**, **bir şey**', '**renk renk**, **binbir** değil **bin bir** (sayı anlamında)', 'Sayılar ayrı: **on beş**, **iki yüz**', 'Ses düşmesi yoksa ayrı: **yardım etmek**, **kayıt olmak**'] },
        ] },
        note: { h: '2020’de soruldu', t: '“**renkrenk** kâğıtlara sarılı **binbir** çeşit çikolata” ifadesinde **renkrenk** yanlıştı: doğrusu **renk renk**. (“Binbir” ise “çok sayıda” anlamında bitişik yazılabilir.)', exam: true },
      },
      {
        h: 'Noktalama: 6 işaret, 6 görev',
        viz: { type: 'table', s: 'turkce', head: ['İşaret', 'En çok sorulan görevi'], rows: [
          ['**Virgül ,**', 'Eş görevli kelimeleri ayırır; uzun cümlede özneden sonra; sıralı cümleleri ayırır.'],
          ['**Noktalı virgül ;**', 'Virgüllerle ayrılmış **grupları** birbirinden ayırır: “Ali, Veli; Ayşe, Fatma…”'],
          ['**İki nokta :**', 'Kendisinden sonra **örnek veya açıklama** gelir.'],
          ['**Üç nokta …**', '**Tamamlanmamış** cümlenin sonuna konur.'],
          ['**Tırnak “ ”**', 'Başkasından **aynen aktarılan** söz.'],
          ['**Kesme ’**', 'Özel adlara gelen ekleri ayırır.'],
        ] },
      },
      {
        k: 'check',
        q: 'Aşağıdaki cümlelerin hangisinde “de” yanlış yazılmıştır?',
        o: ['Sen de bizimle gel.', 'Anahtarlar masada duruyor.', 'Kardeşimde bu kitabı okudu.', 'Bu akşam biz de sinemaya gideceğiz.'],
        a: 2,
        ex: '“Kardeşim **de** bu kitabı okudu.” olmalı. Çıkar-oku: “Kardeşim bu kitabı okudu.” Anlam bozulmuyor → bağlaç → **ayrı**.',
      },
    ],
    quiz: [
      { q: 'Aşağıdaki cümlelerin hangisinde yazım yanlışı **vardır**?', o: ['Hiçbir şey eskisi gibi değil.', 'Bu konuyu birkaç kez anlattım.', 'Evdeki hesap çarşıya uymaz.', 'Sınavı kazandınmı?', 'Ankara’ya yarın gidiyoruz.'], a: 3, ex: 'Soru eki **mi** her zaman ayrı yazılır: “kazandın **mı**?”' },
      { q: 'Aşağıdaki cümlelerin hangisinde büyük harflerin kullanımıyla ilgili bir yanlışlık **vardır**?', o: ['Cumhuriyet 29 Ekim 1923’te ilan edildi.', 'Doğu Anadolu’da kış uzun sürer.', 'Her yıl Ekim ayında yağmurlar başlar.', 'Türk Dil Kurumuna mektup yazdık.', 'Özgür’ün sınavı pazar günü.'], a: 2, ex: 'Belirli bir tarih bildirmeyen ay adı **küçük** yazılır: “her yıl **ekim** ayında”. (E şıkkında “pazar günü” de belirli tarih bildirmediği için küçük, doğru.)' },
      { q: '“Çantasına su, kalem, silgi ve kimliğini koydu ---- sınava hazırdı.”\nBu cümlede boş bırakılan yere hangi noktalama işareti getirilmelidir?', o: ['İki nokta (:)', 'Noktalı virgül (;)', 'Üç nokta (…)', 'Kesme işareti (’)', 'Soru işareti (?)'], a: 1, ex: 'İlk kısımda zaten **virgüller** var. Virgüllü bir grubu sonraki cümleden ayırmak için **noktalı virgül** kullanılır.' },
      { q: 'Aşağıdakilerin hangisinde iki nokta (:) doğru kullanılmıştır?', o: ['Bugün: çok yorgunum.', 'Pazardan şunları aldık: domates, biber, soğan.', 'Ali: ve Veli geldi.', 'Nereye gidiyorsun: diye sordu.', 'Ankara: Türkiye’nin başkentidir.'], a: 1, ex: 'İki noktadan sonra **açıklama veya örnek** (sayılan şeyler) gelir.' },
    ],
    flash: [
      ['Bağlaç “de” nasıl anlaşılır?', '**Çıkar-oku**: anlam bozulmuyorsa bağlaç → **ayrı**'],
      ['“mi” nasıl yazılır?', 'Her zaman **ayrı**: geldin mi?'],
      ['“her şey” mi “herşey” mi?', '**her şey** (ayrı)'],
      ['“hiçbir” mi “hiç bir” mi?', '**hiçbir** (bitişik)'],
      ['Noktalı virgül ne zaman?', 'Virgüllü **grupları** birbirinden ayırırken'],
      ['İki noktadan sonra ne gelir?', '**Açıklama veya örnek**'],
      ['Ay adları ne zaman büyük?', '**Belirli bir tarih** bildirirse: 29 Ekim 1923'],
    ],
  },

  // ───────────────────────── 7. GÜN ─────────────────────────
  {
    id: 'tr7', s: 'turkce', day: 7, min: 13,
    title: 'Ses olayları ve ekler: kısa kurallar, kesin net',
    why: 'her yıl 2 soru',
    cards: [
      {
        h: 'Ses olayları: 5 tane yeter',
        viz: { type: 'table', s: 'turkce', head: ['Olay', 'Ne olur?', 'Örnek'], rows: [
          ['**Ünsüz yumuşaması**', 'p, ç, t, k → b, c, d, ğ/g (ünlüyle başlayan ek gelince)', 'kitap → kita**b**ı, ağaç → ağa**c**ı, renk → ren**g**i'],
          ['**Ünsüz benzeşmesi (sertleşme)**', 'Sert ünsüzden sonra c, d, g → ç, t, k', 'kitap**ç**ı, ağaç**t**a, 1923’**te**'],
          ['**Ünlü düşmesi**', 'İki heceli kelimede ikinci hecedeki ünlü düşer', 'ağız → a**ğz**ı, burun → bu**rn**u, oğul → o**ğl**u'],
          ['**Ünsüz düşmesi**', '-k’li kelimelere ek gelince k düşer; küçük → küçü**cük**', 'küçük → küçü**cük**, büyük → büyü**mek**, alçak → alça**lmak**'],
          ['**Kaynaştırma**', 'İki ünlü yan yana gelmesin diye y, ş, s, n girer', 'araba-**y**-ı, iki-**ş**-er, oda-**s**-ı, bu-**n**-u'],
        ] },
        mn: { code: 'FıSTıKÇı ŞaHaP', t: 'Sert ünsüzler: **f, s, t, k, ç, ş, h, p**. Bunlardan sonra c-d-g gelirse sertleşir (ç-t-k).' },
      },
      {
        h: 'Ünsüz yumuşamasını gör',
        viz: { type: 'flow', items: ['**kitap** + ı', 'p → **b** (ünlü ile başlayan ek geldi)', '**kitabı**'] },
        note: { h: 'İstisna', t: 'Tek heceli kelimelerin çoğu yumuşamaz: top → topu, saç → saçı, at → atı. Özel adlar da yumuşamaz: Zonguldak’ı.' },
      },
      {
        h: 'Ekler: yapım eki mi, çekim eki mi?',
        viz: { type: 'compare', cols: [
          { h: 'Yapım eki', c: 'tr', items: ['**Yeni kelime** yapar, anlamı değiştirir', 'göz → göz**lük** (yeni şey)', 'bil → bil**gi**', 'Sözlükte ayrı madde olarak bulunur'] },
          { h: 'Çekim eki', c: 'ink', items: ['Kelimeyi **cümleye bağlar**, anlam değişmez', 'göz → göz**ü**, göz**de**, göz**ler**', 'geldi**m**, gel**ecek**', 'Çoğul, hâl, iyelik, zaman, kişi ekleri'] },
        ] },
      },
      {
        h: 'Fiilimsiler: fiilden türeyen üç kardeş',
        b: 'Soruda “isim-fiil, sıfat-fiil, zarf-fiil eki almıştır” şıkları gelir (2020’de geldi). Üç kardeşi eklerinden tanı:',
        viz: { type: 'table', s: 'turkce', head: ['Tür', 'Ekler', 'Örnek'], rows: [
          ['**İsim-fiil**', '**-me, -mek, -iş**', 'oku**mak** güzel, gel**iş**i, yaz**ma**sı'],
          ['**Sıfat-fiil**', '**-an, -ası, -mez, -ar, -dik, -ecek, -miş**', 'gel**en** adam, oku**duğ**um kitap, gör**ecek** gün'],
          ['**Zarf-fiil**', '**-ip, -ince, -erek, -ken, -meden, -dikçe, -ince**', 'gel**ip** gitti, gör**ünce**, gül**erek**'],
        ] },
        mn: { code: 'MEK-MA-İŞ · AN-DIK-ACAK · İP-INCE-EREK', t: 'İsim-fiil üçlüsü, sıfat-fiil üçlüsü, zarf-fiil üçlüsü. Her birinden bir örnek ezberle yeter.' },
      },
      {
        k: 'check',
        q: '“ağzı” kelimesinde hangi ses olayı vardır?',
        o: ['Ünsüz yumuşaması', 'Ünlü düşmesi', 'Ünsüz benzeşmesi', 'Kaynaştırma'],
        a: 1,
        ex: 'ağ**ı**z + ı → ağzı. İkinci hecedeki **ı** düştü: **ünlü düşmesi**.',
      },
    ],
    quiz: [
      { q: 'Aşağıdaki kelimelerin hangisinde ünsüz yumuşaması **vardır**?', o: ['Topu', 'Kitabı', 'Saçı', 'Kalemi', 'Evde'], a: 1, ex: 'kitap → kita**b**ı: p → b. Top ve saç tek hecelidir, yumuşamaz.' },
      { q: 'Aşağıdaki cümlelerin hangisinde **ünlü düşmesi** vardır?', o: ['Oğlu bu yıl okula başladı.', 'Kitabı masada unuttum.', 'Ağaçta kuşlar ötüyor.', 'Kapıyı yavaşça kapat.', 'Evin önü tertemiz.'], a: 0, ex: 'o**ğu**l + u → **oğlu**: ikinci hecedeki **u** düştü. Kitabı’nda yumuşama, ağaçta’da benzeşme, kapıyı’da kaynaştırma var; ünlü düşmesi yok.', tip: 'Kelimeyi köküyle yan yana yaz (oğul / oğlu); eksilen ünlüyü ara.' },
      { q: '“Kitap okuyan insan, dünyayı başka gözlerle görür.” cümlesinde “okuyan” kelimesi hangi eki almıştır?', o: ['İsim-fiil eki', 'Sıfat-fiil eki', 'Zarf-fiil eki', 'Çoğul eki', 'İyelik eki'], a: 1, ex: '**-an** sıfat-fiil ekidir: “okuyan insan” (hangi insan? okuyan insan).' },
      { q: '“Eve gelince hemen uyudu.” cümlesindeki “gelince” kelimesi için hangisi doğrudur?', o: ['İsim-fiildir.', 'Sıfat-fiildir.', 'Zarf-fiildir.', 'Yapım eki almış bir isimdir.', 'Çekimli fiildir.'], a: 2, ex: '**-ince** zarf-fiil ekidir; “ne zaman uyudu?” sorusuna cevap verir.' },
    ],
    flash: [
      ['Sert ünsüzler kodlaması?', '**FıSTıKÇı ŞaHaP**: f, s, t, k, ç, ş, h, p'],
      ['Ünsüz yumuşaması örneği?', 'kitap → **kitabı** (p→b)'],
      ['Ünlü düşmesi örneği?', 'ağız → **ağzı**, burun → **burnu**'],
      ['İsim-fiil ekleri?', '**-me, -mek, -iş**'],
      ['Sıfat-fiil ekleri?', '**-an, -dik, -ecek, -miş, -mez, -ası, -ar**'],
      ['Zarf-fiil ekleri?', '**-ip, -ince, -erek, -ken, -meden, -dikçe**'],
    ],
  },

  // ───────────────────────── 8. GÜN ─────────────────────────
  {
    id: 'tr8', s: 'turkce', day: 8, min: 11,
    title: 'Anlatım biçimleri, öznel-nesnel ve anlatım bozuklukları',
    why: '2-3 soru',
    cards: [
      {
        h: 'Öznel mi, nesnel mi?',
        b: '**Nesnel** yargı kanıtlanabilir, kişiden kişiye değişmez. **Öznel** yargı kişisel görüş ve duygudur; tartışılabilir.',
        viz: { type: 'compare', cols: [
          { h: 'Nesnel', c: 'tr', items: ['Kitap 1965’te yayımlandı.', 'Yazar grubu 18 ay izledi.', 'Ankara Türkiye’nin başkentidir.'] },
          { h: 'Öznel', c: 'ink', items: ['**Benzersiz** bir portre kaleme almış.', 'Film **çok etkileyiciydi**.', 'Bence en **güzel** şehir İzmir.'] },
        ] },
        note: { h: 'İpucu kelimeler', t: '“güzel, benzersiz, etkileyici, başarılı, sıkıcı, en iyi, bence, sanırım” gibi **değerlendirme** kelimeleri öznelliği gösterir. 2020’de Beatles biyografisi sorusunda cevap, “**benzersiz** bir portre” ifadesini taşıyan cümleydi.', exam: true },
      },
      {
        h: 'Dört anlatım biçimi',
        viz: { type: 'cards', items: [
          ['Açıklama', 'Bilgi verir, öğretir. Ders kitabı dili.', 'tr'],
          ['Tartışma', 'Bir görüşü savunur, karşı görüşü çürütmeye çalışır.', 'tar'],
          ['Betimleme', 'Bir yeri, kişiyi **resim gibi** anlatır; duyulara hitap eder (renk, ses, koku).', 'cog'],
          ['Öyküleme', 'Olay anlatır: **kişi, yer, zaman, olay** zinciri vardır.', 'mat'],
        ] },
        mn: { code: 'AÇIK-TART-BET-ÖYK', t: 'Bilgi → açıklama · Kavga → tartışma · Fotoğraf → betimleme · Film → öyküleme' },
      },
      {
        h: 'Düşünceyi geliştirme yolları',
        b: 'Soruda “bu parçada hangi düşünceyi geliştirme yolu kullanılmıştır?” der:\n- **Tanımlama:** “X, … olan şeydir.”\n- **Örneklendirme:** “örneğin, mesela”\n- **Karşılaştırma:** iki şeyin benzer/farklı yönleri (“-den daha, oysa”)\n- **Tanık gösterme:** ünlü birinin sözüne başvurma (“Eliot’a göre…”)\n- **Sayısal verilerden yararlanma:** rakam, yüzde, istatistik\n- **Benzetme:** “gibi, sanki”',
      },
      {
        h: 'Anlatım bozukluğu: en sık 4 hata',
        viz: { type: 'table', s: 'turkce', head: ['Hata', 'Bozuk', 'Doğru'], rows: [
          ['**Gereksiz sözcük**', 'Yaklaşık **on kadar** kişi geldi.', 'Yaklaşık on kişi geldi.'],
          ['**Anlamca çelişen sözcük**', '**Kesinlikle** gelebilir.', 'Belki gelebilir. / Kesinlikle gelecek.'],
          ['**Özne-yüklem uyumsuzluğu**', 'Ben ve arkadaşım sinemaya **gittiler**.', '…sinemaya **gittik**.'],
          ['**Ortak ögenin eksikliği**', 'Ona güveniyor, **seviyor**. (güvenmek “-e”, sevmek “-i” ister)', 'Ona güveniyor, **onu** seviyor. (Not: “Kitabı okudum ama beğenmedim.” doğrudur; iki fiil de “kitabı” ister.)'],
        ] },
      },
      {
        k: 'check',
        q: 'Aşağıdaki cümlelerin hangisinde **gereksiz sözcük** kullanımı vardır?',
        o: ['Toplantıya herkes zamanında geldi.', 'Sınava yaklaşık on gün kadar kaldı.', 'Özgür her gün düzenli çalışıyor.', 'Bu kitap üç bölümden oluşuyor.'],
        a: 1,
        ex: '“Yaklaşık” ve “kadar” aynı anlamı verir; biri **gereksiz**.',
      },
    ],
    quiz: [
      { q: '(I) Yazar romanını 2019’da yayımladı. (II) Kitap üç yüz sayfadan oluşuyor. (III) Olaylar küçük bir sahil kasabasında geçiyor. (IV) Yazarın akıcı dili okuru ilk sayfadan yakalıyor. (V) Roman kısa sürede beş dile çevrildi.\nBu parçada numaralanmış cümlelerin hangisinde **öznel** bir yargı vardır?', o: ['I', 'II', 'III', 'IV', 'V'], a: 3, ex: '“**Akıcı** dil”, “okuru **yakalıyor**” kişisel değerlendirmedir. Diğerleri kanıtlanabilir bilgilerdir.' },
      { q: 'Kış sabahıydı. Bembeyaz karın üstünde serçelerin minik ayak izleri vardı. Bacalardan yükselen gri dumanlar, soğuk havada ağır ağır kıvrılıyordu. Uzaktan bir fırının taze ekmek kokusu geliyordu.\nBu parçada ağırlıklı olarak hangi anlatım biçimi kullanılmıştır?', o: ['Açıklama', 'Tartışma', 'Betimleme', 'Öyküleme', 'Karşılaştırma'], a: 2, ex: 'Renk (bembeyaz, gri), koku (ekmek), görüntü (ayak izi): bir **resim** çiziliyor → **betimleme**.' },
      { q: 'Aşağıdaki cümlelerin hangisinde **anlatım bozukluğu** vardır?', o: ['Sınavdan önce iyi bir uyku çekmelisin.', 'Kesinlikle yarın gelebilirim.', 'Annem bu yemeği çok sever.', 'Kardeşimle birlikte parka gittik.', 'Her sabah erkenden kalkar.'], a: 1, ex: '“Kesinlikle” kesinlik, “gelebilirim” olasılık bildirir: **anlamca çelişen** sözcükler.' },
      { q: 'Ünlü edebiyatçı T. S. Eliot’a göre iyi şiir, toplumun tüm kesimlerine seslenen şiirdir.\nBu cümlede hangi düşünceyi geliştirme yolu kullanılmıştır?', o: ['Tanımlama', 'Tanık gösterme', 'Sayısal veri', 'Benzetme', 'Örneklendirme'], a: 1, ex: 'Ünlü birinin görüşüne başvurmak = **tanık gösterme**.' },
    ],
    flash: [
      ['Öznel yargıyı ne ele verir?', '**Değerlendirme** kelimeleri: güzel, benzersiz, etkileyici, bence'],
      ['Betimleme nedir?', 'Bir yeri/kişiyi **resim gibi**, duyularla anlatmak'],
      ['Öyküleme nedir?', 'Olay anlatımı: **kişi-yer-zaman-olay**'],
      ['Tanık gösterme?', 'Ünlü birinin **sözüne/görüşüne** başvurmak'],
      ['“Yaklaşık on kadar” neden bozuk?', '**Gereksiz sözcük**: yaklaşık = kadar'],
    ],
  },

  // ───────────────────────── 9. GÜN ─────────────────────────
  {
    id: 'tr9', s: 'turkce', day: 9, min: 14,
    title: 'Son gün: paragraf provası ve zaman planı',
    why: 'sınav günü için hazırlık',
    cards: [
      {
        h: 'Türkçe’de zaman planın',
        b: '130 dakikada 120 soru var. Türkçe için hedefin **yaklaşık 40 dakika**.\n- Dil bilgisi ve kısa sorular: **30-40 saniye**. Bilmiyorsan hemen geç.\n- Paragraf: **1-1,5 dakika**.\n- Sözel mantık grubu: **6-8 dakika**; tabloyu kurduysan 4 soruyu birlikte çöz.',
        viz: { type: 'bars', items: [['Dil bilgisi', 5, '~5 dk'], ['Sözcük-cümle', 4, '~4 dk'], ['Paragraf', 22, '~22 dk'], ['Sözel mantık', 8, '~8 dk']], c: 'tr' },
      },
      {
        h: 'Sınav anında 5 kural',
        b: '- **Olumsuz kökü** yuvarlak içine al.\n- Parçayı okurken ana düşünceyi **tek cümleyle** kenara not et.\n- İki şık arasında kaldıysan: **parçanın tamamını** kapsayanı seç.\n- Bir soruda 2 dakikayı geçtiysen **işaretle, geç, sonra dön**.\n- Optik formu **her sayfanın sonunda** doldur; sona bırakma.',
        note: { h: 'Unutma', t: 'Türkçe senin güçlü dersin. Burada acele edip hata yapmak, bilmediğin bir tarih sorusundan daha pahalıya patlar.' },
      },
      {
        h: 'Son prova',
        b: 'Şimdi karışık paragraf soruları çözeceğiz. Her soruda öğrendiğin tekniklerden birini kullan: **kök oku → ama/oysa ara → şıkları süz**.',
      },
    ],
    quiz: [
      { q: 'Bir çocuk bisiklet sürmeyi, kitaptaki talimatları okuyarak öğrenemez. Düşe kalka, dizlerini birkaç kez yaralayarak öğrenir. Yazmak da böyledir: Yazarlık kurslarında öğretilen kurallar bir yere kadar işe yarar; insanı yazar yapan asıl şey, sayfalarca yazıp silmek, yeniden yazmaktır.\nBu parçada asıl anlatılmak istenen nedir?', o: ['Bisiklet sürmek tehlikelidir.', 'Yazarlık kursları gereksizdir.', 'Yazarlık, ancak sürekli deneyerek ve yazarak gelişir.', 'Çocuklar kitap okumaz.', 'Kurallar her zaman işe yarar.'], a: 2, ex: 'Bisiklet bir **benzetme**; asıl mesaj yazarlıkla ilgili: **yazarak** öğrenilir. B “çok geniş” (parça kursların “bir yere kadar” işe yaradığını söylüyor).' },
      { q: 'Müzeler artık yalnızca eski eşyaların sergilendiği sessiz binalar değil. Pek çok müze; atölyeler, konserler, çocuk etkinlikleri düzenleyerek insanları yeniden kapısına çağırıyor. Hatta bazıları gece geç saatlere kadar açık kalıyor.\nBu parçaya göre müzelerle ilgili aşağıdakilerden hangisi **söylenemez**?', o: ['İşlevlerini genişletmektedirler.', 'Farklı etkinliklerle ziyaretçi çekmeye çalışmaktadırlar.', 'Bazıları gece de açıktır.', 'Ziyaretçi sayıları azalmaya devam etmektedir.', 'Çocuklara yönelik etkinlikler düzenlemektedirler.'], a: 3, ex: 'Parçada ziyaretçi sayısının **azaldığına** dair bir bilgi yok; tersine insanları çağırdıklarından söz ediliyor.', tip: 'Söylenemez = parçada olmayan veya parçayla çelişen.' },
      { q: 'Kimi insanlar yeni bir şehre gittiklerinde önce en ünlü yerleri gezer, fotoğraf çeker ve dönerler. Kimileri ise bir kafede saatlerce oturur, gelip geçenleri izler, sokak aralarında kaybolmayı sever. ---- \nBu parçanın sonuna düşüncenin akışına göre hangisi getirilmelidir?', o: ['Fotoğraf makineleri giderek küçülüyor.', 'Kafeler turistlerle doluyor.', 'Kısacası, gezmek herkes için aynı anlamı taşımaz.', 'Ünlü yerler her zaman kalabalıktır.', 'Şehirler gece daha güzeldir.'], a: 2, ex: 'Parça iki farklı gezgin tipini karşılaştırıyor. Sona **özetleyen** cümle gelir: “Kısacası…” ile başlayan C.' },
      { q: 'Başarılı insanların hikâyelerini dinlerken genellikle sadece varılan noktayı görürüz. Oysa o noktaya giden yolda yapılan yüzlerce hata, vazgeçmeye yaklaşılan geceler anlatılmaz. Bu yüzden başarının kolay ve hızlı geldiği yanılgısına kapılırız.\nBu parçadan hangisine **ulaşılabilir**?', o: ['Başarılı insanlar hiç hata yapmaz.', 'Başarının arkasındaki zorlukların görünmemesi, yanlış bir başarı algısı oluşturur.', 'Başarı hikâyeleri gerçek değildir.', 'Herkes başarılı olabilir.', 'Hata yapmak başarıyı engeller.'], a: 1, ex: '“Oysa” ve “bu yüzden” zincirini izle: zorluklar anlatılmaz → başarının kolay geldiği **yanılgısı** oluşur.' },
      { q: 'Bir ağaç ne kadar yükseğe uzanmak istiyorsa kökleri de o kadar derine inmek zorundadır. İnsan için de durum farklı değildir.\nBu parçada anlatılmak istenen hangisidir?', o: ['Ağaçlar insanlara benzer.', 'Büyük hedeflere ulaşmak için sağlam bir temel gerekir.', 'Uzun ağaçlar daha yaşlıdır.', 'Kökler görünmez.', 'İnsanlar doğayı korumalıdır.'], a: 1, ex: 'Yükseklik = hedef, kök = temel. Benzetmeyi insana çevir: **büyük hedef = sağlam temel**.' },
    ],
    flash: [
      ['Türkçe için hedef süre?', '**~40 dakika**'],
      ['Bir soruda 2 dakikayı geçtiysen?', '**İşaretle, geç, sonra dön**'],
      ['İki şık arasında kaldıysan?', 'Parçanın **tamamını** kapsayanı seç'],
      ['Optik formu ne zaman doldurursun?', '**Her sayfanın sonunda**'],
    ],
  },
];
