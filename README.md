# Özgür İş Ajanı v2

Özgür Güler adına uzaktan iş ilanlarını bulan, eleyen, ilana özel ön yazıyla başvuran ve e-postaları takip eden otonom sistem. Tamamı Cloudflare üzerinde çalışır (Workers, D1, R2, Workflows, Browser Run, Workers AI, Email Service); hızlı yargılar için TypeSafe Jev.

## Akış (her 10 dakikada bir)
1. **Keşif** — 19 kaynak (Get on Board, Remotar, Djinni, DOU, Habr, Arbeitnow, Landing.jobs, Alignerr, HN, Tecnoempleo…) ve ilanlardan öğrenilen şirket kariyer sayfaları (Greenhouse, Lever, Ashby, Recruitee, Workable, Personio, Teamtailor, Breezy, SmartRecruiters).
2. **Eleme** — kod kuralları → TypeSafe Jev (Türkiye'den olur mu, başka dil şartı, dolandırıcılık, uyum) → Gemma 4 ön eleme → DeepSeek V4 derin analiz ve karar.
3. **Başvuru** — Cloudflare Workflow içinde Browser Run: ajan sayfayı okur, formu doldurur, CV yükler, gerekirse hesap açar ve e-postadan doğrulama kodunu alır. Her adımın ekran görüntüsü R2'de 3 gün, son ekran ve cevaplar kalıcı kanıt olarak saklanır. CAPTCHA çıkarsa Live View ile canlı devralma.
4. **E-posta** — ozgurguler-mail kutusu okunur, sınıflandırılır (onay, olumsuz, mülakat, test…), başvurulara bağlanır; işveren sorularına taslak cevap.
5. **Beyin** — panelden sohbet (araç kullanan ajan), her sabah öz değerlendirme ile eşik/ağırlık/kural güncelleme, haftalık model yarışması.

## Dürüstlük
Başvurularda yalnızca CV ve onaylı profil bilgileri kullanılır; uydurma deneyim, dil yeterliliği ya da yetki beyanı yapılmaz. Ön yazılar ayrı bir modelle doğruluk denetiminden geçer.

## Yayın
`is-ajani` dalına her push GitHub Actions ile `wrangler deploy` yapar. Gizli değerler (panel parolası özeti, TypeSafe anahtarı) koda değil D1 `secrets` tablosuna yazılır.

## Yerel deneme
```bash
npm install
node --import ./test/register.mjs test/pipeline.mjs getonbrd,djinni 2      # keşif + eleme
DRY_RUN=1 node --import ./test/register.mjs test/apply-dry.mjs <başvuru-url>  # formu doldur, gönderme
CF_TOKEN=... node eval/run.mjs                                            # model karşılaştırması
```
