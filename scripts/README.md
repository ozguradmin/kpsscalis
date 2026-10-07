# Yardımcı betikler

Hepsi repo kökünden çalıştırılır: `node --import ./test/register.mjs scripts/<betik>`.
Yerel ortam `test/env.mjs` içindeki taklitleri kullanır (bellek içi D1/R2, sahte e-posta). Workers AI için `CF_TOKEN` gerekir; yoksa LLM çağrıları 401 verir.

| Betik | Ne yapar |
|---|---|
| `smoke-dispatch.mjs` | Duman testi: `dispatch` + `mailTick` bir kez çalışır. Her push'tan önce çalıştır (`node --check` çalışma anı hatalarını yakalamaz). |
| `letter-guard-test.mjs` | Ön yazı uydurma denetimi (ücret, haftalık saat, saat örtüşmesi, olay hikâyesi): LLM taklit edilir, `CF_TOKEN` gerekmez. Ön yazı koduna dokununca çalıştır. |
| `own-page-test.mjs` | "Kendi tarayıcından gönder" sayfası: imzalı link, Kopyala butonları, şifre sızmıyor mu, POST ile `submitted` oluyor mu. |
| `ownpack-test.mjs` | Workable form API'sinden soruları okuyup cevap paketi üretir (HyperDev ilanıyla). |
| `digest-preview.mjs` | Günlük özet mailini göndermeden ekrana basar. |
| `learn-weights.mjs` | `learnSourceWeights` (kaynak ağırlığı öğrenme) çıktısını gösterir. |
| `ric-test.mjs` | Remote In Tech şirket listesi kaynağını (`remote_cos`) 3 tur çalıştırır. |
| `src-test.mjs`, `him-test.mjs`, `yc-test.mjs` | Tek tek kaynakların (Workable, Torre, Himalayas, YC) ilan çekmesini dener. |
| `turnstile-probe.mjs` | Bir Workable ilanında Cloudflare Turnstile tespitini dener (Browser Run gerekir). |
| `snapshot-probe.mjs` | Bir form sayfasının ajan anlık görüntüsünü ve captcha bayrağını gösterir. |
| `panel-proxy.mjs` + `panel-shot.mjs` | Paneli yerelde `public/` dosyalarıyla açar, API'yi canlıya yönlendirir; Playwright ile telefon boyutunda ekran görüntüsü alır. `CJ` ortam değişkeni panel giriş çerezinin (curl cookie jar) yolu olmalı; çerez dosyası repoya konmaz. |
