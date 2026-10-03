# Özgür İş Ajanı v2

Özgür Güler adına uzaktan iş ilanlarını bulan, eleyen, ilana özel ön yazıyla başvuran, e-postaları takip eden ve kendini geliştiren otonom sistem. Sıfırdan kuruldu; tamamı Cloudflare üzerinde çalışır (Workers, D1, R2, Workflows, Browser Run, Workers AI, Email Service). Hızlı yargılar için TypeSafe Jev.

**Panel:** https://ozgur-is-ajani.ozgurglr256.workers.dev (parola korumalı, telefona uygun)

## Her 10 dakikada bir
1. **E-posta** — destek@ozgurguler.tech kutusu (ozgurguler-mail D1) okunur; başvuru bağlamıyla sınıflandırılır (onay, olumsuz, mülakat, test, işveren mesajı, doğrulama, anket…), başvurulara bağlanır. Kayıt/profil/CV isteyen e-postalar ajana **takip görevi** olur; mülakat/test gibi sadece Özgür'ün yapabilecekleri "Sana kalanlar"a düşer.
2. **Keşif** — Workable'ın küresel araması (Türkiye'den uzaktan işe alan küçük şirketler + çok dilli arama), Torre (her yerden uzaktan), Get on Board, Remotar, Djinni, Habr, Arbeitnow, Landing.jobs, HN, Tecnoempleo, Himalayas… ve ilanlardan öğrenilen küçük şirketlerin kariyer sayfaları. Ünlü şirketlerin panoları taranmaz; analizde şirket büyüklüğü ve işe alınma şansı puanlanır, küçük/bilinmeyen şirketler öne alınır.
3. **Eleme** — kod kuralları → TypeSafe Jev (Türkiye'den olur mu, başka dil şartı, dolandırıcılık, uyum) → Gemma 4 ön eleme → derin analiz ve karar.
4. **Başvuru** — Cloudflare Workflow içinde Browser Run ajanı: formu doldurur, CV yükler, gerekirse hesap açar, e-postadan doğrulama kodunu alır. Günlük sınır, şirket başına 30 günde en fazla 2 başvuru, tarayıcı dakika kotası.
5. **Bildirim** — mülakat, teklif, işveren mesajı, sonraki adım, robot doğrulaması ve elle tamamlanacak başvurular anında ozgurglr256@gmail.com'a e-postalanır (günde en fazla 15); sabah özeti de oraya gider.
6. **Kanıt** — ön yazı, form cevapları, son ekranın tam görüntüsü kalıcı; adım adım ekran kaydı 3 gün (R2 yaşam döngüsü + Worker temizliği).

## Beyin
- Panelden sohbet: araç kullanan ajan (istatistik, ilan/başvuru/e-posta sorgulama, ayar değiştirme, hemen başvur, salt okunur SQL).
- Her sabah öz değerlendirme: sonuçlara göre eşikleri, kaynak/rol ağırlıklarını ve öğrenilmiş kuralları günceller. Bariyerler: ayar aralıkları sınırlı; yeni kurallar Jev ile "normal başvuruları engeller mi / dürüstlüğü bozar mı" denetiminden geçer.
- Haftalık model yarışması: Workers AI modelleri aynı görevlerde ölçülür, görev başına en iyi model seçilir.
- Öğrenen dağıtım: robot doğrulamasına sürekli takılan siteler otomatik başvuruda geri plana alınır.

## Dürüstlük
Başvurularda yalnızca CV ve onaylı profil bilgileri kullanılır; uydurma deneyim, dil yeterliliği ya da yetki beyanı yapılmaz. Ön yazılar ayrı bir modelle doğruluk denetiminden geçer; uygunluk sorusuna dürüst cevap "hayır" ise başvuru gönderilmez.

## Yayın ve gizli değerler
`is-ajani` dalına her push GitHub Actions ile `wrangler deploy` yapar (yayın o anda süren başvuru adımını keser; takılan başvuru kayıttan kurtarılır, tekrar gönderilmez). Panel parolası özeti ve TypeSafe anahtarı koda değil D1 `secrets` tablosuna yazılır. Canlı log: `git push origin HEAD:is-ajani-log --force` (12 dk `wrangler tail`).

## Yerel deneme
```bash
npm install
CF_TOKEN=... TYPESAFE_KEY=... node --import ./test/register.mjs test/pipeline.mjs getonbrd,djinni 2      # keşif + eleme
CF_TOKEN=... node --import ./test/register.mjs test/apply-dry.mjs <başvuru-url> "<başlık>" "<şirket>"      # formu doldur, GÖNDERME
CF_TOKEN=... node eval/run.mjs                                                                             # model karşılaştırması
```


## Şirket listesi ve şirket başına kurallar
- **Remote In Tech** (remoteintech.company): ~600 uzaktan çalışan teknoloji şirketi. Her 90 dakikada 15 şirketin profili ve kendi sitesi taranır; işe alım sistemi (Greenhouse/Lever/Ashby/Workable…) bulunursa panoya eklenir, yoksa ve şirket dünya genelinden işe alıyorsa tek seferlik açık başvuru e-postası hazırlanır.
- Reddeden şirkete 6 ay boyunca tekrar başvurulmaz. Açık başvuru şirket başına 6 ayda en fazla bir kez ve o şirkete başka başvuru yoksa gönderilir. Aynı şirkete 30 günde en fazla 2 başvuru.
- Günlük özet (08:00 TR, Gmail): son 24 saatin başvuruları, gelen e-postalar ve özetleri, son 7 günün toplamı, sana kalan işler.
