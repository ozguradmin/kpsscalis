// TARİH — 27 soru. 2024 Ön Lisans'ta 27 sorunun ~10'u Millî Mücadele + inkılaplardan geldi.
// Sıralama "en çok soru getiren konu önce" mantığıyla yapıldı.

export default [
  // ───────────────────────── 1. GÜN ─────────────────────────
  {
    id: 'tar1', s: 'tarih', day: 1, min: 12,
    title: 'Millî Mücadele’nin hazırlığı: Mondros’tan Sivas’a',
    why: 'her yıl 3-4 soru',
    cards: [
      {
        h: 'Önce büyük resim',
        b: '1918’de I. Dünya Savaşı biter, Osmanlı yenilmiştir. Sonraki 1 yıl şöyle akar: **ateşkes imzalanır → düşman işgal eder → halk cemiyet kurar → Mustafa Kemal Samsun’a çıkar → kongreler toplanır → Ankara’da meclis açılır.**\nBu sırayı bir film gibi aklında tut. Sınavdaki soruların çoğu “bu olay neyin sonucudur / neye zemin hazırlamıştır” diye sorulur; sıra bilen kazanır.',
        viz: { type: 'flow', items: ['**Mondros** (30 Ekim 1918) · ateşkes, ordu dağıtılır', '**İşgaller + cemiyetler** · halk kendini örgütler', '**Samsun** (19 Mayıs 1919) · Mustafa Kemal Anadolu’da', '**Amasya Genelgesi** (22 Haziran 1919) · “millet kurtaracak”', '**Erzurum** (Temmuz) ve **Sivas** (Eylül) kongreleri', '**TBMM açılır** (23 Nisan 1920)'] },
      },
      {
        h: 'Mondros Ateşkesi: kapıyı açan anahtar',
        b: '**30 Ekim 1918**’de Limni adasındaki Mondros limanında imzalandı. Osmanlı heyetinin başında **Rauf (Orbay) Bey**, İtilaf tarafında İngiliz **Amiral Calthorpe** vardı.\nEn tehlikeli iki madde:\n- **7. madde:** İtilaf devletleri, güvenliklerini tehdit eden bir durum olursa **istedikleri stratejik yeri işgal edebilir**. İşgallere “yasal” kılıf buydu.\n- **24. madde:** Doğu’daki 6 ilde (Vilayât-ı Sitte) karışıklık çıkarsa buralar işgal edilebilir. Amaç burada bir Ermeni devleti kurmaktı.\nAyrıca ordu terhis edilecek, silahlar teslim edilecekti. Yani Osmanlı **savunmasız** bırakıldı.',
        mn: { code: 'LİMNİ → RAUF + CALTHORPE', t: '“Limni’de Rauf ile Calthorpe çay içti, 7’de her yeri, 24’te Doğu’yu istediler.”' },
        note: { h: 'ÖSYM böyle sordu (2026)', t: 'Limni’deki müzakerede Rauf Bey ile Amiral Calthorpe’un adı verilip “hangi belge?” diye soruldu. Cevap: Mondros.', exam: true },
      },
      {
        k: 'check',
        q: 'Mondros’un hangi maddesi, İtilaf devletlerine Anadolu’nun **her yerini** işgal etme bahanesi verdi?',
        o: ['24. madde', '7. madde', '1. madde', 'Boğazların açılması maddesi'],
        a: 1,
        ex: '**7. madde**: “güvenliği tehdit eden durum” şartı o kadar belirsizdi ki her yer işgal edilebildi. 24. madde sadece Doğu’daki 6 il içindi.',
      },
      {
        h: 'Cemiyetler: iyi olanlar, kötü olanlar',
        b: 'İşgaller başlayınca herkes bir cemiyet kurdu. Sınav bu ikisini ayırmanı ister.',
        viz: {
          type: 'compare', cols: [
            { h: 'Yararlı (millî) cemiyetler', c: 'cog', items: ['**Trakya-Paşaeli** (Edirne, Yunan’a karşı)', '**Kilikyalılar** (Adana, Fransız ve Ermeni’ye karşı)', '**Doğu Anadolu Müdafaa-i Hukuk** (Erzurum, Ermeni’ye karşı)', '**Trabzon Muhafaza-i Hukuk** (Rum-Pontus’a karşı)', '**İzmir Müdafaa-i Hukuk / Redd-i İlhak** (Yunan’a karşı)', '**Millî Kongre** (İstanbul, basın-propaganda)'] },
            { h: 'Zararlı cemiyetler', c: 'tar', items: ['**Mavri Mira** (Rum, Fener Rum Patrikhanesi; Megali İdea)', '**Pontus Rum** (Karadeniz’de Rum devleti; 1904 Merzifon Amerikan Koleji)', '**Etniki Eterya** (Yunan)', '**Hınçak, Taşnak** (Ermeni)', '**Wilson Prensipleri** (Amerikan mandası isteyen)', '**İngiliz Muhipleri**, **Kürt Teali**, **Teali-i İslam**'] },
          ],
        },
        note: { h: 'Tuzak', t: '“Kilikyalılar” adı yabancı gibi durur ama **yararlı** cemiyettir (Adana’yı savundu). ÖSYM 2026’da tam bu tuzağı kurdu.', exam: true },
      },
      {
        h: 'Yararlı cemiyetlerin ortak özellikleri',
        b: 'Soru genelde “aşağıdakilerden hangisi bu cemiyetlerin özelliği **değildir**?” diye gelir. Doğru özellikler:\n- **Bölgeseldiler**: sadece kendi bölgelerini kurtarmaya çalıştılar.\n- Önce **basın-yayınla**, işe yaramayınca **silahlı direnişle** (Kuvâ-yı Millîye) mücadele ettiler.\n- **Kongreler** topladılar (yerel kongreler).\n- Padişaha ve halifeye bağlılıklarını korudular.\n- Sonunda **Sivas Kongresi’nde tek çatı altında** birleştiler.\n**Yanlış** şık örneği (2024): “Padişahı cihad-ı ekber ilanına zorladılar.” Böyle bir şey yok.',
      },
      {
        h: 'Kongrelere giden yol',
        viz: {
          type: 'timeline', s: 'tarih', items: [
            { y: '19 Mayıs 1919', t: '**Samsun**: Mustafa Kemal 9. Ordu Müfettişi olarak Bandırma vapuruyla çıktı.', key: true },
            { y: '28 Mayıs 1919', t: '**Havza Genelgesi**: işgaller mitinglerle protesto edilsin.' },
            { y: '22 Haziran 1919', t: '**Amasya Genelgesi**: “Vatanın bütünlüğü, milletin bağımsızlığı tehlikededir. **Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.**” Sivas’ta kongre toplanacak.', d: 'Millî egemenlik ilk kez vurgulandı; İstanbul hükümeti görevini yapamıyor denildi.', key: true },
            { y: '8-9 Temmuz 1919', t: 'M. Kemal askerlikten istifa etti (“sine-i millete döndü”). **Kâzım Karabekir**: “Emrinizdeyim Paşam.”' },
            { y: '23 Temmuz 1919', t: '**Erzurum Kongresi**: toplanışı bölgesel, kararları ulusal.', key: true },
            { y: '4 Eylül 1919', t: '**Sivas Kongresi**: toplanışı da kararları da ulusal.', key: true },
          ],
        },
      },
      {
        h: 'Erzurum mu, Sivas mı?',
        b: 'İki kongreyi karıştırmamak için tek fark: **Erzurum = ilk kez**, **Sivas = birleştirme**.',
        viz: {
          type: 'table', s: 'tarih',
          head: ['', 'Erzurum (Temmuz 1919)', 'Sivas (Eylül 1919)'],
          rows: [
            ['Toplanış', 'Bölgesel (Doğu illeri)', 'Ulusal (tüm yurttan)'],
            ['İlk kez', '**Millî sınırlar** vatan bütündür; **manda-himaye kabul edilemez**', 'Manda ve himaye **kesin** reddedildi'],
            ['Temsil', '**Heyet-i Temsiliye** kuruldu (başkan M. Kemal)', 'Heyet-i Temsiliye **tüm yurdu** temsil eder oldu'],
            ['Birleşme', '—', 'Tüm cemiyetler **Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti** adında birleşti'],
            ['Diğer', 'Rawlinson olayı; “sine-i millet”', 'İrade-i Milliye gazetesi; İttihat ve Terakki’yi canlandırmama yemini'],
          ],
        },
        mn: { code: 'E = İLK · S = SENTEZ', t: 'Erzurum’da **İlk** kez sınır ve manda reddi. Sivas’ta hepsi birleşip **Sentez** oldu.' },
      },
      {
        h: 'Son adım: Misak-ı Millî ve İstanbul’un işgali',
        b: 'Sivas’tan sonra İstanbul’da son Osmanlı Mebusan Meclisi toplandı ve **28 Ocak 1920**’de **Misak-ı Millî**’yi (Millî Ant) kabul etti: **Mondros imzalandığı sıradaki sınırlar** içinde Türk çoğunluğun yaşadığı yerler bölünemez; **kapitülasyonlar kabul edilmez**.\nİtilaf devletleri buna kızdı: **16 Mart 1920**’de İstanbul resmen işgal edildi, meclis basıldı. Bu olay Mustafa Kemal’i haklı çıkardı: **meclis Anadolu’da toplanmalıydı**. Sonuç: **23 Nisan 1920**’de Ankara’da **TBMM** açıldı.',
        note: { h: 'ÖSYM böyle sordu (2020, 2024)', t: 'Misak-ı Millî’de hangi belgenin sınırı esas alındı? **Mondros**. İstanbul’un işgali M. Kemal’i hangi konuda haklı çıkardı? **Meclisin Anadolu’da toplanması**.', exam: true },
      },
      {
        k: 'video', h: 'Canın isterse izle',
        b: 'Kısa bir video, okuduklarını pekiştirir. Arama sonuçlarından 10-15 dakikalık bir özet seç.',
        links: [['Mondros ve cemiyetler, KPSS özet', 'KPSS Mondros ateşkes antlaşması cemiyetler kısa özet'], ['Amasya, Erzurum, Sivas kongreleri', 'KPSS Amasya genelgesi Erzurum Sivas kongresi farkları']],
      },
    ],
    quiz: [
      { q: 'Limni Adası’ndaki görüşmelerde Osmanlı heyetine Rauf Bey, İtilaf heyetine Amiral Calthorpe başkanlık etmiştir.\nBu görüşmeler sonucunda imzalanan belge aşağıdakilerden hangisidir?', o: ['Sevr Antlaşması', 'Mudanya Ateşkesi', 'Mondros Ateşkesi', 'Gümrü Antlaşması', 'Lozan Antlaşması'], a: 2, ex: 'Limni + Rauf + Calthorpe = **Mondros** (30 Ekim 1918). Mudanya 1922’de, Lozan 1923’te imzalandı.', tip: 'Limni kelimesini gördüğün an Mondros de.' },
      { q: 'Aşağıdaki cemiyetlerden hangisi Millî Mücadele’ye **karşı** faaliyet göstermiştir?', o: ['Kilikyalılar Cemiyeti', 'Trakya-Paşaeli Cemiyeti', 'Redd-i İlhak Cemiyeti', 'Mavri Mira Cemiyeti', 'Millî Kongre Cemiyeti'], a: 3, ex: '**Mavri Mira**, Fener Rum Patrikhanesi’nin kurduğu, Rum-Yunan çıkarına çalışan zararlı cemiyettir. Diğerleri millî (yararlı) cemiyetlerdir.', tip: 'Rumca/Yunanca isim (Mavri Mira, Etniki Eterya, Pontus) = zararlı. Kilikyalılar istisna: yararlı.' },
      { q: '“Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.” ifadesi aşağıdakilerin hangisinde yer almıştır?', o: ['Havza Genelgesi', 'Amasya Genelgesi', 'Erzurum Kongresi', 'Misak-ı Millî', 'Sivas Kongresi'], a: 1, ex: 'Bu cümle **Amasya Genelgesi**’nin (22 Haziran 1919) en ünlü maddesidir ve millî egemenliği ilk kez vurgular.', tip: 'AMasya = Azim ve karar Milletin.' },
      { q: 'Erzurum Kongresi ile ilgili aşağıdakilerden hangisi **yanlıştır**?', o: ['Toplanış amacı bakımından bölgeseldir.', 'Manda ve himaye ilk kez reddedilmiştir.', 'Heyet-i Temsiliye seçilmiştir.', 'Bütün cemiyetler tek çatı altında birleştirilmiştir.', 'Millî sınırlardan ilk kez söz edilmiştir.'], a: 3, ex: 'Cemiyetlerin **Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti** adıyla birleşmesi **Sivas Kongresi**’nde oldu.', tip: 'E = İlk kez; S = Sentez (birleşme).' },
      { q: '28 Ocak 1920’de kabul edilen Misak-ı Millî’de, Türk yurdunun sınırları belirlenirken hangi belgenin imzalandığı sıradaki sınırlar esas alınmıştır?', o: ['Sevr Antlaşması', 'Mondros Ateşkesi', 'Moskova Antlaşması', 'Lozan Antlaşması', 'Mudanya Ateşkesi'], a: 1, ex: 'Misak-ı Millî, **Mondros imzalandığında** Türk askerinin elinde bulunan toprakları esas alır. Bu soru 2020 KPSS Ön Lisans’ta aynen soruldu.' },
      { q: '16 Mart 1920’de İstanbul’un resmen işgal edilip Mebusan Meclisi’nin dağıtılması, Mustafa Kemal’i hangi konuda haklı çıkarmıştır?', o: ['Manda fikrinin reddedilmesi', 'Kuvâ-yı Millîye’nin kaldırılması', 'Meclisin Anadolu’da güvenli bir yerde toplanması gerektiği', 'Saltanatın hemen kaldırılması', 'Düzenli ordunun kurulması'], a: 2, ex: 'Mustafa Kemal, Amasya Görüşmeleri’nden beri **meclisin İstanbul’da toplanmasına karşıydı**. İşgal onu haklı çıkardı ve TBMM Ankara’da açıldı (2024’te soruldu).' },
    ],
    flash: [
      ['Mondros Ateşkesi nerede ve ne zaman imzalandı?', '**Limni adası, Mondros limanı · 30 Ekim 1918** · Rauf Bey – Amiral Calthorpe'],
      ['Mondros’un en tehlikeli maddesi?', '**7. madde**: İtilaf devletleri güvenlik gerekçesiyle istediği yeri işgal edebilir.'],
      ['“Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.” Nerede?', '**Amasya Genelgesi** (22 Haziran 1919)'],
      ['Manda ve himaye ilk kez nerede reddedildi?', '**Erzurum Kongresi** (kesin ret: Sivas)'],
      ['Cemiyetler hangi kongrede birleşti?', '**Sivas Kongresi** → Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti'],
      ['Kilikyalılar Cemiyeti yararlı mı, zararlı mı?', '**Yararlı**: Adana ve çevresini Fransız ve Ermenilere karşı savundu.'],
      ['Misak-ı Millî hangi sınırı esas aldı?', '**Mondros** imzalandığı sıradaki sınırlar'],
      ['TBMM ne zaman açıldı?', '**23 Nisan 1920**, Ankara'],
    ],
  },

  // ───────────────────────── 2. GÜN ─────────────────────────
  {
    id: 'tar2', s: 'tarih', day: 2, min: 13,
    title: 'Cepheler ve antlaşmalar: kim kime karşı savaştı?',
    why: 'her yıl 3-5 soru',
    cards: [
      {
        h: 'Üç cephe, üç düşman, üç antlaşma',
        b: 'TBMM açıldıktan sonra Anadolu üç yönden saldırı altındaydı. Bu tabloyu ezberlersen cephe sorularının yarısını çözersin.',
        viz: {
          type: 'table', s: 'tarih',
          head: ['Cephe', 'Düşman', 'Kim savaştı', 'Bitiren antlaşma'],
          rows: [
            ['**Doğu**', 'Ermeniler', 'Kâzım Karabekir (düzenli ordu)', '**Gümrü** (3 Aralık 1920)'],
            ['**Güney**', 'Fransızlar (+ Ermeni)', '**Kuvâ-yı Millîye** (halk)', '**Ankara** (20 Ekim 1921)'],
            ['**Batı**', 'Yunanlar', 'Düzenli ordu (İsmet, M. Kemal)', '**Mudanya** (11 Ekim 1922)'],
          ],
        },
        mn: { code: 'DEG · GFA · BYM', t: '**D**oğu-**E**rmeni-**G**ümrü · **G**üney-**F**ransız-**A**nkara · **B**atı-**Y**unan-**M**udanya' },
      },
      {
        h: 'Doğu ve Güney cepheleri',
        b: '**Doğu:** Kâzım Karabekir Ermenileri yendi. **Gümrü Antlaşması** TBMM’nin **ilk askerî ve siyasi başarısı**, imzaladığı **ilk uluslararası antlaşmadır**. Ermenistan Sevr’den vazgeçti.\n**Güney:** Burada düzenli ordu yoktu; **halk (Kuvâ-yı Millîye)** savaştı. Bu yüzden şehirlerimiz unvan aldı: **Antep → Gazi**, **Maraş → Kahraman**, **Urfa → Şanlı**. Cephe, **Sakarya zaferinden sonra** Fransa ile imzalanan **Ankara Antlaşması** ile kapandı. Bu antlaşmayla **Hatay hariç bugünkü Türkiye-Suriye sınırı** çizildi. Fransa, Misak-ı Millî’yi tanıyan **ilk İtilaf devleti** oldu.',
        note: { h: 'ÖSYM böyle sordu (2024, 2026)', t: '“Güney Cephesi ile ilgili hangisi doğrudur?” → **Sakarya zaferi cephenin kapanmasında etkili oldu.** Suriye sınırını tarif eden antlaşma → **Ankara Antlaşması (1921)**.', exam: true },
      },
      {
        h: 'Batı Cephesi: savaşlar sırayla',
        b: 'Her savaşın bir **sonucu** var. ÖSYM en çok bu sonuçları sorar. Kaydırarak oku:',
        viz: {
          type: 'timeline', s: 'tarih', items: [
            { y: 'Ocak 1921', t: '**I. İnönü** (İsmet Bey): düzenli ordunun ilk zaferi.', d: 'Sonra: Teşkilât-ı Esasiye (ilk anayasa), İstiklal Marşı (12 Mart 1921), Londra Konferansı, Moskova Antlaşması.', key: true },
            { y: 'Şubat-Mart 1921', t: '**Londra Konferansı**: İtilaf, TBMM’yi ilk kez (dolaylı) muhatap aldı. Sonuç alınamayınca Yunanlar tekrar saldırdı.' },
            { y: 'Mart-Nisan 1921', t: '**II. İnönü**: “Siz orada yalnız düşmanı değil, milletin makûs talihini de yendiniz.”', d: 'Sonra: İtalyanlar Anadolu’dan çekilmeye başladı.' },
            { y: 'Temmuz 1921', t: '**Kütahya-Eskişehir**: tek yenilgimiz; ordu Sakarya’nın doğusuna çekildi.', d: 'Sonra: **Başkomutanlık Kanunu** (M. Kemal başkomutan) ve **Tekâlif-i Millîye** emirleri.', key: true },
            { y: '23 Ağu-13 Eyl 1921', t: '**Sakarya Meydan Muharebesi** (22 gün 22 gece): “Hatt-ı müdafaa yoktur, sath-ı müdafaa vardır.”', d: 'Sonra: M. Kemal’e **Mareşal** rütbesi ve **Gazi** unvanı; Kars ve Ankara antlaşmaları.', key: true },
            { y: '26-30 Ağustos 1922', t: '**Büyük Taarruz** ve **Başkomutan Meydan Muharebesi** (Dumlupınar). “Ordular, ilk hedefiniz Akdeniz’dir. İleri!”', d: '9 Eylül 1922’de İzmir kurtuldu.', key: true },
            { y: '11 Ekim 1922', t: '**Mudanya Ateşkesi**: Doğu Trakya ve İstanbul savaşmadan kurtuldu.' },
          ],
        },
      },
      {
        k: 'check',
        q: 'Mustafa Kemal’e **Mareşal** rütbesi ve **Gazi** unvanı hangi zaferden sonra verildi?',
        o: ['I. İnönü', 'II. İnönü', 'Sakarya Meydan Muharebesi', 'Büyük Taarruz'],
        a: 2,
        ex: '**Sakarya** (1921) sonrası TBMM bu unvanları verdi. Dikkat: Başkomutanlık Kanunu ise Sakarya’dan **önce**, Kütahya-Eskişehir yenilgisinden sonra çıktı.',
      },
      {
        h: 'Antlaşmaları haritada gör',
        b: '1921’de iki antlaşma doğu sınırımızı belirledi: **Moskova** (Sovyet Rusya ile, Mart 1921) ve **Kars** (Kafkas cumhuriyetleriyle, Ekim 1921). Kars ile **doğu sınırı kesinleşti**.',
        viz: { type: 'map', alt: 'Antlaşmaların etkilediği bölgeler', groups: [
          { label: 'Doğu sınırı: Gümrü → Moskova → Kars', c: 'tar', iller: ['kars', 'ardahan', 'igdir', 'artvin'] },
          { label: 'Güney sınırı: Ankara Antl. (1921)', c: 'orange', iller: ['gaziantep', 'kilis', 'sanliurfa', 'mardin'] },
          { label: 'Batı: Mudanya → Doğu Trakya kurtuldu', c: 'blue', iller: ['edirne', 'kirklareli', 'tekirdag'] },
        ], labels: false, pins: [{ lat: 40.37, lon: 28.88, t: 'Mudanya', a: 'end' }, { lat: 39.93, lon: 32.85, t: 'Ankara (TBMM)', c: 'ink' }] },
        note: { h: 'Doğu sınırı sorusu', t: '“Hangisinde doğu sınırıyla ilgili hüküm **yoktur**?” → **Ankara Antlaşması** (o güney sınırıdır). Gümrü, Sevr, Kars ve Moskova doğu ile ilgilidir. (2020’de soruldu.)', exam: true },
      },
      {
        h: 'Sevr: “ölü doğmuş” antlaşma',
        b: '**10 Ağustos 1920**’de İstanbul hükümeti imzaladı ama **Osmanlı Mebusan Meclisi kapalı olduğu için onaylanmadı**, yani hukuken hiç yürürlüğe girmedi. Anadolu’yu parçalayan bir plandı. TBMM imzalayanları vatan haini ilan etti.\nMillî Mücadele boyunca her zafer, Sevr’i biraz daha “kâğıt üzerinde” bıraktı.',
      },
      {
        k: 'video', h: 'Canın isterse izle',
        links: [['Kurtuluş Savaşı cepheleri haritalı anlatım', 'KPSS Kurtuluş Savaşı cepheler haritalı anlatım'], ['Batı Cephesi savaşları sıralama', 'KPSS İnönü Sakarya Büyük Taarruz sonuçları']],
      },
    ],
    quiz: [
      { q: 'TBMM’nin imzaladığı ilk uluslararası antlaşma aşağıdakilerden hangisidir?', o: ['Moskova Antlaşması', 'Ankara Antlaşması', 'Gümrü Antlaşması', 'Kars Antlaşması', 'Mudanya Ateşkesi'], a: 2, ex: '**Gümrü** (3 Aralık 1920), Doğu Cephesi’nde Ermenistan ile imzalandı; TBMM’nin ilk askerî ve siyasi zaferidir.', tip: 'DEG: Doğu-Ermeni-Gümrü, hepsi “ilk”.' },
      { q: 'Kurtuluş Savaşı’nın aşağıdaki cephelerinden hangisinde mücadele, düzenli ordu yerine ağırlıklı olarak Kuvâ-yı Millîye tarafından yürütülmüştür?', o: ['Doğu Cephesi', 'Güney Cephesi', 'Batı Cephesi', 'Kafkas Cephesi', 'Çanakkale Cephesi'], a: 1, ex: '**Güney Cephesi**’nde Antep, Maraş, Urfa halkı Fransızlara karşı direndi; şehirler bu yüzden Gazi, Kahraman ve Şanlı unvanlarını aldı. Kafkas ve Çanakkale, I. Dünya Savaşı cepheleridir.', tip: 'Güney = Gazi, Kahraman, Şanlı = halk direnişi.' },
      { q: 'Kütahya-Eskişehir Savaşları’nın kaybedilmesinin ardından aşağıdakilerden hangisi gerçekleşmiştir?', o: ['İstiklal Marşı’nın kabulü', 'Başkomutanlık Kanunu’nun çıkarılması', 'Mudanya Ateşkesi’nin imzalanması', 'Gümrü Antlaşması’nın imzalanması', 'Londra Konferansı’nın toplanması'], a: 1, ex: 'Yenilgi sonrası meclis, Mustafa Kemal’i 3 aylığına **Başkomutan** yaptı; ardından Tekâlif-i Millîye emirleri çıktı.' },
      { q: 'Büyük Taarruz ve Başkomutan Meydan Muharebesi’nin kazanılması aşağıdakilerden hangisine zemin hazırlamamıştır?', o: ['Mudanya Ateşkesi’nin imzalanmasına', 'İzmir’in kurtarılmasına', 'Lozan Konferansı’nın toplanmasına', 'Mustafa Kemal’in Başkomutan seçilmesine', 'Doğu Trakya’nın savaşmadan alınmasına'], a: 3, ex: 'M. Kemal **Başkomutanlık Kanunu** ile Ağustos 1921’de, yani Büyük Taarruz’dan **bir yıl önce** başkomutan oldu. Sonraki olay öncekine zemin hazırlayamaz. (2024 KPSS Ön Lisans’ta soruldu.)', tip: '“Zemin hazırlamamıştır” sorularında tarihi **önce** olan şıkkı ara.' },
      { q: 'Aşağıdaki antlaşmalardan hangisinde Türkiye’nin doğu sınırlarıyla ilgili bir hüküm **bulunmaz**?', o: ['Gümrü', 'Sevr', 'Kars', 'Moskova', 'Ankara'], a: 4, ex: '1921 **Ankara Antlaşması** Fransa ile imzalandı ve **güney** (Suriye) sınırını belirledi.' },
      { q: 'Londra Konferansı’ndan sonuç alamayan İtilaf devletlerinin yönlendirmesiyle Yunan ordusunun Mart 1921’de başlattığı saldırı hangi muharebeyle sonuçlanmıştır?', o: ['I. İnönü', 'II. İnönü', 'Sakarya', 'Kütahya-Eskişehir', 'Dumlupınar'], a: 1, ex: 'Londra Konferansı (Şubat-Mart 1921) I. İnönü’den sonradır; ardından Yunanlar tekrar saldırdı ve **II. İnönü** yaşandı (2024 ve 2026’da soruldu).' },
    ],
    flash: [
      ['DEG · GFA · BYM ne demek?', 'Doğu-Ermeni-**Gümrü** · Güney-Fransız-**Ankara** · Batı-Yunan-**Mudanya**'],
      ['TBMM’nin ilk uluslararası antlaşması?', '**Gümrü** (1920)'],
      ['Başkomutanlık Kanunu hangi yenilgiden sonra?', '**Kütahya-Eskişehir** (1921)'],
      ['Mareşal rütbesi ve Gazi unvanı?', '**Sakarya** zaferinden sonra (Eylül 1921)'],
      ['Hatay hariç Suriye sınırını çizen antlaşma?', '**Ankara Antlaşması** (20 Ekim 1921, Fransa)'],
      ['Doğu sınırını kesinleştiren antlaşma?', '**Kars** (Ekim 1921)'],
      ['“Siz orada yalnız düşmanı değil, milletin makûs talihini de yendiniz.”', '**II. İnönü** sonrası söylendi'],
      ['Doğu Trakya savaşmadan nasıl kurtuldu?', '**Mudanya Ateşkesi** (11 Ekim 1922)'],
    ],
  },

  // ───────────────────────── 3. GÜN ─────────────────────────
  {
    id: 'tar3', s: 'tarih', day: 3, min: 12,
    title: 'Lozan ve Cumhuriyet’e giden siyasi adımlar',
    why: 'her yıl 2-3 soru',
    cards: [
      {
        h: 'Önce saltanat gitti (1 Kasım 1922)',
        b: 'Lozan Konferansı’na İtilaf devletleri **hem Ankara’yı hem İstanbul hükümetini** davet etti. İki başlılık olmasın diye TBMM **1 Kasım 1922**’de **saltanatı kaldırdı**. Böylece Osmanlı Devleti hukuken sona erdi. Son padişah Vahdettin bir İngiliz gemisiyle ülkeden ayrıldı, halife olarak Abdülmecit Efendi seçildi.',
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'İstanbul Hükûmetinin Lozan’a katılma girişimi hangisiyle engellendi? → **Saltanatın kaldırılması**.', exam: true },
      },
      {
        h: 'Lozan Barış Antlaşması (24 Temmuz 1923)',
        b: 'Türk heyetinin başında **İsmet Paşa** vardı. Lozan, Sevr’in yerine geçen ve yeni Türkiye’yi dünyaya tanıtan **tapu senedi**dir. Konuları “çözüldü / çözülemedi” diye iki kutuda tut:',
        viz: {
          type: 'compare', cols: [
            { h: 'Çözüldü', c: 'cog', items: ['**Kapitülasyonlar** tamamen kaldırıldı', '**Borçlar** paylaştırıldı, taksitle ödenecek', 'Yunanistan **savaş tazminatı yerine Karaağaç**’ı verdi', '**Nüfus mübadelesi** (Türk-Rum; İstanbul Rumları ve Batı Trakya Türkleri hariç)', 'Azınlıklar **Türk vatandaşı** sayıldı', 'Gökçeada ve Bozcaada bizde kaldı'] },
            { h: 'Çözülemedi / sonraya kaldı', c: 'tar', items: ['**Musul** → 1926’da Irak’a (İngiltere)', '**Boğazlar** → uluslararası komisyon; 1936 **Montrö** ile bize geçti', '**Hatay** → 1939’da anavatana katıldı', '**Patrikhane** İstanbul’da kaldı (siyasi yetkisiz)'] },
          ],
        },
        mn: { code: 'MUBOHA', t: 'Lozan’da çözülemeyenler: **MU**sul, **BO**ğazlar, **HA**tay.' },
        note: { h: 'ÖSYM böyle sordu (2024, 2026)', t: 'Yunanistan tahribat karşılığında ne verdi? → **Karaağaç**. İtilaf İstanbul’u ne zaman boşalttı? → **Lozan TBMM’de onaylandıktan sonra** (6 hafta içinde).', exam: true },
      },
      {
        k: 'check',
        q: 'Aşağıdakilerden hangisi Lozan’da **çözümsüz kalıp** sonraya bırakılan konulardan biridir?',
        o: ['Kapitülasyonlar', 'Musul', 'Savaş tazminatı', 'Nüfus mübadelesi'],
        a: 1,
        ex: '**Musul**, İngiltere ile ikili görüşmelere bırakıldı ve 1926 Ankara Antlaşması’yla Irak’a verildi. Kapitülasyonlar ise Lozan’da tamamen kaldırıldı.',
      },
      {
        h: 'Yeni devletin inşası: tarih sırasıyla',
        viz: {
          type: 'timeline', s: 'tarih', items: [
            { y: '1 Kasım 1922', t: '**Saltanat kaldırıldı.**' },
            { y: '13 Ekim 1923', t: '**Ankara başkent** oldu.' },
            { y: '29 Ekim 1923', t: '**Cumhuriyet ilan edildi.** İlk cumhurbaşkanı Mustafa Kemal, ilk başbakan İsmet Paşa.', d: 'Meclis Hükûmeti sisteminden **kabine sistemine** geçildi.', key: true },
            { y: '3 Mart 1924', t: '**Halifelik kaldırıldı**, Osmanlı hanedanı yurt dışına çıkarıldı. Aynı gün **Tevhid-i Tedrisat**; Şer’iye ve Evkaf Vekâleti kaldırılıp **Diyanet İşleri Başkanlığı** kuruldu.', key: true },
            { y: '20 Nisan 1924', t: '**1924 Anayasası** (Teşkilât-ı Esasiye).' },
          ],
        },
        note: { h: 'Tuzak (2026)', t: '“Cumhuriyetin ilanı – Meclis Hükûmeti sistemine geçilmesi” eşleşmesi **yanlıştır**. Cumhuriyetle **kabine sistemine** geçildi; meclis hükûmeti 1920’de başlamıştı.', exam: true },
      },
      {
        h: 'Çok partili hayat denemeleri',
        b: 'Atatürk döneminde iki kez muhalefet partisi kuruldu, ikisi de kısa sürdü:',
        viz: {
          type: 'table', s: 'tarih',
          head: ['Parti', 'Kuran', 'Neden kapandı?'],
          rows: [
            ['**Terakkiperver Cumhuriyet Fırkası** (1924)', 'Kâzım Karabekir', '**Şeyh Sait İsyanı** (1925) → **Takrir-i Sükûn Kanunu** ile kapatıldı'],
            ['**Serbest Cumhuriyet Fırkası** (1930)', 'Fethi Okyar', 'Rejim karşıtlarının toplanması üzerine kendini kapattı; ardından **Menemen Olayı**'],
          ],
        },
        b2: '',
        note: { h: 'Hatırla', t: 'Türkiye’de **kalıcı** çok partili döneme **1946**’da geçildi. 1950’de Demokrat Parti iktidara geldi.' },
      },
      {
        h: 'İç tehditler ve İstiklal Mahkemeleri',
        b: '**1926 İzmir Suikastı**: Mustafa Kemal’e yönelik suikast girişimiydi; davası **İstiklal Mahkemesi**’nde görüldü. İstiklal Mahkemeleri 1920’de vatan hainlerini hızlıca yargılamak için kurulmuştu.\n**Takrir-i Sükûn** (1925): “huzuru sağlama” kanunu; hükümete olağanüstü yetki verdi.',
        note: { h: 'ÖSYM böyle sordu (2024)', t: 'Cumhuriyet’in ilanından sonraki hangi olayın davası İstiklal Mahkemesi’nde görüldü? → **İzmir Suikastı**.', exam: true },
      },
    ],
    quiz: [
      { q: 'İstanbul Hükûmetinin Lozan Konferansı’na katılma girişimi aşağıdakilerden hangisiyle engellenmiştir?', o: ['İstiklal mahkemelerinin kurulması', 'Saltanatın kaldırılması', 'Başkomutanlık Kanunu’nun çıkarılması', 'Ankara’nın başkent olması', 'Halifeliğin kaldırılması'], a: 1, ex: '1 Kasım 1922’de **saltanat kaldırılınca** İstanbul hükümetinin yasal dayanağı kalmadı. (2020 KPSS Ön Lisans sorusu.)' },
      { q: 'Lozan Barış Antlaşması’na göre Yunanistan, Anadolu’da yaptığı tahribata karşılık savaş tazminatı yerine aşağıdakilerden hangisini kabul etmiştir?', o: ['Batı Trakya’yı Türkiye’ye vermeyi', 'Karaağaç ve çevresini Türkiye’ye vermeyi', 'Rodos’u Türkiye’ye bırakmayı', 'Gökçeada’yı askerden arındırmayı', 'Borçları tek başına ödemeyi'], a: 1, ex: 'Yunanistan tazminat ödemek yerine Edirne yakınındaki **Karaağaç**’ı bıraktı (2024 sorusu).' },
      { q: 'Aşağıdakilerden hangisi Lozan Barış Antlaşması’nda **kesin çözüme kavuşturulamamıştır**?', o: ['Kapitülasyonlar', 'Savaş tazminatları', 'Irak sınırı (Musul)', 'Azınlıkların durumu', 'Osmanlı borçlarının paylaşımı'], a: 2, ex: 'Musul meselesi İngiltere ile görüşmelere bırakıldı, 1926’da Irak’a kaldı.', tip: 'MUBOHA: Musul, Boğazlar, Hatay çözülemedi.' },
      { q: 'Atatürk dönemine ait düzenlemeler eşleştirildiğinde aşağıdakilerden hangisi **yanlış** olur?', o: ['Şer’iye ve Evkaf Vekâletinin kaldırılması – Diyanet İşleri Başkanlığının kurulması', 'Cumhuriyetin ilan edilmesi – Meclis Hükûmeti sistemine geçilmesi', 'Soyadı Kanunu – Lakap ve unvanların kaldırılması', 'Devletçilik uygulaması – Sümerbank’ın kurulması', 'Yeni Türk alfabesi – Millet Mekteplerinin açılması'], a: 1, ex: 'Cumhuriyet ile **kabine sistemine** geçildi. Meclis Hükûmeti sistemi 1920’de TBMM ile başlamıştı. (2026 KPSS sorusu.)' },
      { q: 'Terakkiperver Cumhuriyet Fırkası’nın kapatılmasına yol açan gelişme aşağıdakilerden hangisidir?', o: ['Menemen Olayı', 'Şeyh Sait İsyanı', 'İzmir Suikastı', 'Serbest Cumhuriyet Fırkası’nın kurulması', '31 Mart Vakası'], a: 1, ex: '1925 **Şeyh Sait İsyanı** sonrası Takrir-i Sükûn Kanunu çıkarıldı ve parti kapatıldı. Menemen Olayı, Serbest Cumhuriyet Fırkası sonrasıdır (1930).' },
    ],
    flash: [
      ['Saltanat ne zaman kaldırıldı ve neden?', '**1 Kasım 1922** · Lozan’a İstanbul hükümeti de davet edildiği için'],
      ['Lozan’da çözülemeyen 3 konu?', '**Musul, Boğazlar, Hatay** (MUBOHA)'],
      ['Yunanistan savaş tazminatı yerine ne verdi?', '**Karaağaç**'],
      ['Cumhuriyet’in ilanıyla hangi hükümet sistemine geçildi?', '**Kabine sistemi**'],
      ['3 Mart 1924’te kaldırılanlar/kurulanlar?', 'Halifelik kaldırıldı; **Tevhid-i Tedrisat**; Şer’iye ve Evkaf Vekâleti kaldırıldı → **Diyanet İşleri Başkanlığı**'],
      ['Terakkiperver Cumhuriyet Fırkası neden kapandı?', '**Şeyh Sait İsyanı** → Takrir-i Sükûn (1925)'],
      ['Serbest Cumhuriyet Fırkası kurucusu?', '**Fethi Okyar** (1930)'],
    ],
  },

  // ───────────────────────── 4. GÜN ─────────────────────────
  {
    id: 'tar4', s: 'tarih', day: 4, min: 13,
    title: 'Atatürk inkılapları: hukuk, eğitim, toplum, ekonomi',
    why: 'her yıl 2-4 soru',
    cards: [
      {
        h: 'İnkılapları dört çekmeceye koy',
        b: 'Tek tek ezberlemek yerine her inkılabı bir çekmeceye koy. Soru “hangisi eğitim alanında yapılmıştır?” derse doğru çekmeceyi açarsın.',
        viz: {
          type: 'org', root: 'Atatürk inkılapları',
          kids: [
            { h: 'Hukuk', c: 'vat', items: ['Şer’iye mahkemeleri kaldırıldı (1924)', '**Türk Medeni Kanunu** (1926, İsviçre)', 'Borçlar (İsviçre), Ceza (İtalya), Ticaret (Almanya)'] },
            { h: 'Eğitim-kültür', c: 'tr', items: ['**Tevhid-i Tedrisat** (1924)', '**Harf İnkılabı** (1 Kasım 1928)', 'Millet Mektepleri (1929)', 'Türk Tarih Kurumu (1931), Türk Dil Kurumu (1932)', 'Üniversite reformu (1933)'] },
            { h: 'Toplumsal', c: 'cog', items: ['**Şapka Kanunu** (1925)', 'Tekke ve zaviyeler kapatıldı (1925)', 'Uluslararası takvim ve saat (1925-26)', 'Ölçüler Kanunu (1931)', '**Soyadı Kanunu** (1934)', 'Kadına seçme-seçilme: belediye 1930, köy 1933, **milletvekili 1934**'] },
            { h: 'Ekonomi', c: 'mat', items: ['**İzmir İktisat Kongresi** (1923)', '**Aşar** vergisi kaldırıldı (1925)', '**Kabotaj Kanunu** (1926)', 'Teşvik-i Sanayi (1927)', '**Sümerbank** (1933), I. Beş Yıllık Sanayi Planı'] },
          ],
        },
      },
      {
        h: 'Türk Medeni Kanunu (1926)',
        b: 'İsviçre Medeni Kanunu örnek alındı. Neler getirdi?\n- **Tek eşle evlilik** ve **resmî nikâh** zorunlu oldu.\n- Kadına **boşanma** hakkı ve mirasta **eşitlik** geldi.\n- Kadının **mahkemede şahitliği** erkekle eşit sayıldı.\n- Aile hukuku yeniden düzenlendi.\n**Getirmediği şey:** kadına **seçme-seçilme hakkı**. O, ayrı kanunlarla 1930, 1933 ve 1934’te geldi.',
        note: { h: 'ÖSYM böyle sordu (2026)', t: 'Medeni Kanun, Kabotaj Kanunu ve Soyadı Kanunu’nun sonuçları arasında hangisi **yoktur**? → **Kadınlara seçme ve seçilme hakkı tanındığı**.', exam: true },
      },
      {
        h: 'Eğitimde iki dev adım',
        b: '**Tevhid-i Tedrisat (3 Mart 1924):** “öğretimin birleştirilmesi”. Tüm okullar (medreseler dahil) **Maarif Vekâletine** (Millî Eğitim) bağlandı. **Azınlık ve yabancı okullar da** devlet denetimine girdi. Medreseler kapandı.\n**Harf İnkılabı (1 Kasım 1928):** Arap harfleri yerine **Latin kökenli yeni Türk alfabesi**. Okuma yazmayı yaymak için **Millet Mektepleri** açıldı; Atatürk’e “**Başöğretmen**” unvanı verildi.',
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Azınlık ve yabancı okulların Millî Eğitim Bakanlığına bağlanması hangisiyle oldu? → **Tevhid-i Tedrisat Kanunu**.', exam: true },
      },
      {
        k: 'check',
        q: '1934’te “ağa, hacı, hafız, hoca, efendi, bey, paşa” gibi unvanların kaldırılmasının amacı nedir?',
        o: ['Nüfusu saymak', 'Tam bağımsızlığı sağlamak', 'İmtiyazsız ve sınıfsız bir toplum oluşturmak', 'Eğitimi birleştirmek'],
        a: 2,
        ex: 'Unvanlar insanlar arasında ayrıcalık yaratıyordu. Kaldırılmaları **eşitliği** (Halkçılık ilkesini) hedefler. 2020’de aynen soruldu.',
      },
      {
        h: 'Toplumsal inkılaplar: 1925 ve 1934 yılları',
        b: 'Bu inkılapların çoğu iki yıla toplanır. Yılları gruplayınca ezber kolaylaşır:',
        viz: {
          type: 'compare', cols: [
            { h: '1925: dış görünüş ve gelenek', c: 'cog', items: ['**Şapka Kanunu** (Kastamonu gezisinden sonra)', '**Tekke, zaviye ve türbeler** kapatıldı', '**Uluslararası saat ve takvim** kabul edildi (miladi takvim 1926’da başladı)'] },
            { h: '1934: kimlik ve eşitlik', c: 'ink', items: ['**Soyadı Kanunu** (21 Haziran)', 'Mustafa Kemal’e **Atatürk** soyadı (24 Kasım)', '**Lakap ve unvanlar** kaldırıldı', 'Kadına **milletvekili** seçme-seçilme hakkı (5 Aralık)'] },
          ],
        },
        mn: { code: '25 = ŞTT · 34 = SSK', t: '1925: **Ş**apka, **T**ekke, **T**akvim · 1934: **S**oyadı, **S**eçim (kadın), **K**aldırılan unvanlar' },
      },
      {
        h: 'Ekonomi: yerli malı ve devlet eli',
        b: '**İzmir İktisat Kongresi** (17 Şubat 1923): ekonominin yol haritası; “yerli malı kullan”, **Misak-ı İktisadi**.\n**Aşar** (ürünün onda biri alınan vergi) 1925’te kaldırıldı: köylüye büyük rahatlık.\n**Kabotaj Kanunu** (1 Temmuz 1926): Türk kıyıları arasında yük ve yolcu taşımacılığını **yalnızca Türk gemileri** yapabilir. Denizlerde tam bağımsızlık; bugün **Denizcilik ve Kabotaj Bayramı**.\n**1929 Dünya Ekonomik Bunalımı**’ndan sonra **devletçilik** başladı: Sümerbank (1933), Etibank (1935), I. Beş Yıllık Sanayi Planı (1933).',
      },
      {
        k: 'video', h: 'Canın isterse izle',
        links: [['Atatürk inkılapları kodlamalı', 'KPSS Atatürk inkılapları kodlama ile kolay ezber'], ['Toplumsal inkılaplar tarihleri', 'KPSS toplumsal alanda yapılan inkılaplar özet']],
      },
    ],
    quiz: [
      { q: 'Türkiye’de azınlık okulları ve yabancı okulların Millî Eğitim Bakanlığına bağlanması aşağıdakilerden hangisiyle gerçekleşmiştir?', o: ['Maarif Teşkilatı Hakkında Kanun', 'Nisab-ı Müzakere Kanunu', 'Tevhid-i Tedrisat Kanunu', 'Medeni Kanun', 'Millet Mektepleri Talimatnamesi'], a: 2, ex: '**Tevhid-i Tedrisat** (1924) tüm eğitim kurumlarını tek çatıda topladı (2020 Ön Lisans sorusu).' },
      { q: '1926’da kabul edilen Türk Medeni Kanunu ile aşağıdakilerden hangisi **gerçekleşmemiştir**?', o: ['Resmî nikâh zorunlu hâle gelmiştir.', 'Tek eşle evlilik esas alınmıştır.', 'Kadınlara milletvekili seçme ve seçilme hakkı tanınmıştır.', 'Mirasta kadın-erkek eşitliği sağlanmıştır.', 'Kadına boşanma hakkı tanınmıştır.'], a: 2, ex: 'Kadınların milletvekili seçme-seçilme hakkı **5 Aralık 1934**’te ayrı bir düzenlemeyle geldi.', tip: 'Medeni Kanun = aile ve miras. Siyasi haklar ayrı kanunlarla.' },
      { q: 'Aşağıdakilerden hangisi **ekonomi** alanında yapılan inkılaplardan biridir?', o: ['Şapka Kanunu', 'Kabotaj Kanunu', 'Soyadı Kanunu', 'Tevhid-i Tedrisat Kanunu', 'Harf İnkılabı'], a: 1, ex: '**Kabotaj Kanunu** (1926), kıyılarımızdaki taşımacılığı Türk gemilerine vererek denizcilik ve ticarette bağımsızlık sağladı.' },
      { q: '1934 yılında çıkarılan bir kanunla “ağa, hacı, hafız, hoca, molla, efendi, bey, paşa” gibi unvanların kaldırılmasının amacı aşağıdakilerden hangisidir?', o: ['Ülke nüfusunu belirlemek', 'Tam bağımsızlığı sağlamak', 'Toprak bütünlüğünü korumak', 'İmtiyazsız ve sınıfsız bir toplum oluşturmak', 'Eğitim ve öğretimi birleştirmek'], a: 3, ex: 'Unvanlar ayrıcalık demekti; kaldırılmaları eşitliği (**Halkçılık**) sağlar. (2020 sorusu.)' },
      { q: 'I. Harf İnkılabı\nII. Millet Mektepleri\nIII. Kabotaj Kanunu\nYukarıdakilerden hangileri doğrudan okuma yazma oranını artırmaya yöneliktir?', o: ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III'], a: 2, ex: 'Yeni alfabe ve onu halka öğreten **Millet Mektepleri** okuryazarlığı hedefler. Kabotaj ise ekonomiyle ilgilidir.', tip: 'Öncüllü sorularda her maddeyi ayrı ayrı “evet/hayır” diye işaretle.' },
      { q: '1929 Dünya Ekonomik Bunalımı’nın Türkiye’deki etkilerini azaltmaya yönelik olarak aşağıdakilerden hangisi uygulanmıştır?', o: ['Aşar vergisinin kaldırılması', 'Devletçilik ilkesinin ekonomide uygulanması', 'İzmir İktisat Kongresi’nin toplanması', 'Kapitülasyonların kaldırılması', 'Teşvik-i Sanayi Kanunu’nun çıkarılması'], a: 1, ex: '1929 sonrası özel sektör yetersiz kalınca devlet yatırım yaptı: **devletçilik**, Sümerbank, Beş Yıllık Sanayi Planı. Diğer şıklar 1929’dan önceki olaylardır.', tip: 'Tarih kontrolü yap: 1929’dan önce olan bir olay, 1929’a çözüm olamaz.' },
    ],
    flash: [
      ['Tevhid-i Tedrisat ne demek, tarihi?', '**Öğretim birliği**, 3 Mart 1924'],
      ['Harf İnkılabı tarihi?', '**1 Kasım 1928**'],
      ['Medeni Kanun nereden alındı, ne getirmedi?', '**İsviçre**; kadına siyasi hak getirmedi'],
      ['Kadına milletvekili seçme-seçilme hakkı?', '**5 Aralık 1934** (belediye 1930, muhtarlık 1933)'],
      ['1925’in 3 toplumsal inkılabı?', '**Şapka**, **Tekke-zaviye** kapatma, **Takvim-saat**'],
      ['Kabotaj Kanunu ne sağladı?', 'Kıyılarımızda taşımacılık **yalnız Türk gemilerine** (1926)'],
      ['Aşar vergisi ne zaman kaldırıldı?', '**1925**'],
      ['1929 bunalımından sonra ekonomide ne başladı?', '**Devletçilik** (Sümerbank 1933, I. BYSP)'],
    ],
  },

  // ───────────────────────── 5. GÜN ─────────────────────────
  {
    id: 'tar5', s: 'tarih', day: 5, min: 11,
    title: 'Atatürk ilkeleri ve Atatürk dönemi dış politika',
    why: '2-3 soru',
    cards: [
      {
        h: 'Altı ilke, altı soru',
        b: 'Her ilkeyi bir soruya bağla. ÖSYM bir olay verip “hangi ilkeyle ilgilidir?” diye sorar; sen de olayın **hangi soruya cevap verdiğine** bakarsın.',
        viz: {
          type: 'table', s: 'tarih',
          head: ['İlke', 'Sorusu', 'Örnek olaylar'],
          rows: [
            ['**Cumhuriyetçilik**', 'Yönetimi kim seçer?', 'Cumhuriyetin ilanı, saltanatın kaldırılması, çok partili denemeler'],
            ['**Milliyetçilik**', 'Biz kimiz, birlik nasıl olur?', 'Türk Tarih ve Dil kurumları, Kabotaj, tam bağımsızlık'],
            ['**Halkçılık**', 'Herkes eşit mi?', 'Unvanların kaldırılması, Aşar’ın kaldırılması, kadın hakları, Medeni Kanun'],
            ['**Devletçilik**', 'Ekonomiyi kim kalkındırır?', '1929 bunalımı sonrası, Sümerbank, Beş Yıllık Plan'],
            ['**Laiklik**', 'Din ve devlet işleri ayrı mı?', 'Halifeliğin kaldırılması, Tevhid-i Tedrisat, tekkeler, **vicdan özgürlüğü**'],
            ['**İnkılapçılık**', 'Yenilikler nasıl korunur?', 'Tüm inkılapların korunması ve sürdürülmesi'],
          ],
        },
        mn: { code: 'CuMi HaDe Laİ', t: 'Cumhuriyetçilik, Milliyetçilik, Halkçılık, Devletçilik, Laiklik, İnkılapçılık. İlkeler **1937**’de anayasaya girdi.' },
      },
      {
        h: 'Laiklik: sadece “din-devlet ayrı” değil',
        b: 'ÖSYM 2026’da laikliği şöyle tarif etti: kişinin düşüncesini ve inancını serbestçe belirlemesi, dinin gereklerini yerine getirip getirmemekte özgür olması, kimsenin vicdanına baskı yapılamaması. Yani laiklik = **din ve vicdan özgürlüğü** + devletin tüm inançlara eşit mesafede durması.',
      },
      {
        k: 'check',
        q: 'Aşar vergisinin kaldırılması en çok hangi ilkeyle ilgilidir?',
        o: ['Laiklik', 'Halkçılık', 'Cumhuriyetçilik', 'İnkılapçılık'],
        a: 1,
        ex: 'Aşar, nüfusun çoğunluğu olan köylünün sırtındaki yüktü. Kaldırılması **halkın refahını** ve eşitliği gözetir: **Halkçılık**. (Ekonomik sonucu da vardır ama ilke olarak halkçılık.)',
      },
      {
        h: 'Dış politika: sırayla 6 durak',
        b: 'Atatürk dönemi dış politikası “**Yurtta sulh, cihanda sulh**” üzerine kuruludur. Sınav sıralama sorar (2020’de “hangisi en önce?” soruldu). Kodlama ile sıra kendiliğinden gelir:',
        viz: {
          type: 'timeline', s: 'tarih', items: [
            { y: '1926', t: '**Musul** sorunu: Ankara Antlaşması ile Irak’a bırakıldı (petrol gelirinin %10’u 25 yıl Türkiye’ye).', key: true },
            { y: '1930', t: 'Yunanistan ile **Etabli** (yerleşik halk) sorunu çözüldü; ilişkiler düzeldi.' },
            { y: '1932', t: '**Milletler Cemiyeti**’ne davet üzerine girdik.', key: true },
            { y: '1934', t: '**Balkan Antantı**: Türkiye, Yunanistan, Yugoslavya, Romanya (İtalya tehdidine karşı).', key: true },
            { y: '1936', t: '**Montrö Boğazlar Sözleşmesi**: Boğazlar tamamen Türk egemenliğine geçti.', key: true },
            { y: '1937', t: '**Sadabat Paktı**: Türkiye, İran, Irak, Afganistan.', key: true },
            { y: '1939', t: '**Hatay** anavatana katıldı (Atatürk’ün vefatından sonra).', d: '“Kırk asırlık Türk yurdu düşman elinde esir kalamaz.” Hatay davası Misak-ı Millî’nin gereğiydi.', key: true },
          ],
        },
        mn: { code: 'MuMi BaMo SaHa', t: '**Mu**sul → **Mi**lletler Cemiyeti → **Ba**lkan → **Mo**ntrö → **Sa**dabat → **Ha**tay. Söylerken ritim tut: “Mumi, Bamo, Saha!”' },
      },
      {
        h: 'Milletler Cemiyeti tuzağı',
        b: 'ÖSYM 2026’da sordu: Türkiye’nin Milletler Cemiyeti’ne (1932) katılmasında hangileri etkili olabilir? Kural basit: **1932’den sonra olan olay, 1932’deki bir şeye sebep olamaz.**\nSadabat (1937) ve Montrö (1936) sonradır, eleriz. Yunanistan ile Etabli sorununun çözülmesi (1930) ve İngiltere ile ilişkilerin gelişmesi (Musul çözümü sonrası) öncedir, etkili olabilir.',
        note: { h: 'Altın kural', t: 'Sebep-sonuç sorularında önce **tarihleri sırala**. Sonra olan, önce olanın sebebi olamaz.', exam: true },
      },
    ],
    quiz: [
      { q: 'Atatürk; kişinin düşüncesini, inancını ve siyasi görüşünü serbestçe belirleyebilmesini ve kimsenin vicdanına baskı yapılamamasını vurgulamıştır.\nBu yaklaşım en çok hangi ilkeyle ilgilidir?', o: ['Devletçilik', 'Cumhuriyetçilik', 'Milliyetçilik', 'İnkılapçılık', 'Laiklik'], a: 4, ex: 'İnanç ve vicdan özgürlüğü **laikliğin** özüdür (2026 sorusu).' },
      { q: 'Türk dış politikasındaki aşağıdaki gelişmelerden hangisi kronolojik olarak **en önce** gerçekleşmiştir?', o: ['Hatay’ın anavatana katılması', 'Montrö Boğazlar Sözleşmesi', 'Musul sorununun çözümlenmesi', 'Türkiye’nin Milletler Cemiyetine girmesi', 'Balkan Antantı’nın kurulması'], a: 2, ex: 'Sıra: **Musul (1926)** → MC (1932) → Balkan (1934) → Montrö (1936) → Hatay (1939). (2020 Ön Lisans sorusu.)', tip: 'MuMi BaMo SaHa: ilk hece Mu = Musul.' },
      { q: 'Boğazların yönetiminin tamamen Türkiye’ye geçmesini sağlayan belge aşağıdakilerden hangisidir?', o: ['Lozan Antlaşması', 'Sadabat Paktı', 'Montrö Boğazlar Sözleşmesi', 'Balkan Antantı', 'Mudanya Ateşkesi'], a: 2, ex: 'Lozan’da Boğazlar uluslararası komisyona bırakılmıştı; **Montrö (1936)** ile komisyon kaldırıldı ve Boğazlar Türk egemenliğine geçti.' },
      { q: 'Atatürk’ün Hatay için söylediği “Kırk asırlık Türk yurdu düşman elinde esir kalamaz.” sözü, aşağıdakilerden hangisinin vazgeçilmezliğini gösterir?', o: ['Balkan Antantı', 'Misak-ı Millî', 'Sadabat Paktı', 'Milletler Cemiyeti', 'Kabotaj Kanunu'], a: 1, ex: 'Hatay, Misak-ı Millî sınırları içindeydi. Bu söz **Misak-ı Millî**’den taviz verilmeyeceğini gösterir (2024 sorusu).' },
      { q: 'Aşağıdakilerden hangisi **Halkçılık** ilkesiyle doğrudan ilgili değildir?', o: ['Aşar vergisinin kaldırılması', 'Kadınlara seçme ve seçilme hakkı verilmesi', 'Lakap ve unvanların kaldırılması', 'Sümerbank’ın kurulması', 'Medeni Kanun ile kanun önünde eşitliğin güçlenmesi'], a: 3, ex: '**Sümerbank** devletin sanayi yatırımıdır: **Devletçilik**.' },
    ],
    flash: [
      ['Atatürk ilkeleri kodlaması?', '**CuMi HaDe Laİ**: Cumhuriyetçilik, Milliyetçilik, Halkçılık, Devletçilik, Laiklik, İnkılapçılık'],
      ['İlkeler anayasaya ne zaman girdi?', '**1937**'],
      ['Unvanların kaldırılması hangi ilke?', '**Halkçılık** (eşitlik)'],
      ['Dış politika sırası kodlaması?', '**MuMi BaMo SaHa**: Musul 26, MC 32, Balkan 34, Montrö 36, Sadabat 37, Hatay 39'],
      ['Balkan Antantı üyeleri?', 'Türkiye, **Yunanistan, Yugoslavya, Romanya** (1934)'],
      ['Sadabat Paktı üyeleri?', 'Türkiye, **İran, Irak, Afganistan** (1937)'],
      ['Boğazlar hangi belgeyle bize geçti?', '**Montrö** (1936)'],
    ],
  },

  // ───────────────────────── 6. GÜN ─────────────────────────
  {
    id: 'tar6', s: 'tarih', day: 6, min: 13,
    title: 'İlk Türkler, ilk Müslüman Türkler ve Selçuklular',
    why: '3-4 soru',
    cards: [
      {
        h: 'Bozkırın dört kavramı',
        b: 'İslamiyet’ten önceki Türk devletlerini anlamak için dört kelime yeter. 2026’da tam bunlar soruldu.',
        viz: {
          type: 'cards', items: [
            ['Kut', 'Yönetme yetkisi **Gök Tanrı’dan** gelir. Kut kaybedilirse hükümdar meşruiyetini kaybeder.', 'tar'],
            ['Töre', 'Yazısız **hukuk kuralları**. Hükümdar bile töreye uymak zorundadır.', 'vat'],
            ['Kurultay (Toy)', 'Devlet işlerinin görüşüldüğü **danışma meclisi**.', 'tr'],
            ['İkili teşkilat', 'Devlet **doğu ve batı** diye ikiye ayrılır. Doğuyu kağan, batıyı yabgu yönetir.', 'cog'],
          ],
        },
        b2: '',
        note: { h: 'Ayrıca bil', t: '**Ülüş**: ülke hanedanın ortak malıdır → bu yüzden **taht kavgaları** çıkar. **Cihan hâkimiyeti**: Türk hükümdarı bütün dünyayı yönetme idealindedir. Yıkılış sebepleri: taht kavgaları, boylar arası çatışma, Çin entrikaları (ateşli silah eksikliği değil!).' },
      },
      {
        h: 'Üç büyük bozkır devleti',
        viz: {
          type: 'table', s: 'tarih',
          head: ['Devlet', 'Akılda kalacak tek şey'],
          rows: [
            ['**Asya Hun** (Mete Han)', 'Orduyu **onlu sisteme** göre kurdu → ilk düzenli ordu'],
            ['**Kök Türk** (Bumin Kağan, 552)', '“Türk” adını ilk kez devlet adı yaptı; **Orhun Yazıtları** (Bilge Kağan, Kül Tigin, Tonyukuk)'],
            ['**Uygur**', '**Yerleşik hayata** geçen ilk Türk devleti; **Maniheizm**; matbaa, tarım, mimari'],
          ],
        },
        mn: { code: 'HUN-10 · GÖK-YAZI · UYGUR-YERLEŞ', t: 'Hun = on (ordu) · Göktürk = yazı (Orhun) · Uygur = yerleşik hayat' },
      },
      {
        h: 'Talas Savaşı (751): yol ayrımı',
        b: 'Abbasiler ile Çin arasında yapıldı. **Karluklar** Müslüman Arapları destekledi ve Çin yenildi.\nSonuçları:\n- Türkler **Çin kültürünün etkisinden** kurtuldu, **İslam’a geçiş** hızlandı.\n- **Kâğıt** yapımı Çin’den İslam dünyasına geçti.\nTarihçi Barthold, bu savaşın Orta Asya’da hangi medeniyetin (İslam mı, Çin mi) hâkim olacağını belirlediğini söyler. Başka bir deyişle: bu savaş olmasaydı Türklerin çoğu Budist olabilirdi.',
        note: { h: 'ÖSYM iki yıl üst üste sordu', t: '2024 ve 2026’da cevap **Talas** idi. İpuçları: 751, Karluklar, Abbasi-Çin, Budizm.', exam: true },
      },
      {
        h: 'İlk Müslüman Türk devletleri',
        viz: {
          type: 'table', s: 'tarih',
          head: ['Devlet', 'Hatırla'],
          rows: [
            ['**Karahanlılar** (840)', '**İlk Müslüman Türk devleti** (Satuk Buğra Han). Türkçe resmî dil. Eserler: **Kutadgu Bilig** (Yusuf Has Hacip), **Divanü Lügati’t-Türk** (Kaşgarlı Mahmut), Atabetü’l-Hakayık, Divan-ı Hikmet (Ahmet Yesevi)'],
            ['**Gazneliler**', '**Sultan Mahmut**: Hindistan seferleri; “sultan” unvanını kullanan ilk Türk hükümdarı'],
            ['**Büyük Selçuklu**', '**Dandanakan** (1040) ile kuruldu. **Tuğrul Bey** Bağdat’a girdi, halife ona “**Doğu’nun ve Batı’nın hükümdarı**” dedi. **Malazgirt** (1071, Alparslan) Anadolu’nun kapısını açtı. **Nizamiye** medreseleri (Nizamülmülk)'],
          ],
        },
        note: { h: 'ÖSYM böyle sordu (2020)', t: 'Halifenin “Doğu’nun ve Batı’nın Hükümdarı” unvanını verdiği Türk hükümdarı → **Tuğrul Bey**.', exam: true },
      },
      {
        k: 'check',
        q: '“Kutadgu Bilig” ve “Divanü Lügati’t-Türk” hangi Türk-İslam devleti döneminde yazıldı?',
        o: ['Gazneliler', 'Karahanlılar', 'Büyük Selçuklular', 'Uygurlar'],
        a: 1,
        ex: 'İki eser de **Karahanlı** dönemi (11. yüzyıl) eseridir. Kutadgu Bilig bir siyasetnamedir; Divanü Lügati’t-Türk Araplara Türkçe öğretmek için yazılmış bir sözlüktür.',
      },
      {
        h: 'Anadolu Selçuklu: bil ve geç',
        b: '- **Miryokefalon** (1176, II. Kılıç Arslan): Anadolu’nun **Türk yurdu olduğu kesinleşti**.\n- **Kösedağ** (1243): Moğollara yenildiler, yıkılış başladı. Ardından **beylikler dönemi** geldi.\n- Mimari eserler şehir şehir sorulur. 2026’da: **Kayseri** = Döner Kümbet + Gevher Nesibe Darüşşifası + Huant Hatun Külliyesi. **Sivas-Divriği** = Ulu Cami ve Darüşşifa (UNESCO). **Konya** = Karatay ve İnce Minareli medreseler.',
        viz: { type: 'map', alt: 'Selçuklu eserleri', groups: [{ c: 'tar', iller: ['kayseri', 'konya', 'sivas'] }] },
      },
    ],
    quiz: [
      { q: 'İlk Türklerde kağan, yönetme yetkisini Gök Tanrı’dan aldığına inanmış; hâkimiyetini bütün insanlara ulaştırmayı amaçlamış; yönetimde toplumun benimsediği kurallara bağlı kalmıştır.\nBu anlatımda aşağıdaki kavramlardan hangisine **yer verilmemiştir**?', o: ['Töre', 'Kut anlayışı', 'Cihan hâkimiyeti', 'Göçebe yaşam tarzı', 'İkili teşkilatlanma'], a: 4, ex: 'Gök Tanrı’dan yetki = **kut**; bütün insanlara hâkimiyet = **cihan hâkimiyeti**; toplumun kuralları = **töre**. Devletin doğu-batı diye ikiye ayrılması (**ikili teşkilat**) metinde yok. (2026 sorusuna benzer.)', tip: '“Yer verilmemiştir” sorularında metindeki her ifadenin karşısına kavramını yaz; artakalan şık cevaptır.' },
      { q: '751’de yapılan ve Karlukların Müslüman Arapları desteklediği, Türkistan’da İslam ile Çin medeniyetlerinden hangisinin etkili olacağını belirleyen savaş hangisidir?', o: ['Katvan', 'Talas', 'Ayn Calut', 'Hıttin', 'Dandanakan'], a: 1, ex: '**Talas** (751). 2024 ve 2026’da iki kez soruldu.' },
      { q: 'Halife Kaim Biemrillah’ın, Büveyhi tehlikesini ortadan kaldırması üzerine “Doğu’nun ve Batı’nın Hükümdarı” unvanını verdiği Türk-İslam hükümdarı kimdir?', o: ['Sultan Mahmut', 'Tolunoğlu Ahmet', 'Tuğrul Bey', 'II. Kılıç Arslan', 'Alparslan'], a: 2, ex: '**Tuğrul Bey** 1055’te Bağdat’a girip halifeyi Büveyhoğulları baskısından kurtardı (2020 sorusu).' },
      { q: 'Döner Kümbet, Gevher Nesibe Darüşşifası ve Huant Hatun Külliyesi’ni aynı gezide görmek isteyen biri hangi şehre gitmelidir?', o: ['Konya', 'Elazığ', 'Sivas', 'Kayseri', 'Malatya'], a: 3, ex: 'Üç eser de **Kayseri**’dedir (2026 sorusu).' },
      { q: 'Aşağıdakilerden hangisi İslamiyet öncesi Türk devletlerinin kısa ömürlü olmasının nedenlerinden biri **değildir**?', o: ['Boylar arası mücadeleler', 'Yeteneksiz kağanların başa geçmesi', 'Çin’in iç işlerine karışması', 'Taht kavgaları', 'Ateşli silahlardan yoksun olunması'], a: 4, ex: 'O dönemde kimsede ateşli silah yoktu; bu bir yıkılış sebebi olamaz (2020 sorusu).', tip: 'Dönemine uymayan (anakronik) şık genelde cevaptır.' },
      { q: 'Anadolu’nun kesin olarak Türk yurdu olduğunu gösteren savaş hangisidir?', o: ['Malazgirt', 'Miryokefalon', 'Kösedağ', 'Dandanakan', 'Pasinler'], a: 1, ex: 'Malazgirt (1071) Anadolu’nun **kapısını açtı**; **Miryokefalon** (1176) ise Anadolu’nun Türk yurdu olduğunu **kesinleştirdi**.' },
    ],
    flash: [
      ['Kut nedir?', 'Yönetme yetkisinin **Gök Tanrı’dan** verildiği inancı'],
      ['Töre nedir?', '**Yazısız hukuk kuralları**'],
      ['İkili teşkilat nedir?', 'Devletin **doğu ve batı** olarak ikiye ayrılması'],
      ['Onlu sistemi kuran?', '**Mete Han** (Asya Hun)'],
      ['Yerleşik hayata geçen ilk Türk devleti?', '**Uygurlar**'],
      ['İlk Müslüman Türk devleti?', '**Karahanlılar**'],
      ['Talas Savaşı?', '**751**, Abbasi-Çin; Karluklar Arapları destekledi; İslam’a geçiş hızlandı'],
      ['Kutadgu Bilig’in yazarı?', '**Yusuf Has Hacip** (Karahanlı)'],
      ['Miryokefalon’un önemi?', 'Anadolu’nun Türk yurdu olduğu **kesinleşti** (1176)'],
    ],
  },

  // ───────────────────────── 7. GÜN ─────────────────────────
  {
    id: 'tar7', s: 'tarih', day: 7, min: 13,
    title: 'Beylikler ve Osmanlı’nın büyüme çağı',
    why: '3-4 soru',
    cards: [
      {
        h: 'Beylikler: haritada tanı',
        b: 'Anadolu Selçuklu dağılınca Anadolu’da beylikler kuruldu. ÖSYM beylik-başkent eşleştirmesi sorar (2020) ve denizciliği sorar (2024).',
        viz: { type: 'map', alt: 'Anadolu beylikleri', groups: [
          { label: '**Karesi** (Balıkesir): ilk denizci beylik', c: 'blue', iller: ['balikesir'], short: 'Karesi' },
          { label: '**Aydınoğulları** (Aydın-İzmir): Umur Bey, denizcilik', c: 'teal', iller: ['aydin', 'izmir'], short: 'Aydın' },
          { label: '**Menteşe** (Muğla)', c: 'violet', iller: ['mugla'], short: 'Menteşe' },
          { label: '**Saruhan** (Manisa)', c: 'yellow', iller: ['manisa'], short: 'Saruhan' },
          { label: '**Germiyan** (Kütahya)', c: 'orange', iller: ['kutahya'], short: 'Germiyan' },
          { label: '**Karaman** (Karaman-Konya): Türkçe resmî dil', c: 'red', iller: ['karaman', 'konya'], short: 'Karaman' },
          { label: '**Osmanoğulları** (Söğüt-Bilecik)', c: 'dark', iller: ['bilecik'], short: 'Osmanlı' },
        ] },
        note: { h: 'Sık sorulan', t: '**Karamanoğlu Mehmet Bey** (1277): “Bugünden sonra divanda, dergâhta, bargâhta, mecliste ve meydanda **Türkçe**den başka dil konuşulmayacak.” Menteşe = Muğla (Isparta değil! 2020’de yanlış eşleştirme olarak soruldu).', exam: true },
      },
      {
        h: 'Osmanlı’nın ilk padişahları: “ilk”ler zinciri',
        viz: {
          type: 'table', s: 'tarih',
          head: ['Padişah', 'Hatırla'],
          rows: [
            ['**Osman Bey**', 'Kuruluş (1299), **Koyunhisar** (Bizans’la ilk savaş)'],
            ['**Orhan Bey**', '**Bursa** başkent; ilk **akçe**, ilk **düzenli ordu**, ilk **medrese (İznik)**; **Karesi**’yi aldı → **Rumeli’ye geçiş** (Çimpe)'],
            ['**I. Murat**', '**Edirne** başkent; **Divan-ı Hümayun**, **Yeniçeri Ocağı** (devşirme); I. Kosova (1389)'],
            ['**Yıldırım Bayezid**', 'Niğbolu; İstanbul’u ilk kuşatma; **Ankara Savaşı** (1402, Timur) → **Fetret Devri**'],
            ['**Çelebi Mehmet**', 'Fetret’i bitirdi, “ikinci kurucu”'],
            ['**Fatih**', '**İstanbul’un fethi** (1453); Otlukbeli; kanunname'],
            ['**Yavuz Selim**', 'Çaldıran; **Mısır Seferi** (Mercidabık 1516, Ridaniye 1517) → **halifelik**, Mekke-Medine hamiliği'],
            ['**Kanuni**', 'Mohaç, Viyana kuşatması; **Barbaros**’u Kaptan-ı Derya yaptı → **Preveze** (1538)'],
          ],
        },
      },
      {
        h: 'Orhan Bey, Karesi ve Rumeli',
        b: 'Bu zincir ÖSYM’nin favorisi (2026):\n**Bizans’taki taht kavgasında Kantakuzen’i destekledi** + **Karesi Beyliği’ni aldı** (donanması ve denizci beyleri Osmanlı’ya geçti) → **Rumeli’ye geçiş kolaylaştı**.\nAyrıca Orhan Bey döneminde **Bursa** fethedildi ve başkent yapıldı. İbn-i Battuta Bursa için “güzel çarşıları ve geniş sokakları olan büyük bir şehir” demiştir (2024’te soruldu).',
        mn: { code: 'ORHAN = BAKİR', t: '**B**ursa, **A**kçe, **K**aresi, **İ**znik medresesi, **R**umeli’ye geçiş' },
      },
      {
        k: 'check',
        q: 'Suriye, Filistin ve Mısır’ın alınması, halifeliğin Osmanlı’ya geçmesi hangi padişah döneminde oldu?',
        o: ['Fatih', 'II. Bayezid', 'Yavuz Selim', 'Kanuni'],
        a: 2,
        ex: '**Yavuz Sultan Selim**’in Mısır Seferi (1516-17) ile halifelik Osmanlı’ya geçti ve Osmanlı, **Mekke ve Medine**’nin koruyucusu oldu (2024 sorusu).',
      },
      {
        h: 'Fetret Devri ve Çandarlı',
        b: '**Ankara Savaşı** (1402): Yıldırım Bayezid, Timur’a yenildi ve esir düştü. Ardından şehzadeler arasında 11 yıl süren taht kavgası yaşandı: **Fetret Devri** (1402-1413). Çelebi Mehmet birliği yeniden sağladı.\n**Çandarlı Halil Paşa**: II. Murat ve Fatih döneminin güçlü veziri. Fatih’in güç kazanmasına karşı çıktı; Zağanos, Şehabeddin Şahin gibi paşalar ise Fatih’i destekledi. Fatih İstanbul’u aldıktan sonra onu idam ettirdi; bundan sonra devşirme kökenli vezirler öne çıktı (2026’da soruldu).',
      },
      {
        k: 'video', h: 'Canın isterse izle',
        links: [['Osmanlı kuruluş dönemi padişahlar', 'KPSS Osmanlı kuruluş dönemi padişahlar kodlama'], ['Anadolu beylikleri harita', 'KPSS Anadolu beylikleri haritalı anlatım']],
      },
    ],
    quiz: [
      { q: 'Denizcilik faaliyetleriyle öne çıkan ve en parlak dönemini Umur Bey zamanında yaşayan beylik hangisidir?', o: ['Karamanoğulları', 'Germiyanoğulları', 'Aydınoğulları', 'Eşrefoğulları', 'Candaroğulları'], a: 2, ex: '**Aydınoğulları**, Umur Bey döneminde Ege’de güçlü bir donanma kurdu (2024 sorusu).' },
      { q: 'Aşağıda verilen beylik-merkez eşleştirmelerinden hangisi **yanlıştır**?', o: ['Karesioğulları – Balıkesir', 'Germiyanoğulları – Kütahya', 'Saruhanoğulları – Manisa', 'Menteşeoğulları – Isparta', 'Eşrefoğulları – Beyşehir'], a: 3, ex: 'Menteşeoğulları **Muğla** (Milas) merkezlidir. Isparta, Hamitoğulları’nın merkezidir. (2020 sorusu.)' },
      { q: 'Osmanlıların Bizans’taki taht mücadelesinde Kantakuzen’i desteklemesi ve 1345’te Karesioğulları’nı topraklarına katması, aşağıdakilerden hangisini kolaylaştırmıştır?', o: ['Fetret Devri’nin sona ermesi', 'Rumeli’ye geçişin sağlanması', 'Bursa’nın fethi', 'İznik’in merkez yapılması', 'Koyunhisar Savaşı’nın kazanılması'], a: 1, ex: 'Karesi’nin donanması ve denizci beyleri ile Bizans’ın desteği **Rumeli’ye geçişi** kolaylaştırdı (2026 sorusu).' },
      { q: 'Aşağıdakilerden hangisi Orhan Bey döneminde gerçekleşen gelişmelerden biri **değildir**?', o: ['Rumeli’ye geçilmesi', 'Dulkadiroğulları Beyliği’nin ele geçirilmesi', 'İznik’te medrese açılması', 'Kuzeybatı Anadolu’da siyasi birliğin sağlanması', 'Bursa’nın başkent olması'], a: 1, ex: 'Dulkadiroğulları, **Yavuz Selim** döneminde (Turnadağ, 1515) alındı (2020 sorusu).' },
      { q: 'Kanuni Sultan Süleyman’ın, Haçlı donanmasına karşı mücadele etmek için çağırarak Kaptan-ı Deryalık görevi verdiği kişi kimdir?', o: ['Piri Reis', 'Turgut Reis', 'Barbaros Hayreddin Paşa', 'Sokullu Mehmet Paşa', 'Kılıç Ali Paşa'], a: 2, ex: '**Barbaros Hayreddin Paşa**, 1538’de **Preveze**’de Haçlı donanmasını yendi (2024 sorusu).' },
    ],
    flash: [
      ['Türkçeyi resmî dil ilan eden beylik?', '**Karamanoğulları** (Mehmet Bey, 1277)'],
      ['Umur Bey hangi beylik?', '**Aydınoğulları** (denizcilik)'],
      ['Menteşeoğulları’nın merkezi?', '**Muğla** (Milas)'],
      ['Orhan Bey kodlaması?', '**BAKİR**: Bursa, Akçe, Karesi, İznik medresesi, Rumeli’ye geçiş'],
      ['Divan-ı Hümayun ve Yeniçeri Ocağı kimin döneminde?', '**I. Murat**'],
      ['Fetret Devri’ne yol açan savaş?', '**Ankara Savaşı** (1402, Timur)'],
      ['Halifelik Osmanlı’ya ne zaman geçti?', '**Yavuz** · Mısır Seferi (1517)'],
      ['Preveze Deniz Zaferi?', '**1538**, Barbaros Hayreddin Paşa, Kanuni dönemi'],
    ],
  },

  // ───────────────────────── 8. GÜN ─────────────────────────
  {
    id: 'tar8', s: 'tarih', day: 8, min: 13,
    title: 'Osmanlı devlet düzeni: divan, toprak, ordu, toplum',
    why: '2-4 soru',
    cards: [
      {
        h: 'Divan-ı Hümayun: devletin bakanlar kurulu',
        b: 'Her üyenin **tek bir işi** var. İşi bilirsen soruyu bilirsin.',
        viz: {
          type: 'cards', items: [
            ['Sadrazam', 'Padişahın mutlak vekili, **mührü** taşır; divana başkanlık eder.', 'dark'],
            ['Kazasker', '**Adalet ve eğitim** işleri: kadı ve müderris atar; şer’i davalara bakar.', 'vat'],
            ['Defterdar', '**Maliye**: gelir-gider, bütçe.', 'mat'],
            ['Nişancı', 'Padişahın **tuğrasını** çeker; fermanlar, tapu-tahrir defterleri.', 'tr'],
            ['Kaptan-ı Derya', '**Donanma** komutanı.', 'blue'],
            ['Reisülküttap', 'Yazışmalar; zamanla **dış işleri**.', 'gun'],
          ],
        },
        mn: { code: 'KAZA-ADALET · DEFTER-PARA · NİŞAN-TUĞRA', t: 'Kaza(sker) → mahkeme; Defter(dar) → hesap defteri; Nişan(cı) → padişahın nişanı (tuğra).' },
        note: { h: 'ÖSYM böyle sordu', t: '2024: “Divanda şer’i işlere bakan üye?” → **Kazasker**. 2020: “Mali işlerden sorumlu üye?” → **Defterdar**.', exam: true },
      },
      {
        h: 'Toprak düzeni: tımar ve çift-hane',
        b: 'Osmanlı’da tarım topraklarının çoğu devletindir: **mirî arazi**. Devlet bu toprağın vergisini toplama hakkını askerlere ve memurlara maaş yerine verir: **dirlik** (tımar sistemi).\n- Tımar sahibi (sipahi), gelirine göre savaşa **cebelü** (atlı asker) yetiştirir. Böylece devlet hazineden para harcamadan büyük bir ordu besler.\n- Köylü toprağı işler ama satamaz.\n**Çift-hane sistemi**: bir **ailenin bir çift öküzle işleyebileceği kadar toprak** o aileye verilir (2026 sorusu).',
        viz: { type: 'bars', s: 'tarih', items: [['Has', 100, '100.000+ akçe'], ['Zeamet', 50, '20-100 bin'], ['Tımar', 15, '3-20 bin']], c: 'tar', caption: 'Dirliklerin yıllık gelirine göre sıralanışı' },
      },
      {
        h: 'Para bulma yöntemleri: iltizam → malikane → esham',
        b: '16. yüzyıl sonundan itibaren hazine sıkışınca vergi toplama yöntemi değişti. Sıra ve mantık ÖSYM’de sık çıkar (2024: üçü birlikte soruldu).',
        viz: { type: 'flow', items: ['**İltizam**: vergi toplama hakkı açık artırmayla, **kısa süreliğine** mültezime verilir.', '**Malikâne** (1695): bu hak **ömür boyu** verilir.', '**Esham** (1775): devlet, gelecekteki vergi gelirine dayanarak halktan borç alır; **iç borçlanma** (hisse senedi benzeri).'] },
        mn: { code: 'İ → M → E', t: '“**İ**lk **M**aaş **E**rken”: İltizam kısa, Malikâne ömür boyu, Esham borç senedi.' },
      },
      {
        h: 'Ordu: Kapıkulu ocakları',
        b: 'Merkezdeki maaşlı askerlere **Kapıkulu** denir. Her ocağın bir işi var (2020’de soruldu):',
        viz: {
          type: 'table', s: 'tarih',
          head: ['Ocak', 'İşi'],
          rows: [['**Yeniçeri**', 'Piyade (yaya) asker'], ['**Cebeci**', 'Silah, zırh, kalkan **yapar ve tamir eder**'], ['**Topçu**', 'Top döker, kullanır'], ['**Top arabacı**', 'Topları taşır'], ['**Humbaracı**', 'Havan ve el bombası'], ['**Lağımcı**', 'Kale altına tünel kazar']],
        },
        b2: '',
        note: { h: 'Ayrıca bil', t: '**Devşirme**: Hristiyan ailelerden alınan çocuklar eğitilip Kapıkulu ya da yönetici yapılırdı. En yeteneklileri **Enderun**’da (saray okulu) yetişirdi. **Tımarlı sipahiler** ise taşradaki en kalabalık askerî gruptu.' },
      },
      {
        k: 'check',
        q: 'Osmanlı’da silah, ok, yay, kalkan, zırh yapan ve tamir eden ocak hangisidir?',
        o: ['Topçu', 'Lağımcı', 'Cebeci', 'Humbaracı'],
        a: 2,
        ex: '**Cebeci** ocağı. “Cephane” kelimesini düşün: cebeci = cephaneci.',
      },
      {
        h: 'Toplum: yönetenler ve yönetilenler',
        viz: {
          type: 'compare', cols: [
            { h: 'Yönetenler (askerî)', c: 'dark', items: ['**Seyfiye**: ordu (kılıç)', '**İlmiye**: kadı, müderris, müftü (ulema)', '**Kalemiye**: bürokrasi (kalem)', 'Vergi **vermezler**'] },
            { h: 'Yönetilenler (reaya)', c: 'ink', items: ['Köylüler: tarım, hayvancılık', 'Şehirliler: esnaf, tüccar (**lonca**, ahilik)', 'Konar-göçerler', 'Vergi **verirler**'] },
          ],
        },
        note: { h: 'ÖSYM böyle sordu (2020)', t: '“Klasik dönemde yönetilenlerin faaliyet alanlarından biri **değildir**?” → **Vergi toplamak**. (Vergiyi yönetenler toplar.)', exam: true },
      },
      {
        h: 'Külliye, vakıf ve diğer kavramlar',
        b: '**Külliye**: cami, medrese, imaret (aşevi), darüşşifa (hastane), hamam bir arada. İmarette öğrenci, öğretmen, yoksul ve yolcu birlikte yemek yerdi: farklı gruplara hizmet + kültürel etkileşim + **sosyal devlet** anlayışı (2026).\n**Vakıf**: hayır amaçlı bağışlanan mülk.\n**Evlâd-ı Fâtihân**: Rumeli’ye yerleştirilen, fetihlere katılmış Türkmen topluluklar (2026).\nEser türleri: **Gazavatname** = savaş ve seferleri anlatan eser; **Sefaretname** = elçilik raporu; **Siyasetname** = yönetim öğütleri.',
      },
    ],
    quiz: [
      { q: 'Divan-ı Hümayun’un mali işlerden sorumlu üyesi aşağıdakilerden hangisidir?', o: ['Kazasker', 'Vezir', 'Nişancı', 'Reisülküttap', 'Defterdar'], a: 4, ex: '**Defterdar** maliyeden sorumludur (2020 sorusu).', tip: 'Defter = hesap = para.' },
      { q: 'Osmanlı’da yeniçerilerin ihtiyacı olan ok, yay, kalkan, kılıç, zırh gibi aletlerin yapıldığı ve tamir edildiği ocak hangisidir?', o: ['Topçu', 'Lağımcı', 'Cebeci', 'Humbaracı', 'Acemi'], a: 2, ex: '**Cebeci** ocağı (2020 sorusu). Acemi Ocağı ise devşirmelerin yetiştirildiği yerdir.' },
      { q: 'Klasik dönemde tımar düzenine bağlı mirî arazilerin çiftçi ailelere verilmesinde uygulanan “çift-hane” sisteminin esas aldığı ölçüt nedir?', o: ['İki hanenin bir toprağı birlikte işlemesi', 'Her hanenin iki cebelü yetiştirmesi', 'Bir çift öküzün iki hanenin toprağında kullanılması', 'Her bireyin ayrı vergi ödemesi', 'Bir ailenin bir çift öküzle işleyebileceği miktarda toprak'], a: 4, ex: 'Çift = bir çift öküz; hane = aile. Bir aile, bir çift öküzle işleyebileceği kadar toprak alır (2026 sorusu).' },
      { q: 'Osmanlı’da vergi toplama hakkının açık artırmayla kısa süreli olarak verilmesi, ömür boyu verilmesi ve gelecekteki vergiye dayalı iç borçlanma uygulamaları sırasıyla hangileridir?', o: ['Tımar – Zeamet – Has', 'İltizam – Malikâne – Esham', 'Malikâne – İltizam – Esham', 'Esham – İltizam – Malikâne', 'Mukataa – Tımar – Vakıf'], a: 1, ex: 'Sıra: **İltizam** (kısa süreli) → **Malikâne** (ömür boyu) → **Esham** (iç borçlanma).' },
      { q: 'Osmanlı külliyelerindeki imaretlerde medrese hocaları, öğrenciler, kurum çalışanları, yoksullar ve yolcular yemek için bir araya gelirdi.\nBu durum külliyelerin;\nI. farklı toplumsal gruplara hizmet sunması,\nII. kültürel etkileşimi desteklemesi,\nIII. sosyal devlet anlayışını yansıtması\nözelliklerinden hangileriyle açıklanabilir?', o: ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III'], a: 4, ex: 'Hepsi doğru: farklı gruplar (I), bilgi alışverişi (II), yoksula ve yolcuya ücretsiz yemek (III). (2026 sorusu.)' },
      { q: 'Anadolu’dan Rumeli’ye geçip fetihlere katılan, ardından bu topraklara yerleştirilen Türkmen toplulukları Osmanlı kaynaklarında hangi adla anılır?', o: ['Nakîbüleşraf', 'Sahib-i arz', 'Evlâd-ı Fâtihân', 'Ehl-i Hiref', 'Serdâr-ı Ekrem'], a: 2, ex: '**Evlâd-ı Fâtihân** = “fatihlerin çocukları” (2026 sorusu). Ehl-i Hiref saray sanatçılarıdır.' },
    ],
    flash: [
      ['Kazasker’in görevi?', '**Adalet ve eğitim** (kadı, müderris atama; şer’i davalar)'],
      ['Defterdar’ın görevi?', '**Maliye**'],
      ['Nişancı’nın görevi?', '**Tuğra**, fermanlar, tapu-tahrir'],
      ['Cebeci ocağı ne yapar?', 'Silah, zırh yapar ve **tamir eder**'],
      ['İltizam – Malikâne – Esham farkı?', 'Kısa süreli – **ömür boyu** – **iç borçlanma**'],
      ['Çift-hane sistemi?', 'Bir ailenin **bir çift öküzle** işleyebileceği kadar toprak'],
      ['Evlâd-ı Fâtihân?', 'Rumeli’ye yerleştirilen **Türkmen** fatihler'],
      ['Gazavatname nedir?', '**Savaş ve seferleri** anlatan eser'],
    ],
  },

  // ───────────────────────── 9. GÜN ─────────────────────────
  {
    id: 'tar9', s: 'tarih', day: 9, min: 14,
    title: 'Osmanlı’nın son 300 yılı ve çağdaş dünya: hızlı tur',
    why: '4-6 soru',
    cards: [
      {
        h: 'Bugün hız günü',
        b: 'Bu derste çok olay var ama her birinden **tek bir bilgi** yeter. Zaman çizgisini yukarıdan aşağı bir kez oku, sonra kodlamaya bak.',
        viz: {
          type: 'timeline', s: 'tarih', items: [
            { y: '1639', t: '**Kasr-ı Şirin** (İran): bugünkü **İran sınırı** büyük ölçüde çizildi.' },
            { y: '1699', t: '**Karlofça**: ilk büyük **toprak kaybı**.' },
            { y: '1727', t: 'Lale Devri, **matbaa** (İbrahim Müteferrika).' },
            { y: '1774', t: '**Küçük Kaynarca**: Kırım bağımsız oldu, Rusya Ortodoksların koruyucusu sayıldı.' },
            { y: '1798', t: '**Napolyon Mısır’ı işgal etti** → Osmanlı-Fransa ilişkileri bozuldu (III. Selim).' },
            { y: '1808', t: '**Sened-i İttifak** (II. Mahmut-ayanlar): padişahın yetkisi ilk kez sınırlandı.', key: true },
            { y: '1826', t: '**Yeniçeri Ocağı kaldırıldı** (II. Mahmut). Nezaretler (bakanlıklar) kuruldu → merkez teşkilatı modernleşti.' },
            { y: '1833', t: '**Hünkâr İskelesi**: Mısır sorununda **Rusya**’dan yardım.' },
            { y: '1839', t: '**Tanzimat Fermanı**: can, mal, namus güvencesi; kanun üstünlüğü.', key: true },
            { y: '1856', t: '**Islahat Fermanı**: gayrimüslimlere geniş haklar.' },
            { y: '1876', t: '**Kanun-i Esasi**: ilk anayasa, **I. Meşrutiyet**.', d: 'Resmî dil Türkçe, resmî din İslam; hükümet padişaha karşı sorumlu.', key: true },
            { y: '1881', t: '**Muharrem Kararnamesi** → **Duyun-u Umumiye**: alacaklılar tuz, tütün, ipek gibi gelirlere el koydu.' },
            { y: '1911-12', t: '**Trablusgarp** (İtalya): M. Kemal **gayrinizami harp** tecrübesi kazandı.' },
            { y: '1912-13', t: '**Balkan Savaşları**: **Arnavutluk** bağımsız oldu (Osmanlı’dan ayrılan son Balkan devleti).' },
          ],
        },
      },
      {
        h: 'I. Dünya Savaşı cepheleri',
        viz: {
          type: 'compare', cols: [
            { h: 'Taarruz (biz saldırdık)', c: 'tar', items: ['**Kafkas** (Rusya’ya karşı; Sarıkamış)', '**Kanal** (İngilizlere karşı; Süveyş)'] },
            { h: 'Savunma', c: 'blue', items: ['**Çanakkale** (18 Mart 1915; Anafartalar)', 'Irak, Suriye-Filistin, Hicaz-Yemen'] },
            { h: 'Yardım (müttefike)', c: 'gray', items: ['**Galiçya** (Rusya’ya karşı)', 'Makedonya, Romanya'] },
          ],
        },
        note: { h: 'ÖSYM böyle sordu', t: '2024: Osmanlı hangi cephelerde **Rusya**’ya karşı savaştı? → **Kafkas ve Galiçya**. 2026: M. Kemal I. Dünya Savaşı’nda **İzmir**’de görev yapmadı (Çanakkale, Muş-Bitlis, Halep’te yaptı).', exam: true },
      },
      {
        k: 'check',
        q: 'Osmanlı’dan ayrılarak bağımsızlığını kazanan **son** Balkan devleti hangisidir?',
        o: ['Yunanistan', 'Sırbistan', 'Arnavutluk', 'Romanya'],
        a: 2,
        ex: '**Arnavutluk**, 1912’de Balkan Savaşları sırasında bağımsız oldu. Yunanistan ilk (1830).',
      },
      {
        h: 'II. Dünya Savaşı ve Soğuk Savaş',
        viz: {
          type: 'timeline', s: 'tarih', items: [
            { y: '1939-45', t: '**II. Dünya Savaşı**: Türkiye savaşa **girmedi** (savaş sonunda sembolik olarak Almanya’ya savaş ilan etti).' },
            { y: '1942', t: '**Varlık Vergisi**: savaş ekonomisi için tüccar ve sanayiciden **bir defaya mahsus** alınan vergi.', key: true },
            { y: '1946', t: 'Çok partili hayata geçiş; **1950**’de Demokrat Parti iktidar.' },
            { y: '1947', t: '**Truman Doktrini**: ABD’nin **Sovyet yayılmasına karşı** Türkiye ve Yunanistan’a yardımı. Ardından **Marshall Planı**.' },
            { y: '1950', t: 'Türkiye **Kore Savaşı**’na asker gönderdi.' },
            { y: '1952', t: 'Türkiye **NATO**’ya girdi (Kore’deki başarı kolaylaştırdı).', key: true },
            { y: '1955', t: '**Varşova Paktı**: SSCB ve Doğu Bloku. **Yugoslavya üye değildi.**', key: true },
            { y: '1974', t: '**Kıbrıs Barış Harekâtı**.' },
          ],
        },
        mn: { code: 'KORE → NATO · YUGO ≠ VARŞOVA', t: 'Kore’ye asker gitti, NATO kapısı açıldı. Yugoslavya Varşova’ya girmedi (Tito, bağlantısızlar).' },
        note: { h: 'ÖSYM 2024’te üçünü de sordu', t: 'Varlık Vergisi, Kore → NATO ve “Varşova Paktı’na üye olmayan: **Yugoslavya**” soruları 2024 Ön Lisans’taydı.', exam: true },
      },
    ],
    quiz: [
      { q: '1639 yılında İran ile imzalanan ve bugünkü Türkiye-İran sınırının büyük ölçüde belirlendiği antlaşma hangisidir?', o: ['Amasya', 'Serav', 'Kasr-ı Şirin', 'Zitvatorok', 'Karlofça'], a: 2, ex: '**Kasr-ı Şirin** (1639), IV. Murat dönemi (2024 sorusu).' },
      { q: 'Kanun-i Esasi ile ilgili;\nI. Hükümet padişaha karşı sorumludur.\nII. Resmî dil Türkçe, resmî din İslam’dır.\nIII. Padişahın yetkileri tamamen kaldırılmıştır.\nifadelerinden hangileri doğrudur?', o: ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III'], a: 2, ex: 'Kanun-i Esasi’de padişah hâlâ çok güçlüydü (meclisi açıp kapatabiliyordu); III yanlış. I ve II doğru (2024 sorusu).' },
      { q: 'Osmanlı Devleti’nin dış borçlarını ödeyememesi üzerine tuz, ipek, tütün gibi gelirlerine alacaklı devletlerce el konulması hangisiyle gerçekleşmiştir?', o: ['Islahat Fermanı', 'Muharrem Kararnamesi', 'Sened-i İttifak', 'Vilayet Nizamnamesi', 'Kanun-i Esasi'], a: 1, ex: '**Muharrem Kararnamesi** (1881) ile Duyun-u Umumiye kuruldu (2020 sorusu).' },
      { q: 'Osmanlı Devleti I. Dünya Savaşı’nda hangi cephelerde Rusya’ya karşı savaşmıştır?', o: ['Kanal – Irak', 'Çanakkale – Suriye', 'Kafkas – Galiçya', 'Hicaz – Yemen', 'Makedonya – Romanya'], a: 2, ex: '**Kafkas** (taarruz) ve **Galiçya** (yardım) cepheleri (2024 sorusu).' },
      { q: 'Türkiye’nin Kore Savaşı’ndaki başarısı aşağıdakilerden hangisine katılımını kolaylaştırmıştır?', o: ['Balkan Paktı', 'Bağdat Paktı', 'NATO', 'Birleşmiş Milletler', 'Avrupa Konseyi'], a: 2, ex: 'Türkiye 1950’de Kore’ye asker gönderdi, **1952**’de **NATO**’ya üye oldu (2024 sorusu).' },
      { q: 'Aşağıdaki devletlerden hangisi Varşova Paktı’na üye **değildir**?', o: ['Polonya', 'Macaristan', 'Bulgaristan', 'Yugoslavya', 'Romanya'], a: 3, ex: '**Yugoslavya** (Tito) Sovyet bloğuna girmedi; Bağlantısızlar Hareketi’nin öncülerindendir (2024 sorusu).' },
      { q: 'İkinci Dünya Savaşı yıllarında (1942) tüccar, sanayici ve iş insanlarından bir defaya mahsus alınan vergi hangisidir?', o: ['Aşar', 'Varlık Vergisi', 'Tekâlif-i Millîye', 'Cizye', 'Avarız'], a: 1, ex: '**Varlık Vergisi** (1942) (2024 sorusu). Tekâlif-i Millîye 1921’de Kurtuluş Savaşı için halktan istenen yardımdır.' },
    ],
    flash: [
      ['Bugünkü İran sınırını büyük ölçüde çizen antlaşma?', '**Kasr-ı Şirin** (1639)'],
      ['İlk büyük toprak kaybı?', '**Karlofça** (1699)'],
      ['Padişahın yetkisini ilk kez sınırlayan belge?', '**Sened-i İttifak** (1808)'],
      ['İlk anayasa ve tarihi?', '**Kanun-i Esasi**, 1876 (I. Meşrutiyet)'],
      ['Duyun-u Umumiye hangi belgeyle kuruldu?', '**Muharrem Kararnamesi** (1881)'],
      ['M. Kemal gayrinizami harp tecrübesini nerede kazandı?', '**Trablusgarp** (1911)'],
      ['Rusya’ya karşı savaştığımız cepheler?', '**Kafkas ve Galiçya**'],
      ['NATO üyeliği ve kolaylaştıran olay?', '**1952**; **Kore Savaşı**'],
      ['Varşova Paktı’na girmeyen Doğu Avrupa ülkesi?', '**Yugoslavya**'],
    ],
  },
];
