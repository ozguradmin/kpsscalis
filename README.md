# KPSS Çalış · Özgür

2026 KPSS Ön Lisans (4 Ekim 2026 Pazar, 10.15) için 9 günlük, mobil öncelikli çalışma uygulaması.

- **9 gün × 6 ders** + ekstra dersler; her ders ~10-15 dk, telefona sığan kaymayan ekranlar
- Görselli anlatım: Türkiye haritaları, zaman çizgileri, adım adım matematik, Venn, grafik, cümle ögeleri, sözel mantık tabloları
- 288 ÖSYM tarzı soru, 344 bilgi kartı, aralıklı tekrar (Leitner), hata defteri, sadece çalışılan konulardan mini deneme
- **Yapay zekâ hoca** (Workers AI, araç kullanan ajan): bulunduğun ekranı/soruyu görür; ders notlarında
  anlam araması, Vikipedi, sohbet içinde dokunarak çözülen test + sonuç analizi, görsel çizme, tekrar kartı ekleme
- **Doğrulamalı soru bankası**: üretilen her soru iki bağımsız denetimden (şık şık, cevap anahtarı görülmeden) geçerse kaydedilir
- **Tahmini net/puan**: 2014-2020 kitapçık analizindeki konu ağırlıkları × senin cevap geçmişin
- İlerleme ve cevap günlüğü Cloudflare D1’de; çevrimdışı çalışır (PWA), sesli okuma, açık/koyu tema

Araştırma raporu: [`docs/ARASTIRMA.md`](docs/ARASTIRMA.md)

## Kurulum (Windows, `C:\dev`)

```bat
cd C:\dev
git clone -b claude/cloudflare-account-connection-hq2usr https://github.com/ozguradmin/kpsscalis.git
cd kpsscalis
kur.bat
```

`kur.bat` sırasıyla: paketleri kurar, Cloudflare’e giriş yaptırır (`wrangler login`), siteyi yayınlar (`wrangler deploy`).
Sonunda `https://kpss-ozgur.<hesabın>.workers.dev` adresi yazar.

Alternatif (terminalsiz): Cloudflare panelinde **Workers & Pages → Create → Import a repository** ile bu repoyu seç; her `git push`’ta otomatik yayınlanır.

## Mimari

| Parça | Nerede | Açıklama |
|---|---|---|
| Site | `public/` | Derleme gerektirmeyen HTML/CSS/JS (ES modülleri) |
| İçerik | `public/js/content/*.js` | Ders kartları, sorular, bilgi kartları |
| API | `src/worker.js` | `/api/chat` (araçlı ajan, SSE), `/api/questions`, `/api/bank`, `/api/bank/fill`, `/api/search`, `/api/progress` |
| Hoca talimatları | `src/prompts.js` | Hoca, soru yazarı (gerçek ÖSYM üslup örnekleriyle) ve denetçi |
| Bilgi tabanı | `src/kb.js`, `public/kb/` | 657 parça; anahtar kelime + bge-m3 anlam vektörleri (`node scripts/build-vectors.mjs`) |
| Yapay zekâ | Workers AI `AI` bağlaması | Hızlı: `@cf/deepseek-ai/deepseek-v4-flash-0731` · Derin: `@cf/deepseek-ai/deepseek-v4-pro-0813` · Vektör: `@cf/baai/bge-m3` |
| Veritabanı | D1 `kpss-ozgur` | İlerleme, doğrulanmış soru bankası (`qbank`), kullanım sınırı, hoca kayıtları |

Token koda girmez: yayında Workers AI, `AI` bağlamasıyla hesaptan faturalanır. Günlük kullanım sınırı Worker’da (IP başına 600, toplam 3000 çağrı). Dakikalık model sınırına takılınca bekleyip dener, sonra yedek modele geçer.

## Yerel geliştirme

```bash
npm install
npx wrangler d1 execute kpss-ozgur --local --file=schema.sql
# .dev.vars: CF_API_TOKEN=... ve CF_ACCOUNT_ID=... (git’e girmez)
npx wrangler dev -c wrangler.dev.jsonc
npm run check   # içerik denetimi
node scripts/build-vectors.mjs   # içerik değişince anlam vektörlerini yenile
```
