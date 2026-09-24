// COĞRAFYA — 18 soru, tamamı Türkiye coğrafyası. En çok: yer şekilleri (~4), iklim (~2-3), nüfus (~2), ekonomi (~6).
// Haritalar il sınırlarıyla çizilir; ÖSYM harita üzerinde numaralı alan sorar.

export default [
  // ───────────────────────── 1. GÜN ─────────────────────────
  {
    id: 'cog1', s: 'cografya', day: 1, min: 11,
    title: 'Türkiye’nin konumu: matematik ve göreceli konum',
    why: 'her yıl 1-2 soru',
    cards: [
      {
        h: 'Türkiye haritada nerede?',
        b: 'Türkiye **36° ile 42° kuzey paralelleri** ve **26° ile 45° doğu meridyenleri** arasındadır. Yani:\n- **Kuzey yarım küre**deyiz (Ekvator’un kuzeyi).\n- **Doğu yarım küre**deyiz (Greenwich’in doğusu).\n- **Orta kuşakta**yız: dört mevsim belirgin yaşanır.',
        viz: { type: 'map', alt: 'Türkiye’nin uç noktaları', groups: [
          { label: 'En doğu: **Iğdır**', c: 'tar', iller: ['igdir'], show: false },
          { label: 'En batı: **Çanakkale** (Gökçeada)', c: 'blue', iller: ['canakkale'], show: false },
          { label: 'En kuzey: **Sinop** (İnceburun)', c: 'cog', iller: ['sinop'], show: false },
          { label: 'En güney: **Hatay**', c: 'orange', iller: ['hatay'], show: false },
        ], pins: [{ lat: 39.9, lon: 44.0, t: 'Doğu', a: 'end' }, { lat: 40.2, lon: 25.9, t: 'Batı', dy: -16, a: 'middle' }, { lat: 42.0, lon: 35.0, t: 'Kuzey', dy: 30, a: 'middle' }, { lat: 36.0, lon: 36.1, t: 'Güney' }] },
      },
      {
        h: '19 meridyen = 76 dakika',
        b: 'Doğu ile batı ucumuz arasında **45 − 26 = 19 meridyen** vardır. Her meridyen **4 dakika** yerel saat farkı demektir.\n**19 × 4 = 76 dakika.** Yani Güneş, Iğdır’da Gökçeada’dan **76 dakika önce** doğar. Ama ülke genelinde tek bir **ortak saat** (3. saat dilimi, UTC+3) kullanırız.',
        mn: { code: '19 × 4 = 76', t: '“On dokuz meridyen, dörder dakika: yetmiş altı.” Doğu erken uyanır.' },
      },
      {
        h: 'Matematik konum mu, göreceli konum mu?',
        b: 'ÖSYM bu ikisini ayırmanı ister (2020’de sordu). Kural basit:\n- **Matematik konum** = **enlem ve boylamdan** kaynaklanan sonuçlar (iklim kuşağı, mevsimler, güneş ışınlarının açısı, gündüz süresi).\n- **Göreceli (özel) konum** = **yer şekilleri, denizler, komşular, boğazlar** gibi Türkiye’ye özgü özellikler.',
        viz: { type: 'compare', cols: [
          { h: 'Matematik konum sonucu', c: 'blue', items: ['Dört mevsimin belirgin olması', 'Güneş ışınlarının hiçbir zaman **dik** gelmemesi', 'Kuzeye gidildikçe sıcaklığın azalması', 'Güneyden esen rüzgârların sıcak olması', 'Akdeniz iklim kuşağında bulunması'] },
          { h: 'Göreceli konum sonucu', c: 'ink', items: ['Yükseltinin **batıdan doğuya artması**', 'Üç tarafının denizlerle çevrili olması', 'Asya ile Avrupa arasında **köprü** olması', 'Boğazlara sahip olması', 'Dağların kıyıya paralel uzanması'] },
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Hangisi Türkiye’nin göreceli konumuyla ilgilidir?” → **Yükseltinin batıdan doğuya doğru artması**. Diğer şıklar (sıcak güney rüzgârları, mevsimler, Akdeniz iklim alanı) matematik konumdan kaynaklanıyordu.', exam: true },
      },
      {
        k: 'check',
        q: 'Türkiye’de güneş ışınlarının yıl boyunca hiçbir yere dik açıyla düşmemesi hangi konum özelliğinin sonucudur?',
        o: ['Göreceli konum', 'Matematik konum', 'Boğazlar', 'Yükselti'],
        a: 1,
        ex: 'Güneş ışınları sadece dönenceler arasına dik gelir. Türkiye Yengeç Dönencesi’nin kuzeyinde (**enlem** = **matematik konum**) olduğu için dik gelmez.',
      },
      {
        h: 'Yükselti doğuya doğru artar',
        b: 'Batıda denize yakın ovalar, doğuda yüksek platolar ve dağlar vardır. Ortalama yükseltisi en fazla olan bölge **Doğu Anadolu**, en yüksek nokta **Ağrı Dağı (5137 m)**.\nBu yüzden **aynı enlemde** olsa bile doğudaki şehirler batıdakilerden daha soğuktur: Erzurum ile Ankara’yı düşün.',
        viz: { type: 'bars', items: [['Marmara', 1, 'alçak'], ['Ege', 2, ''], ['İç Anadolu', 3, '~1000 m'], ['Doğu Anadolu', 5, '~2000 m']], c: 'cog', caption: 'Batıdan doğuya ortalama yükselti artışı (temsilî)' },
      },
    ],
    quiz: [
      { q: 'Aşağıdaki özelliklerden hangisi Türkiye’nin **göreceli** konumuyla ilgilidir?', o: ['Güneyden esen rüzgârların genellikle sıcak olması', 'Yazın dinamik yüksek basıncın etkili olması', 'Akdeniz makro iklim alanında bulunması', 'Mevsimlerin belirgin olarak yaşanması', 'Yükseltinin batıdan doğuya doğru artması'], a: 4, ex: 'Yükselti **yer şekilleriyle** ilgilidir ve Türkiye’ye özgüdür: **göreceli konum**. Diğerleri enlemin sonucudur. (2020 sorusu.)', tip: 'Enlem/boylam kokan şık matematik; yer şekli, deniz, komşu kokan şık göreceli.' },
      { q: 'Türkiye’nin en doğusu ile en batısı arasındaki yerel saat farkı kaç dakikadır?', o: ['19', '38', '60', '76', '90'], a: 3, ex: '19 meridyen × 4 dk = **76 dakika**.' },
      { q: 'Aşağıdakilerden hangisi Türkiye’nin **matematik** konumunun bir sonucudur?', o: ['Boğazlara sahip olması', 'Üç tarafının denizlerle çevrili olması', 'Dört mevsimin belirgin olarak yaşanması', 'Asya ile Avrupa arasında köprü olması', 'Zengin yer altı kaynaklarına sahip olması'], a: 2, ex: 'Orta kuşakta (enlem) olduğumuz için **dört mevsim** belirgindir.' },
      { q: 'Aynı enlem üzerinde bulunmalarına rağmen Erzurum’un kışları Ankara’dan daha soğuk geçer.\nBunun temel nedeni aşağıdakilerden hangisidir?', o: ['Denize uzaklık', 'Yükselti farkı', 'Bitki örtüsü', 'Nüfus yoğunluğu', 'Tarım alanları'], a: 1, ex: 'Doğuya gidildikçe yükselti artar; Erzurum yaklaşık 1900 m, Ankara yaklaşık 900 m. Yükseldikçe sıcaklık düşer.' },
    ],
    flash: [
      ['Türkiye hangi paraleller ve meridyenler arasında?', '**36°-42° Kuzey**, **26°-45° Doğu**'],
      ['Doğu-batı yerel saat farkı?', '**76 dakika** (19 × 4)'],
      ['Yükseltinin batıdan doğuya artması hangi konum?', '**Göreceli (özel) konum**'],
      ['Dört mevsimin belirgin olması hangi konum?', '**Matematik konum**'],
      ['Türkiye’nin en yüksek noktası?', '**Ağrı Dağı** (5137 m)'],
      ['En doğu ve en batı iller?', 'Doğu **Iğdır**, batı **Çanakkale** (Gökçeada)'],
    ],
  },

  // ───────────────────────── 2. GÜN ─────────────────────────
  {
    id: 'cog2', s: 'cografya', day: 2, min: 12,
    title: 'İklim, bitki örtüsü ve toprak: 3 iklim, 3 renk',
    why: 'her yıl 2-3 soru',
    cards: [
      {
        h: 'Türkiye’de 3 ana iklim',
        viz: { type: 'map', alt: 'Türkiye iklim tipleri', groups: [
          { label: '**Karadeniz iklimi**: her mevsim yağışlı', c: 'cog', iller: ['artvin', 'rize', 'trabzon', 'giresun', 'ordu', 'samsun', 'sinop', 'kastamonu', 'bartin', 'zonguldak', 'duzce'], show: false },
          { label: '**Akdeniz iklimi**: yazı sıcak-kurak, kışı ılık-yağışlı', c: 'orange', iller: ['mugla', 'antalya', 'mersin', 'adana', 'hatay', 'izmir', 'aydin', 'osmaniye'], show: false },
          { label: '**Karasal iklim**: yazı sıcak-kurak, kışı soğuk-karlı', c: 'brown', iller: ['ankara', 'konya', 'eskisehir', 'kirsehir', 'aksaray', 'nigde', 'nevsehir', 'kayseri', 'sivas', 'yozgat', 'kirikkale', 'karaman', 'erzurum', 'kars', 'ardahan', 'van', 'agri', 'mus', 'bitlis', 'hakkari', 'erzincan', 'bayburt', 'bingol', 'tunceli', 'elazig', 'malatya', 'igdir', 'cankiri'], show: false },
        ] },
        mn: { code: 'YEŞİL-TURUNCU-KAHVE', t: 'Karadeniz **yeşil** (orman, yağmur) · Akdeniz **turuncu** (portakal, güneş) · İç kesim **kahverengi** (bozkır, toprak).' },
      },
      {
        h: 'Üç iklimi yan yana karşılaştır',
        viz: { type: 'table', s: 'cografya', head: ['', 'Karadeniz', 'Akdeniz', 'Karasal'], rows: [
          ['Yaz', 'Serin, yağışlı', 'Sıcak, **kurak**', 'Sıcak, kurak'],
          ['Kış', 'Ilık, yağışlı', 'Ilık, **yağışlı**', 'Soğuk, **karlı**'],
          ['En çok yağış', '**Sonbahar**', '**Kış**', '**İlkbahar**'],
          ['Bitki örtüsü', '**Orman** (geniş + iğne yapraklı)', '**Maki**', '**Bozkır** (step)'],
          ['Toprak', '**Podzol**', '**Kırmızı toprak** (terra rossa)', 'Kahverengi bozkır toprağı'],
        ] },
        note: { h: 'Rekorlar', t: 'En çok yağış alan il: **Rize**. En az yağış alan yer: **Tuz Gölü** çevresi (İç Anadolu). Yağışın en az olduğu bölge **İç Anadolu**.' },
      },
      {
        h: 'Yağış neden farklı?',
        viz: { type: 'cards', items: [
          ['Yamaç (orografik) yağış', 'Nemli hava **dağa çarpar**, yükselir ve yağmur olur. **Karadeniz** kıyıları böyle yağış alır.', 'cog'],
          ['Cephe (frontal) yağışı', 'Sıcak ve soğuk hava kütleleri karşılaşır. **Akdeniz**’de kış yağışları.', 'orange'],
          ['Konveksiyonel (kırkım) yağış', 'Isınan hava yükselir; **İç Anadolu**’da ilkbahar yağışları.', 'brown'],
        ] },
      },
      {
        h: 'Topraklar: iklimin çocuğu',
        b: '- **Podzol:** yağış çok, sıcaklık düşük, orman altında gelişir → **Karadeniz** (Rize). 2020’de soruldu.\n- **Kırmızı toprak (terra rossa):** kalker (kireçtaşı) üzerinde, Akdeniz ikliminde.\n- **Kahverengi bozkır toprağı:** İç Anadolu.\n- **Alüvyal toprak:** akarsuların taşıdığı; **ovalarda ve deltalarda**, en verimli tarım toprağıdır.\n- **Çernozyom (kara toprak):** çok verimli; Kars-Ardahan çevresinde.',
      },
      {
        k: 'check',
        q: 'Yağışın her mevsime dağıldığı ve en çok sonbaharda düştüğü iklim hangisidir?',
        o: ['Akdeniz iklimi', 'Karasal iklim', 'Karadeniz iklimi', 'Step iklimi'],
        a: 2,
        ex: '**Karadeniz iklimi**: her mevsim yağışlı, en çok sonbaharda; bu yüzden ormanlar gür.',
      },
    ],
    quiz: [
      { q: 'Türkiye’de yağışın fazla, sıcaklığın düşük olduğu ve iğne ile geniş yapraklı ormanların bulunduğu yerlerde podzol topraklar görülür.\nBu topraklar aşağıdaki illerin hangisinde daha yaygındır?', o: ['Rize', 'Edirne', 'Çanakkale', 'İzmir', 'Hatay'], a: 0, ex: 'Yağışlı ve ormanlık: **Rize** (Karadeniz). (2020 sorusu.)' },
      { q: 'Yazları sıcak ve kurak, kışları ılık ve yağışlı geçen, doğal bitki örtüsü maki olan iklim hangisidir?', o: ['Karadeniz', 'Akdeniz', 'Karasal', 'Kutup', 'Muson'], a: 1, ex: 'Maki + kuru yaz + ılık kış = **Akdeniz iklimi**.' },
      { q: 'İç Anadolu’da ilkbaharda görülen ve halk arasında “kırkım yağmurları” denilen yağışlar hangi yağış tipine örnektir?', o: ['Yamaç (orografik)', 'Cephe', 'Konveksiyonel', 'Muson', 'Kar'], a: 2, ex: 'Isınan havanın yükselmesiyle oluşan **konveksiyonel** (yükselim) yağışlardır.' },
      { q: 'Aşağıdakilerden hangisi Karasal iklimin özelliklerinden biri **değildir**?', o: ['Kışların soğuk ve karlı geçmesi', 'Yıllık sıcaklık farkının fazla olması', 'Bitki örtüsünün bozkır olması', 'Yağışların en çok sonbaharda düşmesi', 'Yazların sıcak ve kurak geçmesi'], a: 3, ex: 'Sonbahar maksimumu **Karadeniz**’e aittir. Karasal iklimde yağış en çok **ilkbahardadır**.' },
      { q: 'Kalkerli (kireçtaşı) arazilerde, Akdeniz iklimi etkisinde oluşan toprak türü hangisidir?', o: ['Podzol', 'Çernozyom', 'Kırmızı toprak (terra rossa)', 'Alüvyal', 'Tundra'], a: 2, ex: 'Kalker + Akdeniz iklimi = **terra rossa** (kırmızı toprak).' },
    ],
    flash: [
      ['Karadeniz ikliminde en çok yağış hangi mevsim?', '**Sonbahar**'],
      ['Akdeniz ikliminin bitki örtüsü?', '**Maki**'],
      ['Karasal iklimin bitki örtüsü?', '**Bozkır** (step)'],
      ['Podzol toprak nerede?', '**Karadeniz** (Rize), yağışlı ormanlık alan'],
      ['Terra rossa nedir?', 'Kalker üzerinde, Akdeniz’de **kırmızı toprak**'],
      ['En çok yağış alan il?', '**Rize**'],
    ],
  },

  // ───────────────────────── 3. GÜN ─────────────────────────
  {
    id: 'cog3', s: 'cografya', day: 3, min: 13,
    title: 'Dağlar ve ovalar: nasıl oluştular?',
    why: 'yer şekilleri her yıl ~4 soru',
    cards: [
      {
        h: 'Üç tür dağ',
        viz: { type: 'table', s: 'cografya', head: ['Tür', 'Nasıl oluşur?', 'Örnek'], rows: [
          ['**Kıvrım dağı**', 'Yan basınçla katmanlar **bükülür**', '**Kuzey Anadolu Dağları**, **Toroslar**'],
          ['**Kırık dağı (horst)**', 'Yer kabuğu kırılır, bir blok **yükselir** (horst), yanı **çöker** (graben)', 'Ege’de **Bozdağlar, Aydın Dağları**; **Uludağ**, Kaz Dağı'],
          ['**Volkanik dağ**', 'Magma yüzeye çıkar', '**Ağrı, Süphan, Nemrut, Tendürek, Erciyes, Hasan, Karacadağ**; Kula volkanları'],
        ] },
      },
      {
        h: 'Volkanik dağları haritada gör',
        viz: { type: 'map', alt: 'Volkanik dağlar', groups: [], pins: [
          { lat: 39.70, lon: 44.30, t: 'Ağrı', a: 'end', c: 'tar' },
          { lat: 38.93, lon: 42.83, t: 'Süphan', c: 'tar' },
          { lat: 38.65, lon: 42.23, t: 'Nemrut', a: 'end', c: 'tar' },
          { lat: 38.53, lon: 35.45, t: 'Erciyes', c: 'tar' },
          { lat: 38.13, lon: 34.17, t: 'Hasan', a: 'end', c: 'tar' },
          { lat: 37.75, lon: 39.83, t: 'Karacadağ', c: 'tar' },
          { lat: 38.55, lon: 28.65, t: 'Kula', c: 'tar' },
        ] },
        mn: { code: 'AĞRI’DA SÜPHAN NEMRUT OLDU, ERCİYES’TE HASAN KARA KULA’YA KAÇTI', t: 'Ağrı, Süphan, Nemrut, Erciyes, Hasan, Karacadağ, Kula: hepsi volkanik.' },
      },
      {
        h: 'Ege’nin horst-graben düzeni',
        b: 'Ege’de dağlar kıyıya **dik** uzanır. Kırılmayla yükselen yerler **dağ** (horst: Bozdağlar, Aydın Dağları), çöken yerler **ova** (graben: **Gediz, Büyük Menderes, Küçük Menderes** ovaları) olmuştur.\nBu yüzden Ege’de deniz etkisi iç kesimlere kadar sokulur ve **ulaşım kolaydır**.',
        viz: { type: 'flow', items: ['Yer kabuğu kırılır', 'Bir blok yükselir → **HORST = DAĞ**', 'Yanındaki blok çöker → **GRABEN = OVA**'] },
      },
      {
        h: 'Ovaların oluşumu: 3 yol',
        viz: { type: 'cards', items: [
          ['Delta ovası (akarsu)', 'Akarsu taşıdığı malzemeyi denize döküldüğü yerde biriktirir: **Bafra** (Kızılırmak), **Çarşamba** (Yeşilırmak), **Çukurova** (Seyhan-Ceyhan), **Silifke** (Göksu), **Menemen** (Gediz)', 'cog'],
          ['Tektonik ova (çöküntü)', 'Yer kabuğunun çökmesiyle: Ege’deki graben ovaları, **Muş, Erzincan, Malatya**', 'blue'],
          ['Karstik ova (polye)', 'Kireçtaşının erimesiyle: **Elmalı** (Antalya), **Muğla**, Tefenni, Acıpayam', 'violet'],
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Çarşamba, Elmalı, Menemen, Silifke, Çukurova ovalarından hangisinin oluşumu farklıdır? → **Elmalı** (karstik). Diğerleri delta.', exam: true },
      },
      {
        h: 'Deltaları haritada gör',
        viz: { type: 'map', alt: 'Delta ovaları', groups: [{ label: 'Delta ovalarının bulunduğu iller', c: 'cog', iller: ['samsun', 'adana', 'mersin', 'izmir'], show: false }], pins: [
          { lat: 41.62, lon: 35.9, t: 'Bafra', a: 'end', dy: 26 },
          { lat: 41.2, lon: 36.72, t: 'Çarşamba', dy: 26 },
          { lat: 36.85, lon: 35.35, t: 'Çukurova', dy: -12 },
          { lat: 36.35, lon: 33.95, t: 'Silifke', a: 'end' },
          { lat: 38.6, lon: 26.95, t: 'Menemen', a: 'end' },
        ] },
      },
      {
        k: 'check',
        q: 'Aşağıdakilerden hangisi volkanik bir dağdır?',
        o: ['Uludağ', 'Erciyes', 'Toroslar', 'Bozdağlar'],
        a: 1,
        ex: '**Erciyes** (Kayseri) volkaniktir. Uludağ ve Bozdağlar kırık, Toroslar kıvrım dağıdır.',
      },
    ],
    quiz: [
      { q: 'Aşağıdaki ovalardan hangisinin oluşumunda etkili olan faktör diğerlerinden **farklıdır**?', o: ['Çarşamba Ovası', 'Elmalı Ovası', 'Menemen Ovası', 'Silifke Ovası', 'Çukurova'], a: 1, ex: '**Elmalı** kireçtaşının erimesiyle oluşan karstik ovadır (polye). Diğerleri akarsuların oluşturduğu **delta** ovalarıdır. (2020 sorusu.)' },
      { q: 'Aşağıdaki dağlardan hangisi kıvrılma sonucu oluşmuştur?', o: ['Ağrı Dağı', 'Erciyes Dağı', 'Toroslar', 'Hasan Dağı', 'Nemrut Dağı'], a: 2, ex: '**Toroslar** ve Kuzey Anadolu Dağları kıvrım dağlarıdır. Diğerleri volkanik.' },
      { q: 'Ege Bölgesi’nde dağların kıyıya dik uzanması ve aralarında çöküntü ovalarının bulunması, bölgede hangi tür yer şekillerinin yaygın olduğunu gösterir?', o: ['Kıvrım dağları ve deltalar', 'Horst ve graben', 'Volkanik dağlar ve krater gölleri', 'Karstik şekiller', 'Buzul şekilleri'], a: 1, ex: 'Yükselen bloklar **horst** (dağ), çöken bloklar **graben** (ova).' },
      { q: 'Kızılırmak’ın Karadeniz’e döküldüğü yerde oluşturduğu delta ovası hangisidir?', o: ['Çarşamba', 'Bafra', 'Çukurova', 'Silifke', 'Menemen'], a: 1, ex: 'Kızılırmak → **Bafra**. Yeşilırmak → Çarşamba. İkisi de Samsun’da; karıştırma: “**K**ızıl-**B**afra, **Y**eşil-**Ç**arşamba.”', tip: 'Kızıl Bafra, Yeşil Çarşamba.' },
      { q: 'Aşağıdakilerden hangisi volkanik bir dağ **değildir**?', o: ['Süphan', 'Tendürek', 'Uludağ', 'Karacadağ', 'Hasan'], a: 2, ex: '**Uludağ** kırılma ile yükselmiş bir horsttur.' },
    ],
    flash: [
      ['Kıvrım dağlarına örnek?', '**Kuzey Anadolu Dağları**, **Toroslar**'],
      ['Horst ve graben?', 'Horst = yükselen blok (**dağ**), graben = çöken blok (**ova**)'],
      ['Volkanik dağlar kodlaması?', 'Ağrı, Süphan, Nemrut, Erciyes, Hasan, Karacadağ, Kula'],
      ['Kızılırmak’ın deltası?', '**Bafra**'],
      ['Yeşilırmak’ın deltası?', '**Çarşamba**'],
      ['Elmalı Ovası nasıl oluştu?', '**Karstik** (polye, kireçtaşının erimesi)'],
    ],
  },

  // ───────────────────────── 4. GÜN ─────────────────────────
  {
    id: 'cog4', s: 'cografya', day: 4, min: 13,
    title: 'Göller, akarsular ve kıyılar',
    why: 'yer şekilleri ~4 soru',
    cards: [
      {
        h: 'Göller oluşumlarına göre',
        viz: { type: 'table', s: 'cografya', head: ['Tür', 'Nasıl?', 'Örnek'], rows: [
          ['**Tektonik**', 'Yer kabuğunun çöktüğü çukurda', '**Tuz Gölü, İznik, Sapanca, Eğirdir, Burdur, Hazar**'],
          ['**Volkanik set**', 'Lavlar önünü kapatır', '**Van Gölü** (Nemrut’un lavları)'],
          ['**Krater / maar**', 'Yanardağ ağzında', '**Nemrut** krater gölü, **Acıgöl Maarı** (Nevşehir)'],
          ['**Heyelan set**', 'Toprak kayması vadiyi kapatır', '**Tortum**, Sera, Yedigöller'],
          ['**Kıyı set (lagün)**', 'Kıyıda kum birikir, deniz parçası ayrılır', '**Bafa**, **Köyceğiz**, **Büyük ve Küçük Çekmece**'],
          ['**Karstik**', 'Kireçtaşının erimesiyle', '**Salda**, Avlan, Kestel'],
        ] },
      },
      {
        h: 'Gölleri haritada gör',
        viz: { type: 'map', alt: 'Türkiye gölleri', groups: [], pins: [
          { lat: 38.6, lon: 42.9, t: 'Van (volkanik set)', a: 'end', c: 'blue' },
          { lat: 38.75, lon: 33.35, t: 'Tuz (tektonik)', c: 'blue' },
          { lat: 40.43, lon: 29.55, t: 'İznik (tektonik)', dy: -14, c: 'blue' },
          { lat: 40.65, lon: 41.65, t: 'Tortum (heyelan)', a: 'end', c: 'orange' },
          { lat: 37.5, lon: 27.5, t: 'Bafa (kıyı set)', c: 'teal' },
          { lat: 37.55, lon: 29.68, t: 'Salda (karstik)', dy: 30, c: 'violet' },
          { lat: 38.0, lon: 30.87, t: 'Eğirdir', c: 'blue' },
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Bafa, Tuz, Tortum ve İznik göllerinden hangileri **tektonik**? → **Tuz ve İznik**. Bafa kıyı set, Tortum heyelan set.', exam: true },
      },
      {
        h: 'Akarsular: nereye dökülürler?',
        viz: { type: 'table', s: 'cografya', head: ['Deniz', 'Akarsular'], rows: [
          ['**Karadeniz**', '**Kızılırmak** (en uzun, 1355 km), **Yeşilırmak, Sakarya, Filyos**, Çoruh'],
          ['**Marmara**', '**Susurluk**, Biga, Gönen'],
          ['**Ege**', '**Gediz, Büyük Menderes, Küçük Menderes**, Bakırçay, Meriç'],
          ['**Akdeniz**', '**Seyhan, Ceyhan, Göksu**, Asi, Dalaman'],
          ['**Basra Körfezi**', '**Fırat ve Dicle** (en çok su taşıyanlar)'],
          ['**Hazar Denizi**', '**Aras, Kura**'],
        ] },
        mn: { code: 'KIZILIRMAK = EN UZUN, FIRAT = EN BEREKETLİ', t: 'Kızılırmak sınırlarımız içinde doğup denize dökülen en uzun akarsu. Fırat’ta en büyük barajlar (Atatürk, Keban, Karakaya).' },
      },
      {
        h: 'Kıyı tipleri',
        viz: { type: 'cards', items: [
          ['Boyuna kıyı', 'Dağlar kıyıya **paralel**: **Karadeniz ve Akdeniz**. Girinti-çıkıntı az, iç kesime ulaşım zor.', 'cog'],
          ['Enine kıyı', 'Dağlar kıyıya **dik**: **Ege**. Girintili-çıkıntılı, koy ve körfez çok.', 'blue'],
          ['Ria kıyı', 'Akarsu vadilerini deniz basmış: **İstanbul Boğazı, Haliç**.', 'teal'],
          ['Tombolo', 'Adayı karaya bağlayan kum dili: **Kapıdağ Yarımadası**, **Sinop**.', 'orange'],
        ] },
        note: { h: 'Türkiye’de görülmeyen kıyı', t: '**Fiyort** kıyı Türkiye’de **yoktur** (buzulların oyduğu kıyılar; Norveç’te bulunur). 2020’de soruldu.', exam: true },
      },
      {
        h: 'Karstik şekiller: Toroslar’ın kireçtaşı dünyası',
        b: 'Kireçtaşı (kalker), jips ve kaya tuzu gibi kayaçlar suyla **erir**. Bu erimeyle **mağaralar, obruklar, polyeler, lapyalar, traverten** (Pamukkale) oluşur.\nTürkiye’de en yaygın oldukları yer: **Toroslar**, özellikle **Teke ve Taşeli platoları** (Antalya-Mersin arası).',
        viz: { type: 'map', alt: 'Karstik alanlar', groups: [{ label: 'Karstik şekillerin en yaygın olduğu Toroslar (Teke-Taşeli)', c: 'violet', iller: ['antalya', 'mersin', 'karaman', 'burdur', 'isparta'], show: false }], pins: [{ lat: 37.92, lon: 29.12, t: 'Pamukkale (traverten)', a: 'end' }] },
      },
      {
        k: 'check',
        q: 'Van Gölü hangi yolla oluşmuştur?',
        o: ['Tektonik', 'Heyelan set', 'Volkanik set', 'Karstik'],
        a: 2,
        ex: 'Nemrut Dağı’ndan çıkan **lavların** önünü kapatmasıyla oluşan **volkanik set gölü**dür.',
      },
    ],
    quiz: [
      { q: 'I. Bafa Gölü\nII. Tuz Gölü\nIII. Tortum Gölü\nIV. İznik Gölü\nYukarıdaki göllerden hangileri tektonik hareketler sonucu oluşmuştur?', o: ['I ve II', 'I ve III', 'II ve III', 'II ve IV', 'III ve IV'], a: 3, ex: '**Tuz** ve **İznik** tektonik. Bafa kıyı set (alüvyal), Tortum heyelan set. (2020 sorusu.)' },
      { q: 'I. Acıgöl Maarı\nII. Bafra Deltası\nIII. Ergene Ovası\nIV. Kapıdağ Tombolosu\nYukarıdaki yer şekillerinden hangilerinin oluşumunda akarsuların etkisi vardır?', o: ['I ve II', 'I ve III', 'II ve III', 'II ve IV', 'III ve IV'], a: 2, ex: 'Delta ve akarsu ovası (Ergene) → **akarsu**. Maar volkanik, tombolo dalgaların eseri. (2020 sorusu.)' },
      { q: 'Türkiye’de aşağıdaki kıyı tiplerinden hangisi **görülmez**?', o: ['Ria tipi kıyı', 'Boyuna kıyı', 'Enine kıyı', 'Dalmaçya tipi kıyı', 'Fiyortlu kıyı'], a: 4, ex: '**Fiyort**, buzulların oyduğu kıyılardır; Türkiye’de yoktur. (2020 sorusu.)' },
      { q: 'Aşağıdaki akarsulardan hangisi Ege Denizi’ne dökülür?', o: ['Seyhan', 'Susurluk', 'Gediz', 'Yeşilırmak', 'Göksu'], a: 2, ex: '**Gediz** Ege’ye dökülür. Seyhan-Göksu Akdeniz, Susurluk Marmara, Yeşilırmak Karadeniz.' },
      { q: 'Kireçtaşı gibi suda eriyebilen kayaçların yaygın olduğu, mağara, obruk ve polyelerin sık görüldüğü alan hangisidir?', o: ['Ergene Havzası', 'Teke ve Taşeli platoları', 'Çukurova', 'Erzurum-Kars Platosu', 'Doğu Karadeniz kıyıları'], a: 1, ex: 'Toroslar’daki **Teke ve Taşeli** platoları karstik şekillerin en yaygın olduğu yerdir.' },
    ],
    flash: [
      ['Tektonik göllere örnek?', '**Tuz, İznik, Sapanca, Eğirdir, Burdur, Hazar**'],
      ['Van Gölü’nün oluşumu?', '**Volkanik set** (Nemrut lavları)'],
      ['Tortum Gölü?', '**Heyelan set**'],
      ['Bafa ve Köyceğiz?', '**Kıyı set** (lagün)'],
      ['Türkiye’de görülmeyen kıyı tipi?', '**Fiyort**'],
      ['En uzun akarsuyumuz?', '**Kızılırmak**'],
      ['Karstik şekillerin en yaygın olduğu yer?', 'Toroslar: **Teke ve Taşeli**'],
    ],
  },

  // ───────────────────────── 5. GÜN ─────────────────────────
  {
    id: 'cog5', s: 'cografya', day: 5, min: 12,
    title: 'Nüfus, göç ve yerleşme',
    why: 'her yıl ~2 soru',
    cards: [
      {
        h: 'Türkiye nüfusu nereye gidiyor?',
        b: 'Türkiye’nin nüfusu **85 milyonu** geçti ama artış **yavaşlıyor**. Sınavda en çok sorulan eğilimler:',
        viz: { type: 'compare', cols: [
          { h: 'Artıyor ↑', c: 'tar', items: ['**Ortanca yaş** (toplum yaşlanıyor)', '**Yaşlı nüfus oranı** (65 yaş üstü)', 'Şehirde yaşayanların oranı', 'Ortalama yaşam süresi'] },
          { h: 'Azalıyor ↓', c: 'blue', items: ['**Nüfus artış hızı**', '**Doğurganlık** (kadın başına çocuk)', '**Genç nüfus oranı**', 'Kırsalda yaşayanların oranı'] },
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Yakın gelecekte beklenenler: “Nüfus artış hızı azalacak” ve “**ortanca yaş yükselecek**”. Genç nüfus artacak, yaşlı nüfus azalacak şıkları **yanlış**.', exam: true },
      },
      {
        h: 'Nüfus nerede yoğun?',
        viz: { type: 'map', alt: 'Nüfus yoğunluğu', groups: [
          { label: 'Yoğun: sanayi, ticaret, kıyı ve verimli ovalar', c: 'ink', iller: ['istanbul', 'kocaeli', 'izmir', 'bursa', 'ankara', 'antalya', 'adana', 'gaziantep', 'yalova'], show: false },
          { label: 'Seyrek: yüksek, engebeli, sert iklim', c: 'gray', iller: ['tunceli', 'ardahan', 'bayburt', 'hakkari', 'erzincan', 'gumushane', 'kars'], show: false },
        ] },
        b: '- Yoğunluğu **en fazla**: **İstanbul** (sonra Kocaeli). **En az**: **Tunceli**.\n- Nüfusu artıran etkenler: **sanayi, ticaret, ılıman iklim, düz ve verimli arazi, ulaşım kolaylığı**.\n- Nüfusu azaltan etkenler: **yükselti, engebe, sert iklim, kurak ve verimsiz toprak**.',
      },
      {
        h: 'İç göç: doğudan batıya',
        b: 'Türkiye’de iç göç genel olarak **doğudan batıya**, **kırdan kente** doğrudur. ÖSYM 2020’de nedenlerini sordu:\n- **Sanayileşme** ve iş imkânı batıda fazla ✓\n- **İklim şartları** batıda daha elverişli ✓\n- **Yer altı kaynakları** ise göçün yönünü belirlemez ✗\nGöçün sonuçları: şehirlerde **gecekondu**, altyapı sorunu, kırsalda yaşlı nüfus.',
      },
      {
        h: 'Kırsal yerleşme adları',
        b: 'Yerleşme adları sık sorulur. Hepsinin bir **işi** var:',
        viz: { type: 'table', s: 'cografya', head: ['Ad', 'Nerede / ne işe yarar?'], rows: [
          ['**Yayla**', 'Yazın hayvanlarla çıkılan yüksek yer (Karadeniz, Toroslar)'],
          ['**Kom, dam**', '**Hayvancılık** için kurulan geçici yerleşme (Doğu Anadolu)'],
          ['**Mezra**', 'Köye bağlı, birkaç evlik küçük yerleşme (Doğu, Güneydoğu)'],
          ['**Oba**', 'Konar-göçerlerin (Yörük) çadırlı yerleşmesi'],
          ['**Divan**', 'Birkaç köyün birleştiği yönetim birimi (Kastamonu)'],
          ['**Çiftlik**', 'Geniş tarım arazisindeki yerleşme (Çukurova, Ege)'],
          ['**Dalyan**', '**Balıkçılık** için kurulan yerleşme'],
        ] },
        note: { h: '2020 sorusu', t: '“Dam ve kom” adıyla bilinen kırsal yerleşmelerde hâkim faaliyet? → **Hayvancılık**.', exam: true },
      },
      {
        k: 'check',
        q: 'Türkiye’de nüfus yoğunluğunun en az olduğu il hangisidir?',
        o: ['Hakkari', 'Tunceli', 'Ardahan', 'Bayburt'],
        a: 1,
        ex: '**Tunceli**: yüksek, engebeli ve sert iklimli. En fazla ise İstanbul.',
      },
    ],
    quiz: [
      { q: 'Türkiye nüfusunun yakın geleceğiyle ilgili;\nI. Nüfus artış hızı azalacaktır.\nII. Ortanca yaş yükselecektir.\nIII. Genç nüfus oranı artacaktır.\nIV. Yaşlı nüfus oranı azalacaktır.\nyargılarından hangilerinin gerçekleşmesi beklenir?', o: ['I ve II', 'I ve III', 'II ve III', 'II ve IV', 'III ve IV'], a: 0, ex: 'Doğurganlık düşüyor → artış hızı azalıyor, toplum **yaşlanıyor** (ortanca yaş ↑). III ve IV tam tersi. (2020 sorusu.)' },
      { q: 'I. Yer altı kaynakları\nII. Sanayileşme\nIII. İklim şartları\nTürkiye’de iç göçlerin ana hatlarıyla doğudan batıya doğru gerçekleşmesi yukarıdakilerden hangileriyle ilişkilidir?', o: ['Yalnız I', 'Yalnız II', 'Yalnız III', 'I ve II', 'II ve III'], a: 4, ex: 'Batıda **sanayi** ve **elverişli iklim** var. Yer altı kaynakları ise doğuda da bol; göçün yönünü açıklamaz. (2020 sorusu.)' },
      { q: 'Türkiye’de “dam ve kom” adıyla bilinen kırsal yerleşmelerde hâkim ekonomik faaliyet hangisidir?', o: ['Arıcılık', 'Hayvancılık', 'Kültür balıkçılığı', 'Bağ-bahçe tarımı', 'Tahıl tarımı'], a: 1, ex: '**Hayvancılık**. (2020 sorusu.)' },
      { q: 'Aşağıdakilerden hangisi bir yerde nüfusun **seyrek** olmasının nedenlerinden biri **değildir**?', o: ['Yükseltinin fazla olması', 'Arazinin engebeli olması', 'Kışların çok sert geçmesi', 'Sanayi tesislerinin yoğun olması', 'Tarım alanlarının az olması'], a: 3, ex: 'Sanayi nüfusu **artırır**, azaltmaz.' },
      { q: 'Konar-göçer Yörüklerin çadırlardan oluşan geçici yerleşmelerine ne ad verilir?', o: ['Mezra', 'Divan', 'Oba', 'Dalyan', 'Çiftlik'], a: 2, ex: '**Oba** = göçebe çadır yerleşmesi.' },
    ],
    flash: [
      ['Türkiye’de ortanca yaş ne yönde?', '**Artıyor** (toplum yaşlanıyor)'],
      ['Nüfus artış hızı ne yönde?', '**Azalıyor**'],
      ['Nüfus yoğunluğu en fazla ve en az il?', 'En fazla **İstanbul**, en az **Tunceli**'],
      ['İç göç doğudan batıya, neden?', '**Sanayileşme** ve **elverişli iklim**'],
      ['“Kom” ve “dam” nedir?', '**Hayvancılık** için geçici yerleşme'],
      ['Mezra nedir?', 'Köye bağlı **küçük** yerleşme'],
    ],
  },

  // ───────────────────────── 6. GÜN ─────────────────────────
  {
    id: 'cog6', s: 'cografya', day: 6, min: 13,
    title: 'Tarım ve hayvancılık: hangi ürün nerede?',
    why: 'her yıl 1-2 soru',
    cards: [
      {
        h: 'Kural: ürün iklimi sever',
        b: 'Bir ürünün nerede yetiştiğini ezberlemek yerine **ne istediğini** bil:\n- **Çay**: bol yağış + nem → **Rize**\n- **Pamuk**: sıcak + bol güneş + sulama → **Şanlıurfa (GAP), Çukurova, Ege**\n- **Zeytin**: ılık kış (don sevmez) → **Ege, Güney Marmara, Akdeniz**\n- **Buğday**: az yağışa dayanıklı → **İç Anadolu (Konya)**\nİklimini bildiğin ürünün yerini tahmin edersin.',
      },
      {
        h: 'Ürün haritası',
        viz: { type: 'map', alt: 'Tarım ürünleri', groups: [
          { label: '**Çay**: Rize, Artvin, Trabzon', c: 'green', iller: ['rize', 'artvin', 'trabzon'], show: false },
          { label: '**Fındık**: Ordu, Giresun (dünya 1.)', c: 'brown', iller: ['ordu', 'giresun'], show: false },
          { label: '**Pamuk**: Şanlıurfa, Adana, Aydın', c: 'gray', iller: ['sanliurfa', 'adana', 'aydin'], show: false },
          { label: '**Buğday, şeker pancarı**: Konya', c: 'yellow', iller: ['konya'], show: false },
          { label: '**Kayısı**: Malatya · **Antep fıstığı**: Gaziantep · **Haşhaş**: Afyon', c: 'orange', iller: ['malatya', 'gaziantep', 'afyonkarahisar'], show: false },
          { label: '**Muz**: Anamur (Mersin), Alanya (Antalya)', c: 'teal', iller: ['mersin'], show: false },
        ] },
      },
      {
        h: 'Tablo olarak hızlı tekrar',
        viz: { type: 'table', s: 'cografya', head: ['Ürün', 'Nerede?'], rows: [
          ['Çay', 'Doğu Karadeniz (**Rize**)'],
          ['Fındık', '**Ordu, Giresun** (Karadeniz)'],
          ['Pamuk', '**GAP (Şanlıurfa)**, Çukurova, Ege'],
          ['Zeytin', '**Ege** (Aydın, İzmir, Balıkesir), Güney Marmara (Gemlik)'],
          ['Buğday', '**İç Anadolu** (Konya), GAP'],
          ['Tütün', 'Ege (Manisa), Karadeniz (Samsun), Güneydoğu (Adıyaman)'],
          ['Turunçgiller', '**Akdeniz** kıyıları (Mersin, Adana, Antalya, Hatay) + Rize (mikroklima)'],
          ['Çeltik (pirinç)', '**Edirne** (Meriç), **Samsun** (Bafra-Çarşamba), Balıkesir'],
          ['Üzüm', 'Manisa (çekirdeksiz kuru üzüm), Ege; bağcılık her yerde'],
          ['İncir', '**Aydın**'],
        ] },
      },
      {
        h: 'Hayvancılık',
        viz: { type: 'cards', items: [
          ['Büyükbaş (sığır)', '**Kuzeydoğu Anadolu** (Erzurum-Kars-Ardahan): **çayır ve meralar** geniş. Ayrıca Karadeniz ve Marmara’da ahır besiciliği.', 'cog'],
          ['Küçükbaş (koyun)', '**İç Anadolu ve Doğu Anadolu**: bozkır bitki örtüsü.', 'brown'],
          ['Keçi', 'Kıl keçisi **Toroslar**’da; Ankara (tiftik) keçisi Ankara çevresi.', 'gray'],
          ['Arıcılık', '**Ordu** (en çok kovan), **Muğla** (çam balı).', 'yellow'],
          ['İpek böceği', '**Bursa** (dut ağaçları).', 'violet'],
          ['Balıkçılık', '**Karadeniz** (hamsi); en çok balık Karadeniz’den.', 'blue'],
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Kuzeydoğu Anadolu’nun büyükbaş hayvancılıkta önemli olmasının temel nedeni? → **Çayır ve meraların geniş alan kaplaması** (yaz yağışlarıyla gür otlar).', exam: true },
      },
      {
        k: 'check',
        q: 'Türkiye’de fındık üretiminde ilk sıralarda yer alan iller hangileridir?',
        o: ['Rize-Artvin', 'Ordu-Giresun', 'Konya-Karaman', 'Aydın-Muğla'],
        a: 1,
        ex: '**Ordu ve Giresun**. Türkiye dünya fındık üretiminde birincidir.',
      },
    ],
    quiz: [
      { q: 'Kuzeydoğu Anadolu’nun Türkiye’de büyükbaş hayvancılığın önemli alanlarından biri olmasındaki temel neden hangisidir?', o: ['Düzlüklerin yaygın olması', 'Karasal iklimin yaşanması', 'Çayır ve meraların geniş alan kaplaması', 'Et tüketiminin fazla olması', 'Ortalama yükseltinin fazla olması'], a: 2, ex: 'Yaz yağışları gür **çayırlar** oluşturur; büyükbaş hayvanlar bunlarla beslenir. (2020 sorusu.)' },
      { q: 'Aşağıdaki tarım ürünlerinden hangisinin yetişme koşulları, Doğu Karadeniz’in iklim özellikleriyle **bağdaşmaz**?', o: ['Çay', 'Fındık', 'Mısır', 'Pamuk', 'Kivi'], a: 3, ex: '**Pamuk** sıcak, güneşli ve kurak yaz ister; her mevsim yağışlı Doğu Karadeniz’e uymaz.' },
      { q: 'Aşağıdaki eşleştirmelerden hangisi **yanlıştır**?', o: ['Çay – Rize', 'Kayısı – Malatya', 'Antep fıstığı – Gaziantep', 'Haşhaş – Afyonkarahisar', 'Muz – Edirne'], a: 4, ex: 'Muz sıcak ve nemli kıyılarda yetişir: **Anamur ve Alanya**. Edirne çeltik (pirinç) ile bilinir.' },
      { q: 'Türkiye’de en çok bal üretilen ve arıcılığın en yaygın olduğu illerden biri hangisidir?', o: ['Konya', 'Ordu', 'Van', 'Edirne', 'Eskişehir'], a: 1, ex: '**Ordu** (kovan sayısında ilk sıralarda), ayrıca Muğla (çam balı).' },
      { q: 'Zeytin yetiştiriciliği aşağıdaki bölgelerin hangisinde **en az** yaygındır?', o: ['Ege', 'Güney Marmara', 'Akdeniz', 'Doğu Anadolu', 'Güneydoğu Anadolu’nun batısı'], a: 3, ex: 'Zeytin **dona** dayanamaz. Kışları çok sert geçen **Doğu Anadolu** uygun değildir.' },
    ],
    flash: [
      ['Çay nerede?', '**Rize** (Doğu Karadeniz)'],
      ['Fındık nerede?', '**Ordu, Giresun**'],
      ['Pamuk nerede?', '**Şanlıurfa (GAP)**, Çukurova, Ege'],
      ['Kayısı?', '**Malatya**'],
      ['Büyükbaş hayvancılık nerede ve neden?', '**Kuzeydoğu Anadolu**; çayır ve meralar'],
      ['Zeytin neden doğuda yetişmez?', '**Dona** dayanamaz'],
    ],
  },

  // ───────────────────────── 7. GÜN ─────────────────────────
  {
    id: 'cog7', s: 'cografya', day: 7, min: 13,
    title: 'Madenler ve enerji kaynakları',
    why: 'her yıl ~2 soru',
    cards: [
      {
        h: 'Madenler haritası',
        viz: { type: 'map', alt: 'Türkiye maden yatakları', groups: [], pins: [
          { lat: 41.45, lon: 31.8, t: 'Taşkömürü (Zonguldak)', a: 'end', c: 'dark' },
          { lat: 39.28, lon: 30.53, t: 'Bor (Eskişehir)', c: 'violet' },
          { lat: 39.37, lon: 38.12, t: 'Demir (Divriği)', c: 'tar' },
          { lat: 41.28, lon: 42.02, t: 'Bakır (Murgul)', a: 'end', c: 'orange' },
          { lat: 38.45, lon: 39.85, t: 'Krom (Elazığ)', c: 'teal' },
          { lat: 37.42, lon: 31.85, t: 'Boksit (Seydişehir)', a: 'end', c: 'gray' },
          { lat: 38.25, lon: 37.2, t: 'Linyit (Afşin-Elbistan)', a: 'end', c: 'brown' },
          { lat: 37.88, lon: 41.13, t: 'Petrol (Batman)', c: 'dark' },
        ] },
      },
      {
        h: 'Maden – yer eşleştirmesi',
        viz: { type: 'table', s: 'cografya', head: ['Maden', 'Nerede?', 'Kullanım'], rows: [
          ['**Bor**', '**Eskişehir** (Kırka), Balıkesir, Kütahya, Bursa', 'Dünya rezervinin çoğu Türkiye’de'],
          ['**Krom**', '**Elazığ** (Guleman-Alacakaya), Bursa (Orhaneli), Adana (Aladağ), Eskişehir (Mihalıççık), Muğla, Kopdağı', 'Paslanmaz çelik'],
          ['**Demir**', '**Sivas (Divriği)**, Malatya (Hekimhan)', 'Karabük, Ereğli, İskenderun demir-çelik'],
          ['**Bakır**', '**Artvin (Murgul)**, Kastamonu (Küre), Elazığ (Maden)', 'Elektrik kablosu'],
          ['**Boksit**', '**Konya (Seydişehir)**', 'Alüminyum'],
          ['**Taşkömürü**', '**Zonguldak** (neredeyse tek yer)', 'Enerji, demir-çelik'],
          ['**Linyit**', '**Afşin-Elbistan**, Soma, Tunçbilek, Yatağan', 'Termik santral'],
          ['**Petrol**', '**Batman, Adıyaman, Diyarbakır, Şırnak (Gabar)**', 'Güneydoğu'],
        ] },
        mn: { code: 'BORLU ESKİ, KROMLU ELAZIĞ, DEMİRLİ DİVRİĞİ', t: 'Bor-Eskişehir, Krom-Elazığ, Demir-Divriği, Bakır-Murgul, Boksit-Seydişehir, Taşkömürü-Zonguldak.' },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Elazığ-Alacakaya, Bursa-Orhaneli, Adana-Aladağ, Eskişehir-Mihalıççık, Kopdağı yataklarıyla bilinen maden → **Krom**.', exam: true },
      },
      {
        h: 'Enerji kaynakları',
        viz: { type: 'cards', items: [
          ['Hidroelektrik', '**Fırat** üzerinde **Atatürk** (en büyük), Keban, Karakaya; Dicle’de **Ilısu**.', 'blue'],
          ['Jeotermal', '**Denizli** (Sarayköy-Kızıldere, ilk santral) ve **Aydın** (Germencik). Sıcaklığı en yüksek kaynaklar burada.', 'tar'],
          ['Doğal gaz', 'Karadeniz’de **Sakarya Gaz Sahası** (2020’de bulundu, **Filyos** üzerinden üretim); Trakya.', 'teal'],
          ['Nükleer', '**Akkuyu** Nükleer Santrali (**Mersin**, Gülnar).', 'violet'],
          ['Rüzgâr', 'Ege ve Marmara kıyıları (İzmir, Balıkesir, Çanakkale).', 'gray'],
          ['Güneş', 'Güney ve iç kesimler; **Konya-Karapınar** büyük güneş santrali.', 'orange'],
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Jeotermalden elektrik üretim potansiyeli en fazla olan il? → **Denizli**.', exam: true },
      },
      {
        k: 'check',
        q: 'Alüminyumun hammaddesi olan boksit hangi ilçede çıkarılır ve işlenir?',
        o: ['Divriği', 'Seydişehir', 'Murgul', 'Soma'],
        a: 1,
        ex: '**Seydişehir** (Konya). Divriği demir, Murgul bakır, Soma linyit.',
      },
    ],
    quiz: [
      { q: 'Türkiye’nin rezerv bakımından dünyanın önemli ülkelerinden biri olduğu ve Elazığ-Alacakaya, Bursa-Orhaneli, Adana-Aladağ, Eskişehir-Mihalıççık ile Kopdağı’nda önemli yatakları bulunan maden hangisidir?', o: ['Krom', 'Bakır', 'Demir', 'Manganez', 'Boksit'], a: 0, ex: '**Krom**. (2020 sorusu.)' },
      { q: 'Jeotermal kaynaklardaki sıcaklık arttıkça elektrik üretim potansiyeli de artar.\nAşağıdaki illerin hangisinde bu potansiyel daha fazladır?', o: ['Denizli', 'Ankara', 'Konya', 'Yalova', 'Samsun'], a: 0, ex: '**Denizli** (Kızıldere). Yalova’da da kaplıca var ama sıcaklık düşük. (2020 sorusu.)' },
      { q: 'Türkiye’de taşkömürünün çıkarıldığı başlıca il hangisidir?', o: ['Kütahya', 'Zonguldak', 'Manisa', 'Kahramanmaraş', 'Muğla'], a: 1, ex: '**Zonguldak**. Diğerleri **linyit** yataklarıyla bilinir.' },
      { q: 'Aşağıdaki maden-yer eşleştirmelerinden hangisi **yanlıştır**?', o: ['Bor – Eskişehir', 'Demir – Divriği', 'Bakır – Murgul', 'Boksit – Seydişehir', 'Petrol – Zonguldak'], a: 4, ex: 'Petrol **Batman, Adıyaman** gibi Güneydoğu illerindedir. Zonguldak taşkömürüdür.' },
      { q: 'Akkuyu Nükleer Santrali hangi ilimizdedir?', o: ['Sinop', 'Mersin', 'Kırklareli', 'Antalya', 'Adana'], a: 1, ex: '**Mersin** (Gülnar ilçesi).' },
    ],
    flash: [
      ['Bor nerede?', '**Eskişehir** (Kırka), Balıkesir, Kütahya'],
      ['Krom nerede?', '**Elazığ** (Guleman-Alacakaya)'],
      ['Demir nerede?', '**Sivas-Divriği**'],
      ['Bakır nerede?', '**Artvin-Murgul**, Kastamonu-Küre'],
      ['Boksit nerede?', '**Konya-Seydişehir**'],
      ['Taşkömürü nerede?', '**Zonguldak**'],
      ['Jeotermal potansiyeli en yüksek il?', '**Denizli** (ve Aydın)'],
      ['Akkuyu Nükleer Santrali?', '**Mersin**'],
    ],
  },

  // ───────────────────────── 8. GÜN ─────────────────────────
  {
    id: 'cog8', s: 'cografya', day: 8, min: 12,
    title: 'Sanayi, ulaşım, turizm ve kalkınma projeleri',
    why: '2-3 soru',
    cards: [
      {
        h: 'Sanayi: hammaddeye ya da pazara yakın',
        viz: { type: 'table', s: 'cografya', head: ['Tesis', 'Nerede?'], rows: [
          ['Demir-çelik', '**Karabük** (1937, ilk), **Ereğli** (Zonguldak), **İskenderun** (Hatay)'],
          ['Petrol rafinerisi', '**İzmit** (Tüpraş), **Aliağa** (İzmir), **Batman**, **Kırıkkale**'],
          ['İlk şeker fabrikası', '**Uşak** (1926)'],
          ['Otomotiv', '**Bursa, Kocaeli, Sakarya**'],
          ['Alüminyum', '**Seydişehir** (boksite yakın)'],
        ] },
        note: { h: 'Mantık', t: 'Karabük ve Ereğli, **Zonguldak kömürüne** yakın olduğu için demir-çelik fabrikası kurulmuştur. Sanayi en çok **Marmara**’da (İstanbul-Kocaeli) toplanır.' },
      },
      {
        h: 'Ulaşım: büyük projeler',
        viz: { type: 'cards', items: [
          ['Köprüler', '15 Temmuz Şehitler, FSM, **Yavuz Sultan Selim** (İstanbul Boğazı); **Osmangazi** (İzmit Körfezi); **1915 Çanakkale Köprüsü** (2022, dünyanın en uzun orta açıklıklı asma köprüsü).', 'blue'],
          ['Tüneller', '**Marmaray** (2013, denizin altından demiryolu), **Avrasya Tüneli** (2016, karayolu).', 'teal'],
          ['Hızlı tren', 'İlk hat **Ankara-Eskişehir** (2009). Ankara-Konya, Ankara-İstanbul, Ankara-Sivas…', 'ink'],
          ['Havalimanı', '**İstanbul Havalimanı** (2018).', 'gray'],
        ] },
      },
      {
        h: 'Bölgesel kalkınma projeleri',
        b: 'Geri kalmış bölgeleri kalkındırmak için hazırlanır. En ünlüsü **GAP**.',
        viz: { type: 'map', alt: 'Kalkınma projeleri', groups: [
          { label: '**GAP**: Güneydoğu Anadolu Projesi (9 il)', c: 'orange', iller: ['adiyaman', 'batman', 'diyarbakir', 'gaziantep', 'kilis', 'mardin', 'siirt', 'sanliurfa', 'sirnak'], show: false },
          { label: '**DOKAP**: Doğu Karadeniz Projesi', c: 'green', iller: ['artvin', 'bayburt', 'giresun', 'gumushane', 'ordu', 'rize', 'samsun', 'trabzon'], show: false },
          { label: '**KOP**: Konya Ovası Projesi', c: 'yellow', iller: ['konya', 'karaman', 'aksaray', 'nigde'], show: false },
          { label: '**ZBK**: Zonguldak-Bartın-Karabük', c: 'gray', iller: ['zonguldak', 'bartin', 'karabuk'], show: false },
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Gümüşhane, Artvin, **Sinop**, Bayburt, Rize: hangisi Doğu Karadeniz Projesi’nde değil? → **Sinop** (Batı Karadeniz’de).', exam: true },
      },
      {
        h: 'Turizm: doğa + kültür',
        viz: { type: 'table', s: 'cografya', head: ['Tür', 'Örnekler'], rows: [
          ['Kış turizmi', '**Uludağ** (Bursa), **Palandöken** (Erzurum), **Erciyes** (Kayseri), Kartalkaya (Bolu), Sarıkamış (Kars)'],
          ['Termal (kaplıca)', '**Afyon**, **Pamukkale** (Denizli), Yalova, Kızılcahamam'],
          ['Deniz-güneş', '**Antalya** (en çok turist), Muğla (Bodrum, Marmaris), Aydın (Kuşadası)'],
          ['Tarih-kültür', '**Efes** (İzmir-Selçuk), **Truva** (Çanakkale), **Göbeklitepe** (Şanlıurfa), **Kapadokya** (Nevşehir), **Nemrut** (Adıyaman)'],
        ] },
      },
      {
        k: 'check',
        q: 'Karabük ve Ereğli’de demir-çelik fabrikalarının kurulmasının temel nedeni nedir?',
        o: ['Nüfusun fazla olması', 'Zonguldak kömür havzasına yakınlık', 'Turizm potansiyeli', 'Tarım alanlarının genişliği'],
        a: 1,
        ex: 'Demir eritmek için **kömür** gerekir. Zonguldak taşkömürüne yakınlık belirleyici oldu.',
      },
    ],
    quiz: [
      { q: 'Türkiye’de iller ve bölgeler arasındaki gelişmişlik farkını azaltmak için hazırlanan projelerden biri de Doğu Karadeniz Bölgesel Gelişme Projesi’dir (DOKAP).\nAşağıdaki illerden hangisi bu proje kapsamında **bulunmaz**?', o: ['Gümüşhane', 'Artvin', 'Sinop', 'Bayburt', 'Rize'], a: 2, ex: '**Sinop** Batı Karadeniz’dedir. (2020 sorusu.)' },
      { q: 'Aşağıdaki illerden hangisi GAP (Güneydoğu Anadolu Projesi) kapsamında **değildir**?', o: ['Şanlıurfa', 'Batman', 'Kilis', 'Malatya', 'Mardin'], a: 3, ex: 'GAP’ın 9 ili: Adıyaman, Batman, Diyarbakır, Gaziantep, Kilis, Mardin, Siirt, Şanlıurfa, Şırnak. **Malatya** dahil değil.' },
      { q: 'Türkiye’nin ilk demir-çelik fabrikası hangi ilde kurulmuştur?', o: ['Zonguldak', 'Karabük', 'Hatay', 'Sivas', 'Kocaeli'], a: 1, ex: '**Karabük** (1937).' },
      { q: 'Aşağıdakilerden hangisi kış turizmiyle öne çıkan merkezlerden biri **değildir**?', o: ['Uludağ', 'Palandöken', 'Erciyes', 'Kartalkaya', 'Pamukkale'], a: 4, ex: '**Pamukkale** travertenleri ve termal suyuyla bilinir.' },
      { q: 'Avrupa ile Asya’yı denizin altından demiryoluyla bağlayan proje hangisidir?', o: ['Avrasya Tüneli', 'Marmaray', 'Osmangazi Köprüsü', '1915 Çanakkale Köprüsü', 'Yavuz Sultan Selim Köprüsü'], a: 1, ex: '**Marmaray** (2013) demiryoludur. Avrasya Tüneli ise karayolu tünelidir.' },
    ],
    flash: [
      ['İlk demir-çelik fabrikası?', '**Karabük** (1937)'],
      ['İlk şeker fabrikası?', '**Uşak** (1926)'],
      ['GAP kaç il, hangi bölge?', '**9 il**, Güneydoğu Anadolu'],
      ['DOKAP’ta olmayan ünlü tuzak il?', '**Sinop**'],
      ['Denizin altından demiryolu?', '**Marmaray**'],
      ['Dünyanın en uzun orta açıklıklı asma köprüsü?', '**1915 Çanakkale Köprüsü** (2022)'],
    ],
  },

  // ───────────────────────── 9. GÜN ─────────────────────────
  {
    id: 'cog9', s: 'cografya', day: 9, min: 12,
    title: 'Son gün: 7 bölge tek bakışta ve harita provası',
    why: 'genel tekrar',
    cards: [
      {
        h: 'Yedi bölge, yedi kimlik',
        viz: { type: 'table', s: 'cografya', head: ['Bölge', 'Tek cümlelik kimliği'], rows: [
          ['**Marmara**', 'Sanayi, nüfus ve ulaşımın kalbi; geçiş iklimi'],
          ['**Ege**', 'Dağlar kıyıya dik, horst-graben, zeytin-incir-üzüm, jeotermal'],
          ['**Akdeniz**', 'Maki, turunçgil, muz, turizm, karstik Toroslar'],
          ['**Karadeniz**', 'Her mevsim yağış, orman, çay-fındık, kömür, boyuna kıyı'],
          ['**İç Anadolu**', 'En az yağış, bozkır, buğday, Tuz Gölü'],
          ['**Doğu Anadolu**', '**En büyük** ve **en yüksek** bölge, sert karasal iklim, büyükbaş hayvancılık'],
          ['**Güneydoğu Anadolu**', '**En küçük** bölge, GAP, pamuk, petrol'],
        ] },
        mn: { code: 'DOĞU EN BÜYÜK, GÜNEYDOĞU EN KÜÇÜK', t: 'Bölgeler 1941’de Ankara’daki **I. Coğrafya Kongresi**’nde belirlendi.' },
      },
      {
        h: 'Harita sorularında taktik',
        b: 'ÖSYM haritada numaralı alanlar verip “hangisinde…” diye sorar. Yöntem:\n1. Önce numaraların **hangi bölgede** olduğunu yaz (kıyı mı, iç mi, doğu mu?).\n2. Sorulan özelliğin **nedenini** düşün (yağış mı, yükselti mi, kalker mi?).\n3. Nedeni taşıyan bölgeyi seç.\nÖrnek: “Tarımda makineleşmenin en zor olduğu alanlar?” → **engebeli ve eğimli** yerler: Doğu Karadeniz, Doğu Anadolu dağlık kesimleri.',
      },
      {
        k: 'check',
        q: 'Yüz ölçümü en büyük coğrafi bölgemiz hangisidir?',
        o: ['İç Anadolu', 'Doğu Anadolu', 'Karadeniz', 'Akdeniz'],
        a: 1,
        ex: '**Doğu Anadolu**. En küçük ise Güneydoğu Anadolu.',
      },
    ],
    quiz: [
      { q: 'Türkiye’nin coğrafi bölgeleri hangi olayla belirlenmiştir?', o: ['1923 İzmir İktisat Kongresi', '1941 Birinci Coğrafya Kongresi', '1932 Türk Dil Kurultayı', '1924 Anayasası', '1936 Montrö Sözleşmesi'], a: 1, ex: '**1941**’de Ankara’da toplanan **I. Coğrafya Kongresi**.' },
      { q: 'Aşağıdakilerden hangisi Doğu Anadolu Bölgesi’nin özelliklerinden biri **değildir**?', o: ['Ortalama yükseltinin en fazla olduğu bölgedir.', 'Büyükbaş hayvancılık yaygındır.', 'Kışlar uzun ve serttir.', 'Turunçgil tarımı yaygındır.', 'Yüz ölçümü en büyük bölgedir.'], a: 3, ex: 'Turunçgiller sıcak kıyılarda (**Akdeniz**) yetişir; Doğu Anadolu’nun sert kışına dayanamaz.' },
      { q: 'Tarımda makine kullanımının engebeli ve eğimli arazi nedeniyle en zor olduğu bölümlerden biri aşağıdakilerden hangisidir?', o: ['Konya Ovası', 'Çukurova', 'Doğu Karadeniz', 'Ergene Havzası', 'Harran Ovası'], a: 2, ex: '**Doğu Karadeniz**’de dağlar denize kadar iner; tarım alanları dik yamaçlardadır.' },
      { q: 'Aşağıdaki özelliklerden hangisi İç Anadolu Bölgesi için söylenemez?', o: ['Yıllık yağış miktarı azdır.', 'Doğal bitki örtüsü bozkırdır.', 'Buğday üretimi fazladır.', 'Çay tarımı yaygındır.', 'Tuz Gölü bu bölgededir.'], a: 3, ex: 'Çay bol yağış ister; **Doğu Karadeniz**’e özgüdür.' },
    ],
    flash: [
      ['En büyük ve en yüksek bölge?', '**Doğu Anadolu**'],
      ['En küçük bölge?', '**Güneydoğu Anadolu**'],
      ['Bölgeler ne zaman belirlendi?', '**1941**, I. Coğrafya Kongresi'],
      ['En az yağış alan bölge?', '**İç Anadolu**'],
      ['Harita sorusunda ilk adım?', 'Numaraların **hangi bölgede** olduğunu yazmak'],
    ],
  },
];
