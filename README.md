# KPSS Çalış · Özgür

2026 KPSS Ön Lisans (4 Ekim 2026 Pazar, 10.15) için 9 günlük, mobil öncelikli çalışma uygulaması.

- **9 gün × 6 ders**: her gün Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık, Güncel & Kültür dersi (~10-15 dk)
- Görselli anlatım: Türkiye haritaları, zaman çizgileri, adım adım matematik, Venn, grafik, cümle ögeleri, sözel mantık tabloları
- 282 ÖSYM tarzı soru (açıklamalı, ipuçlu), 336 bilgi kartı, aralıklı tekrar (Leitner), hata defteri, mini deneme
- Yapay zekâ hoca (Cloudflare Workers AI): ders bağlamını ve ilerlemeni bilerek anlatır, yeni soru üretir
- İlerleme Cloudflare D1’de saklanır; telefon ve bilgisayar arasında otomatik eşitlenir
- Çevrimdışı çalışır (PWA), sesli okuma (Türkçe), açık/koyu tema

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
| API | `src/worker.js` | `/api/chat` (akışlı), `/api/questions`, `/api/progress`, `/api/health` |
| Yapay zekâ | Workers AI `AI` bağlaması | Hızlı: `@cf/deepseek-ai/deepseek-v4-flash-0731` · Derin: `@cf/deepseek-ai/deepseek-v4-pro-0813` |
| Veritabanı | D1 `kpss-ozgur` | İlerleme, AI kullanım sınırı, soru kayıtları |

Token koda girmez: yayında Workers AI, `AI` bağlamasıyla hesaptan faturalanır. Günlük kullanım sınırı Worker’da (IP başına 400, toplam 2000 çağrı).

## Yerel geliştirme

```bash
npm install
npx wrangler d1 execute kpss-ozgur --local --file=schema.sql
# .dev.vars: CF_API_TOKEN=... ve CF_ACCOUNT_ID=... (git’e girmez)
npx wrangler dev -c wrangler.dev.jsonc
npm run check   # içerik denetimi
```
