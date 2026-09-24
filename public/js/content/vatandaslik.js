// VATANDAŞLIK — 9 soru. 2020 Ön Lisans: Medeni Kanun kitapları, mahkemeler, kanun yolları, TSK kullanımı,
// milletvekili şartları, il genel meclisi, 657 DMK yıllık izin ve adaylık. Hepsi güncel (2017 sonrası) anayasaya göre.

export default [
  // ───────────────────────── 1. GÜN ─────────────────────────
  {
    id: 'vat1', s: 'vatandaslik', day: 1, min: 11,
    title: 'Hukukun temel kavramları: kural, yaptırım, hukuk dalları',
    why: 'her yıl ~3 soru bu bölümden',
    cards: [
      {
        h: 'Neden hukuk kuralı?',
        b: 'Toplumda birçok kural vardır: din, ahlak, görgü (adap), hukuk. Farkları **yaptırımdadır**:\n- Din, ahlak, görgü kurallarına uymazsan **toplum kınar** ya da **vicdanın** rahatsız olur.\n- Hukuk kuralına uymazsan **devlet gücüyle** yaptırım uygulanır.',
        viz: { type: 'compare', cols: [
          { h: 'Hukuk kuralı', c: 'vat', items: ['Yaptırımı **devlet** uygular', '**Genel ve soyut**tur (herkese)', '**Süreklidir**', 'Yazılı ya da yazısız olabilir (örf-âdet)'] },
          { h: 'Diğer sosyal kurallar', c: 'gray', items: ['Din: manevi yaptırım', 'Ahlak: vicdan azabı', 'Görgü: ayıplanma, dışlanma', 'Devlet zorlamaz'] },
        ] },
      },
      {
        h: 'Altı yaptırım türü',
        viz: { type: 'cards', items: [
          ['Ceza', 'Suç işleyene **hapis** veya **adli para cezası**.', 'tar'],
          ['Cebri icra', 'Borcunu ödemeyene **zorla** ödetme (icra dairesi).', 'orange'],
          ['Tazminat', 'Verilen zararın **parayla** giderilmesi (maddi-manevi).', 'mat'],
          ['Hükümsüzlük', 'Kurallara aykırı işlem **geçersiz** sayılır (örn. 15 yaşındakinin yaptığı ev satışı).', 'vat'],
          ['İptal', 'Hukuka aykırı **idari işlemin** mahkemece ortadan kaldırılması.', 'blue'],
          ['Disiplin cezası', 'Kurum içi kurallara uymayan memura verilen ceza (uyarma, kınama…).', 'gray'],
        ] },
        mn: { code: 'CE-CE-TA-HÜ-İP-Dİ', t: '“**Ce**viz **Ce**vizi **Ta**şa **Hü**püp **İp**le **Di**zdi.” Ceza, Cebri icra, Tazminat, Hükümsüzlük, İptal, Disiplin.' },
      },
      {
        h: 'Kamu hukuku mu, özel hukuk mu?',
        b: 'Soru: ilişkinin bir tarafında **devlet (egemenlik gücüyle)** var mı?',
        viz: { type: 'compare', cols: [
          { h: 'Kamu hukuku (devlet var)', c: 'vat', items: ['**Anayasa** hukuku', '**İdare** hukuku', '**Ceza** hukuku', '**Vergi** hukuku', 'Devletler genel hukuku'] },
          { h: 'Özel hukuk (kişiler arası)', c: 'teal', items: ['**Medeni** hukuk', '**Borçlar** hukuku', '**Ticaret** hukuku', 'Devletler özel hukuku'] },
        ] },
        mn: { code: 'AİCV = KAMU · MBT = ÖZEL', t: 'Kamu: **A**nayasa, **İ**dare, **C**eza, **V**ergi. Özel: **M**edeni, **B**orçlar, **T**icaret.' },
      },
      {
        h: 'Hukukun kaynakları',
        b: '**Yazılı kaynaklar** (hiyerarşi sırasıyla): **Anayasa** → **Kanun** (ve milletlerarası antlaşmalar) → **Cumhurbaşkanlığı kararnamesi** → **Yönetmelik**.\nAlttaki kural üsttekine aykırı olamaz.\n**Yazısız kaynak**: **örf ve âdet** hukuku.\n**Yardımcı kaynaklar**: **yargı kararları** (içtihat) ve **bilimsel görüşler** (doktrin).',
        viz: { type: 'flow', items: ['**Anayasa** (en üstte)', '**Kanun** / milletlerarası antlaşma', '**Cumhurbaşkanlığı kararnamesi**', '**Yönetmelik**'] },
      },
      {
        k: 'check',
        q: 'Borcunu ödemeyen kişinin evindeki eşyalara icra yoluyla el konulması hangi yaptırım türüdür?',
        o: ['Tazminat', 'Cebri icra', 'Hükümsüzlük', 'İptal'],
        a: 1,
        ex: 'Borcun devlet gücüyle **zorla** ödetilmesi: **cebri icra**.',
      },
    ],
    quiz: [
      { q: 'Aşağıdakilerden hangisi hukuk kurallarını diğer sosyal kurallardan ayıran en belirgin özelliktir?', o: ['Toplumda uyulması beklenmesi', 'Yaptırımının devlet gücüyle uygulanması', 'Yazılı olması', 'Değişmez olması', 'Bireylerin vicdanına hitap etmesi'], a: 1, ex: 'Hukukun yaptırımını **devlet** uygular. Hukuk kuralları yazısız da olabilir (örf-âdet), zamanla değişebilir.' },
      { q: 'Başkasının aracına zarar veren kişiye, verdiği zararı parayla ödemesine hükmedilmesi hangi yaptırım türüne örnektir?', o: ['Ceza', 'Cebri icra', 'Tazminat', 'Hükümsüzlük', 'İptal'], a: 2, ex: 'Zararın **parayla** giderilmesi: **tazminat**.' },
      { q: 'Aşağıdakilerden hangisi **özel hukuk** dallarından biridir?', o: ['Anayasa hukuku', 'Ceza hukuku', 'Vergi hukuku', 'Ticaret hukuku', 'İdare hukuku'], a: 3, ex: 'Özel hukuk: **Medeni, Borçlar, Ticaret**. Diğerleri kamu hukukudur.', tip: 'AİCV = kamu.' },
      { q: 'Hukuka aykırı bir atama kararının idare mahkemesince ortadan kaldırılması hangi yaptırım türüdür?', o: ['Tazminat', 'Ceza', 'İptal', 'Cebri icra', 'Disiplin cezası'], a: 2, ex: '**İdari işlemin** mahkemece ortadan kaldırılması: **iptal**.' },
    ],
    flash: [
      ['Hukuk kuralını diğerlerinden ayıran özellik?', 'Yaptırımını **devlet** uygular'],
      ['Yaptırım türleri kodlaması?', '**Ce-Ce-Ta-Hü-İp-Di**: Ceza, Cebri icra, Tazminat, Hükümsüzlük, İptal, Disiplin'],
      ['Kamu hukuku dalları?', '**Anayasa, İdare, Ceza, Vergi** (AİCV)'],
      ['Özel hukuk dalları?', '**Medeni, Borçlar, Ticaret**'],
      ['Yazılı hukuk kaynakları sıralaması?', 'Anayasa → Kanun → CB kararnamesi → Yönetmelik'],
      ['Yazısız hukuk kaynağı?', '**Örf ve âdet**'],
    ],
  },

  // ───────────────────────── 2. GÜN ─────────────────────────
  {
    id: 'vat2', s: 'vatandaslik', day: 2, min: 12,
    title: 'Kişiler hukuku ve Medeni Kanun: ehliyet, hısımlık',
    why: '1-2 soru',
    cards: [
      {
        h: 'Medeni Kanun’un kitapları',
        b: '4721 sayılı **Türk Medeni Kanunu** (2001’de kabul edildi, 2002’de yürürlüğe girdi) şu bölümlerden oluşur:',
        viz: { type: 'flow', items: ['**Başlangıç**', '**Kişiler Hukuku**', '**Aile Hukuku**', '**Miras Hukuku**', '**Eşya Hukuku**'] },
        mn: { code: 'KİŞİ AİLE KURUR, MİRAS EŞYA KALIR', t: 'Kişiler, Aile, Miras, Eşya. **Borçlar** ayrı bir kanundur (Türk Borçlar Kanunu). **Şirketler** ise Ticaret Kanunu’ndadır.' },
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Hangisi Medeni Kanun’u oluşturan kitaplardan biri **değildir**?” → **Şirketler Hukuku**.', exam: true },
      },
      {
        h: 'Hak ehliyeti ve fiil ehliyeti',
        viz: { type: 'compare', cols: [
          { h: 'Hak ehliyeti', c: 'vat', items: ['Haklara **sahip olabilme**', '**Herkes** eşit olarak sahiptir', '**Tam ve sağ doğmak** şartıyla ana rahmine düşüldüğü andan başlar', '**Ölümle** sona erer'] },
          { h: 'Fiil ehliyeti', c: 'ink', items: ['Kendi işlemleriyle hak edinme, **borç altına girme**', 'Şartları: **ayırt etme gücü**, **ergin olmak** (18 yaş), **kısıtlı olmamak**', 'Evlenen kişi **ergin** olur', '15 yaşını dolduran, mahkeme kararıyla ergin kılınabilir'] },
        ] },
        mn: { code: 'HAK = SAHİP · FİİL = YAP', t: 'Hak ehliyeti **sahip olmak**, fiil ehliyeti **kullanmak/yapmak**. Bebek miras alabilir (hak) ama ev satamaz (fiil).' },
      },
      {
        h: 'Hısımlık',
        b: '- **Kan hısımlığı**: aynı soydan gelmek. **Üstsoy-altsoy** (anne, baba, çocuk, torun) ve **yan soy** (kardeş, amca, dayı, teyze).\n- **Kayın hısımlığı**: evlilik yoluyla; **eşin kan hısımları** (kayınvalide, kayınbirader). Evlilik bitse de kayın hısımlığı sürer.\n- **Evlenme yaşı**: 17 (olağanüstü durumda hâkim izniyle 16).',
      },
      {
        h: 'Kişi türleri ve yerleşim yeri',
        viz: { type: 'cards', items: [
          ['Gerçek kişi', 'İnsanlar. Kişilik doğumla başlar, ölümle biter.', 'vat'],
          ['Tüzel kişi', '**Dernek** (kişi topluluğu), **vakıf** (mal topluluğu), şirket.', 'teal'],
          ['Yerleşim yeri', 'Kişinin **sürekli kalma niyetiyle** oturduğu yer. Aynı anda **birden fazla olamaz**.', 'ink'],
          ['Kısıtlılık', 'Akıl hastalığı, savurganlık, alkol-uyuşturucu bağımlılığı, 1 yıl+ hapis gibi nedenlerle **vesayet** altına alınma.', 'gray'],
        ] },
      },
      {
        k: 'check',
        q: 'Yeni doğmuş bir bebeğin kendisine bırakılan mirası alabilmesi hangi ehliyetle ilgilidir?',
        o: ['Fiil ehliyeti', 'Hak ehliyeti', 'Ayırt etme gücü', 'Erginlik'],
        a: 1,
        ex: 'Haklara **sahip olma**: **hak ehliyeti**. Herkeste doğuştan vardır.',
      },
    ],
    quiz: [
      { q: 'Aşağıdakilerden hangisi 4721 sayılı Türk Medeni Kanunu’nu oluşturan kitaplardan biri **değildir**?', o: ['Kişiler Hukuku', 'Eşya Hukuku', 'Aile Hukuku', 'Miras Hukuku', 'Şirketler Hukuku'], a: 4, ex: 'Şirketler **Türk Ticaret Kanunu**’nda düzenlenir. (2020 sorusu.)' },
      { q: 'Fiil ehliyetine sahip olmak için aşağıdakilerden hangisi gerekli **değildir**?', o: ['Ayırt etme gücüne sahip olmak', 'Ergin olmak', 'Kısıtlı olmamak', 'Yükseköğrenim görmüş olmak', 'Bu üç şartı birlikte taşımak'], a: 3, ex: 'Fiil ehliyetinin şartları: ayırt etme gücü, erginlik, kısıtlı olmamak. Öğrenim durumu şart değildir.' },
      { q: 'Hak ehliyeti ne zaman sona erer?', o: ['18 yaşında', 'Evlenince', 'Ölümle', 'Kısıtlanınca', 'Emekli olunca'], a: 2, ex: 'Hak ehliyeti **ölümle** sona erer; kısıtlanan kişinin bile hak ehliyeti vardır.' },
      { q: 'Bir kişinin eşinin kardeşiyle arasındaki hısımlık türü hangisidir?', o: ['Üstsoy kan hısımlığı', 'Altsoy kan hısımlığı', 'Yan soy kan hısımlığı', 'Kayın hısımlığı', 'Hısımlık yoktur'], a: 3, ex: 'Eşin kan hısımlarıyla kurulan bağ: **kayın hısımlığı**.' },
      { q: 'Aşağıdakilerden hangisi bir “mal topluluğu” olarak kurulan tüzel kişidir?', o: ['Dernek', 'Vakıf', 'Siyasi parti', 'Sendika', 'Kooperatif'], a: 1, ex: '**Vakıf**, bir malın belirli bir amaca özgülenmesiyle kurulur. Dernek ise kişilerin bir araya gelmesidir.' },
    ],
    flash: [
      ['Medeni Kanun kitapları?', 'Başlangıç, **Kişiler, Aile, Miras, Eşya**'],
      ['Medeni Kanun’da olmayan?', '**Borçlar** (ayrı kanun), **Şirketler** (Ticaret K.)'],
      ['Hak ehliyeti ne zaman başlar?', 'Tam ve sağ doğmak şartıyla **ana rahmine düşülünce**'],
      ['Fiil ehliyetinin 3 şartı?', '**Ayırt etme gücü, erginlik, kısıtlı olmamak**'],
      ['Kayın hısımlığı?', '**Eşin kan hısımları** ile bağ'],
      ['Vakıf ve dernek farkı?', 'Vakıf **mal** topluluğu, dernek **kişi** topluluğu'],
    ],
  },

  // ───────────────────────── 3. GÜN ─────────────────────────
  {
    id: 'vat3', s: 'vatandaslik', day: 3, min: 12,
    title: 'Anayasa tarihi ve 1982 Anayasası’nın temelleri',
    why: '1-2 soru',
    cards: [
      {
        h: 'Anayasa tarihimiz',
        viz: { type: 'timeline', s: 'vatandaslik', items: [
          { y: '1808', t: '**Sened-i İttifak**: padişahın yetkisini ilk kez sınırlayan belge (anayasal gelişmenin başlangıcı).' },
          { y: '1876', t: '**Kanun-i Esasi**: **ilk anayasa**, I. Meşrutiyet.', key: true },
          { y: '1921', t: '**Teşkilât-ı Esasiye**: **güçler birliği**, millî egemenlik. En kısa anayasa.', key: true },
          { y: '1924', t: '**1924 Anayasası**: en uzun süre yürürlükte kalan (1960’a kadar). Laiklik 1937’de eklendi.' },
          { y: '1961', t: '**1961 Anayasası**: **Anayasa Mahkemesi** kuruldu; iki meclis (Millet Meclisi + Cumhuriyet Senatosu); sosyal devlet.', key: true },
          { y: '1982', t: '**1982 Anayasası**: Danışma Meclisi hazırladı, **7 Kasım 1982** halkoylamasıyla kabul edildi.', key: true },
          { y: '2017', t: '**Cumhurbaşkanlığı Hükümet Sistemi**: 16 Nisan 2017 halkoylaması. Başbakanlık ve Bakanlar Kurulu kaldırıldı; milletvekili sayısı 600, seçilme yaşı 18.', key: true },
        ] },
      },
      {
        h: 'Değiştirilemeyen ilk üç madde',
        b: '1982 Anayasası’nın **ilk 3 maddesi değiştirilemez, değiştirilmesi teklif bile edilemez** (4. madde bunu güvenceye alır).',
        viz: { type: 'cards', items: [
          ['Madde 1', 'Türkiye Devleti bir **Cumhuriyettir**.', 'vat'],
          ['Madde 2', 'Cumhuriyetin nitelikleri: **demokratik, laik ve sosyal bir hukuk devleti**; Atatürk milliyetçiliğine bağlı; insan haklarına saygılı.', 'ink'],
          ['Madde 3', 'Devletin **bütünlüğü**, dili **Türkçe**, bayrağı **ay yıldızlı al bayrak**, millî marşı **İstiklal Marşı**, başkenti **Ankara**.', 'tar'],
        ] },
        mn: { code: 'BÜ-DİL-BAY-MAR-BAŞ', t: '3. madde: **Bü**tünlük, **Dil**, **Bay**rak, **Mar**ş, **Baş**kent.' },
      },
      {
        h: 'Anayasa nasıl değiştirilir?',
        b: 'Teklif için TBMM’nin en az **1/3**’ü (**200** milletvekili) imza verir. Sonra oylama:',
        viz: { type: 'table', s: 'vatandaslik', head: ['Kabul oyu', 'Sonuç'], rows: [
          ['**360’tan az** (3/5 altı)', 'Reddedilir'],
          ['**360–399** (3/5 ile 2/3 arası)', '**Halkoylamasına** gider'],
          ['**400 ve üstü** (2/3)', 'Doğrudan kabul; Cumhurbaşkanı isterse halkoyuna sunabilir'],
        ] },
        mn: { code: '200 · 360 · 400', t: 'Teklif **200**, halkoyu kapısı **360**, doğrudan kabul **400**.' },
      },
      {
        k: 'check',
        q: '1982 Anayasası’na göre aşağıdakilerden hangisi **değiştirilemez** maddeler arasında yer alır?',
        o: ['Milletvekili sayısı', 'Başkentin Ankara olması', 'Cumhurbaşkanının görev süresi', 'Seçim barajı'],
        a: 1,
        ex: '**Başkent Ankara** 3. maddededir. Milletvekili sayısı, görev süresi değiştirilebilir (nitekim 2017’de değişti).',
      },
    ],
    quiz: [
      { q: 'Anayasa Mahkemesi ilk kez hangi anayasa ile kurulmuştur?', o: ['1876 Kanun-i Esasi', '1921 Teşkilât-ı Esasiye', '1924 Anayasası', '1961 Anayasası', '1982 Anayasası'], a: 3, ex: '**1961 Anayasası** Anayasa Mahkemesi’ni kurdu ve iki meclisli sistem getirdi.' },
      { q: 'Güçler birliği ilkesinin benimsendiği ve millî egemenliğe dayanan ilk Türkiye anayasası hangisidir?', o: ['Kanun-i Esasi', 'Teşkilât-ı Esasiye (1921)', '1924 Anayasası', '1961 Anayasası', 'Sened-i İttifak'], a: 1, ex: '**1921 Teşkilât-ı Esasiye**: yasama ve yürütme TBMM’de toplanmıştı (güçler birliği).' },
      { q: 'Aşağıdakilerden hangisi 1982 Anayasası’nın 3. maddesinde düzenlenen hususlardan biri **değildir**?', o: ['Devletin dili', 'Bayrak', 'Millî marş', 'Başkent', 'Devletin yönetim şeklinin cumhuriyet olması'], a: 4, ex: 'Yönetim şeklinin **cumhuriyet** olması **1. madde**dir.' },
      { q: 'Anayasa değişikliği teklifi TBMM’de 370 oyla kabul edilirse ne olur?', o: ['Reddedilir.', 'Doğrudan yürürlüğe girer.', 'Halkoylamasına sunulur.', 'Anayasa Mahkemesine gönderilir.', 'Yeniden oylanmak üzere komisyona gider.'], a: 2, ex: '360-399 arası kabul → **halkoylaması**.' },
      { q: 'Başbakanlığın ve Bakanlar Kurulunun kaldırıldığı, Cumhurbaşkanlığı Hükümet Sistemine geçilen anayasa değişikliği hangi yıl halkoyuyla kabul edilmiştir?', o: ['2007', '2010', '2012', '2017', '2020'], a: 3, ex: '**16 Nisan 2017** halkoylaması.' },
    ],
    flash: [
      ['İlk anayasa?', '**Kanun-i Esasi** (1876)'],
      ['Güçler birliği hangi anayasada?', '**1921** Teşkilât-ı Esasiye'],
      ['Anayasa Mahkemesi hangi anayasayla?', '**1961**'],
      ['1982 Anayasası ne zaman kabul edildi?', '**7 Kasım 1982** halkoylaması'],
      ['Değiştirilemez maddeler?', 'İlk **3 madde** (4. madde güvencesi)'],
      ['Anayasa değişikliği sayıları?', 'Teklif **200**, halkoyu **360**, doğrudan **400**'],
    ],
  },

  // ───────────────────────── 4. GÜN ─────────────────────────
  {
    id: 'vat4', s: 'vatandaslik', day: 4, min: 12,
    title: 'Yasama: TBMM ve milletvekilleri',
    why: '1-2 soru',
    cards: [
      {
        h: 'TBMM’nin sayıları',
        viz: { type: 'cards', items: [
          ['600', '**milletvekili**', 'vat'],
          ['5 yıl', 'seçim dönemi (Cumhurbaşkanı seçimiyle **aynı gün**)', 'ink'],
          ['18 yaş', 'milletvekili **seçilme** yaşı', 'tar'],
          ['%7', 'ülke geneli seçim barajı', 'gray'],
        ] },
      },
      {
        h: 'Milletvekili olmanın şartları',
        b: '- **Türk vatandaşı** olmak\n- **18 yaşını** doldurmuş olmak\n- En az **ilkokul** mezunu olmak\n- **Kısıtlı** olmamak\n- **Askerlikle ilişiği** olmamak (yükümlü ise)\n- Kamu hizmetinden yasaklı olmamak, belirli suçlardan hüküm giymemiş olmak\n**Yükseköğrenim şart değildir!** (O, Cumhurbaşkanı için şarttır.)',
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Hangisi milletvekili seçilme yeterliliği arasında **yer almaz**?” → **Yükseköğrenim yapmış olmak**.', exam: true },
      },
      {
        h: 'TBMM ne yapar?',
        viz: { type: 'cards', items: [
          ['Kanun', 'Kanun **koymak, değiştirmek, kaldırmak**.', 'vat'],
          ['Bütçe', '**Bütçe** ve **kesin hesap** kanunlarını kabul etmek.', 'mat'],
          ['Savaş', '**Savaş ilanına** karar vermek.', 'tar'],
          ['Antlaşma', 'Milletlerarası antlaşmaları **onaylamayı uygun bulmak**.', 'teal'],
          ['Af', '**Genel ve özel af** ilanı (üye tamsayısının 3/5’iyle).', 'gray'],
          ['Para', '**Para basılmasına** karar vermek.', 'orange'],
        ] },
        mn: { code: 'KA-BÜ-SA-AN-AF-PA', t: '“**Ka**rdeşim **Bü**yük **Sa**at **An**tika **Af**yon **Pa**zarından.” Kanun, Bütçe, Savaş, Antlaşma, Af, Para.' },
      },
      {
        h: 'TBMM hükümeti nasıl denetler?',
        b: '2017’den sonra denetim yolları:\n- **Meclis araştırması**: bir konuda bilgi edinmek için komisyon kurulur.\n- **Genel görüşme**: bir konu Genel Kurul’da görüşülür.\n- **Yazılı soru**: Cumhurbaşkanı yardımcıları ve bakanlara yazılı soru sorulur (**15 gün** içinde cevaplanır).\n- **Meclis soruşturması**: Cumhurbaşkanı yardımcıları ve bakanların cezai sorumluluğu için.\n**Gensoru kaldırıldı** (2017).',
      },
      {
        h: 'Önemli sayılar',
        viz: { type: 'table', s: 'vatandaslik', head: ['Konu', 'Sayı'], rows: [
          ['Toplantı yeter sayısı', 'Üye tamsayısının **1/3**’ü (**200**)'],
          ['Karar yeter sayısı', 'Katılanların salt çoğunluğu, ama **151**’den az olamaz'],
          ['Seçimlerin yenilenmesi kararı', '**3/5** (**360**)'],
          ['Genel ve özel af', '**3/5** (**360**)'],
        ] },
      },
      {
        k: 'check',
        q: 'Aşağıdakilerden hangisi milletvekili olmanın şartlarından biri **değildir**?',
        o: ['Türk vatandaşı olmak', '18 yaşını doldurmak', 'Yükseköğrenim yapmış olmak', 'Kısıtlı olmamak'],
        a: 2,
        ex: 'Milletvekili için **ilkokul** yeterlidir. Yükseköğrenim **Cumhurbaşkanı** için şarttır.',
      },
    ],
    quiz: [
      { q: '1982 Anayasası’na göre aşağıdakilerden hangisi milletvekili seçilme yeterliliğine ilişkin koşullar arasında **yer almaz**?', o: ['Türk vatandaşı olmak', 'Yükseköğrenim yapmış olmak', 'Askerlikle ilişiği olmamak', 'Kısıtlı olmamak', '18 yaşını doldurmuş olmak'], a: 1, ex: 'Yükseköğrenim şartı **yoktur**. (2020 sorusu.)' },
      { q: 'TBMM’de kaç milletvekili vardır?', o: ['450', '500', '550', '600', '650'], a: 3, ex: '2017 değişikliğiyle **600**.' },
      { q: 'Aşağıdakilerden hangisi TBMM’nin görevlerinden biri **değildir**?', o: ['Kanun koymak', 'Bütçe kanununu kabul etmek', 'Savaş ilanına karar vermek', 'Bakanları atamak', 'Genel ve özel af ilan etmek'], a: 3, ex: 'Bakanları **Cumhurbaşkanı** atar ve görevden alır.' },
      { q: '2017 Anayasa değişikliğiyle kaldırılan denetim yolu hangisidir?', o: ['Meclis araştırması', 'Genel görüşme', 'Yazılı soru', 'Gensoru', 'Meclis soruşturması'], a: 3, ex: '**Gensoru** kaldırıldı, çünkü Bakanlar Kurulu artık TBMM’ye karşı sorumlu değil.' },
      { q: 'TBMM’nin toplantı yeter sayısı kaçtır?', o: ['151', '200', '301', '360', '400'], a: 1, ex: 'Üye tamsayısının **1/3**’ü: 600 ÷ 3 = **200**.' },
    ],
    flash: [
      ['Milletvekili sayısı?', '**600**'],
      ['Milletvekili seçilme yaşı?', '**18**'],
      ['Milletvekili için öğrenim şartı?', 'En az **ilkokul** (yükseköğrenim şart değil)'],
      ['TBMM görevleri kodlaması?', '**Ka-Bü-Sa-An-Af-Pa**: Kanun, Bütçe, Savaş, Antlaşma, Af, Para'],
      ['Kaldırılan denetim yolu?', '**Gensoru** (2017)'],
      ['Toplantı yeter sayısı?', '**200** (1/3)'],
    ],
  },

  // ───────────────────────── 5. GÜN ─────────────────────────
  {
    id: 'vat5', s: 'vatandaslik', day: 5, min: 12,
    title: 'Yürütme: Cumhurbaşkanı ve yetkileri',
    why: 'her yıl 2-3 soru',
    cards: [
      {
        h: 'Cumhurbaşkanı kimdir?',
        viz: { type: 'cards', items: [
          ['40 yaş', 'doldurmuş olmalı', 'vat'],
          ['Yükseköğrenim', 'yapmış olmalı', 'ink'],
          ['5 yıl', 'görev süresi; en fazla **2 kez** seçilebilir', 'tar'],
          ['Halk seçer', 'Geçerli oyların **salt çoğunluğu** (%50+1); olmazsa **2. tur**', 'teal'],
        ] },
        b: 'Aday gösterebilenler: TBMM’de grubu olan partiler, son seçimde toplam **%5** oy alan partiler ve en az **100.000 seçmen**.\nCumhurbaşkanı seçilen kişinin partisiyle **ilişiği kesilmez**.',
        mn: { code: '40 · YÜKSEK · 5 · 2', t: '“Kırk yaşında, yüksek okullu, beş yıllığına, en fazla iki kere.”' },
      },
      {
        h: 'Yetkiler: dört çekmece',
        viz: { type: 'org', root: 'Cumhurbaşkanı', kids: [
          { h: 'Yasama ile ilgili', c: 'vat', items: ['Kanunları **yayımlar** ya da **15 gün** içinde geri gönderir', 'Anayasa değişikliklerini **halkoyuna** sunabilir', 'Anayasa Mahkemesinde **iptal davası** açar', 'TBMM seçimlerini yenileyebilir'] },
          { h: 'Yürütme ile ilgili', c: 'ink', items: ['**CB yardımcılarını ve bakanları atar**, görevden alır', '**Cumhurbaşkanlığı kararnamesi** çıkarır', '**Olağanüstü hal** ilan eder', 'Üst kademe kamu yöneticilerini atar', 'Millî Güvenlik Kurulunu toplantıya çağırır'] },
          { h: 'Güvenlik', c: 'tar', items: ['**TSK Başkomutanlığını** TBMM adına temsil eder', '**TSK’nın kullanılmasına** karar verir'] },
          { h: 'Yargı ile ilgili', c: 'teal', items: ['Anayasa Mahkemesi üyelerinden **12**’sini seçer', 'HSK’nın **4** üyesini atar', 'Hastalık, sakatlık, kocama nedeniyle bazı kişilerin cezasını hafifletir veya kaldırır'] },
        ] },
      },
      {
        h: 'TSK’nın kullanılması',
        b: 'Normalde savaş ilanına **TBMM** karar verir. Ama **TBMM tatilde veya ara vermede iken** ülke **ani bir silahlı saldırıya** uğrarsa ve hemen karar vermek gerekiyorsa, **Türk Silahlı Kuvvetlerinin kullanılmasına Cumhurbaşkanı karar verir**.',
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Cevap: **Cumhurbaşkanı**. Millî Savunma Bakanlığı, Genelkurmay, MGK gibi şıklar çeldiricidir.', exam: true },
      },
      {
        h: 'Cumhurbaşkanlığı kararnamesinin sınırları',
        b: '- **Yürütme yetkisine** ilişkin konularda çıkarılır.\n- **Temel haklar, kişi hakları ve siyasi haklar** kararnameyle düzenlenemez.\n- **Kanunla** açıkça düzenlenen konuda kararname çıkarılamaz.\n- Kanun ile kararname çelişirse **kanun uygulanır**.\n- TBMM aynı konuda kanun çıkarırsa kararname **hükümsüz** olur.',
      },
      {
        h: 'Cumhurbaşkanına bağlı kurullar',
        viz: { type: 'compare', cols: [
          { h: 'Millî Güvenlik Kurulu', c: 'tar', items: ['Başkanı: **Cumhurbaşkanı**', 'Üyeler: CB yardımcıları, Adalet, Millî Savunma, İçişleri, Dışişleri bakanları, Genelkurmay Başkanı, Kara-Deniz-Hava komutanları', 'Kararları **tavsiye** niteliğinde'] },
          { h: 'Devlet Denetleme Kurulu', c: 'ink', items: ['Cumhurbaşkanlığına bağlı', 'Başkan ve üyelerini **Cumhurbaşkanı atar**', 'İdareyi denetler; **yargı organları** denetim dışında'] },
        ] },
      },
      {
        k: 'check',
        q: 'TBMM tatildeyken ülkeye ani silahlı saldırı olursa TSK’nın kullanılmasına kim karar verir?',
        o: ['Genelkurmay Başkanı', 'Millî Savunma Bakanı', 'Cumhurbaşkanı', 'Millî Güvenlik Kurulu'],
        a: 2,
        ex: 'Anayasa m.92: **Cumhurbaşkanı** karar verir.',
      },
    ],
    quiz: [
      { q: '1982 Anayasası’na göre, TBMM tatilde veya ara vermede iken ülkenin ani bir silahlı saldırıya uğraması ve bu sebeple silahlı kuvvet kullanılmasına derhâl karar verilmesinin kaçınılmaz olması hâlinde, TSK’nın kullanılmasına kim karar verebilir?', o: ['Dışişleri Bakanlığı', 'Millî Savunma Bakanlığı', 'Cumhurbaşkanı', 'Genelkurmay Başkanı', 'Millî Güvenlik Kurulu'], a: 2, ex: '**Cumhurbaşkanı**. (2020 sorusu.)' },
      { q: 'Aşağıdakilerden hangisi Cumhurbaşkanı adayı olabilmenin şartlarından biri **değildir**?', o: ['40 yaşını doldurmuş olmak', 'Yükseköğrenim yapmış olmak', 'Milletvekili seçilme yeterliliğine sahip olmak', 'Türk vatandaşı olmak', 'Milletvekili olmak'], a: 4, ex: 'TBMM üyesi olmak **şart değildir**; milletvekili dışından da aday olunabilir.' },
      { q: 'Cumhurbaşkanlığı kararnamesiyle ilgili aşağıdakilerden hangisi **yanlıştır**?', o: ['Yürütme yetkisine ilişkin konularda çıkarılır.', 'Temel haklar kararnameyle düzenlenemez.', 'Kanunla çelişirse kararname uygulanır.', 'Kanunla açıkça düzenlenen konuda çıkarılamaz.', 'TBMM aynı konuda kanun çıkarırsa kararname hükümsüz olur.'], a: 2, ex: 'Çelişki hâlinde **kanun** uygulanır.' },
      { q: 'Cumhurbaşkanı, TBMM’nin kabul ettiği kanunları kaç gün içinde yayımlar veya tekrar görüşülmek üzere geri gönderir?', o: ['7', '10', '15', '30', '45'], a: 2, ex: '**15 gün**.' },
      { q: 'Anayasa Mahkemesinin 15 üyesinden kaçını Cumhurbaşkanı seçer?', o: ['3', '7', '10', '12', '15'], a: 3, ex: 'Cumhurbaşkanı **12**, TBMM **3** üye seçer.' },
    ],
    flash: [
      ['Cumhurbaşkanı adaylık yaşı ve öğrenim?', '**40 yaş**, **yükseköğrenim**'],
      ['Cumhurbaşkanı görev süresi?', '**5 yıl**, en fazla **2 kez**'],
      ['TBMM tatildeyken ani saldırıda TSK kullanımına kim karar verir?', '**Cumhurbaşkanı**'],
      ['Kanunu yayımlama/geri gönderme süresi?', '**15 gün**'],
      ['Kanun ile CB kararnamesi çelişirse?', '**Kanun** uygulanır'],
      ['AYM üyelerini kim seçer?', 'CB **12**, TBMM **3**'],
    ],
  },

  // ───────────────────────── 6. GÜN ─────────────────────────
  {
    id: 'vat6', s: 'vatandaslik', day: 6, min: 13,
    title: 'Yargı: mahkemeler ve kanun yolları',
    why: 'her yıl 1-2 soru',
    cards: [
      {
        h: 'Yargının haritası',
        viz: { type: 'org', root: 'Türk yargı sistemi', kids: [
          { h: 'Anayasa yargısı', c: 'vat', items: ['**Anayasa Mahkemesi**'] },
          { h: 'Adli yargı', c: 'tar', items: ['İlk derece: sulh, asliye, ağır ceza…', 'İstinaf: **Bölge Adliye Mahkemesi**', 'Temyiz: **Yargıtay**'] },
          { h: 'İdari yargı', c: 'blue', items: ['İlk derece: **idare** ve **vergi** mahkemeleri', 'İstinaf: **Bölge İdare Mahkemesi**', 'Temyiz: **Danıştay**'] },
          { h: 'Uyuşmazlık yargısı', c: 'gray', items: ['**Uyuşmazlık Mahkemesi**: adli ve idari yargı arasındaki görev uyuşmazlıkları'] },
        ] },
      },
      {
        h: 'Adli yargının ilk derece mahkemeleri',
        viz: { type: 'compare', cols: [
          { h: 'Hukuk mahkemeleri', c: 'teal', items: ['**Sulh hukuk** (kira, ortaklığın giderilmesi, vesayet)', '**Asliye hukuk** (genel görevli)', '**Aile**, **iş**, **asliye ticaret**, **tüketici**, **kadastro** mahkemeleri'] },
          { h: 'Ceza mahkemeleri', c: 'tar', items: ['**Sulh ceza hâkimliği** (tutuklama, arama kararları)', '**Asliye ceza**', '**Ağır ceza** (ağır suçlar)', '**Çocuk** mahkemeleri'] },
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Hangisi **adli** yargı ilk derece mahkemesi değildir?” → **İdare mahkemesi** (o idari yargıdadır).', exam: true },
      },
      {
        h: 'Kanun yolları: karara itiraz basamakları',
        viz: { type: 'flow', items: ['**İlk derece mahkemesi** karar verir', '**İstinaf** (olağan kanun yolu): Bölge Adliye / Bölge İdare Mahkemesi', '**Temyiz** (olağan kanun yolu): Yargıtay / Danıştay', 'Olağanüstü: **yargılamanın yenilenmesi**, **kanun yararına bozma**'] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Hangisi adli yargıda yer alan kanun yollarından biridir?” → **Temyiz**. Tahkim, ihtiyati tedbir, ıslah, asli müdahale kanun yolu değildir.', exam: true },
      },
      {
        h: 'Yüksek mahkemeler ve kurullar',
        viz: { type: 'table', s: 'vatandaslik', head: ['Kurum', 'Görevi'], rows: [
          ['**Anayasa Mahkemesi** (15 üye, 12 yıl)', 'Kanunların, CB kararnamelerinin ve TBMM İçtüzüğünün anayasaya uygunluğunu denetler; **bireysel başvuru**; **Yüce Divan** olarak üst düzey yöneticileri yargılar; parti kapatma'],
          ['**Yargıtay**', 'Adli yargının **son** inceleme mercii'],
          ['**Danıştay**', 'İdari yargının son inceleme mercii + **danışma** organı'],
          ['**Uyuşmazlık Mahkemesi**', 'Adli-idari yargı arasındaki görev ve hüküm uyuşmazlıkları'],
          ['**Hâkimler ve Savcılar Kurulu (HSK)**', 'Hâkim ve savcıların atanması, disiplini. **Başkanı Adalet Bakanı**'],
          ['**Sayıştay**', 'Kamu harcamalarını **TBMM adına** denetler'],
        ] },
      },
      {
        h: 'Başkanını kendi seçen, seçmeyen',
        b: 'ÖSYM 2020’de sordu: “Başkanını **kendi üyeleri arasından** seçen merci hangisidir?”\n- **TBMM** ✓ (Başkanını milletvekilleri seçer)\n- HSK ✗ (başkanı Adalet Bakanı)\n- MGK ✗ (başkanı Cumhurbaşkanı)\n- Devlet Denetleme Kurulu ✗ (başkanını Cumhurbaşkanı atar)\n- Uyuşmazlık Mahkemesi ✗ (başkanı Anayasa Mahkemesi üyeleri arasından görevlendirilir)',
      },
      {
        k: 'check',
        q: 'İdari yargının son inceleme mercii hangisidir?',
        o: ['Yargıtay', 'Danıştay', 'Anayasa Mahkemesi', 'Sayıştay'],
        a: 1,
        ex: '**Danıştay**. Yargıtay adli yargının son merciidir.',
      },
    ],
    quiz: [
      { q: 'Aşağıdakilerden hangisi adli yargı ilk derece mahkemelerinden biri **değildir**?', o: ['Sulh hukuk mahkemesi', 'İdare mahkemesi', 'Ağır ceza mahkemesi', 'Aile mahkemesi', 'Asliye ticaret mahkemesi'], a: 1, ex: '**İdare mahkemesi** idari yargıdadır. (2020 sorusu.)' },
      { q: 'Aşağıdakilerden hangisi adli yargıda yer alan kanun yollarından biridir?', o: ['Tahkim', 'İhtiyati tedbir', 'Temyiz', 'Islah', 'Asli müdahale'], a: 2, ex: '**Temyiz** olağan kanun yoludur. (2020 sorusu.)' },
      { q: '1982 Anayasası’na göre aşağıdakilerden hangisi başkanını kendi üyeleri arasından seçen mercilerden biridir?', o: ['Türkiye Büyük Millet Meclisi', 'Uyuşmazlık Mahkemesi', 'Millî Güvenlik Kurulu', 'Devlet Denetleme Kurulu', 'Hâkimler ve Savcılar Kurulu'], a: 0, ex: 'TBMM Başkanını milletvekilleri kendi aralarından seçer. (2020 sorusu.)' },
      { q: 'Adli yargı ile idari yargı arasındaki görev uyuşmazlıklarını çözen mahkeme hangisidir?', o: ['Yargıtay', 'Danıştay', 'Anayasa Mahkemesi', 'Uyuşmazlık Mahkemesi', 'Bölge Adliye Mahkemesi'], a: 3, ex: '**Uyuşmazlık Mahkemesi**.' },
      { q: 'Hâkimler ve Savcılar Kurulunun başkanı kimdir?', o: ['Cumhurbaşkanı', 'Adalet Bakanı', 'Yargıtay Başkanı', 'TBMM Başkanı', 'Anayasa Mahkemesi Başkanı'], a: 1, ex: 'HSK’nın başkanı **Adalet Bakanı**dır.' },
    ],
    flash: [
      ['Adli yargının son mercii?', '**Yargıtay**'],
      ['İdari yargının son mercii?', '**Danıştay**'],
      ['İstinaf mahkemeleri?', '**Bölge Adliye** (adli), **Bölge İdare** (idari)'],
      ['Olağan kanun yolları?', '**İstinaf** ve **Temyiz**'],
      ['AYM üye sayısı ve görev süresi?', '**15 üye**, **12 yıl**'],
      ['HSK başkanı?', '**Adalet Bakanı**'],
      ['Başkanını kendi seçen?', '**TBMM**'],
    ],
  },

  // ───────────────────────── 7. GÜN ─────────────────────────
  {
    id: 'vat7', s: 'vatandaslik', day: 7, min: 13,
    title: '657 sayılı Devlet Memurları Kanunu',
    why: 'ön lisansın favorisi, 1-2 soru',
    cards: [
      {
        h: 'Neden önemli?',
        b: 'KPSS’yi **memur olmak için** giriyorsun, ÖSYM de bunu biliyor. 2020 Ön Lisans’ta **iki soru** doğrudan 657’den geldi: **yıllık izin** ve **adaylık süresi**. Birkaç sayı ezberle, net kazan.',
      },
      {
        h: 'Kamuda 4 istihdam şekli',
        viz: { type: 'cards', items: [
          ['Memur', 'Asli ve sürekli kamu hizmetini yürütür.', 'vat'],
          ['Sözleşmeli personel', 'Sözleşmeyle çalışır.', 'ink'],
          ['Geçici personel', 'Bir yıldan az süreli, mevsimlik işler.', 'gray'],
          ['İşçi', 'İş Kanunu’na tabi.', 'teal'],
        ] },
      },
      {
        h: 'Aday memurluk ve izinler',
        viz: { type: 'table', s: 'vatandaslik', head: ['Konu', 'Süre'], rows: [
          ['**Aday memurluk**', 'En az **1 yıl**, en fazla **2 yıl**'],
          ['**Yıllık izin**: 1-10 yıl hizmet (10 dahil)', '**20 gün**'],
          ['**Yıllık izin**: 10 yıldan fazla hizmet', '**30 gün**'],
          ['Evlenme izni', '**7 gün**'],
          ['Eş, çocuk, anne, baba, kardeş ölümü', '**7 gün**'],
          ['Doğum izni (kadın memur)', 'Doğumdan önce **8**, sonra **8** hafta (toplam **16 hafta**)'],
          ['Babalık izni', '**10 gün**'],
        ] },
        mn: { code: '1-2 · 20-30', t: 'Adaylık **1-2 yıl**. İzin **20 gün**, 10 yılı geçince **30 gün**.' },
        note: { h: 'ÖSYM böyle sordu (2020)', t: '12 yıllık hizmeti olan memurun yıllık izni? → **30 gün**. Aday memurluk süresi en az? → **1 yıl**.', exam: true },
      },
      {
        h: 'Disiplin cezaları: hafiften ağıra 5 basamak',
        viz: { type: 'flow', items: ['**1. Uyarma**: görevde daha dikkatli olması yazıyla bildirilir.', '**2. Kınama**: kusurlu olduğu yazıyla bildirilir.', '**3. Aylıktan kesme**: brüt aylığın 1/30 – 1/8’i kesilir.', '**4. Kademe ilerlemesinin durdurulması**: 1-3 yıl kademe ilerlemez.', '**5. Devlet memurluğundan çıkarma**: bir daha memur olamaz (Yüksek Disiplin Kurulu karar verir).'] },
        mn: { code: 'UKAKD', t: '“**U**yku **K**açar **A**ma **K**alk **D**evam et.” Uyarma, Kınama, Aylıktan kesme, Kademe durdurma, Devlet memurluğundan çıkarma.' },
      },
      {
        h: 'Haklar ve yasaklar',
        viz: { type: 'compare', cols: [
          { h: 'Memurun hakları', c: 'cog', items: ['**Sendika** kurma ve üye olma', '**Toplu sözleşme**', '**Çekilme** (istifa)', 'İzin, sosyal güvenlik', 'Dava açma'] },
          { h: 'Memurun yasakları', c: 'tar', items: ['**Grev** yapamaz', '**Ticaret** ve kazanç getirici faaliyet yapamaz', '**Hediye** alamaz', 'Toplu eylem yapamaz', 'Görevi ile ilgili bilgileri açıklayamaz'] },
        ] },
      },
      {
        k: 'check',
        q: '657’ye göre en ağır disiplin cezası hangisidir?',
        o: ['Kınama', 'Aylıktan kesme', 'Kademe ilerlemesinin durdurulması', 'Devlet memurluğundan çıkarma'],
        a: 3,
        ex: 'UKAKD’nin son harfi: **Devlet memurluğundan çıkarma**.',
      },
    ],
    quiz: [
      { q: '657 sayılı Devlet Memurları Kanunu’na göre 12 yıllık hizmeti bulunan bir memurun yıllık izin süresi kural olarak kaç gündür?', o: ['20', '22', '25', '30', '33'], a: 3, ex: '10 yıldan fazla hizmet → **30 gün**. (2020 sorusu.)' },
      { q: '657 sayılı Devlet Memurları Kanunu’na göre aday memurluk süresi en az ne kadardır?', o: ['2 yıl', '1 yıl', '6 ay', '3 ay', '2 ay'], a: 1, ex: 'En az **1**, en fazla **2 yıl**. (2020 sorusu.)' },
      { q: 'Aşağıdakilerden hangisi 657’de sayılan disiplin cezalarından biri **değildir**?', o: ['Uyarma', 'Kınama', 'Aylıktan kesme', 'Görevden uzaklaştırma', 'Kademe ilerlemesinin durdurulması'], a: 3, ex: '**Görevden uzaklaştırma** bir disiplin cezası değil, **tedbir**dir.', tip: 'UKAKD dışındaki her şey ceza değildir.' },
      { q: 'Devlet memurlarıyla ilgili aşağıdakilerden hangisi **yanlıştır**?', o: ['Sendika kurabilirler.', 'Toplu sözleşme hakları vardır.', 'Grev yapabilirler.', 'Ticaret yapamazlar.', 'Görevden çekilebilirler.'], a: 2, ex: 'Memurlar **grev yapamaz**.' },
      { q: '657’ye göre kadın memura verilen doğum izni toplam kaç haftadır?', o: ['8', '12', '16', '20', '24'], a: 2, ex: 'Doğumdan önce 8 + sonra 8 = **16 hafta**.' },
    ],
    flash: [
      ['Aday memurluk süresi?', 'En az **1 yıl**, en fazla **2 yıl**'],
      ['Yıllık izin (1-10 yıl)?', '**20 gün**'],
      ['Yıllık izin (10 yıldan fazla)?', '**30 gün**'],
      ['Disiplin cezaları kodlaması?', '**UKAKD**: Uyarma, Kınama, Aylıktan kesme, Kademe durdurma, Devlet memurluğundan çıkarma'],
      ['Görevden uzaklaştırma ceza mı?', 'Hayır, **tedbir**'],
      ['Memurlar grev yapabilir mi?', '**Hayır**'],
      ['Evlenme izni?', '**7 gün**'],
    ],
  },

  // ───────────────────────── 8. GÜN ─────────────────────────
  {
    id: 'vat8', s: 'vatandaslik', day: 8, min: 12,
    title: 'İdare: merkezî yönetim ve yerel yönetimler',
    why: 'her yıl ~2 soru',
    cards: [
      {
        h: 'İdarenin iki yarısı',
        viz: { type: 'compare', cols: [
          { h: 'Merkezî idare', c: 'vat', items: ['**Başkent**: Cumhurbaşkanı, CB yardımcıları, **bakanlıklar**', '**Taşra**: **il** (vali), **ilçe** (kaymakam)', 'Hiyerarşi vardır (üst-ast ilişkisi)', 'Vali ve kaymakamı **merkez atar**'] },
          { h: 'Yerinden yönetim', c: 'teal', items: ['**Yer yönünden** (mahallî idareler): **il özel idaresi, belediye, köy**', '**Hizmet yönünden**: üniversiteler, TRT, SGK, barolar gibi meslek kuruluşları', 'Karar organları **seçimle** gelir', 'Merkez **vesayet denetimi** yapar'] },
        ] },
      },
      {
        h: 'Mahallî idarelerin organları',
        b: 'Her birinde bir **karar organı** (meclis), bir **yürütme organı** ve genelde bir **encümen** vardır:',
        viz: { type: 'table', s: 'vatandaslik', head: ['İdare', 'Karar organı', 'Yürütme organı'], rows: [
          ['**İl özel idaresi**', '**İl genel meclisi** (seçilir)', '**Vali** (atanır), il encümeni'],
          ['**Belediye**', '**Belediye meclisi** (seçilir)', '**Belediye başkanı** (seçilir), belediye encümeni'],
          ['**Köy**', '**Köy derneği** (seçmenler)', '**Muhtar** ve **ihtiyar heyeti** (seçilir)'],
        ] },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'İl özel idaresinin, ildeki seçmenlerce seçilen üyelerden oluşan karar organı? → **İl genel meclisi**. (İl idare kurulu **merkezî** idarenin kuruludur; seçimle gelmez.)', exam: true },
      },
      {
        h: 'Tuzak: il idare kurulu mu, il genel meclisi mi?',
        viz: { type: 'compare', cols: [
          { h: 'İl idare kurulu', c: 'vat', items: ['**Merkezî** idareye ait', 'Başkanı vali; üyeleri **il müdürleri**', '**Seçimle gelmez**'] },
          { h: 'İl genel meclisi', c: 'teal', items: ['**İl özel idaresinin** karar organı', 'Üyeleri halk tarafından **seçilir**', '5 yılda bir seçim'] },
        ] },
        mn: { code: 'GENEL MECLİS = GENEL SEÇİM', t: 'Adında “meclis” geçen organ seçimle gelir. “Kurul” geçen merkezî idareye aittir.' },
      },
      {
        h: 'Yerel seçimler ve büyükşehirler',
        b: '- Mahallî idare seçimleri **5 yılda bir** yapılır.\n- **30 büyükşehir** vardır; büyükşehir olan illerde **il özel idaresi kaldırılmıştır**.\n- **Vesayet denetimi**: merkezî idarenin, yerel yönetimlerin işlemlerini kanunun izin verdiği ölçüde denetlemesi. **Hiyerarşi** ise merkezî idarenin kendi içindeki üst-ast ilişkisidir.',
      },
      {
        k: 'check',
        q: 'Belediyenin karar organı hangisidir?',
        o: ['Belediye başkanı', 'Belediye encümeni', 'Belediye meclisi', 'Vali'],
        a: 2,
        ex: 'Karar organı **belediye meclisi**dir; belediye başkanı yürütme organıdır.',
      },
    ],
    quiz: [
      { q: 'İl özel idaresinin, ilgili kanunda gösterilen esas ve usullere göre ildeki seçmenler tarafından seçilmiş üyelerden oluşan karar organı hangisidir?', o: ['İl genel sekreterliği', 'İl idare başkanlığı', 'İl müdürlüğü', 'İl idare kurulu', 'İl genel meclisi'], a: 4, ex: '**İl genel meclisi**. (2020 sorusu.)' },
      { q: 'Aşağıdakilerden hangisi hizmet yönünden yerinden yönetim kuruluşudur?', o: ['Valilik', 'Kaymakamlık', 'Üniversite', 'Bakanlık', 'İl idare kurulu'], a: 2, ex: '**Üniversite** belirli bir hizmeti (yükseköğretim) özerk olarak yürütür.' },
      { q: 'Köyün karar organı hangisidir?', o: ['Muhtar', 'İhtiyar heyeti', 'Köy derneği', 'Kaymakam', 'Belediye meclisi'], a: 2, ex: 'Köyün seçmenlerinden oluşan **köy derneği** karar organıdır.' },
      { q: 'Merkezî idarenin, yerel yönetimlerin işlemleri üzerinde kanunla sınırlı olarak yaptığı denetime ne ad verilir?', o: ['Hiyerarşi', 'Vesayet denetimi', 'Yargı denetimi', 'Meclis denetimi', 'Kamuoyu denetimi'], a: 1, ex: '**Vesayet denetimi**. Hiyerarşi, merkezî idarenin kendi içindedir.' },
      { q: 'Aşağıdakilerden hangisi merkezî idarenin taşra teşkilatında yer alır?', o: ['Belediye başkanı', 'Kaymakam', 'İl genel meclisi', 'Muhtar', 'Belediye meclisi'], a: 1, ex: '**Kaymakam** (ilçe) ve **vali** (il) merkezî idarenin taşradaki temsilcileridir.' },
    ],
    flash: [
      ['Merkezî idarenin taşra teşkilatı?', '**İl (vali)**, **ilçe (kaymakam)**'],
      ['Mahallî idareler?', '**İl özel idaresi, belediye, köy**'],
      ['İl özel idaresinin karar organı?', '**İl genel meclisi** (seçimle)'],
      ['İl idare kurulu nereye ait?', '**Merkezî** idare (seçimle gelmez)'],
      ['Köyün karar organı?', '**Köy derneği**'],
      ['Vesayet ile hiyerarşi farkı?', 'Vesayet: merkez → **yerel** · Hiyerarşi: merkez **içi**'],
    ],
  },

  // ───────────────────────── 9. GÜN ─────────────────────────
  {
    id: 'vat9', s: 'vatandaslik', day: 9, min: 12,
    title: 'Temel haklar, ödevler ve seçim ilkeleri',
    why: '1 soru + genel tekrar',
    cards: [
      {
        h: 'Üç grup hak',
        viz: { type: 'table', s: 'vatandaslik', head: ['Grup', 'Örnekler'], rows: [
          ['**Kişi hakları**', 'Yaşama, kişi dokunulmazlığı, özel hayatın gizliliği, konut dokunulmazlığı, haberleşme, yerleşme-seyahat, din-vicdan, düşünce, basın, toplantı, **mülkiyet**, hak arama'],
          ['**Sosyal ve ekonomik haklar**', 'Ailenin korunması, **eğitim**, **çalışma**, **sendika**, toplu sözleşme, grev, **sosyal güvenlik**, sağlık, konut'],
          ['**Siyasi haklar ve ödevler**', 'Vatandaşlık, **seçme-seçilme**, parti kurma, kamu hizmetine girme, **vatan hizmeti**, **vergi ödevi**, dilekçe, bilgi edinme'],
        ] },
        mn: { code: 'KİŞİ-SOSYAL-SİYASİ', t: 'Kendimle ilgili (kişi) · toplumdaki yaşamımla ilgili (sosyal) · devlet yönetimine katılımımla ilgili (siyasi).' },
      },
      {
        h: 'Savaşta bile dokunulamayanlar',
        b: 'Savaş, seferberlik, olağanüstü hâlde bazı haklar durdurulabilir. Ama şu **çekirdek haklara** asla dokunulamaz:\n- **Yaşama hakkı** (savaş hukukuna uygun fiiller hariç)\n- **Maddi ve manevi varlığın bütünlüğü**\n- **Din, vicdan, düşünce ve kanaat özgürlüğü** (kimse açıklamaya zorlanamaz)\n- **Suç ve cezaların geriye yürümezliği**\n- **Masumiyet karinesi**: suçluluğu mahkeme kararıyla sabit oluncaya kadar kimse suçlu sayılamaz.',
      },
      {
        h: 'Hem hak hem ödev olanlar',
        viz: { type: 'cards', items: [
          ['Eğitim', 'Hem hak hem ödev; ilköğretim **zorunlu ve devlet okullarında parasız**.', 'vat'],
          ['Çalışma', 'Herkesin **hakkı ve ödevi**.', 'mat'],
          ['Vatan hizmeti', 'Her Türk’ün **hakkı ve ödevi**.', 'tar'],
          ['Vergi', 'Herkes **mali gücüne göre** vergi öder (ödev).', 'gray'],
        ] },
      },
      {
        h: 'Seçim ilkeleri',
        b: 'Seçimler şu ilkelere göre yapılır: **serbest, eşit, gizli, tek dereceli, genel oy**; oylar **açık sayılır** ve dökümü yapılır. Seçimler **yargı yönetimi ve denetimi** altındadır: **Yüksek Seçim Kurulu (YSK)**.\n- Seçme yaşı: **18**\n- Seçim kanunlarındaki değişiklikler, yürürlüğe girdikleri tarihten itibaren **1 yıl** içinde yapılacak seçimlerde uygulanmaz.',
        mn: { code: 'SEGTEG + AÇIK SAYIM', t: '**S**erbest, **E**şit, **G**izli, **TE**k dereceli, **G**enel oy; açık sayım ve döküm.' },
      },
      {
        h: 'Kamu Denetçiliği Kurumu (Ombudsman)',
        b: '**TBMM’ye bağlıdır** (2012). Vatandaşların idarenin işleyişiyle ilgili şikâyetlerini inceler. Bilgi edinme hakkı ile birlikte anayasada “**dilekçe, bilgi edinme ve kamu denetçisine başvurma hakkı**” başlığında yer alır.',
      },
      {
        k: 'check',
        q: 'Aşağıdakilerden hangisi olağanüstü hâlde bile dokunulamayan haklardandır?',
        o: ['Seyahat hürriyeti', 'Toplantı ve gösteri yürüyüşü hakkı', 'Yaşama hakkı', 'Basın hürriyeti'],
        a: 2,
        ex: '**Yaşama hakkı** çekirdek haklar arasındadır (savaş hukukuna uygun fiiller hariç).',
      },
    ],
    quiz: [
      { q: '1982 Anayasası’na göre aşağıdakilerden hangisi **sosyal ve ekonomik** haklar arasında yer alır?', o: ['Yaşama hakkı', 'Seçme ve seçilme hakkı', 'Sendika kurma hakkı', 'Konut dokunulmazlığı', 'Dilekçe hakkı'], a: 2, ex: '**Sendika** sosyal-ekonomik haktır. Yaşama ve konut kişi hakkı; seçme ve dilekçe siyasi haktır.' },
      { q: 'Aşağıdakilerden hangisi seçim ilkelerinden biri **değildir**?', o: ['Serbest seçim', 'Eşit oy', 'Gizli oy', 'Açık oy', 'Tek dereceli seçim'], a: 3, ex: 'Oylama **gizli**dir; **sayım ve döküm açık**tır. “Açık oy” bir ilke değildir.' },
      { q: 'Seçimlerin genel yönetim ve denetimini yapan kurum hangisidir?', o: ['İçişleri Bakanlığı', 'TBMM', 'Yüksek Seçim Kurulu', 'Anayasa Mahkemesi', 'Danıştay'], a: 2, ex: '**YSK**. Seçimler yargı yönetim ve denetimi altındadır.' },
      { q: 'Aşağıdakilerden hangisi Anayasa’ya göre hem hak hem ödev olarak düzenlenmiştir?', o: ['Mülkiyet', 'Vatan hizmeti', 'Konut dokunulmazlığı', 'Basın hürriyeti', 'Toplantı hakkı'], a: 1, ex: '**Vatan hizmeti** her Türk’ün hakkı ve ödevidir.' },
      { q: 'Kamu Denetçiliği Kurumu hangi kuruma bağlıdır?', o: ['Cumhurbaşkanlığı', 'Adalet Bakanlığı', 'TBMM', 'Danıştay', 'İçişleri Bakanlığı'], a: 2, ex: '**TBMM**’ye bağlıdır.' },
    ],
    flash: [
      ['Temel hak grupları?', '**Kişi**, **sosyal-ekonomik**, **siyasi**'],
      ['Sendika hakkı hangi grupta?', '**Sosyal ve ekonomik**'],
      ['Seçme-seçilme hangi grupta?', '**Siyasi**'],
      ['Seçim ilkeleri?', 'Serbest, eşit, gizli, tek dereceli, genel oy; **açık sayım**'],
      ['Seçimleri kim yönetir?', '**YSK**'],
      ['Kamu Denetçiliği Kurumu nereye bağlı?', '**TBMM**'],
      ['Hem hak hem ödev?', '**Eğitim, çalışma, vatan hizmeti**'],
    ],
  },
];
