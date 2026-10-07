# İş Ajanı: devir notu (7 Ekim 2026)

Bu not, İş Ajanı'nı yeni bir Claude hesabında, yeni bir oturumda kaldığı yerden sürdürmek için yazıldı.
Kod `ozguradmin/kpsscalis` reposunun **`is-ajani`** dalında. Bu dosya o dalın kökünde.

## 1. Amaç

Özgür Güler (Türkiye, UTC+3, full-stack / mobil geliştirici) adına uzaktan iş bulup başvuran otonom sistem.
Özgür sürekli kontrol etmek istemiyor. Sistem kendi başına çalışmalı, Özgür'e sadece gerçekten onun yapması gereken işler kalmalı:
mülakat, test, robot doğrulaması ya da kendi tarayıcısından 3 dakikalık gönderim.

- Türkiye'den başvurulabilen, az bilinen, küçük şirketlerin uzaktan ilanlarını bulur ve eler.
- İlana özel, dürüst, insan gibi yazılmış ön yazıyla başvurur: formu doldurur, CV yükler, gerekirse hesap açar.
- Gelen mailleri (destek@ozgurguler.tech) her 10 dakikada bir okur ve başvurulara bağlar. Kayıt/profil isteyen mailleri kendisi takip eder.
- Önemli olayları ve her sabah bir özeti ozgurglr256@gmail.com adresine gönderir.
- Sonuçlara göre kendini ayarlar: kaynak ağırlıkları, eşikler, öğrenilmiş kurallar.

## 2. Mimari

Her şey Cloudflare üzerinde. Cloudflare hesabı `3c39c225b3a27de7822833feb24b65b1` (ozgurglr256@gmail.com).

| Parça | Ad / kimlik |
|---|---|
| Worker | `ozgur-is-ajani` (panel: https://ozgur-is-ajani.ozgurglr256.workers.dev) |
| D1 (ana veri) | `ozgur-is-ajani`, id `3827bdf9-60ff-42ec-996f-9c4f9447d6c9`, bağlama `DB` |
| D1 (posta kutusu) | `ozgurguler-mail`, id `caab2371-6dfc-452a-8daf-f508e089eefd`, bağlama `MAILDB`. `messages` tablosunu ayrı `ozgurguler-mail` worker'ı doldurur (gelen mailler). İş ajanı bu tabloyu okur ve gönderdiği mailleri de buraya yazar. O worker bu repoda değil. |
| R2 | `ozgur-is-ajani`, bağlama `R2`. CV, kanıt ekranları, adım adım kayıtlar (`rec/` 3 gün sonra silinir), önbellekler. |
| Workflows | `ozgur-is-ajani-apply` (`APPLY`, `ApplyWorkflow`: tek başvuru), `ozgur-is-ajani-task` (`TASKS`, `TaskWorkflow`: keşif, eleme, öğrenme gibi uzun işler) |
| Browser Run | bağlama `BROWSER` (`@cloudflare/puppeteer`). Canlı devralma için CDP `Cloudflare.getLiveView` / `Cloudflare.handoff`. |
| Workers AI | bağlama `AI`. Modeller D1 `settings.models` içinde: eleme `@cf/google/gemma-4-26b-a4b-it`, ön yazı/cevap/analiz `@cf/deepseek-ai/deepseek-v4-flash-0731`. |
| E-posta gönderimi | `send_email` bağlaması `EMAIL`. Gönderen destek@ozgurguler.tech. |
| Cron | `*/10 * * * *` → `tick()` |
| KV | Yok. Kalıcı durum D1 `settings` tablosunda. |

**Eski sistem:** `ozgur-job-agent` worker'ı duruyor; cron'ları 30 Eylül'de kaldırıldı (`.github/workflows/old-agent.yml`). Verisi yeni sisteme aktarıldı.

### Kod haritası (`src/`)
- `index.js`: HTTP router (panel API'si), `/h/<imzalı-token>` sayfaları (canlı devral, kendi tarayıcından gönder), `tick()` (cron), `runTask`, temizlik, `restartApp`.
- `sources/index.js`: ilan kaynakları (Workable, Workable TR, Torre, Get on Board, Remotar, Djinni RSS, Habr, Arbeitnow, Landing.jobs, HN, Himalayas, YC Work at a Startup, Remote In Tech şirket listesi `remote_cos`, ATS panoları: Greenhouse, Lever, Ashby, Recruitee…).
- `discover.js`, `triage.js`: keşif ve eleme (kod kuralları → TypeSafe Jev → LLM ön eleme → derin analiz).
- `apply/index.js`: `dispatch` (kuyruktan başvuru başlatma, sınırlar), `submit` (tek başvuru), `finalize`, `submitByEmail`.
- `apply/agent.js`: tarayıcı ajanı (`runAgent`, `askHuman`, Turnstile tespiti, başarı/kapalı/uygun değil regex'leri).
- `apply/browser.js`: tarayıcı açma, anlık görüntü (SNAPSHOT_JS), tıklama/doldurma, çerez bannerları.
- `apply/materials.js`: ön yazı, form cevapları, doğruluk denetimi, uydurma teknoloji kontrolü.
- `apply/ownpack.js`: "kendi tarayıcından gönder" paketi (Workable form API'sinden sorular ve standart cevaplar).
- `mail.js`: posta işleme, sınıflandırma, takip görevleri, uyarılar, günlük özet, `sendMail` (insanlaştırma ve site linki düzeltme).
- `brain.js`: panel sohbet ajanı, sabah öz değerlendirme, `learnSourceWeights`.
- `profile.js`: CORE profil, HONESTY_RULES, STYLE_RULES. `cv-text.js`: CV metni.
- `lib/`: `db.js` (migrate, settings, secrets), `auth.js` (parola, oturum, imzalı link, kasa şifrelemesi), `llm.js`, `util.js` (`humanize`, `fixSiteLink`, `looksEnglish`).
- `public/`: panel arayüzü (tek sayfa, telefona uygun).
- `test/`: yerel ortam taklitleri. `scripts/`: yardımcı betikler (bkz. `scripts/README.md`).

### Her 10 dakikalık tur (`tick`)
1. Mail işleme (`mailTick`): yeni gelenleri sınıflandırır, başvuruya bağlar, takip görevi ya da uyarı üretir.
2. Keşif ve eleme kaynak sırasıyla (`src:<kaynak>` ayarlarında son çalışma bilgisi).
3. `dispatch`: onaylı ilanlardan başvuru başlatır (Workflow).
4. Günlük işler: özet maili (TR 08:00, `last_digest_day`), öz değerlendirme (`last_review_day`), kaynak ağırlığı öğrenme (TR saat ≥ 4, `last_learn_day`), haftalık model yarışması (`last_eval_week`), temizlik.

## 3. Yayın

- `is-ajani` dalına her push → GitHub Actions (`.github/workflows/is-ajani.yml`) → `wrangler deploy` → `/api/health` duman testi.
- **Yayın, o anda süren başvuru workflow'larını keser.** Push'tan önce panelde çalışan başvuru olmadığını kontrol et (`GET /api/overview` → `running` boş olmalı).
- Canlı log: `git push origin HEAD:is-ajani-log --force` (12 dakika `wrangler tail`, özet Actions çıktısında).
- Push'tan önce yerelde: `node --check` + modülleri içe aktar + `node --import ./test/register.mjs scripts/smoke-dispatch.mjs`.
  `node --check` çalışma anı hatalarını yakalamaz. Bir keresinde SQL içindeki tırnak hatası başvuruları 20 dakika durdurdu.
- SNAPSHOT_JS bir template literal içinde. İçindeki regex'lerde ters bölüler **iki kez** kaçırılmalı.

**7 Ekim kontrolü:** Yayındaki `ozgur-is-ajani` worker'ı son commit `fec844d` ile aynı. Worker 06:32:54 UTC'de güncellenmiş; bu, `fec844d` yayın işinin (başarılı, 06:33:06'da bitti) yayın adımı. Ondan sonra başka yayın yok.

## 4. Panel ve API

- Panel: https://ozgur-is-ajani.ozgurglr256.workers.dev (parola korumalı).
- Giriş: `POST /api/login` gövde `{"password":"…"}` → `ajan_oturum` çerezi.
  Komut satırından curl ile kullanırken `-A curl-agent` ver. Tarayıcı user-agent'ı "Özgür panelde" sayılır ve canlı devralmayı boşuna bekletir.
- Uçlar (hepsi `/api` önekli; `health` ve `login` dışındakiler giriş ister):

| Uç | Ne yapar |
|---|---|
| `GET /health` | `{ok, last_tick, paused}` (girişsiz) |
| `POST /login`, `POST /logout` | Oturum |
| `GET /overview` | Özet, son olaylar, açık işler, kullanım, maliyet, çalışan başvurular |
| `GET /jobs?status=&q=&source=&page=` | İlanlar. `status=eligible` → approved/review/queued |
| `GET /jobs/:id` | İlan detayı ve başvuruları |
| `POST /jobs/:id/decision`, `POST /jobs/:id/reanalyze` | Onay/ret, yeniden analiz |
| `GET /applications?status=`, `GET /applications/:id` | Başvurular ve detay (ön yazı, cevaplar, kanıt, mailler, olaylar) |
| `POST /applications/:id/retry` | Yeniden dene. `{handoff:true}` verilirse canlı devral modunda başlar. |
| `POST /applications/:id/status` | Durumu elle değiştir (submitted, confirmed, interview, next_step, offer, rejected, cancelled) |
| `GET /recordings`, `GET /recordings/:id`, `GET /file/<r2-anahtar>` | Ekran kayıtları ve kanıtlar (`rec/`, `evidence/`, `assets/`) |
| `GET /mail`, `GET /mail/:id`, `POST /mail/:id/reply` | Gelen mailler, cevap |
| `GET /actions`, `POST /actions/:id/done` | "Sana kalanlar" |
| `GET /events` | Olay günlüğü |
| `GET/POST /chat` | Beyin ile sohbet (araç kullanan ajan, salt okunur SQL) |
| `GET/POST /accounts`, `GET /accounts/:site/password` | Ajanın açtığı site hesapları (şifreler kasada şifreli) |
| `POST /sessions/import`, `POST /sessions/login`, `POST /sessions/:domain/delete` | Kayıtlı tarayıcı oturumları (çerezler) |
| `GET /cv/:lang` | CV (en/tr) |
| `GET/POST /settings`, `GET /memory`, `POST /memory/:id/toggle`, `GET/POST /facts` | Ayarlar, öğrenilmiş kurallar, profil bilgileri |
| `GET /models`, `GET /costs`, `GET /sources` | Model yarışması, maliyet, kaynak istatistikleri |
| `POST /run/:task` | Elle görev başlat (ör. keşif, eleme, `learn`) |

- İmzalı sayfalar `/h/<token>` (`signLink`, `session_key` ile HMAC):
  - `op` yok: canlı devral sayfası.
  - `op:'own'`: kendi tarayıcından gönder sayfası, 10 gün geçerli. İlan linki, CV linki, Kopyala butonlu ön yazı ve cevaplar, "Gönderdim ✓" butonu var.

## 5. Gizli değerler ve ortam değişkenleri (yalnızca adlar)

Hiçbir gizli değer repoda yok. Değerler aşağıdaki yerlerde duruyor.

**GitHub Actions secret (repo `ozguradmin/kpsscalis`)**
- `CLOUDFLARE_API_TOKEN`: `wrangler deploy`, R2 yaşam döngüsü kuralı, `wrangler tail`, eski ajanın cron'unu kapatma.

**D1 `secrets` tablosu (ana D1).** Worker ilk kullanımda kendisi üretir; `typesafe_key` hariç.
- `password_hash`: panel giriş parolasının PBKDF2 özeti. Düz parola hiçbir yerde saklanmıyor.
- `session_key`: oturum çerezi ve `/h/` imzalı linklerin HMAC anahtarı. Değiştirilirse tüm oturumlar ve gönderilmiş linkler geçersiz olur.
- `vault_key`: `accounts.secret` alanındaki site şifrelerini (YC, Djinni) şifreleyen AES anahtarı. **Silinirse kayıtlı site şifreleri okunamaz.**
- `typesafe_key`: TypeSafe Jev API anahtarı (hızlı yargı modeli; ilan eleme, mail sınıflandırma).
- `session_epoch` (aynı tabloda, şu an yok = 0): artırılırsa tüm panel oturumları düşer.

**Worker ortam değişkenleri (isteğe bağlı, şu an tanımlı değil)**
- `TYPESAFE_KEY`: verilirse D1 `typesafe_key` yerine kullanılır.
- `DRY_RUN`: verilirse formlar doldurulur ama gönderilmez, e-posta başvurusu atılmaz.

**Yerel deneme (`test/`, `eval/`)**
- `CF_TOKEN`: Workers AI REST çağrıları için Cloudflare API token'ı (Workers AI yetkili).
- `TYPESAFE_KEY`: yerel Jev çağrıları.
- `MODELS`, `OUT`: `eval/run.mjs` model listesi ve çıktı dosyası.
- `CJ`, `SP`: `scripts/panel-proxy.mjs` ve `panel-shot.mjs` için çerez dosyası yolu ve ekran görüntüsü klasörü.

**Panel giriş parolası nerede?** Yalnızca özeti D1 `secrets.password_hash` içinde. Düz hali repoda ve D1'de yok; Özgür biliyor.
Panelde parola değiştirme ekranı yok. Değiştirmek için `lib/auth.js` → `hashPassword(yeniParola)` çıktısını D1 `secrets` tablosunda `password_hash` anahtarına yaz.

**Site hesapları:** `accounts` tablosunda.
- `account.ycombinator.com`: kullanıcı `ozgurguler_dev`, aktif.
- `djinni.co`: destek@ozgurguler.tech, aktif, aday profili yayında.
- `himalayas.app`: eski, etkin değil.
- `app.scholars.net`, `jobs.micro1.ai`: e-posta ile giriş.

Şifreler `vault_key` ile şifreli. Panelde Hesaplar → "şifreyi göster" (`GET /api/accounts/:site/password`).
Kayıtlı tarayıcı çerezleri `sessions` tablosunda. `logins` tablosu canlı giriş görevleri için.

## 6. Kurallar (Özgür'ün istekleri; bozulmamalı)

- **Dürüstlük** (`profile.js` HONESTY_RULES):
  - Sadece CV ve onaylı `facts` kullanılır. Uydurma deneyim, URL, yetki, dil yok.
  - Mobil uygulamalar React + TypeScript + Capacitor. **React Native, Flutter ya da native değil.**
  - Ürün sayısı: App Store/Google Play'de **4 uygulama** (Dönerci, Coğrafist, Print Fast, WTF Yapay Zekâ). Galaktik Uzay ayrı bir web platformu. Toplam **5 ürün**.
  - Çalışma saati, saat dilimi örtüşmesi, başlama tarihi, maaş ya da müsaitlik vaadi profilde yoksa yazılmaz.
  - Seviye Junior ya da Mid. "Nereden duydunuz" sorusuna gerçek kaynak yazılır.
  - Uygunluk sorusunun dürüst cevabı "hayır" ise başvuru gönderilmez (`not_eligible`).
- **Yazım** (`STYLE_RULES`, `humanize`):
  - İnsan gibi, sade yazı. **Uzun tire "—" ve "–" yasak**; noktalı virgül yok.
  - AI kalıpları yok: excited to, passionate about, leverage, delve, seamless…
  - Madde işareti ve kalın yazı yok. Genel değil, somut cümleler.
- **Site linki:** İngilizce metinlerde her zaman `ozgurguler.tech/en` (`fixSiteLink`). Çıplak `ozgurguler.tech` Türkçe sayfaya gider.
- **Aynı şirkete ısrar yok:**
  - Şirket başına 30 günde en fazla 2 başvuru.
  - Reddeden şirkete 180 gün başvuru yok.
  - Açık başvuru maili şirket başına bir kez, ve o şirkete başka açık başvuru yoksa.
- **Tempo ve sınırlar:**
  - Günde en fazla 15 başvuru (`daily_apply_limit`).
  - Açık başvuru mailleri 240 dakikada en fazla 8 (kampanya kuralı).
  - YC haftada 5 başvuru.
  - "Kendi tarayıcından gönder" paketi günde en fazla 4 (`OWN_PER_DAY`).
  - Uyarı maili günde en fazla 15.
- **Mail güvenliği:**
  - Gmail Birincil sekmesini kandırma girişimi yok. Her mail kişiye özel. Gönderen "Özgür Güler" <destek@ozgurguler.tech>.
  - Abonelikten çıkma, geri dönen ve şikâyet edilen adresler saygıyla atlanır.
  - Kullanıcının istemediği mailler silinmez ya da değiştirilmez.
  - `status=accepted` sadece Cloudflare'in maili kabul ettiği anlamına gelir. `delivered` görülmeden "ulaştı" denmez.
- **Doğrulama kodu yönlendirme:** Son ~25 dakikada ajan çalışmadıysa kod Özgür'e iletilir; çalıştıysa ajan kodu kendisi kullanır.
- **İnsan yardımı:** Ajan önce formu kendisi doldurur. Sadece captcha ya da takılma anında Özgür'ü çağırır (`askHuman`).
  Cloudflare Turnstile Browser Run'da geçilemiyor (insan tıklasa bile). Bu sitelerde "kendi tarayıcından gönder" paketi kullanılır.
- **İletişim:** Özgür ile Türkçe konuşulur.

## 7. Durum (7 Ekim 2026, 07:10 UTC)

**Başvurular (toplam):**
- 33 submitted, 11 confirmed, 1 next_step
- 6 rejected, 14 needs_human, 8 blocked
- 53 failed, 5 not_eligible, 20 cancelled (eski sistemden), 1 closed

**Son 7 gün:**
- 31 submitted, 7 confirmed, 5 rejected
- 11 needs_human, 7 blocked, 51 failed

51 başarısızın dağılımı:
- 36 "Sayfa ilerlemiyor": çoğu 30 Eylül–5 Ekim arası, askHuman ve Turnstile düzeltmelerinden önce. Son 2 günde sadece 2.
- 7 yanlış WaaS onayı, düzeltilip `failed` yapıldı.
- 3 YC haftalık sınır.
- 5 tarayıcı zaman aşımı.

**İlanlar:**
- 17.791 reddedildi (çoğu bölge kısıtlı).
- 167 incelemede, 19 onaylı (5'i YC, haftalık sınır açılınca gidecek; 16'sı 70+ puanlı Himalayas ilanı, günde 4'er "kendi tarayıcından gönder" paketi olarak gidecek).
- 49 başvuruldu.

**Sonuçlar:**
- HyperDev (Workable): Özgür kendi tarayıcısından gönderdi, onay geldi.
- FreeAgent: kayıt tamamlandı ("Senior" seçilmişti, siteden değiştirilemiyor).
- Nozbe, Prezly, Mixmax açık başvurulara "şu an alım yok" dedi.
- Başvuruldu: Valtech, Udacity, Sezzle (2), Bloom, Star, Gooseworks, kapa.ai, MixRank (2), Smartcuts ve başkaları.
- Henüz mülakat yok.

**Ayarlar:**
- `min_fit_apply` 75, `min_fit_review` 55, `max_agent_steps` 20, `handoff_wait_minutes` 30.
- `blocked_domains`: remoteok.com, workingnomads.com, remotive.com, getonbrd.com, jobs.workable.com. Son ikisini beyin ekledi. jobs.workable.com zaten kendi tarayıcı paketine gidiyor.
- `source_weights` (öğrenilen): ats:greenhouse/ashby 1.8, workable_tr 1.4, remote_cos 1.33, ats:workable 1.2, yc 0.72, hn 0.6, himalayas 0.59, diğerleri 1.
  Öğrenme 3 Ekim'den beri (`learn_since`), en az 5 deneme eşiğiyle, 0.3–1.8 aralığında. LLM'in kaynak ağırlığı yazması kapatıldı (her şeyi sıfırlıyordu).

## 8. Bilinen sorunlar

- **Bot tespiti:** Browser Run bot olarak görünüyor.
  - Workable (Gönder butonu Turnstile arkasında) ve Himalayas doğrudan "kendi tarayıcından gönder" paketine gidiyor.
  - Ashby bazen "spam olabilir" diyor; bu durumda da paket.
  - getonbrd formları sık takılıyor.
- **Az uygun ilan:** Uzaktan ilanların çoğu ABD/AB ile sınırlı. Bunu dengelemek için açık başvuru mailleri (Remote In Tech listesi) var.
- **Djinni:** Gereksinim tutmazsa Apply butonunu gizliyor (`NOT_ELIGIBLE_RE` yakalıyor). İki RSS akışı kullanılıyor (dünya geneli + Türkiye).
- **YC Work at a Startup:** Haftada 5 başvuru sınırı.
- **`node --check` yetersiz:** Push öncesi duman testi şart.
- **Yayın uzun workflow'ları keser:** Boşta iken yayınla.
- **Yerel LLM testi yok:** Bu ortamdaki yerel Workers AI token'ı 401 veriyordu. Yeni ortamda `CF_TOKEN` ver.
- **FreeAgent'ta seviye "Senior"** kaldı (site değiştirmeye izin vermiyor).

## 9. Yarım kalan / sıradaki işler

1. **Himalayas paketlerinin doğrulanması.** 7 Ekim'de 16 Himalayas ilanı onaylandı. İlk "3 dakikalık iş: … kendi tarayıcından gönder" maillerinin doğru üretildiği (form soruları ve standart cevaplar dolu, şifre sızmıyor) henüz canlıda görülmedi.
   Kontrol: `actions` tablosunda `kind='needs_human'` ve başlığı "kendi tarayıcından" olanlar; `events` içinde `own_` uyarıları.
2. **Günlük sabah kontrolü** (eski hesapta routine olarak vardı; yeni hesapta yeniden kurulmalı, TR 09:30 = 06:30 UTC). Kontrol listesi:
   - Son 24 saatin başvuruları; sahte "submitted" var mı.
   - Takılı çalışmalar.
   - `blocked_domains` ve `source_weights` mantıklı mı.
   - Giden mail kalitesi: tire, AI kalıpları, uydurma bilgi.
   - Şirket cevapları ve günlük özet.
   - Sorun varsa düzelt, Özgür'e kısa Türkçe özet ver.
3. **İnceleme kuyruğu:** `review` durumundaki 167 ilan ara sıra gözden geçirilebilir. İyi olanlar onaylanır; gerekirse `min_fit_apply` düşürülür.
4. Ashby "spam" işaretlerinin sıklığı izlenmeli. Artarsa Ashby formları doğrudan pakete yönlendirilebilir.

## 10. Yeni hesapta ilk adımlar

1. Yeni Claude hesabında GitHub bağlantısını `ozguradmin/kpsscalis` reposuna erişecek şekilde kur. Oturumda `is-ajani` dalını çek.
2. Cloudflare bağlayıcısını aynı Cloudflare hesabına bağla (D1 sorguları ve worker kontrolü için).
   Worker, D1, R2 ve GitHub secret yerinde kalıyor; sistem Claude oturumu olmadan da kendi başına çalışmaya devam ediyor.
3. Bu dosyayı ve `README.md`'yi okut; `scripts/smoke-dispatch.mjs` ile yerel testin çalıştığını gör.
4. Panel parolasıyla `/api/login` → `/api/overview` ile canlı durumu kontrol et.
5. Sabah kontrolü routine'ini yeniden kur.
