// MATEMATİK — 30 soru. Temeli sıfır olan biri için 9 günde gerçekçi hedef: 8-10 net.
// Seçim mantığı: her yıl gelen işlem soruları + şıklardan çözülebilen problemler + grafik + kural takip (sayısal mantık).
// Geometri ve ağır cebir bilerek dışarıda bırakıldı.

export default [
  // ───────────────────────── 1. GÜN ─────────────────────────
  {
    id: 'mat1', s: 'matematik', day: 1, min: 12,
    title: 'İşlem sırası ve negatif sayılar',
    why: 'her yıl 4 “işlemin sonucu kaçtır?” sorusu',
    cards: [
      {
        h: 'Matematikte hedefimiz',
        b: 'Özgür, matematikte her şeyi öğrenmeye çalışmayacağız. 30 sorunun içinden **senin çözebileceğin 8-10 soruyu** seçip onlara odaklanacağız. İlk durak: sınavın başında hep gelen “**işleminin sonucu kaçtır?**” soruları. Bunlar tamamen **kural**dır; kuralı bilen yapar.',
        viz: { type: 'bars', items: [['İşlem soruları', 4, '~4 soru'], ['Problemler', 8, '~8 soru'], ['Grafik-tablo', 2, '~2 soru'], ['Sayısal mantık', 4, '~3-4 soru'], ['Diğer + geometri', 12, '~12 soru']], c: 'mat', caption: 'Mor ve turuncu çubuklar bizim hedefimiz; son satırı sınavda atlayacağız.' },
      },
      {
        h: 'İşlem sırası: kim önce?',
        b: 'Bir işlemde her şey aynı anda yapılmaz. Sıra şöyledir:',
        viz: { type: 'flow', items: ['**1. Parantez** ( ) içi', '**2. Üs** (kare, küp)', '**3. Çarpma ve bölme** (soldan sağa, hangisi önce gelirse)', '**4. Toplama ve çıkarma** (soldan sağa)'] },
        mn: { code: 'PÜ-ÇB-TÇ', t: '“**P**astacı **Ü**lkü **Ç**ok **B**örek **T**atlı **Ç**ıkarır.” Parantez, Üs, Çarpma-Bölme, Toplama-Çıkarma.' },
      },
      {
        k: 'steps', h: 'Adım adım çözelim: 12 − 3 × (4 − 6) ÷ 2',
        steps: [
          { t: 'Önce **parantez**: 4 − 6 = −2', m: '12 − 3 × (−2) ÷ 2' },
          { t: 'Sonra **çarpma** (soldan ilk o geliyor): 3 × (−2) = −6', m: '12 − (−6) ÷ 2' },
          { t: 'Sonra **bölme**: (−6) ÷ 2 = −3', m: '12 − (−3)' },
          { t: 'Eksi ile eksi yan yana gelince **artı** olur: 12 + 3', m: '= 15' },
        ],
      },
      {
        h: 'Negatif sayılar: sayı doğrusunda yürü',
        b: 'Sayı doğrusunu bir yol gibi düşün. **Artı** ile sağa, **eksi** ile sola yürürsün.',
        viz: { type: 'numberline', from: -6, to: 6, marks: [{ v: -3, t: '−3 (başla)', c: 'ink' }, { v: 2, t: '2 (vardın)', c: 'cog' }], jumps: [{ from: -3, to: 2, t: '+5' }], caption: '−3 + 5 = 2: −3’ten başla, 5 adım sağa yürü.' },
      },
      {
        h: 'Çarpmada işaret kuralı',
        viz: { type: 'table', s: 'matematik', head: ['İşaretler', 'Sonuç', 'Örnek'], rows: [['(+) × (+)', '**+**', '3 × 4 = 12'], ['(−) × (−)', '**+**', '(−3) × (−4) = 12'], ['(+) × (−)', '**−**', '3 × (−4) = −12'], ['(−) × (+)', '**−**', '(−3) × 4 = −12']] },
        mn: { code: 'AYNI = + · FARKLI = −', t: 'İşaretler **aynıysa** sonuç artı, **farklıysa** eksi. Bölmede de aynı kural geçerli.' },
      },
      {
        k: 'check',
        q: '20 − 4 × 3 işleminin sonucu kaçtır?',
        o: ['48', '8', '12', '−8'],
        a: 1,
        ex: 'Önce çarpma: 4 × 3 = 12. Sonra 20 − 12 = **8**. (Soldan yapıp 16 × 3 = 48 bulmak en sık yapılan hatadır.)',
      },
    ],
    quiz: [
      { q: '18 − 6 ÷ 3 × 2 işleminin sonucu kaçtır?', o: ['8', '10', '14', '16', '24'], a: 2, ex: 'Çarpma ve bölme soldan sağa: 6 ÷ 3 = 2, 2 × 2 = 4. Sonra 18 − 4 = **14**.', tip: 'PÜ-ÇB-TÇ: önce çarpma/bölme.' },
      { q: '(−3) × (−4) − 5 işleminin sonucu kaçtır?', o: ['−17', '−7', '7', '12', '17'], a: 2, ex: '(−3) × (−4) = +12 (aynı işaret). 12 − 5 = **7**.' },
      { q: '2 × (5 − 8) + 10 işleminin sonucu kaçtır?', o: ['−16', '−4', '4', '6', '16'], a: 2, ex: 'Parantez: 5 − 8 = −3. Çarpma: 2 × (−3) = −6. Toplama: −6 + 10 = **4**.' },
      { q: '−7 + 3 − (−2) işleminin sonucu kaçtır?', o: ['−12', '−8', '−2', '2', '8'], a: 2, ex: '−7 + 3 = −4. Eksi eksi = artı: −4 + 2 = **−2**.' },
      { q: '3² + 4 × 2 işleminin sonucu kaçtır?', o: ['14', '17', '22', '26', '50'], a: 1, ex: 'Üs önce: 3² = 9. Sonra çarpma: 4 × 2 = 8. 9 + 8 = **17**.' },
      { q: '100 ÷ (10 − 5) ÷ 2 işleminin sonucu kaçtır?', o: ['10', '20', '40', '5', '1'], a: 0, ex: 'Parantez: 5. Sonra soldan sağa: 100 ÷ 5 = 20, 20 ÷ 2 = **10**.' },
    ],
    flash: [
      ['İşlem sırası kodlaması?', '**PÜ-ÇB-TÇ**: Parantez, Üs, Çarpma-Bölme, Toplama-Çıkarma'],
      ['(−) × (−) = ?', '**+** (aynı işaretler artı verir)'],
      ['(+) × (−) = ?', '**−** (farklı işaretler eksi verir)'],
      ['−3 + 5 = ?', '**2** (−3’ten 5 adım sağa)'],
      ['12 − (−3) = ?', '**15** (eksi eksi artı)'],
    ],
  },

  // ───────────────────────── 2. GÜN ─────────────────────────
  {
    id: 'mat2', s: 'matematik', day: 2, min: 13,
    title: 'Kesirler ve ondalık sayılar: pizza yöntemi',
    why: 'işlem sorularının yarısı kesirli',
    cards: [
      {
        h: 'Kesir bir pizzadır',
        b: '**3/4** demek: pizza **4** eşit dilime bölünmüş, bunların **3**’ü senin. Alttaki sayı (**payda**) dilim sayısı, üstteki (**pay**) aldığın dilim.',
        viz: { type: 'fraction', items: [[1, 2, '1/2'], [3, 4, '3/4'], [2, 3, '2/3']] },
      },
      {
        h: 'Toplama: önce dilimleri eşitle',
        b: 'Yarım pizza ile üçte bir pizzayı toplamak için iki pizzayı da **aynı sayıda** dilime bölmelisin. 2 ve 3’ün ortak katı **6**.',
        vizs: [
          { type: 'fraction', items: [[1, 2, '1/2'], [1, 3, '1/3']], op: '+' },
          { type: 'fraction', items: [[3, 6, '3/6'], [2, 6, '2/6']], op: '+', caption: '1/2 = 3/6 ve 1/3 = 2/6 → toplam **5/6**' },
        ],
        mn: { code: 'PAYDA EŞİTLE, PAYI TOPLA', t: 'Toplama ve çıkarmada paydalar aynı olmalı. Paydayı eşitlemek için kesrin üstünü ve altını **aynı sayıyla** çarp.' },
      },
      {
        h: 'Çarpma ve bölme: daha kolay!',
        viz: { type: 'cards', items: [
          ['Çarpma', '**Üst × üst, alt × alt.** 2/3 × 3/5 = 6/15 = **2/5** (sadeleştir: 3’e böl)', 'mat'],
          ['Bölme', '**İkinciyi ters çevir, çarp.** 3/4 ÷ 1/2 = 3/4 × 2/1 = **6/4 = 3/2**', 'ink'],
          ['Sadeleştirme', 'Üstü ve altı **aynı sayıya** böl: 6/15 → (÷3) → 2/5', 'teal'],
          ['Tam sayı', 'Her tam sayının altında 1 vardır: 2 = 2/1', 'gray'],
        ] },
      },
      {
        h: 'Ondalık sayıları kesre çevir',
        b: 'Virgülden sonra **kaç basamak** varsa, alta 1 yazıp yanına **o kadar 0** koy:',
        viz: { type: 'table', s: 'matematik', head: ['Ondalık', 'Kesir', 'Sade hâli'], rows: [['0,5', '5/10', '**1/2**'], ['0,25', '25/100', '**1/4**'], ['0,4', '4/10', '**2/5**'], ['0,75', '75/100', '**3/4**'], ['0,08', '8/100', '**2/25**']] },
        note: { h: 'Bölmede sihirli hile', t: '0,6 ÷ 0,03 gibi işlemlerde **virgülleri aynı sayıda sağa kaydır** ki ikisi de tam sayı olsun: 0,6 → 60, 0,03 → 3. Sonuç: 60 ÷ 3 = **20**.', exam: true },
      },
      {
        k: 'steps', h: 'Karışık örnek: 1 − 0,25 + 1/2',
        steps: [
          { t: '0,25’i kesre çevir: 1/4', m: '1 − 1/4 + 1/2' },
          { t: 'Hepsini dörtte bire çevir: 1 = 4/4, 1/2 = 2/4', m: '4/4 − 1/4 + 2/4' },
          { t: 'Paylar üzerinden işlem: 4 − 1 + 2 = 5', m: '= 5/4' },
        ],
      },
      {
        k: 'check',
        q: '2/3 × 3/4 işleminin sonucu kaçtır?',
        o: ['5/7', '1/2', '6/7', '8/9'],
        a: 1,
        ex: 'Üst × üst: 2 × 3 = 6. Alt × alt: 3 × 4 = 12. 6/12 = **1/2**.',
      },
    ],
    quiz: [
      { q: '1/2 + 1/4 işleminin sonucu kaçtır?', o: ['1/6', '2/6', '2/4', '3/4', '1'], a: 3, ex: '1/2 = 2/4. 2/4 + 1/4 = **3/4**. (1/6 yazmak, paydaları toplamak demektir: yanlış!)', tip: 'Paydaları asla toplama; eşitle.' },
      { q: '2/3 − 1/6 işleminin sonucu kaçtır?', o: ['1/3', '1/2', '1/6', '1/9', '5/6'], a: 1, ex: '2/3 = 4/6. 4/6 − 1/6 = 3/6 = **1/2**.' },
      { q: '3/4 × 8/9 işleminin sonucu kaçtır?', o: ['2/3', '11/13', '3/2', '1/3', '8/3'], a: 0, ex: '24/36. Üstü ve altı 12’ye böl: **2/3**.' },
      { q: '2/5 ÷ 4/15 işleminin sonucu kaçtır?', o: ['8/75', '2/3', '6/5', '3/2', '1/2'], a: 3, ex: 'İkinciyi ters çevir: 2/5 × 15/4 = 30/20 = **3/2**.' },
      { q: '0,6 ÷ 0,03 işleminin sonucu kaçtır?', o: ['0,2', '2', '18', '20', '200'], a: 3, ex: 'Virgülleri 2 basamak kaydır: 60 ÷ 3 = **20**.', tip: 'Bölmede her iki sayının virgülünü aynı miktar kaydır.' },
      { q: '1 − 0,25 + 1/2 işleminin sonucu kaçtır?', o: ['1/4', '3/4', '1', '5/4', '7/4'], a: 3, ex: '1 − 1/4 = 3/4. 3/4 + 2/4 = **5/4**.' },
    ],
    flash: [
      ['Kesirlerde toplama kuralı?', 'Önce **paydaları eşitle**, sonra payları topla'],
      ['Kesirlerde çarpma?', '**Üst × üst, alt × alt**'],
      ['Kesirlerde bölme?', '**İkinciyi ters çevir, çarp**'],
      ['0,25 = ?', '**1/4**'],
      ['0,75 = ?', '**3/4**'],
      ['0,6 ÷ 0,03 nasıl yapılır?', 'Virgülleri kaydır: 60 ÷ 3 = **20**'],
    ],
  },

  // ───────────────────────── 3. GÜN ─────────────────────────
  {
    id: 'mat3', s: 'matematik', day: 3, min: 13,
    title: 'Sayı problemleri: Türkçeyi matematiğe çevir',
    why: '2-3 soru + şıklardan deneme taktiği',
    cards: [
      {
        h: 'Problem, Türkçe yazılmış bir denklemdir',
        b: 'Sen Türkçede iyisin. Problemleri de bir **çeviri** işi gibi düşün. Her kalıbın matematikteki karşılığını bil, gerisi kolay:',
        viz: { type: 'table', s: 'matematik', head: ['Türkçe', 'Matematik'], rows: [['Bir sayı', '**x**'], ['Sayının 3 katı', '**3x**'], ['5 fazlası', '**+ 5**'], ['5 eksiği', '**− 5**'], ['Yarısı', '**x/2**'], ['Üçte biri', '**x/3**'], ['Ardışık iki sayı', '**x, x+1**'], ['Ardışık iki çift/tek sayı', '**x, x+2**'], ['… -dir / eder', '**=**']] },
      },
      {
        h: 'Denklem bir terazidir',
        b: 'Eşittir işaretinin iki tarafı **dengede** durur. Bir tarafa ne yaparsan diğerine de aynısını yaparsın.',
        viz: { type: 'balance', left: '3x + 5', right: '26', note: 'Soldan 5 çıkarırsan sağdan da 5 çıkar' },
      },
      {
        k: 'steps', h: '“Bir sayının 3 katının 5 fazlası 26’dır. Sayı kaçtır?”',
        steps: [
          { t: 'Çevir: sayı = x, 3 katı = 3x, 5 fazlası = +5', m: '3x + 5 = 26' },
          { t: 'Terazinin iki tarafından 5 çıkar', m: '3x = 21' },
          { t: 'İki tarafı 3’e böl', m: 'x = 7' },
          { t: '**Kontrol et:** 7’nin 3 katı 21, 5 fazlası 26 ✓' },
        ],
      },
      {
        h: 'Süper taktik: şıklardan deneme',
        b: 'Denklem kuramıyor musun? Sorun yok. **Şıkları tek tek soruya yerleştir.** Hangisi tutuyorsa cevap odur.\nÖSYM’de sayısal şıklar **küçükten büyüğe** dizilir. **C şıkkından başla**: sonuç büyük çıkarsa A-B’ye, küçük çıkarsa D-E’ye geç. En fazla 2-3 denemede bulursun.',
        viz: { type: 'flow', items: ['Soru: “3 katının 5 fazlası 26” · şıklar: A) 5  B) 6  C) 7  D) 8  E) 9', '**C) 7 dene:** 3 × 7 + 5 = 26 ✓', 'Cevap C. Denklem kurmadan buldun!'] },
        mn: { code: 'C’DEN BAŞLA', t: 'Ortadan başla; sonuç büyükse yukarı (A-B), küçükse aşağı (D-E).' },
        note: { h: 'Sınavda', t: 'Şıklardan deneme **yaş, sayı, işçi, para** problemlerinin çoğunda işe yarar. Bu taktik tek başına sana 2-4 net kazandırabilir.', exam: true },
      },
      {
        k: 'check',
        q: 'Bir sayının 2 katının 4 eksiği 16’dır. Sayı kaçtır? (Şıklardan dene!)',
        o: ['6', '8', '10', '12'],
        a: 2,
        ex: '10 dene: 2 × 10 − 4 = 16 ✓. Denklemle: 2x − 4 = 16 → 2x = 20 → x = **10**.',
      },
    ],
    quiz: [
      { q: 'Bir sayının 4 katının 3 eksiği 25’tir. Bu sayı kaçtır?', o: ['5', '6', '7', '8', '9'], a: 2, ex: '4x − 3 = 25 → 4x = 28 → x = **7**. Şıklardan: 4 × 7 − 3 = 25 ✓', tip: 'C’den başla.' },
      { q: 'Ardışık üç tek sayının toplamı 45’tir. Bu sayıların en büyüğü kaçtır?', o: ['13', '15', '17', '19', '21'], a: 2, ex: 'x + (x+2) + (x+4) = 45 → 3x + 6 = 45 → x = 13. Sayılar 13, 15, 17 → en büyük **17**. Kısa yol: ortanca = 45 ÷ 3 = 15, en büyük 15 + 2 = 17.' },
      { q: '34 kişilik bir sınıfta kızların sayısı erkeklerin sayısından 6 fazladır. Sınıfta kaç kız vardır?', o: ['14', '16', '18', '20', '22'], a: 3, ex: 'Erkek = e, kız = e + 6. e + e + 6 = 34 → 2e = 28 → e = 14. Kız = **20**. Şıklardan: kız 20 ise erkek 14, toplam 34 ✓' },
      { q: 'Ali’nin parası Veli’nin parasının 3 katıdır. Ali, Veli’ye 20 TL verirse paraları eşit oluyor. Veli’nin parası kaç TL’dir?', o: ['10', '15', '20', '25', '40'], a: 2, ex: 'Şıklardan dene: Veli 20 → Ali 60. Ali 20 verirse 40-40 ✓. Cevap **20**.', tip: 'Para verme problemlerinde şıklardan deneme çok hızlıdır.' },
      { q: 'Bir sayının yarısı ile üçte birinin toplamı 25’tir. Bu sayı kaçtır?', o: ['20', '24', '30', '36', '50'], a: 2, ex: 'Şıklardan: 30 → yarısı 15, üçte biri 10, toplam 25 ✓. Denklemle: x/2 + x/3 = 25 → 5x/6 = 25 → x = **30**.', tip: 'Yarı ve üçte bir istenen sayı 6’nın katı olmalı: 24, 30, 36 adaylar.' },
    ],
    flash: [
      ['“Bir sayının 3 katının 5 fazlası” nasıl yazılır?', '**3x + 5**'],
      ['Ardışık iki tek sayı nasıl yazılır?', '**x, x + 2**'],
      ['Şıklardan denemeye nereden başlarsın?', '**C şıkkından** (ortadan)'],
      ['Denklemde altın kural?', 'Terazi: bir tarafa ne yaparsan **diğerine de** yap'],
    ],
  },

  // ───────────────────────── 4. GÜN ─────────────────────────
  {
    id: 'mat4', s: 'matematik', day: 4, min: 12,
    title: 'Yaş problemleri: iki kural, bir tablo',
    why: 'hemen her yıl 1 soru',
    cards: [
      {
        h: 'Sadece iki kural',
        viz: { type: 'cards', items: [
          ['Kural 1', 'İki kişinin **yaş farkı hiç değişmez**. Bugün 30 fark varsa, 20 yıl sonra da 30 fark vardır.', 'mat'],
          ['Kural 2', '**n yıl sonra herkes n yaş büyür.** 3 kişinin yaşları toplamı n yıl sonra **3n** artar.', 'ink'],
        ] },
      },
      {
        h: 'Tabloyla düşün',
        b: 'Her yaş problemi için küçük bir tablo çiz: satırlarda kişiler, sütunlarda zaman.',
        viz: { type: 'table', s: 'matematik', head: ['Kişi', 'Bugün', '5 yıl sonra'], rows: [['Kız', '**k**', 'k + 5'], ['Anne', '**4k**', '4k + 5']] },
      },
      {
        k: 'steps', h: '“Annenin yaşı kızının 4 katıdır. 5 yıl sonra annenin yaşı kızının 3 katı olacak. Kız bugün kaç yaşında?”',
        steps: [
          { t: 'Tablodan: 5 yıl sonra anne = 4k + 5, kız = k + 5' },
          { t: 'Anne, kızın 3 katı olacak', m: '4k + 5 = 3 × (k + 5)' },
          { t: 'Sağ tarafı aç', m: '4k + 5 = 3k + 15' },
          { t: 'k’leri bir tarafa, sayıları diğer tarafa topla', m: 'k = 10' },
          { t: '**Şıklardan deneme yolu:** kız 10 → anne 40. 5 yıl sonra 15 ve 45. 45 = 3 × 15 ✓' },
        ],
        note: { h: 'Sınavda', t: 'Yaş sorularında şıklardan deneme neredeyse her zaman çalışır. Şıktaki yaşı yerleştir, tabloyu doldur, koşul tutuyor mu bak.', exam: true },
      },
      {
        k: 'check',
        q: 'İki kardeşin yaşları toplamı 30, farkı 4’tür. Büyük kardeş kaç yaşındadır?',
        o: ['13', '15', '17', '19'],
        a: 2,
        ex: 'Kısa yol: (toplam + fark) ÷ 2 = büyük. (30 + 4) ÷ 2 = **17**. Küçük 13. Kontrol: 17 + 13 = 30, 17 − 13 = 4 ✓',
      },
    ],
    quiz: [
      { q: 'Bir baba 36, oğlu 8 yaşındadır. Kaç yıl sonra babanın yaşı oğlunun yaşının 3 katı olur?', o: ['6', '8', '10', '12', '14'], a: 0, ex: '36 + x = 3(8 + x) → 36 + x = 24 + 3x → x = **6**. Kontrol: 6 yıl sonra 42 ve 14; 42 = 3 × 14 ✓', tip: 'Şıklardan: x = 6 → 42 ve 14 ✓' },
      { q: 'İki kardeşin yaşları toplamı 30, farkı 4’tür. Büyük kardeş kaç yaşındadır?', o: ['11', '13', '15', '17', '19'], a: 3, ex: '(30 + 4) ÷ 2 = **17**.' },
      { q: 'Üç kardeşin bugünkü yaşları toplamı 60’tır. 4 yıl sonra yaşları toplamı kaç olur?', o: ['62', '64', '68', '72', '80'], a: 3, ex: 'Her biri 4 yaş büyür: 3 × 4 = 12. 60 + 12 = **72**. (64 bulmak en sık yapılan hata.)', tip: 'Kural 2: kişi sayısı × yıl.' },
      { q: 'Ayşe 5 yıl önce 12 yaşındaydı. Ayşe 3 yıl sonra kaç yaşında olacak?', o: ['17', '20', '21', '23', '25'], a: 1, ex: 'Bugün 12 + 5 = 17. 3 yıl sonra 17 + 3 = **20**.' },
      { q: 'Bir anne 32, çocuğu 4 yaşındadır. Kaç yıl sonra annenin yaşı çocuğunun yaşının 5 katı olur?', o: ['1', '2', '3', '4', '6'], a: 2, ex: '32 + x = 5(4 + x) → 32 + x = 20 + 5x → 12 = 4x → x = **3**. Kontrol: 35 ve 7; 35 = 5 × 7 ✓' },
    ],
    flash: [
      ['Yaş probleminde değişmeyen şey?', 'İki kişinin **yaş farkı**'],
      ['3 kişinin yaş toplamı 5 yıl sonra ne kadar artar?', '**15** (3 × 5)'],
      ['Toplam ve farktan büyüğü bulma formülü?', '**(toplam + fark) ÷ 2**'],
      ['Yaş sorularında en hızlı yol?', '**Şıklardan deneme** + tablo'],
    ],
  },

  // ───────────────────────── 5. GÜN ─────────────────────────
  {
    id: 'mat5', s: 'matematik', day: 5, min: 13,
    title: 'Yüzde, zam-indirim, kâr ve orantı: 100 lira modeli',
    why: '2-3 soru',
    cards: [
      {
        h: 'Yüzde = 100 üzerinden',
        b: '**%20** demek: her **100**’de **20**. Yüzde hesaplarında en kolay yol, fiyatı **100 lira** kabul edip düşünmektir.',
        viz: { type: 'pie', items: [['20 (yani %20)', 20], ['Geri kalan 80', 80]], colors: ['ink', 'gray'], center: '100' },
      },
      {
        h: 'Kafadan yüzde hesaplama hileleri',
        viz: { type: 'table', s: 'matematik', head: ['Yüzde', 'Nasıl?', '250’nin …'], rows: [['%10', 'Virgülü bir sola kaydır (10’a böl)', '**25**'], ['%20', '%10’un 2 katı', '**50**'], ['%5', '%10’un yarısı', '**12,5**'], ['%25', 'Dörde böl', '**62,5**'], ['%50', 'Yarısı', '**125**']] },
      },
      {
        h: 'Zam ve indirim: çarpan yöntemi',
        viz: { type: 'cards', items: [
          ['%20 zam', 'Fiyatı **1,20** ile çarp (100 → 120)', 'cog'],
          ['%25 indirim', 'Fiyatı **0,75** ile çarp (100 → 75)', 'tar'],
          ['%10 zam + %10 indirim', '100 → 110 → **99**. Eski fiyata dönmez!', 'orange'],
          ['Kâr', 'Maliyeti 100 kabul et. %30 kârla satış = **130**', 'mat'],
        ] },
        note: { h: 'Tuzak', t: '“%20 zam yapılıp sonra %20 indirim yapılırsa fiyat değişmez” **yanlıştır**. 100 → 120 → 96. İndirim daha büyük bir sayıdan hesaplanır.', exam: true },
      },
      {
        k: 'steps', h: '“%25 indirimle 150 TL’ye satılan ürünün indirimsiz fiyatı kaçtır?”',
        steps: [
          { t: '100 lira modeli: 100’lük ürün %25 indirimle **75** olur.' },
          { t: 'Bizde 75’e karşılık gelen fiyat 150. Yani her şey **2 katı**.', m: '75 → 150 (× 2)' },
          { t: 'O hâlde 100 de 2 katı olur', m: 'İndirimsiz fiyat = 200 TL' },
        ],
      },
      {
        h: 'Oran-orantı: aynı yöne mi, ters yöne mi?',
        viz: { type: 'compare', cols: [
          { h: 'Doğru orantı (ikisi birlikte artar)', c: 'cog', items: ['Daha çok ekmek → daha çok para', '3 ekmek 30 TL ise 5 ekmek **50 TL**', 'Çapraz çarp: 3/30 = 5/x'] },
          { h: 'Ters orantı (biri artarsa diğeri azalır)', c: 'tar', items: ['Daha çok işçi → daha az gün', '4 işçi 12 günde bitirirse 6 işçi **8 günde**', 'Çarp-böl: 4 × 12 = 48, 48 ÷ 6 = 8'] },
        ] },
      },
      {
        k: 'check',
        q: '300’ün %20’si kaçtır?',
        o: ['30', '60', '90', '150'],
        a: 1,
        ex: '%10 = 30 (virgül kaydır). %20 = 2 × 30 = **60**.',
      },
    ],
    quiz: [
      { q: '480’in %25’i kaçtır?', o: ['96', '100', '120', '140', '160'], a: 2, ex: '%25 = dörtte bir. 480 ÷ 4 = **120**.' },
      { q: 'Fiyatı 200 TL olan bir ürüne %15 zam yapılıyor. Ürünün yeni fiyatı kaç TL olur?', o: ['210', '215', '220', '230', '250'], a: 3, ex: '%10 = 20, %5 = 10 → %15 = 30. 200 + 30 = **230**.' },
      { q: '%20 indirimle 320 TL’ye satılan bir ürünün indirimsiz fiyatı kaç TL’dir?', o: ['380', '384', '400', '420', '440'], a: 2, ex: '100 → 80. 80 ↔ 320, yani 4 katı. 100 × 4 = **400**.', tip: '384 = 320’ye %20 eklemek; bu tuzak şık.' },
      { q: 'Maliyeti 80 TL olan bir ürün %25 kârla satılıyor. Satış fiyatı kaç TL’dir?', o: ['85', '90', '100', '105', '120'], a: 2, ex: '80’in %25’i = 20. 80 + 20 = **100**.' },
      { q: '4 işçi bir işi 12 günde bitiriyor. Aynı hızda çalışan 6 işçi bu işi kaç günde bitirir?', o: ['6', '8', '9', '10', '18'], a: 1, ex: 'Ters orantı: toplam iş = 4 × 12 = 48 işçi-gün. 48 ÷ 6 = **8** gün.', tip: 'Daha çok işçi → daha az gün. 18 gibi büyük sayılar mantıksız.' },
      { q: '100 TL’lik bir ürüne önce %10 zam, sonra %10 indirim yapılıyor. Son fiyat kaç TL olur?', o: ['90', '99', '100', '101', '110'], a: 1, ex: '100 → 110 → 110’un %10’u 11 → 110 − 11 = **99**.' },
    ],
    flash: [
      ['%10 kafadan nasıl bulunur?', 'Virgülü **bir basamak sola** kaydır'],
      ['%25 = ?', '**Dörtte bir**'],
      ['%20 zam çarpanı?', '**1,20**'],
      ['%25 indirim çarpanı?', '**0,75**'],
      ['%10 zam sonra %10 indirim, 100 TL → ?', '**99 TL**'],
      ['İşçi-gün hangi orantı?', '**Ters orantı** (çarp-böl)'],
    ],
  },

  // ───────────────────────── 6. GÜN ─────────────────────────
  {
    id: 'mat6', s: 'matematik', day: 6, min: 12,
    title: 'Tablo ve grafik okuma: yorumla gelen netler',
    why: 'her yıl 2 soru',
    cards: [
      {
        h: 'Bu konu yoruma dayanır',
        b: 'Grafik soruları neredeyse hiç formül istemez; **dikkatli okuma** ister. Sen yorum yapabildiğin için buradan net çıkarman çok kolay.\nÜç kural:\n- **Başlığı ve birimi** oku (adet mi, bin mi, yüzde mi?).\n- Soru **hangi veriyi** istiyor, sadece ona odaklan.\n- İki grafik varsa ilkinde **sayı**, ikincisinde **yüzde** olabilir; karıştırma.',
      },
      {
        h: 'Sütun grafiği',
        b: 'Bir kırtasiyenin 4 günlük defter satışı:',
        viz: { type: 'bars', items: [['Pazartesi', 30], ['Salı', 45], ['Çarşamba', 25], ['Perşembe', 50]], c: 'mat', caption: 'Toplam 150 defter · ortalama 150 ÷ 4 = 37,5' },
        note: { h: 'Sık sorulanlar', t: '**Toplam** (hepsini topla) · **ortalama** (toplamı gün sayısına böl) · **en çok ile en az arasındaki fark** (50 − 25 = 25) · **oran** (50 ÷ 25 = 2 kat)' },
      },
      {
        h: 'Daire grafiği: 360 derece = %100',
        b: 'Bir ailenin 20.000 TL’lik aylık bütçesi:',
        viz: { type: 'pie', items: [['Kira %40', 40], ['Gıda %25', 25], ['Diğer %20', 20], ['Ulaşım %15', 15]], colors: ['ink', 'mat', 'gray', 'teal'] },
        mn: { code: '%10 = 36°', t: 'Daire 360°’dir. **%10 = 36°**, %25 = 90°, %50 = 180°. Gıda: 20.000’in %25’i = **5.000 TL**.' },
      },
      {
        k: 'steps', h: 'İki grafikli soru (2020 tarzı)',
        b: 'Bir fabrikada 1. ay üretimi: A 3000, B 2000, C 1000 adet. 2. ay toplam üretim 9000 ve dağılım: A %50, B %30, C %20.\nSoru: İki ayda toplam kaç C üretildi?',
        steps: [
          { t: '1. aydaki C sayısı grafikte doğrudan yazıyor', m: 'C₁ = 1000' },
          { t: '2. ayda C’nin payı %20. 9000’in %20’si', m: 'C₂ = 9000 × 0,20 = 1800' },
          { t: 'Topla', m: '1000 + 1800 = 2800' },
        ],
      },
      {
        k: 'check',
        q: 'Yukarıdaki bütçede ulaşımın payı (%15) daire grafiğinde kaç derecelik alan kaplar?',
        o: ['15°', '36°', '54°', '90°'],
        a: 2,
        ex: '%10 = 36°, %5 = 18° → %15 = 36 + 18 = **54°**.',
      },
    ],
    quiz: [
      { q: 'Bir kırtasiyenin günlük defter satışları grafikte verilmiştir. Dört günde toplam kaç defter satılmıştır?', viz: { type: 'bars', items: [['Pazartesi', 30], ['Salı', 45], ['Çarşamba', 25], ['Perşembe', 50]], c: 'mat' }, o: ['120', '140', '150', '160', '175'], a: 2, ex: '30 + 45 + 25 + 50 = **150**.' },
      { q: 'Bir kırtasiyenin günlük defter satışları grafikte verilmiştir. Buna göre en çok satış yapılan gün ile en az satış yapılan gün arasındaki fark kaçtır?', viz: { type: 'bars', items: [['Pazartesi', 30], ['Salı', 45], ['Çarşamba', 25], ['Perşembe', 50]], c: 'mat' }, o: ['5', '15', '20', '25', '30'], a: 3, ex: 'En çok 50 (Perşembe), en az 25 (Çarşamba). 50 − 25 = **25**.' },
      { q: 'Aylık geliri 20.000 TL olan bir ailenin bütçe dağılımı grafikte verilmiştir. Bu aile kiraya kaç TL ayırmaktadır?', viz: { type: 'pie', items: [['Kira %40', 40], ['Gıda %25', 25], ['Diğer %20', 20], ['Ulaşım %15', 15]], colors: ['ink', 'mat', 'gray', 'teal'] }, o: ['5.000', '6.000', '8.000', '9.000', '12.000'], a: 2, ex: '20.000’in %40’ı: %10 = 2.000 → %40 = **8.000**.' },
      { q: 'Bir ailenin bütçe dağılımı daire grafiğinde verilmiştir. Ulaşıma ayrılan dilim kaç derecedir?', viz: { type: 'pie', items: [['Kira %40', 40], ['Gıda %25', 25], ['Diğer %20', 20], ['Ulaşım %15', 15]], colors: ['ink', 'mat', 'gray', 'teal'] }, o: ['15', '36', '45', '54', '60'], a: 3, ex: '%15 → 360 × 0,15 = **54°**.' },
      { q: 'Bir fabrikada 1. ay A 3000, B 2000, C 1000 adet üretilmiştir. 2. ayda toplam 9000 ürün üretilmiş ve bunun %50’si A, %30’u B, %20’si C olmuştur.\nİki ayda toplam kaç C ürünü üretilmiştir?', o: ['2.000', '2.800', '3.000', '3.200', '3.600'], a: 1, ex: '2. ay C = 9000 × %20 = 1800. Toplam 1000 + 1800 = **2800**.', tip: 'Hangi grafik sayı, hangisi yüzde? Önce bunu ayır.' },
    ],
    flash: [
      ['Grafik sorusunda ilk iş?', '**Başlığı ve birimi** okumak'],
      ['Daire grafiğinde %10 kaç derece?', '**36°**'],
      ['%25 kaç derece?', '**90°**'],
      ['Ortalama nasıl bulunur?', '**Toplam ÷ adet**'],
    ],
  },

  // ───────────────────────── 7. GÜN ─────────────────────────
  {
    id: 'mat7', s: 'matematik', day: 7, min: 12,
    title: 'Sayısal mantık: kuralı oku, uygula',
    why: '3-4 soru, bilgi istemez',
    cards: [
      {
        h: 'Bu sorular sana kuralı kendisi öğretir',
        b: 'Matematik testinin sonlarında uzun metinli sorular gelir: “**… sayıya uyumlu sayı denir**”, “**artıl sayı**” gibi. Korkutucu görünür ama aslında **yeni bir oyunun kurallarını** anlatırlar. Formül bilmene gerek yok; **dikkatli okuyup kuralı uygularsın**.\nBu tam sana göre: yorum becerisiyle matematik neti.',
      },
      {
        h: 'Tanımlı işlemler',
        b: 'Soru yeni bir işaret uydurur ve ne yaptığını söyler. Sen sadece **harflerin yerine sayıları koyarsın**.',
        viz: { type: 'flow', items: ['Kural: **a ◆ b = 2a + b**', 'Soru: 3 ◆ 4 = ?', 'a = 3, b = 4 yerleştir: 2 × 3 + 4', '**= 10**'] },
        mn: { code: 'HARF YERİNE SAYI', t: 'a’yı gördüğün yere birinci sayıyı, b’yi gördüğün yere ikinci sayıyı yaz. Bitti.' },
      },
      {
        k: 'steps', h: '2020 tarzı: “uyumlu sayı”',
        b: 'Kural: Bir doğal sayının **rakamları toplamı**, **basamak sayısına** eşitse bu sayıya **uyumlu sayı** denir.\nSoru: İki basamaklı kaç tane uyumlu sayı vardır?',
        steps: [
          { t: 'İki basamaklı → basamak sayısı 2 → rakamlar toplamı **2** olmalı.' },
          { t: 'Rakamları toplamı 2 olan iki basamaklı sayıları yaz: ilk rakam 0 olamaz.', m: '11, 20' },
          { t: 'Say', m: '2 tane' },
          { t: 'Aynı mantıkla dört basamaklı olanları sorsaydı: rakamlar toplamı 4 olacaktı. Liste yapıp saymak yeterli.' },
        ],
      },
      {
        h: 'Örüntüler: aradaki farkı bul',
        viz: { type: 'cards', items: [
          ['Sabit ekleme', '3, 7, 11, 15 → her seferinde **+4** → 19', 'mat'],
          ['Katlama', '2, 6, 18, 54 → her seferinde **×3** → 162', 'ink'],
          ['İki katı artı bir', '3, 7, 15, 31 → **×2 + 1** → 63', 'teal'],
          ['Artan fark', '1, 2, 4, 7, 11 → farklar 1, 2, 3, 4 → **16**', 'violet'],
        ] },
        note: { h: 'Yöntem', t: 'Önce ardışık iki sayı arasındaki **farka** bak. Fark sabit değilse **oranına** (kaç katı) bak. O da değilse farkların farkına bak.' },
      },
      {
        k: 'check',
        q: '2, 5, 11, 23, ? örüntüsünde soru işareti yerine ne gelir?',
        o: ['35', '44', '46', '47'],
        a: 3,
        ex: 'Her sayı: öncekinin **2 katı + 1**. 2→5→11→23→**47**.',
      },
    ],
    quiz: [
      { q: 'a ◆ b = a · b − a biçiminde tanımlanıyor.\nBuna göre 4 ◆ 5 kaçtır?', o: ['16', '18', '20', '24', '25'], a: 0, ex: 'a = 4, b = 5: 4 × 5 − 4 = 20 − 4 = **16**.' },
      { q: '3, 7, 15, 31, ? örüntüsünde soru işareti yerine hangi sayı gelmelidir?', o: ['47', '55', '62', '63', '64'], a: 3, ex: '×2 + 1: 31 × 2 + 1 = **63**. (Farklar 4, 8, 16, 32 diye de bulunur.)' },
      { q: 'Rakamları toplamı 3 olan iki basamaklı kaç doğal sayı vardır?', o: ['2', '3', '4', '5', '6'], a: 1, ex: 'Liste yap: **12, 21, 30** → 3 tane. (03 iki basamaklı değildir.)', tip: 'İlk rakamı 1’den başlatıp sırayla yaz, hiçbirini atlama.' },
      { q: 'Bir sayı çiftse yarısı, tekse 3 katının 1 fazlası alınıyor. 6 sayısına bu işlem art arda 3 kez uygulanırsa hangi sayı elde edilir?', o: ['3', '5', '8', '10', '16'], a: 1, ex: '6 (çift) → 3. 3 (tek) → 3 × 3 + 1 = 10. 10 (çift) → **5**.' },
      { q: 'Bir makineye giren sayı önce 2 ile çarpılıyor, sonra 3 çıkarılıyor. 5 sayısı bu makineden art arda iki kez geçirilirse hangi sayı elde edilir?', o: ['9', '11', '13', '15', '17'], a: 1, ex: '1. geçiş: 5 × 2 − 3 = 7. 2. geçiş: 7 × 2 − 3 = **11**.' },
    ],
    flash: [
      ['Tanımlı işlem sorusunda ne yaparsın?', '**Harflerin yerine sayıları** koyarsın'],
      ['Örüntüde ilk bakılacak şey?', 'Ardışık sayılar arasındaki **fark**'],
      ['3, 7, 15, 31 kuralı?', '**×2 + 1**'],
      ['Sayısal mantık soruları neden sana uygun?', 'Formül değil, **dikkatli okuma** ister'],
    ],
  },

  // ───────────────────────── 8. GÜN ─────────────────────────
  {
    id: 'mat8', s: 'matematik', day: 8, min: 12,
    title: 'Kümeler ve olasılık: şekil çiz, say',
    why: '2-3 soru',
    cards: [
      {
        h: 'Venn şeması: iç içe iki halka',
        b: '40 kişilik bir sınıfta **25** kişi futbol, **20** kişi basketbol oynuyor. **10** kişi ikisini de oynuyor.',
        viz: { type: 'venn', a: 'Futbol (25)', b: 'Basketbol (20)', onlyA: 15, both: 10, onlyB: 10, outside: 5 },
        mn: { code: 'ÖNCE ORTA', t: 'Venn’de her zaman **önce ortayı** (ikisini birden yapanları) yaz. Sonra “sadece”leri bul: 25 − 10 = 15, 20 − 10 = 10.' },
      },
      {
        k: 'steps', h: 'Hiçbirini oynamayan kaç kişi?',
        steps: [
          { t: 'Ortayı yaz: ikisi birden = 10' },
          { t: 'Sadece futbol = 25 − 10', m: '15' },
          { t: 'Sadece basketbol = 20 − 10', m: '10' },
          { t: 'En az birini oynayan = 15 + 10 + 10', m: '35' },
          { t: 'Hiçbiri = 40 − 35', m: '5' },
        ],
        note: { h: 'Formül (istersen)', t: 's(A ∪ B) = s(A) + s(B) − s(A ∩ B) = 25 + 20 − 10 = 35. Ortayı bir kez çıkarıyoruz çünkü iki kez sayılmıştı.' },
      },
      {
        h: 'Olasılık: istediğin ÷ hepsi',
        viz: { type: 'cards', items: [
          ['Formül', '**Olasılık = istenen durum sayısı ÷ tüm durumlar**', 'ink'],
          ['Zar', 'Çift gelme: {2, 4, 6} → 3/6 = **1/2**', 'mat'],
          ['Torba', '3 kırmızı, 5 mavi top → kırmızı çekme: **3/8**', 'tar'],
          ['Para', 'Yazı gelme: **1/2**', 'teal'],
        ] },
      },
      {
        k: 'check',
        q: 'Bir zar atılıyor. Zarın 4’ten büyük gelme olasılığı kaçtır?',
        o: ['1/6', '1/3', '1/2', '2/3'],
        a: 1,
        ex: '4’ten büyük: {5, 6} → 2 durum. Tümü 6. 2/6 = **1/3**.',
      },
    ],
    quiz: [
      { q: '30 kişilik bir grupta 18 kişi çay, 15 kişi kahve içiyor. 7 kişi hem çay hem kahve içiyor. Bu grupta hiçbirini içmeyen kaç kişi vardır?', o: ['3', '4', '5', '6', '7'], a: 1, ex: 'Sadece çay 11, sadece kahve 8, ikisi 7 → 26. 30 − 26 = **4**.', tip: 'Önce orta: 7.' },
      { q: '30 kişilik bir grupta 18 kişi çay, 15 kişi kahve içiyor; 7 kişi hem çay hem kahve içiyor. Bu grupta yalnızca çay içen kaç kişi vardır?', o: ['7', '8', '11', '15', '18'], a: 2, ex: '18 − 7 = **11**. “Yalnızca” kelimesi ortayı çıkarmanı ister.' },
      { q: 'Bir zar atıldığında üst yüze 4’ten büyük bir sayı gelme olasılığı kaçtır?', o: ['1/6', '1/3', '1/2', '2/3', '5/6'], a: 1, ex: '{5, 6} → 2/6 = **1/3**.' },
      { q: 'Bir torbada 4 kırmızı ve 6 beyaz top vardır. Rastgele çekilen bir topun beyaz olma olasılığı kaçtır?', o: ['2/5', '1/2', '3/5', '2/3', '3/4'], a: 2, ex: '6 ÷ 10 = **3/5**.' },
      { q: 'A = {1, 2, 3, 4} ve B = {3, 4, 5} kümeleri veriliyor. A ∩ B kümesinin (ortak elemanların) eleman sayısı kaçtır?', o: ['1', '2', '3', '4', '5'], a: 1, ex: 'Ortak elemanlar {3, 4} → **2**. (∩ = kesişim = ortak; ∪ = birleşim = hepsi.)' },
    ],
    flash: [
      ['Venn şemasında ilk ne yazılır?', '**Ortadaki** (ikisini birden yapanlar)'],
      ['s(A ∪ B) formülü?', '**s(A) + s(B) − s(A ∩ B)**'],
      ['Olasılık formülü?', '**İstenen ÷ tüm durumlar**'],
      ['∩ ve ∪ farkı?', '∩ = **ortak** (kesişim), ∪ = **hepsi** (birleşim)'],
    ],
  },

  // ───────────────────────── 9. GÜN ─────────────────────────
  {
    id: 'mat9', s: 'matematik', day: 9, min: 13,
    title: 'Üslü sayılar, bölünebilme ve sınav stratejisi',
    why: 'hızlı kurallar + hangi soruyu çözeceğin',
    cards: [
      {
        h: 'Üslü sayılar: 4 kural',
        viz: { type: 'table', s: 'matematik', head: ['Kural', 'Örnek'], rows: [['aⁿ = a’yı n kez çarp', '2³ = 2 × 2 × 2 = **8**'], ['Çarparken üsler **toplanır**', '2³ × 2² = 2⁵ = **32**'], ['Her sayının 0. kuvveti **1**’dir', '5⁰ = **1**'], ['Negatif sayının çift kuvveti **pozitif**', '(−2)² = **4**, ama −2² = **−4**']] },
        note: { h: 'Tuzak', t: '**(−3)²** ile **−3²** farklıdır! Parantez varsa eksi de kare alınır: (−3)² = 9. Parantez yoksa sadece 3’ün karesi alınır: −3² = −9.', exam: true },
      },
      {
        h: 'Bölünebilme: 5 kısa kural',
        viz: { type: 'cards', items: [
          ['2 ile', 'Son rakam **çift**', 'mat'],
          ['3 ile', 'Rakamlar toplamı **3’ün katı**', 'ink'],
          ['5 ile', 'Son rakam **0 veya 5**', 'teal'],
          ['9 ile', 'Rakamlar toplamı **9’un katı**', 'violet'],
          ['10 ile', 'Son rakam **0**', 'gray'],
        ] },
      },
      {
        h: 'Sınavda matematik stratejin',
        b: 'Matematik testine **Türkçe ve Genel Kültür’den sonra** geç. Sırayla şunları yap:\n- **İlk 4-6 soru** (işlem soruları): hepsine bak, çoğu kuralla çözülür.\n- **Problemler**: yaş, sayı, yüzde sorularında **şıklardan dene**.\n- **Grafik/tablo** sorularını mutlaka çöz.\n- **Uzun metinli kural soruları** (sayısal mantık): oku ve uygula.\n- **Geometri** (son 4-5 soru, şekilli): **boş bırak**.\nHedef: **8-10 doğru**. Emin olmadığını boş bırakmak, yanlış yapmaktan iyidir.',
        viz: { type: 'flow', items: ['İşlem soruları → çöz', 'Problemler → şıklardan dene', 'Grafik → çöz', 'Kural/mantık → oku, uygula', 'Geometri → **boş bırak**'] },
      },
      {
        k: 'check',
        q: '2³ × 2² işleminin sonucu kaçtır?',
        o: ['10', '16', '32', '64'],
        a: 2,
        ex: 'Tabanlar aynı, üsler toplanır: 2⁵ = **32**. (Kontrol: 8 × 4 = 32.)',
      },
    ],
    quiz: [
      { q: '2³ · 2² işleminin sonucu kaçtır?', o: ['10', '16', '32', '64', '128'], a: 2, ex: '2⁵ = **32**.' },
      { q: '5⁰ + 2⁴ işleminin sonucu kaçtır?', o: ['16', '17', '20', '21', '80'], a: 1, ex: '5⁰ = 1, 2⁴ = 16. 1 + 16 = **17**.', tip: '0. kuvvet her zaman 1 (0 değil!).' },
      { q: 'Aşağıdaki sayılardan hangisi 3 ile tam bölünür?', o: ['1245', '1244', '2021', '1001', '7777'], a: 0, ex: '1 + 2 + 4 + 5 = 12 → 3’ün katı ✓. Diğerleri: 11, 5, 2, 28 → 3’ün katı değil.' },
      { q: 'Dört basamaklı 23A5 sayısı 9 ile tam bölünebildiğine göre A kaçtır?', o: ['0', '4', '6', '8', '9'], a: 3, ex: '2 + 3 + A + 5 = 10 + A. 9’un katı olmalı → 18 → A = **8**.' },
      { q: '(−3)² − 3² işleminin sonucu kaçtır?', o: ['−18', '−9', '0', '9', '18'], a: 2, ex: '(−3)² = 9 ve 3² = 9. 9 − 9 = **0**.' },
    ],
    flash: [
      ['2³ × 2² = ?', '**2⁵ = 32** (üsler toplanır)'],
      ['Her sayının 0. kuvveti?', '**1**'],
      ['(−2)² ile −2² farkı?', '(−2)² = **4**, −2² = **−4**'],
      ['3 ile bölünebilme kuralı?', 'Rakamlar toplamı **3’ün katı**'],
      ['9 ile bölünebilme kuralı?', 'Rakamlar toplamı **9’un katı**'],
      ['Matematikte boş bırakacağın bölüm?', '**Geometri** (son şekilli sorular)'],
    ],
  },
];
