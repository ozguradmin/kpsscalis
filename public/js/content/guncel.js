// GÜNCEL & KÜLTÜR — 6 soru. 2020 Ön Lisans’ta 6 sorunun 4’ü “kültür” (Efes, Fuat Köprülü, UNESCO Dünya Belleği,
// Arif Nihat Asya), 2’si gerçek güncel (Oscar, Yargıtay başkanı) idi. 2024’te UNESCO ahşap camiler soruldu.
// Güncel bilgiler Eylül 2026 itibarıyla birden fazla kaynaktan doğrulandı.

export default [
  // ───────────────────────── 1. GÜN ─────────────────────────
  {
    id: 'gun1', s: 'guncel', day: 1, min: 12,
    title: 'Türkiye’nin UNESCO Dünya Mirası listesi (22 alan)',
    why: 'neredeyse her yıl 1 soru',
    cards: [
      {
        h: 'Bu ders neden ilk gün?',
        b: '“Güncel bilgiler” denince sadece haber aklına gelmesin. ÖSYM bu 6 soruda en çok **Türkiye’nin kültür mirasını** sorar. En sık konu: **UNESCO Dünya Mirası Listesi**. 2024 Ön Lisans’ta “Anadolu’nun Orta Çağ Dönemi Ahşap Hipostil Camileri” soruldu.\nTürkiye’nin listede **22** alanı var (**20 kültürel, 2 karma**).',
      },
      {
        h: 'Harita üzerinde miras alanları',
        viz: { type: 'map', alt: 'UNESCO Dünya Mirası alanları', groups: [{ c: 'gun', iller: ['istanbul', 'nevsehir', 'sivas', 'corum', 'adiyaman', 'denizli', 'antalya', 'karabuk', 'canakkale', 'edirne', 'konya', 'bursa', 'izmir', 'diyarbakir', 'kars', 'aydin', 'sanliurfa', 'malatya', 'ankara', 'manisa', 'eskisehir', 'afyonkarahisar', 'kastamonu'], show: false }] },
        b: 'Mavi renkteki her ilde en az bir Dünya Mirası alanı var.',
      },
      {
        h: 'Tam liste: yıl sırasıyla',
        viz: { type: 'timeline', s: 'guncel', items: [
          { y: '1985', t: '**İstanbul Tarihi Alanları** · **Göreme ve Kapadokya** (karma) · **Divriği Ulu Camii ve Darüşşifası** (Sivas)', key: true },
          { y: '1986', t: '**Hattuşa**: Hitit başkenti (Çorum)' },
          { y: '1987', t: '**Nemrut Dağı** (Adıyaman)' },
          { y: '1988', t: '**Hierapolis-Pamukkale** (karma, Denizli) · **Xanthos-Letoon** (Antalya-Muğla)' },
          { y: '1994', t: '**Safranbolu** (Karabük)' },
          { y: '1998', t: '**Truva** (Çanakkale)' },
          { y: '2011', t: '**Selimiye Camii ve Külliyesi** (Edirne)' },
          { y: '2012', t: '**Çatalhöyük** Neolitik Kenti (Konya)' },
          { y: '2014', t: '**Bursa ve Cumalıkızık** · **Bergama** (İzmir)' },
          { y: '2015', t: '**Diyarbakır Kalesi ve Hevsel Bahçeleri** · **Efes** (İzmir)' },
          { y: '2016', t: '**Ani** Arkeolojik Alanı (Kars)' },
          { y: '2017', t: '**Afrodisias** (Aydın)' },
          { y: '2018', t: '**Göbeklitepe** (Şanlıurfa)', key: true },
          { y: '2021', t: '**Arslantepe Höyüğü** (Malatya)', key: true },
          { y: '2023', t: '**Gordion** (Ankara-Polatlı) · **Anadolu’nun Orta Çağ Dönemi Ahşap Hipostil Camileri**', key: true },
          { y: '2025', t: '**Sardes ve Bin Tepe Lidya Tümülüsleri** (Manisa-Salihli): **en son eklenen**', key: true },
        ] },
        mn: { code: 'GÖBEK-ARSLAN-GORDİON-SARDES', t: 'Son dört dalga: **Göbeklitepe** 2018 → **Arslantepe** 2021 → **Gordion + ahşap camiler** 2023 → **Sardes** 2025. Sınav en çok sonları sorar.' },
      },
      {
        h: 'Ahşap hipostil camiler (2023)',
        b: 'Ahşap direklerle taşınan, düz ahşap tavanlı 5 Selçuklu-Beylikler dönemi camisi birlikte listeye girdi:\n- **Afyon Ulu Camii** (Afyonkarahisar)\n- **Sivrihisar Ulu Camii** (Eskişehir)\n- **Ahi Şerafettin (Arslanhane) Camii** (Ankara)\n- **Mahmut Bey Camii** (Kastamonu, Kasaba köyü)\n- **Eşrefoğlu Camii** (Konya, Beyşehir)',
        note: { h: 'Tuzak', t: 'Karma (hem doğal hem kültürel) alanlar sadece iki tane: **Kapadokya** ve **Pamukkale**. Soruda “doğal güzellik + tarihî yapı birlikte” diyorsa bu ikisini düşün.', exam: true },
      },
      {
        k: 'check',
        q: 'Türkiye’nin UNESCO Dünya Mirası Listesi’ne en son (2025) eklenen alanı hangisidir?',
        o: ['Gordion', 'Arslantepe Höyüğü', 'Sardes ve Bin Tepe Lidya Tümülüsleri', 'Göbeklitepe'],
        a: 2,
        ex: '**Sardes** (Manisa), 2025’te listeye girdi. Gordion 2023, Arslantepe 2021, Göbeklitepe 2018.',
      },
    ],
    quiz: [
      { q: 'Aşağıdakilerden hangisi Türkiye’nin UNESCO Dünya Mirası Listesi’nde **karma** (hem doğal hem kültürel) miras olarak yer alan alanlarından biridir?', o: ['Efes', 'Göreme Millî Parkı ve Kapadokya', 'Safranbolu', 'Truva', 'Ani'], a: 1, ex: 'Karma alanlar: **Kapadokya** ve **Pamukkale**.' },
      { q: 'İzmir ili Selçuk ilçesi sınırları içinde bulunan, Artemis Tapınağı ve Celsus Kütüphanesi gibi yapılarıyla tanınan antik kent hangisidir?', o: ['Efes', 'Antandros', 'Anemurium', 'Xanthos', 'Dara'], a: 0, ex: '**Efes**, 2015’te listeye girdi. (2020 Ön Lisans sorusu.)' },
      { q: '2021 yılında UNESCO Dünya Mirası Listesi’ne alınan ve Malatya’da bulunan alan hangisidir?', o: ['Çatalhöyük', 'Arslantepe Höyüğü', 'Göbeklitepe', 'Hattuşa', 'Gordion'], a: 1, ex: '**Arslantepe Höyüğü** (Malatya).' },
      { q: 'Aşağıdakilerden hangisi 2023’te Dünya Mirası Listesi’ne giren “Anadolu’nun Orta Çağ Dönemi Ahşap Hipostil Camileri” arasında **yer almaz**?', o: ['Afyon Ulu Camii', 'Sivrihisar Ulu Camii', 'Eşrefoğlu Camii', 'Selimiye Camii', 'Mahmut Bey Camii'], a: 3, ex: '**Selimiye** (Edirne) taş bir Mimar Sinan eseridir; 2011’de ayrı olarak listeye girdi.' },
      { q: 'Aşağıdaki eşleştirmelerden hangisi **yanlıştır**?', o: ['Göbeklitepe – Şanlıurfa', 'Hattuşa – Çorum', 'Nemrut Dağı – Adıyaman', 'Afrodisias – Aydın', 'Ani – Van'], a: 4, ex: '**Ani** Arkeolojik Alanı **Kars**’tadır.' },
    ],
    flash: [
      ['Türkiye’nin kaç Dünya Mirası alanı var?', '**22** (20 kültürel, 2 karma)'],
      ['Karma alanlar?', '**Kapadokya** ve **Pamukkale**'],
      ['En son eklenen (2025)?', '**Sardes ve Bin Tepe Lidya Tümülüsleri** (Manisa)'],
      ['2023’te eklenenler?', '**Gordion** ve **Ahşap Hipostil Camiler**'],
      ['2021’de eklenen?', '**Arslantepe** (Malatya)'],
      ['2018’de eklenen?', '**Göbeklitepe** (Şanlıurfa)'],
      ['Efes nerede?', 'İzmir, **Selçuk**'],
      ['Ani nerede?', '**Kars**'],
    ],
  },

  // ───────────────────────── 2. GÜN ─────────────────────────
  {
    id: 'gun2', s: 'guncel', day: 2, min: 11,
    title: 'Somut olmayan miras, Dünya Belleği ve UNESCO anma yılları',
    why: '1 soru',
    cards: [
      {
        h: 'Somut olmayan kültürel miras nedir?',
        b: 'Bina ya da eşya değil, **yaşayan gelenekler**: ustalıklar, törenler, sözlü anlatılar, oyunlar. Türkiye’nin UNESCO listelerinde **32** unsuru var. En sonuncusu: **Antep İşi Nakışı** (Aralık 2025).',
        viz: { type: 'cards', items: [
          ['Sahne ve anlatı', '**Meddahlık**, **Karagöz**, **Âşıklık** geleneği, **Nasreddin Hoca** fıkralarını anlatma, **Dede Korkut** mirası', 'gun'],
          ['Tören ve festival', '**Mevlevi Sema** töreni, **Nevruz**, **Hıdrellez**, **Kırkpınar** yağlı güreşleri, **Mesir Macunu** festivali, **iftar**', 'ink'],
          ['El sanatları', '**Ebru**, **Çini**, **Minyatür**, **Hüsn-i Hat**, **Antep İşi** (2025)', 'mat'],
          ['Yeme-içme ve diğer', '**Türk kahvesi**, **çay kültürü**, **keşkek**, **ince hamur (yufka-lavaş)**, **ıslık dili** (Giresun-Kuşköy), **geleneksel Türk okçuluğu**', 'cog'],
        ] },
      },
      {
        h: 'Dünya Belleği: belgeler de miras',
        b: 'UNESCO’nun **Dünya Belleği** programı, kaybolma tehlikesindeki önemli **belge ve yazmaları** korur. Türkiye’nin önerisiyle listeye girenlerden bazıları:\n- **Kültepe Tabletleri** (Kayseri; Asurlu tüccarların yazışmaları)\n- **Hitit çivi yazılı tabletleri** (Boğazköy arşivi)\n- **Evliya Çelebi’nin Seyahatnamesi**\n- **Kandilli Rasathanesi** el yazmaları\n- **İbn-i Sina**’nın Süleymaniye’deki eserleri',
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Türkiye’nin önerisiyle Dünya Belleği Kütüğü’ne giren belgesel miras?” → **Kültepe Tabletleri**. Tuzak şık: Orhun Kitabeleri (onlar Moğolistan’da).', exam: true },
      },
      {
        h: 'UNESCO anma ve kutlama yılları',
        b: 'UNESCO, ünlü kişilerin ve olayların **50 yılın katı** olan yıl dönümlerini anar. Türkiye’nin önerisiyle **2026** için kabul edilenler:',
        viz: { type: 'cards', items: [
          ['Bâkî', '**Doğumunun 500. yılı** (2026). Divan şiirinin “sultanüşşuara”sı; Kanuni için yazdığı mersiyeyle ünlü.', 'gun'],
          ['Şeyh Edebali', '**Vefatının 700. yılı** (2026). Osman Gazi’nin kayınpederi ve manevi rehberi; “İnsanı yaşat ki devlet yaşasın.”', 'ink'],
        ] },
        mn: { code: 'BÂKÎ 500 · EDEBALİ 700', t: '2026: şairin 500. doğumu, bilgenin 700. vefatı.' },
      },
      {
        k: 'check',
        q: 'Türkiye’nin somut olmayan kültürel miras listesine 2025’te eklenen unsur hangisidir?',
        o: ['Ebru', 'Antep İşi Nakışı', 'Türk Kahvesi', 'Karagöz'],
        a: 1,
        ex: '**Antep İşi Nakışı**, 11 Aralık 2025’te listeye girdi; unsur sayısı 32 oldu.',
      },
    ],
    quiz: [
      { q: 'UNESCO Dünya Belleği Kütüğü’nde Türkiye’nin önerisiyle listelenen belgesel miraslardan biri hangisidir?', o: ['Kültepe Tabletleri', 'Manas Destanı', 'Orhun Kitabeleri', 'Türeyiş Destanı', 'Dede Korkut Hikâyeleri'], a: 0, ex: '**Kültepe Tabletleri**. (2020 Ön Lisans sorusu.)' },
      { q: 'Aşağıdakilerden hangisi UNESCO İnsanlığın Somut Olmayan Kültürel Mirası listesinde yer alan Türkiye unsurlarından biri **değildir**?', o: ['Meddahlık', 'Ebru', 'Mevlevi Sema Töreni', 'Nemrut Dağı', 'Türk kahvesi kültürü'], a: 3, ex: '**Nemrut Dağı** somut (fiziksel) bir alandır; **Dünya Mirası Listesi**’ndedir.' },
      { q: 'UNESCO’nun 2026 anma ve kutlama yıl dönümleri arasında Türkiye’nin önerisiyle yer alan ve doğumunun 500. yılı anılan divan şairi kimdir?', o: ['Fuzûlî', 'Nedîm', 'Bâkî', 'Nef’î', 'Şeyh Gâlib'], a: 2, ex: '**Bâkî** (1526 doğumlu).' },
      { q: 'Vefatının 700. yılı nedeniyle 2026’da UNESCO tarafından anılan, Osman Gazi’nin manevi rehberi kimdir?', o: ['Ahi Evran', 'Hacı Bektaş Veli', 'Şeyh Edebali', 'Yunus Emre', 'Hoca Ahmet Yesevi'], a: 2, ex: '**Şeyh Edebali** (1326’da vefat etti).' },
    ],
    flash: [
      ['Türkiye’nin somut olmayan miras unsur sayısı?', '**32**'],
      ['En son eklenen somut olmayan unsur?', '**Antep İşi Nakışı** (2025)'],
      ['Dünya Belleği’nde Türkiye’den bir belge?', '**Kültepe Tabletleri** (ayrıca Evliya Çelebi Seyahatnamesi)'],
      ['UNESCO 2026 anma: Bâkî?', 'Doğumunun **500.** yılı'],
      ['UNESCO 2026 anma: Şeyh Edebali?', 'Vefatının **700.** yılı'],
    ],
  },

  // ───────────────────────── 3. GÜN ─────────────────────────
  {
    id: 'gun3', s: 'guncel', day: 3, min: 12,
    title: 'Türkiye ve dünya gündemi: 2025-2026 zirveleri',
    why: '1-2 soru',
    cards: [
      {
        h: 'Türkiye’nin ev sahipliği yaptığı büyük buluşmalar',
        viz: { type: 'timeline', s: 'guncel', items: [
          { y: 'Mayıs-Temmuz 2025', t: '**Rusya-Ukrayna doğrudan görüşmeleri İstanbul’da** yapıldı.' },
          { y: '7 Ekim 2025', t: '**Türk Devletleri Teşkilatı 12. Zirvesi**: **Gebele** (Azerbaycan), tema “Bölgesel barış ve güvenlik”. 13. zirvenin **2026’da Türkiye**’de yapılması kararlaştırıldı.' },
          { y: '20 Mayıs 2026', t: '**UEFA Avrupa Ligi finali İstanbul**’da (Beşiktaş Stadyumu): **Aston Villa**, Freiburg’u 3-0 yendi.' },
          { y: '7-8 Temmuz 2026', t: '**NATO Ankara Zirvesi**: 2004 İstanbul’dan sonra Türkiye’deki ikinci NATO zirvesi.', key: true },
          { y: '9-20 Kasım 2026', t: '**COP31** (BM İklim Değişikliği Konferansı) **Antalya**’da. (COP30, 2025’te Brezilya’daydı.)', key: true },
        ] },
        mn: { code: 'NATO ANKARA · COP ANTALYA', t: '“**A**nkara’da **N**ATO, **A**ntalya’da iklim.” İkisi de A ile başlar, ikisi de 2026.' },
      },
      {
        h: 'İlan edilen yıllar',
        viz: { type: 'table', s: 'guncel', head: ['Kim ilan etti', 'Yıl', 'Adı'], rows: [
          ['Türkiye', '**2025**', '**Aile Yılı**'],
          ['Türkiye', '**2026-2035**', '**Aile ve Nüfus On Yılı**'],
          ['Birleşmiş Milletler', '**2026**', '**Uluslararası Mera ve Göçebe Hayvancılık Yılı**'],
          ['Birleşmiş Milletler', '**2026**', 'Uluslararası **Kadın Çiftçi** Yılı'],
        ] },
      },
      {
        h: 'Kültür başkentleri 2026',
        viz: { type: 'cards', items: [
          ['Türk Dünyası Kültür Başkenti', '**2025: Aktav** (Kazakistan) → **2026: Andican** (Özbekistan)', 'gun'],
          ['Türk Dünyası Turizm Başkenti', '**2026: Ankara**', 'ink'],
          ['Avrupa Kültür Başkentleri', '**2026: Oulu** (Finlandiya) ve **Trenčín** (Slovakya)', 'blue'],
          ['UNESCO Dünya Kitap Başkenti', '**2026: Rabat** (Fas)', 'mat'],
        ] },
      },
      {
        k: 'check',
        q: '2026 NATO Zirvesi hangi şehirde yapıldı?',
        o: ['İstanbul', 'Ankara', 'Brüksel', 'Lahey'],
        a: 1,
        ex: '**Ankara**, 7-8 Temmuz 2026. (Lahey 2025 zirvesiydi; İstanbul 2004.)',
      },
    ],
    quiz: [
      { q: '7-8 Temmuz 2026 tarihlerinde NATO Devlet ve Hükümet Başkanları Zirvesi hangi şehirde düzenlenmiştir?', o: ['İstanbul', 'Ankara', 'Vilnius', 'Washington', 'Madrid'], a: 1, ex: '**Ankara**.' },
      { q: 'Birleşmiş Milletler İklim Değişikliği Çerçeve Sözleşmesi Taraflar Konferansı’nın 31.si (COP31) hangi şehirde yapılacaktır?', o: ['İzmir', 'İstanbul', 'Antalya', 'Belem', 'Bakü'], a: 2, ex: '**Antalya**, 9-20 Kasım 2026. Belem (Brezilya) COP30’un, Bakü COP29’un yeriydi.' },
      { q: 'TÜRKSOY tarafından 2026 Türk Dünyası Kültür Başkenti ilan edilen şehir hangisidir?', o: ['Aktav', 'Şuşa', 'Andican', 'Anav', 'Türkistan'], a: 2, ex: '**Andican** (Özbekistan). 2025’te Aktav (Kazakistan) idi.' },
      { q: 'Birleşmiş Milletler 2026 yılını aşağıdakilerden hangisi olarak ilan etmiştir?', o: ['Uluslararası Kuantum Bilimi Yılı', 'Uluslararası Mera ve Göçebe Hayvancılık Yılı', 'Uluslararası Deve Yılı', 'Uluslararası Mağaralar Yılı', 'Uluslararası Buzulların Korunması Yılı'], a: 1, ex: 'BM 2026’yı **Uluslararası Mera ve Göçebe Hayvancılık Yılı** ilan etti. (2025 Kuantum Bilimi ve Buzulların Korunması Yılı, 2024 Deve Yılı idi.)' },
      { q: 'Türkiye’de 2026-2035 dönemi nasıl ilan edilmiştir?', o: ['Dijital Dönüşüm On Yılı', 'Aile ve Nüfus On Yılı', 'Yeşil Kalkınma On Yılı', 'Gençlik On Yılı', 'Türkiye Yüzyılı On Yılı'], a: 1, ex: '**Aile ve Nüfus On Yılı**. 2025 ise **Aile Yılı** olarak ilan edilmişti.' },
    ],
    flash: [
      ['2026 NATO Zirvesi?', '**Ankara**, 7-8 Temmuz 2026'],
      ['COP31 nerede, ne zaman?', '**Antalya**, 9-20 Kasım 2026'],
      ['TDT 12. Zirvesi?', '**Gebele** (Azerbaycan), Ekim 2025; 13. zirve 2026’da Türkiye’de'],
      ['2026 Türk Dünyası Kültür Başkenti?', '**Andican** (Özbekistan)'],
      ['BM 2026 yılı?', 'Uluslararası **Mera ve Göçebe Hayvancılık** Yılı'],
      ['Türkiye 2025 yılını ne ilan etti?', '**Aile Yılı**'],
      ['2026 Avrupa Kültür Başkentleri?', '**Oulu** ve **Trenčín**'],
    ],
  },

  // ───────────────────────── 4. GÜN ─────────────────────────
  {
    id: 'gun4', s: 'guncel', day: 4, min: 10,
    title: 'Spor: 2025-2026’nın büyük başarıları',
    why: '1 soru',
    cards: [
      {
        h: 'Millî takımların yılı',
        viz: { type: 'timeline', s: 'guncel', items: [
          { y: 'Eylül 2025', t: '**Filenin Sultanları** Dünya Şampiyonası finalinde İtalya’ya 3-2 yenildi: **dünya ikincisi** (gümüş). Final Tayland’da oynandı.' },
          { y: 'Eylül 2025', t: '**12 Dev Adam** EuroBasket finalinde Almanya’ya 88-83 yenildi: **Avrupa ikincisi** (gümüş). **Alperen Şengün** turnuvanın en iyi beşinde.', key: true },
          { y: '31 Mart 2026', t: '**A Millî Futbol Takımı** play-off finalinde **Kosova**’yı 1-0 yendi (gol: **Kerem Aktürkoğlu**) ve **2002’den sonra ilk kez** Dünya Kupası’na katıldı.', key: true },
          { y: 'Haziran 2026', t: 'Dünya Kupası’nda D Grubu’nda (ABD, Paraguay, Avustralya) mücadele etti, **grup aşamasında** elendi.' },
          { y: 'Temmuz 2026', t: '**Filenin Sultanları** Makao’da Brezilya’yı 3-1 yenerek **Milletler Ligi şampiyonu** oldu (2023’ten sonra **ikinci** kez). MVP: **Melissa Vargas**.', key: true },
        ] },
      },
      {
        h: 'Dünyada büyük organizasyonlar',
        viz: { type: 'table', s: 'guncel', head: ['Organizasyon', 'Nerede / sonuç'], rows: [
          ['**2026 FIFA Dünya Kupası**', '**ABD, Kanada, Meksika** (ilk kez **48 takım**). Şampiyon: **İspanya** (finalde Arjantin’i 1-0 yendi)'],
          ['**2026 Kış Olimpiyatları**', '**Milano-Cortina** (İtalya)'],
          ['**2026 UEFA Avrupa Ligi finali**', '**İstanbul**: şampiyon **Aston Villa**'],
          ['**2024 Paris Olimpiyatları**', 'Türkiye altın alamadı; 3 gümüş, 5 bronz. Atıcılıkta **Yusuf Dikeç** gümüş.'],
        ] },
        mn: { code: 'İSPANYA 2. YILDIZ', t: '2026 Dünya Kupası: İspanya ikinci kez dünya şampiyonu (ilki 2010).' },
      },
      {
        k: 'check',
        q: 'A Millî Futbol Takımı 2026 Dünya Kupası biletini hangi takımı yenerek aldı?',
        o: ['Romanya', 'Kosova', 'Slovakya', 'İspanya'],
        a: 1,
        ex: 'Play-off yarı finalinde Romanya’yı, **finalde Kosova**’yı 1-0 yendi.',
      },
    ],
    quiz: [
      { q: '2025 EuroBasket’te finalde Almanya’ya yenilerek gümüş madalya kazanan millî takımımızın adı nedir?', o: ['Filenin Sultanları', '12 Dev Adam', 'Potanın Perileri', 'Filenin Efeleri', 'Ay-Yıldızlılar'], a: 1, ex: 'Erkek basketbol millî takımı: **12 Dev Adam**.' },
      { q: 'Filenin Sultanları 2026 FIVB Milletler Ligi finalinde hangi ülkeyi yenerek şampiyon olmuştur?', o: ['İtalya', 'ABD', 'Brezilya', 'Çin', 'Japonya'], a: 2, ex: '**Brezilya**’yı 3-1 yendi; ikinci Milletler Ligi şampiyonluğu.' },
      { q: '2026 FIFA Dünya Kupası’nı kazanan ülke hangisidir?', o: ['Arjantin', 'Fransa', 'Brezilya', 'İspanya', 'Almanya'], a: 3, ex: '**İspanya**, finalde Arjantin’i uzatmalarda 1-0 yendi.' },
      { q: '2026 FIFA Dünya Kupası’na ev sahipliği yapan ülkeler hangi seçenekte doğru verilmiştir?', o: ['Katar', 'ABD – Kanada – Meksika', 'Rusya', 'İspanya – Portekiz – Fas', 'Brezilya'], a: 1, ex: '**ABD, Kanada, Meksika**; ilk kez 48 takım katıldı. (2030: İspanya-Portekiz-Fas.)' },
      { q: '2026 UEFA Avrupa Ligi finali hangi şehirde oynanmıştır?', o: ['Budapeşte', 'İstanbul', 'Londra', 'Madrid', 'Berlin'], a: 1, ex: '**İstanbul** (Beşiktaş Stadyumu); şampiyon Aston Villa.' },
    ],
    flash: [
      ['EuroBasket 2025’te 12 Dev Adam?', '**Gümüş** (finalde Almanya)'],
      ['Filenin Sultanları 2026?', '**Milletler Ligi şampiyonu** (Brezilya 3-1)'],
      ['Filenin Sultanları 2025 Dünya Şampiyonası?', '**Gümüş** (finalde İtalya)'],
      ['A Millî Takım Dünya Kupası’na kaç yıl sonra gitti?', '**24 yıl** (2002’den sonra ilk)'],
      ['2026 Dünya Kupası şampiyonu?', '**İspanya**'],
      ['2026 Kış Olimpiyatları?', '**Milano-Cortina**'],
    ],
  },

  // ───────────────────────── 5. GÜN ─────────────────────────
  {
    id: 'gun5', s: 'guncel', day: 5, min: 10,
    title: 'Ödüller: Nobel ve Oscar',
    why: '0-1 soru',
    cards: [
      {
        h: '2025 Nobel ödülleri',
        viz: { type: 'table', s: 'guncel', head: ['Alan', 'Kazanan'], rows: [
          ['**Edebiyat**', '**László Krasznahorkai** (Macar yazar)'],
          ['**Barış**', '**María Corina Machado** (Venezuelalı muhalif siyasetçi)'],
          ['Fizik', 'John Clarke, Michel Devoret, John Martinis'],
          ['Kimya', 'Susumu Kitagawa, Richard Robson, Omar M. Yaghi'],
          ['Tıp', 'Mary Brunkow, Fred Ramsdell, Shimon Sakaguchi'],
          ['Ekonomi', 'Joel Mokyr, Philippe Aghion, Peter Howitt'],
        ] },
        mn: { code: 'MACAR KALEM · VENEZUELA BARIŞ', t: 'KPSS en çok **edebiyat** ve **barış** ödülünü sorar. Krasznahorkai Macar, Machado Venezuelalı.' },
      },
      {
        h: 'Türk Nobelliler',
        viz: { type: 'cards', items: [
          ['Orhan Pamuk', '**2006 Nobel Edebiyat Ödülü**. Eserleri: Benim Adım Kırmızı, Kar, Masumiyet Müzesi.', 'gun'],
          ['Aziz Sancar', '**2015 Nobel Kimya Ödülü**. DNA onarımı üzerine çalışmalar.', 'ink'],
        ] },
      },
      {
        h: '2026 Oscar ödülleri (98. Akademi Ödülleri)',
        viz: { type: 'table', s: 'guncel', head: ['Kategori', 'Kazanan'], rows: [
          ['**En iyi film**', '**One Battle After Another**'],
          ['**En iyi yönetmen**', '**Paul Thomas Anderson**'],
          ['En iyi erkek oyuncu', 'Michael B. Jordan (Sinners)'],
          ['En iyi kadın oyuncu', 'Jessie Buckley (Hamnet)'],
        ] },
        note: { h: 'Neden önemli?', t: '2020 Ön Lisans’ta “92. Oscar’da en iyi erkek oyuncu” soruldu. Yani ÖSYM sınav yılındaki Oscar’ı sorabiliyor.', exam: true },
      },
      {
        k: 'check',
        q: '2025 Nobel Edebiyat Ödülü’nü kazanan yazar hangi ülkedendir?',
        o: ['Güney Kore', 'Macaristan', 'Norveç', 'Fransa'],
        a: 1,
        ex: '**László Krasznahorkai**, Macar yazar. (2024’te Güney Koreli Han Kang, 2023’te Norveçli Jon Fosse kazanmıştı.)',
      },
    ],
    quiz: [
      { q: '2025 Nobel Edebiyat Ödülü’nü kazanan yazar kimdir?', o: ['Han Kang', 'Jon Fosse', 'László Krasznahorkai', 'Annie Ernaux', 'Haruki Murakami'], a: 2, ex: '**Krasznahorkai** (Macaristan). Han Kang 2024, Fosse 2023, Ernaux 2022.' },
      { q: '2025 Nobel Barış Ödülü’nü kazanan María Corina Machado hangi ülkenin siyasetçisidir?', o: ['Kolombiya', 'Venezuela', 'Arjantin', 'Şili', 'Küba'], a: 1, ex: '**Venezuela**.' },
      { q: 'Nobel Kimya Ödülü’nü kazanan ilk Türk bilim insanı kimdir?', o: ['Cahit Arf', 'Aziz Sancar', 'Oktay Sinanoğlu', 'Gazi Yaşargil', 'Canan Dağdeviren'], a: 1, ex: '**Aziz Sancar**, 2015.' },
      { q: '2026’daki 98. Oscar Ödülleri’nde “En İyi Film” ödülünü hangi film kazanmıştır?', o: ['Oppenheimer', 'Anora', 'One Battle After Another', 'Sinners', 'Hamnet'], a: 2, ex: '**One Battle After Another** (yönetmen Paul Thomas Anderson). Oppenheimer 2024’ün, Anora 2025’in en iyi filmiydi.' },
    ],
    flash: [
      ['2025 Nobel Edebiyat?', '**László Krasznahorkai** (Macar)'],
      ['2025 Nobel Barış?', '**María Corina Machado** (Venezuela)'],
      ['Orhan Pamuk Nobel yılı?', '**2006**, Edebiyat'],
      ['Aziz Sancar Nobel yılı?', '**2015**, Kimya'],
      ['2026 Oscar en iyi film?', '**One Battle After Another**'],
    ],
  },

  // ───────────────────────── 6. GÜN ─────────────────────────
  {
    id: 'gun6', s: 'guncel', day: 6, min: 12,
    title: 'Kültür büyüklerimiz: kim, ne ile tanınır?',
    why: 'her yıl 1-2 soru',
    cards: [
      {
        h: 'Bir isim, bir eser',
        b: 'ÖSYM kişiyi tanıtan bir ipucu verip “kimdir?” diye sorar (2020’de Arif Nihat Asya ve Fuat Köprülü soruldu). Her kişiyi **tek bir anahtar bilgiyle** tanı:',
        viz: { type: 'table', s: 'guncel', head: ['Kişi', 'Anahtar bilgi'], rows: [
          ['**Mehmet Akif Ersoy**', '**İstiklal Marşı** (12 Mart 1921); **Safahat**'],
          ['**Arif Nihat Asya**', '“**Bayrak**” şiiri; “**Bayrak şairi**” (Adana’nın kurtuluşu için)'],
          ['**Mehmet Fuat Köprülü**', 'Türk edebiyatı ve tarih çalışmaları; **Demokrat Parti döneminde Dışişleri Bakanı**'],
          ['**Yunus Emre**', 'Tasavvuf şiiri, sade Türkçe; “Gelin tanış olalım”'],
          ['**Mevlânâ**', '**Mesnevi**; Konya; Sema'],
          ['**Evliya Çelebi**', '**Seyahatname** (10 cilt)'],
          ['**Kâtip Çelebi**', '**Cihannüma**, **Keşfü’z-Zunun**'],
          ['**Piri Reis**', '**Kitab-ı Bahriye**, 1513 dünya haritası'],
          ['**Mimar Sinan**', 'Şehzade (çıraklık), **Süleymaniye** (kalfalık), **Selimiye** (ustalık)'],
          ['**Cahit Arf**', 'Matematikçi; **Arf değişmezi**; 10 TL banknotunda'],
          ['**Afet İnan**', 'Tarihçi; Atatürk’ün manevi kızı'],
          ['**Âşık Veysel**', '“Uzun ince bir yoldayım”'],
          ['**Neşet Ertaş**', '“**Bozkırın tezenesi**”'],
          ['**Ahmet Hamdi Tanpınar**', '**Huzur**, **Saatleri Ayarlama Enstitüsü**'],
          ['**Yaşar Kemal**', '**İnce Memed**'],
        ] },
      },
      {
        h: 'Eski Türk ve İslam bilginleri',
        viz: { type: 'cards', items: [
          ['Kaşgarlı Mahmut', '**Divanü Lügati’t-Türk** (ilk Türkçe sözlük)', 'gun'],
          ['Yusuf Has Hacip', '**Kutadgu Bilig**', 'ink'],
          ['Uluğ Bey & Ali Kuşçu', 'Astronomi; Semerkant rasathanesi', 'blue'],
          ['Farabi', '“**Muallim-i Sani**” (ikinci öğretmen); müzik ve felsefe', 'violet'],
          ['İbn-i Sina', 'Tıp: **El-Kanun fi’t-Tıb**', 'tar'],
          ['Biruni', 'Dünyanın çevresini hesapladı', 'cog'],
        ] },
      },
      {
        k: 'check',
        q: '“Bayrak” şiiriyle tanınan ve “Bayrak şairi” olarak anılan şair kimdir?',
        o: ['Mehmet Akif Ersoy', 'Arif Nihat Asya', 'Necip Fazıl Kısakürek', 'Ceyhun Atuf Kansu'],
        a: 1,
        ex: '**Arif Nihat Asya**; şiiri 5 Ocak Adana’nın kurtuluşu kutlamaları için yazdı. (2020 sorusu.)',
      },
    ],
    quiz: [
      { q: '5 Ocak Adana’nın Kurtuluşu kutlamaları için kaleme aldığı “Bayrak” adlı şiiriyle tanınan ve “Bayrak Şairi” olarak anılan şair hangisidir?', o: ['Ceyhun Atuf Kansu', 'Osman Yüksel Serdengeçti', 'Sabahattin Kudret Aksal', 'Ahmet Muhip Dıranas', 'Arif Nihat Asya'], a: 4, ex: '**Arif Nihat Asya**. (2020 sorusu.)' },
      { q: 'Demokrat Parti döneminde Dışişleri Bakanlığı görevinde bulunan, Türk halk edebiyatı ve tarih alanındaki çalışmalarıyla tanınan kişi kimdir?', o: ['Oktay Sinanoğlu', 'Hulusi Behçet', 'Mehmet Fuat Köprülü', 'Afet İnan', 'Cahit Arf'], a: 2, ex: '**Mehmet Fuat Köprülü**. (2020 sorusu.)' },
      { q: '“Seyahatname” adlı 10 ciltlik eserin yazarı kimdir?', o: ['Kâtip Çelebi', 'Evliya Çelebi', 'Piri Reis', 'Naima', 'Aşıkpaşazade'], a: 1, ex: '**Evliya Çelebi**. Eser UNESCO Dünya Belleği’nde de yer alır.' },
      { q: 'Mimar Sinan’ın “ustalık eserim” dediği yapı hangisidir?', o: ['Şehzade Camii', 'Süleymaniye Camii', 'Selimiye Camii', 'Sultanahmet Camii', 'Mihrimah Sultan Camii'], a: 2, ex: 'Çıraklık Şehzade, kalfalık Süleymaniye, ustalık **Selimiye** (Edirne).' },
      { q: '“Huzur” ve “Saatleri Ayarlama Enstitüsü” romanlarının yazarı kimdir?', o: ['Yaşar Kemal', 'Orhan Pamuk', 'Ahmet Hamdi Tanpınar', 'Sait Faik Abasıyanık', 'Reşat Nuri Güntekin'], a: 2, ex: '**Ahmet Hamdi Tanpınar**.' },
    ],
    flash: [
      ['İstiklal Marşı?', '**Mehmet Akif Ersoy**, 12 Mart 1921'],
      ['Bayrak şairi?', '**Arif Nihat Asya**'],
      ['Seyahatname?', '**Evliya Çelebi**'],
      ['Kitab-ı Bahriye?', '**Piri Reis**'],
      ['Mimar Sinan’ın ustalık eseri?', '**Selimiye** (Edirne)'],
      ['Divanü Lügati’t-Türk?', '**Kaşgarlı Mahmut**'],
      ['Bozkırın tezenesi?', '**Neşet Ertaş**'],
    ],
  },

  // ───────────────────────── 7. GÜN ─────────────────────────
  {
    id: 'gun7', s: 'guncel', day: 7, min: 10,
    title: 'Bilim, teknoloji, uzay ve doğa: Türkiye’nin yeni “ilk”leri',
    why: '1 soru',
    cards: [
      {
        h: 'Uzay ve havacılık',
        viz: { type: 'timeline', s: 'guncel', items: [
          { y: 'Nisan 2023', t: '**HÜRJET** (jet eğitim uçağı) ilk uçuşunu yaptı.' },
          { y: 'Ocak 2024', t: '**Alper Gezeravcı**: **ilk Türk astronot**; Uluslararası Uzay İstasyonu’na (Ax-3) gitti.', key: true },
          { y: 'Şubat 2024', t: '**KAAN** millî muharip uçağı ilk uçuşunu yaptı.', key: true },
          { y: 'Haziran 2024', t: '**Tuva Cihangir Atasever**: **ikinci Türk astronot** (yörünge altı uçuş).' },
          { y: 'Temmuz 2024', t: '**Türksat 6A**: **ilk yerli haberleşme uydusu** fırlatıldı.', key: true },
        ] },
        mn: { code: 'ALPER İLK · TUVA İKİNCİ · 6A YERLİ', t: 'Gezeravcı uzay istasyonuna giden ilk Türk; Atasever ikinci; Türksat 6A ilk yerli haberleşme uydusu.' },
      },
      {
        h: 'Enerji',
        viz: { type: 'cards', items: [
          ['Sakarya Gaz Sahası', 'Karadeniz’de; 2020’de keşfedildi, **Filyos** üzerinden üretim.', 'teal'],
          ['Gabar', 'Şırnak’ta petrol üretimi.', 'dark'],
          ['Akkuyu', 'İlk nükleer santral, **Mersin**.', 'violet'],
        ] },
      },
      {
        h: 'Doğa koruma: yeni ilanlar',
        b: '- **Geben Vadisi** (Kahramanmaraş) **30 Mayıs 2025**’te millî park ilan edildi ve Türkiye’deki **millî park sayısı 50** oldu.\n- **Dilim Kayalar** (Tokat, Niksar) Türkiye’nin **112. tabiat anıtı** oldu.\nKoruma statülerini karıştırma: **millî park** (en geniş koruma), **tabiat parkı**, **tabiat anıtı** (tek bir doğal oluşum: kaya, ağaç, şelale), **sulak alan** (Ramsar).',
      },
      {
        k: 'check',
        q: 'Uluslararası Uzay İstasyonu’na giden ilk Türk astronot kimdir?',
        o: ['Tuva Cihangir Atasever', 'Alper Gezeravcı', 'Canan Dağdeviren', 'Selçuk Bayraktar'],
        a: 1,
        ex: '**Alper Gezeravcı** (Ocak 2024).',
      },
    ],
    quiz: [
      { q: 'Türkiye’nin ilk yerli ve millî haberleşme uydusu hangisidir?', o: ['Türksat 5A', 'Göktürk-1', 'Türksat 6A', 'İMECE', 'RASAT'], a: 2, ex: '**Türksat 6A** (2024). İMECE ve Göktürk gözlem uydularıdır.' },
      { q: 'Türkiye’nin 50. millî parkı olarak ilan edilen alan hangisidir?', o: ['Nemrut Kalderası', 'Geben Vadisi', 'Salda Gölü', 'Abant Gölü', 'Kaçkar Dağları'], a: 1, ex: '**Geben Vadisi** (Kahramanmaraş), Mayıs 2025.' },
      { q: 'Türkiye’nin ilk nükleer santrali hangi ilde kurulmaktadır?', o: ['Sinop', 'Kırklareli', 'Mersin', 'Samsun', 'Hatay'], a: 2, ex: '**Mersin** (Akkuyu).' },
      { q: 'Millî muharip uçak KAAN ilk uçuşunu hangi yıl yapmıştır?', o: ['2021', '2022', '2023', '2024', '2025'], a: 3, ex: '**Şubat 2024**.' },
    ],
    flash: [
      ['İlk Türk astronot?', '**Alper Gezeravcı** (2024)'],
      ['İkinci Türk astronot?', '**Tuva Cihangir Atasever** (2024)'],
      ['İlk yerli haberleşme uydusu?', '**Türksat 6A** (2024)'],
      ['KAAN ilk uçuş?', '**Şubat 2024**'],
      ['50. millî park?', '**Geben Vadisi** (Kahramanmaraş, 2025)'],
      ['112. tabiat anıtı?', '**Dilim Kayalar** (Tokat-Niksar)'],
    ],
  },

  // ───────────────────────── 8. GÜN ─────────────────────────
  {
    id: 'gun8', s: 'guncel', day: 8, min: 11,
    title: 'Türkiye ve uluslararası örgütler',
    why: '0-1 soru',
    cards: [
      {
        h: 'Türkiye hangi örgütlere, ne zaman?',
        viz: { type: 'timeline', s: 'guncel', items: [
          { y: '1945', t: '**Birleşmiş Milletler** (kurucu üye)' },
          { y: '1949', t: '**Avrupa Konseyi**' },
          { y: '1952', t: '**NATO**', key: true },
          { y: '1961', t: '**OECD** (kurucu üye)' },
          { y: '1969', t: '**İslam İşbirliği Teşkilatı** (kurucu üye)' },
          { y: '1985', t: '**Ekonomik İşbirliği Teşkilatı** (EİT; Türkiye, İran, Pakistan)' },
          { y: '1992', t: '**Karadeniz Ekonomik İşbirliği** (KEİ; Türkiye öncülüğünde, merkezi İstanbul)', key: true },
          { y: '1996', t: 'AB ile **Gümrük Birliği**' },
          { y: '1997', t: '**D-8** (Türkiye öncülüğünde; gelişmekte olan 8 Müslüman ülke)', key: true },
          { y: '1999', t: '**G20** (kurucu üye); AB **aday ülke** statüsü (Helsinki)' },
          { y: '2009', t: '**Türk Keneşi** kuruldu (Nahçıvan) → **2021**’de adı **Türk Devletleri Teşkilatı** oldu', key: true },
        ] },
      },
      {
        h: 'Örgütlerin merkezleri',
        viz: { type: 'table', s: 'guncel', head: ['Örgüt', 'Merkez'], rows: [
          ['BM', 'New York'], ['NATO, AB', 'Brüksel'], ['UNESCO', 'Paris'], ['Dünya Sağlık Örgütü', 'Cenevre'], ['İslam İşbirliği Teşkilatı', 'Cidde'], ['**Türk Devletleri Teşkilatı**', '**İstanbul**'], ['**TÜRKSOY**', '**Ankara**'], ['**KEİ**, **D-8**', '**İstanbul**'],
        ] },
        mn: { code: 'TÜRK ÖRGÜTLERİ TÜRKİYE’DE', t: 'TDT, KEİ, D-8 İstanbul’da; TÜRKSOY Ankara’da.' },
      },
      {
        h: 'Türk Devletleri Teşkilatı üyeleri',
        b: '**Üyeler**: Türkiye, **Azerbaycan, Kazakistan, Kırgızistan, Özbekistan**.\n**Gözlemciler**: **Macaristan, Türkmenistan, KKTC**.',
      },
      {
        k: 'check',
        q: 'Türkiye’nin öncülüğünde 1992’de kurulan ve merkezi İstanbul’da bulunan örgüt hangisidir?',
        o: ['D-8', 'Karadeniz Ekonomik İşbirliği Örgütü', 'EİT', 'OECD'],
        a: 1,
        ex: '**KEİ** (1992). D-8 ise 1997’de kuruldu.',
      },
    ],
    quiz: [
      { q: 'Türkiye NATO’ya hangi yıl üye olmuştur?', o: ['1945', '1949', '1952', '1961', '1974'], a: 2, ex: '**1952** (Kore Savaşı’nın etkisiyle).' },
      { q: 'Türk Devletleri Teşkilatının sekretaryası hangi şehirdedir?', o: ['Bakü', 'Astana', 'Ankara', 'İstanbul', 'Taşkent'], a: 3, ex: '**İstanbul**. TÜRKSOY ise Ankara’dadır.' },
      { q: 'Aşağıdakilerden hangisi Türk Devletleri Teşkilatının **tam üyesi değildir**, gözlemcisidir?', o: ['Azerbaycan', 'Kazakistan', 'Macaristan', 'Özbekistan', 'Kırgızistan'], a: 2, ex: '**Macaristan** gözlemcidir (Türkmenistan ve KKTC de gözlemci).' },
      { q: 'Türkiye aşağıdaki örgütlerin hangisinin **kurucu üyesi değildir**?', o: ['Birleşmiş Milletler', 'OECD', 'İslam İşbirliği Teşkilatı', 'NATO', 'G20'], a: 3, ex: 'NATO 1949’da kuruldu; Türkiye **1952**’de katıldı.' },
    ],
    flash: [
      ['Türkiye BM’ye?', '**1945**, kurucu'],
      ['Türkiye NATO’ya?', '**1952**'],
      ['KEİ?', '**1992**, merkez İstanbul'],
      ['D-8?', '**1997**, Türkiye öncülüğünde'],
      ['TDT merkezi?', '**İstanbul**'],
      ['TÜRKSOY merkezi?', '**Ankara**'],
      ['TDT gözlemcileri?', '**Macaristan, Türkmenistan, KKTC**'],
    ],
  },

  // ───────────────────────── 9. GÜN ─────────────────────────
  {
    id: 'gun9', s: 'guncel', day: 9, min: 10,
    title: 'Güncelde son tekrar: tek sayfalık özet',
    why: 'sınav öncesi hızlı tarama',
    cards: [
      {
        h: 'Tek bakışta 2025-2026',
        viz: { type: 'table', s: 'guncel', head: ['Konu', 'Bilgi'], rows: [
          ['UNESCO en son miras', '**Sardes** (2025)'],
          ['Somut olmayan en son', '**Antep İşi** (2025)'],
          ['UNESCO 2026 anma', '**Bâkî** (500. doğum), **Şeyh Edebali** (700. vefat)'],
          ['NATO Zirvesi 2026', '**Ankara**'],
          ['COP31', '**Antalya**, Kasım 2026'],
          ['Türk Dünyası Kültür Başkenti 2026', '**Andican**'],
          ['BM 2026 yılı', '**Mera ve Göçebe Hayvancılık**'],
          ['Türkiye 2025 yılı', '**Aile Yılı**'],
          ['Dünya Kupası 2026', 'Şampiyon **İspanya**; Türkiye 24 yıl sonra katıldı'],
          ['Filenin Sultanları', '2026 **Milletler Ligi şampiyonu**'],
          ['12 Dev Adam', 'EuroBasket 2025 **gümüş**'],
          ['Nobel 2025 Edebiyat', '**Krasznahorkai** (Macar)'],
          ['Oscar 2026 en iyi film', '**One Battle After Another**'],
          ['50. millî park', '**Geben Vadisi**'],
        ] },
      },
      {
        h: 'Güncel sorularda eleme taktiği',
        b: '- Seçeneklerde **hiç duymadığın** isimler varsa, sınav yılıyla ilgisi olmayanları ele.\n- **Eski tarihleri** gösteren şıklar (başka yılların zirveleri, eski şampiyonlar) çoğu zaman çeldiricidir.\n- En az bir şıkkı eleyebiliyorsan işaretle; hiçbirini eleyemiyorsan boş bırak.',
      },
    ],
    quiz: [
      { q: 'Aşağıdaki eşleştirmelerden hangisi **yanlıştır**?', o: ['NATO Zirvesi 2026 – Ankara', 'COP31 – Antalya', 'Türk Dünyası Kültür Başkenti 2026 – Andican', '2026 FIFA Dünya Kupası şampiyonu – Arjantin', 'UNESCO’ya en son eklenen Türkiye mirası – Sardes'], a: 3, ex: '2026 şampiyonu **İspanya**; Arjantin finalde kaybetti.' },
      { q: 'Aşağıdakilerden hangisi 2026 yılı için UNESCO anma ve kutlama yıl dönümleri arasında Türkiye’nin önerisiyle yer almaktadır?', o: ['Yunus Emre', 'Şeyh Edebali', 'Mevlânâ', 'Nasreddin Hoca', 'Piri Reis'], a: 1, ex: '**Şeyh Edebali** (700. vefat yılı) ve **Bâkî** (500. doğum yılı).' },
      { q: 'Türkiye’nin 2025 yılı için yaptığı ilan hangisidir?', o: ['Aile Yılı', 'Engelsiz Yıl', 'Su Yılı', 'Yunus Emre Yılı', 'Tarım Yılı'], a: 0, ex: '**2025 Aile Yılı**; 2026-2035 ise Aile ve Nüfus On Yılı.' },
    ],
    flash: [
      ['2026 NATO ve COP31?', 'NATO **Ankara** (Temmuz), COP31 **Antalya** (Kasım)'],
      ['UNESCO 2026 anma?', '**Bâkî** ve **Şeyh Edebali**'],
      ['En son Dünya Mirası?', '**Sardes** (2025)'],
      ['Güncelde hiçbir şıkkı eleyemiyorsan?', '**Boş bırak**'],
    ],
  },
];
