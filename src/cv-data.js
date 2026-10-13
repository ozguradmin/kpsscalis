// CV'nin yapılandırılmış hâli (ozgurguler.tech/pro/*.pdf, 13 Ekim 2026 düzeltilmiş sürüm). Tek doğruluk kaynağı:
// düz metin (cv-text.js) ve başvuruya özel PDF (apply/cv.js) buradan üretilir. Burada olmayan bir şey başvuruda iddia edilmez.
// Bağlantılı maddelerde iki nokta düz yazıyla gelir ("Dönerci: …"); bağlantısızlarda kalın etiketin içindedir.
const LINKS = {
  phone: 'tel:+905537284232',
  email: 'mailto:destek@ozgurguler.tech',
  site: 'https://ozgurguler.tech/professional',
  github: 'https://github.com/ozguradmin',
  linkedin: 'https://www.linkedin.com/in/%C3%B6zg%C3%BCr-g-133a33219/',
  donerci: 'https://apps.apple.com/tr/app/id6804304454',
  cografist: 'https://cografist.app/',
  printfast: 'https://play.google.com/store/apps/details?id=com.printfast.app',
  wtf: 'https://play.google.com/store/apps/details?id=com.wtfyapayzeka',
  galaktik: 'https://galaktikuzay.com/',
  onopo: 'https://onopostore.com/',
  ivricambi: 'https://ivricambi.com/',
  llmeval: 'https://github.com/ozguradmin/galaktikuzay/tree/master/llm-eval',
  whisper: 'https://whisper-web-scribe.vercel.app/',
};

export const CV_DATA = {
  en: {
    name: 'Özgür Güler',
    title: 'Mobile, Game & Web Developer',
    contact: [
      { t: 'Mardin, Türkiye' },
      { t: '+90 553 728 42 32', href: LINKS.phone },
      { t: 'destek@ozgurguler.tech', href: LINKS.email },
      { t: 'ozgurguler.tech', href: LINKS.site },
      { t: 'GitHub', href: LINKS.github },
      { t: 'LinkedIn', href: LINKS.linkedin },
    ],
    sections: [
      { id: 'summary', h: 'SUMMARY', type: 'text', text: 'I create mobile apps and games, and I also work on web projects. I have 4 apps live on the app stores; WTF Yapay Zekâ has passed 50,000 downloads. I take my projects from idea to launch on my own, including design, code, payments and store releases. Outside of software, I manage several social media accounts I grew from scratch (100K+ followers each, one peaked at 1M+).' },
      { id: 'experience', h: 'EXPERIENCE', type: 'groups', groups: [
        { id: 'indie', h: 'Independent Developer', items: [
          { id: 'donerci', label: 'Dönerci', href: LINKS.donerci, text: '3D restaurant tycoon game (Godot). Live in 5 languages on the App Store and Google Play, with ads and in-app purchases.' },
          { id: 'cografist', label: 'Coğrafist', href: LINKS.cografist, text: 'Geography learning app for exam prep. Available on web, iOS and Android; 30+ study modes, interactive maps and subscriptions.' },
          { id: 'printfast', label: 'Print Fast', href: LINKS.printfast, text: 'Prints receipts, labels and barcodes from a phone to Bluetooth or Wi-Fi thermal printers.' },
          { id: 'wtf', label: 'WTF Yapay Zekâ', href: LINKS.wtf, text: 'Turkish AI assistant app. 50,000+ downloads, 1,700+ reviews.' },
          { id: 'galaktik', label: 'Galaktik Uzay', href: LINKS.galaktik, text: "AI-powered space news site. Adds images from NASA's archive and publishes automatically in 6 languages at once." },
        ] },
        { id: 'freelance', h: 'Freelance Web Developer', items: [
          { id: 'onopo', label: 'ONOPO Store', href: LINKS.onopo, text: 'E-commerce site with iyzico payments and an admin panel for orders, products, coupons and shipping.' },
          { id: 'ivricambi', label: 'Ivricambi', href: LINKS.ivricambi, text: 'Product catalog site for a spare parts company.' },
        ] },
      ] },
      { id: 'projects', h: 'OTHER PROJECTS', type: 'list', items: [
        { id: 'speech', label: 'Turkish speech models', text: 'Developing Turkish speech-to-text (STT) and text-to-speech (TTS) models, to be released as open source.' },
        { id: 'automation', label: 'Automation system', text: 'Automatically produces video content for my own social media accounts.' },
        { id: 'llmeval', label: 'LLM Evaluation Toolkit', href: LINKS.llmeval, text: 'Open-source tool that compares AI models on quality, speed and cost.' },
        { id: 'whisper', label: 'Whisper Web Scribe', href: LINKS.whisper, text: 'Open-source tool that transcribes audio in the browser, no server needed.' },
      ] },
      { id: 'skills', h: 'SKILLS', type: 'rows', rows: [
        { id: 'mobile', label: 'Mobile & Games', text: 'Capacitor (iOS/Android), Godot 4, AdMob, in-app purchases, store releases' },
        { id: 'web', label: 'Web & Backend', text: 'React, Next.js, TypeScript, Node.js, Cloudflare Workers, Firebase, SQL' },
        { id: 'ai', label: 'AI', text: 'OpenAI / Azure OpenAI, Whisper, STT/TTS, content automation' },
      ] },
      { id: 'social', h: 'SOCIAL MEDIA', type: 'text', text: 'Grew several accounts from scratch and still manage them, including Tarihsel Wojak (Instagram 400K+, previously 1M+, YouTube 100K+), Kırmızı ya da Mavi (YouTube 250K+), WTF Çeviri and Galaktik Uzay (Instagram 200K+). Ran paid promotions for the films Siccin and Nazar.' },
      { id: 'education', h: 'EDUCATION', type: 'edu', label: 'Istanbul Yeni Yüzyıl University', text: 'Associate Degree, Oral and Dental Health · 2026' },
    ],
  },
  tr: {
    name: 'Özgür Güler',
    title: 'Mobil, Oyun ve Web Geliştirici',
    contact: [
      { t: 'Mardin' },
      { t: '0553 728 42 32', href: LINKS.phone },
      { t: 'destek@ozgurguler.tech', href: LINKS.email },
      { t: 'ozgurguler.tech', href: LINKS.site },
      { t: 'GitHub', href: LINKS.github },
      { t: 'LinkedIn', href: LINKS.linkedin },
    ],
    sections: [
      { id: 'summary', h: 'PROFİL', type: 'text', text: "Mobil uygulama ve oyun geliştiriyorum, web projeleri de yapıyorum. Mağazalarda yayında 4 uygulamam var; WTF Yapay Zekâ 50.000'den fazla indirildi. Projelerimi fikirden yayına kadar tek başıma götürüyorum: tasarım, kod, ödeme sistemleri ve mağaza yayını dahil. Ayrıca 100K+ takipçili birçok sosyal medya hesabını sıfırdan kurdum ve yönetiyorum; en büyüğü bir dönem 1 milyonu geçti." },
      { id: 'experience', h: 'DENEYİM', type: 'groups', groups: [
        { id: 'indie', h: 'Bağımsız Geliştirici', items: [
          { id: 'donerci', label: 'Dönerci', href: LINKS.donerci, text: "3D döner dükkânı işletme oyunu (Godot). 5 dilde App Store ve Google Play'de; reklam ve uygulama içi satın alma sistemi." },
          { id: 'cografist', label: 'Coğrafist', href: LINKS.cografist, text: "KPSS coğrafya öğrenme uygulaması. Web, iOS ve Android'de; 30+ çalışma modu, interaktif haritalar ve abonelik." },
          { id: 'printfast', label: 'Print Fast', href: LINKS.printfast, text: 'Telefondan Bluetooth veya Wi-Fi termal yazıcıya fiş, etiket ve barkod basan uygulama.' },
          { id: 'wtf', label: 'WTF Yapay Zekâ', href: LINKS.wtf, text: 'Türkçe yapay zekâ uygulaması. 50.000+ indirme, 1.700+ değerlendirme.' },
          { id: 'galaktik', label: 'Galaktik Uzay', href: LINKS.galaktik, text: 'Yapay zekâ tabanlı uzay haberleri sitesi. NASA arşivinden görsel ekliyor ve 6 dilde eşzamanlı olarak otomatik yayınlıyor.' },
        ] },
        { id: 'freelance', h: 'Freelance Web Geliştirici', items: [
          { id: 'onopo', label: 'ONOPO Store', href: LINKS.onopo, text: 'iyzico ödemeli e-ticaret sitesi ve sipariş, ürün, kupon ve kargo yönetim paneli.' },
          { id: 'ivricambi', label: 'Ivricambi', href: LINKS.ivricambi, text: 'Yedek parça firması için ürün kataloğu sitesi.' },
        ] },
      ] },
      { id: 'projects', h: 'DİĞER PROJELER', type: 'list', items: [
        { id: 'speech', label: 'Türkçe ses modelleri', text: 'Türkçe konuşmayı yazıya çeviren (STT) ve seslendiren (TTS) modeller geliştiriyorum; açık kaynak olarak yayınlanacak.' },
        { id: 'automation', label: 'Otomasyon sistemi', text: 'Kendi sosyal medya hesaplarım için video içeriklerini otomatik üreten sistem.' },
        { id: 'llmeval', label: 'LLM Evaluation Toolkit', href: LINKS.llmeval, text: 'Yapay zekâ modellerini kalite, hız ve maliyete göre kıyaslar. Açık kaynak.' },
        { id: 'whisper', label: 'Whisper Web Scribe', href: LINKS.whisper, text: 'Sesi sunucuya göndermeden tarayıcıda yazıya döker. Açık kaynak.' },
      ] },
      { id: 'skills', h: 'YETKİNLİKLER', type: 'rows', rows: [
        { id: 'mobile', label: 'Mobil & Oyun', text: 'Capacitor (iOS/Android), Godot 4, AdMob, uygulama içi satın alma, mağaza yayını' },
        { id: 'web', label: 'Web & Backend', text: 'React, Next.js, TypeScript, Node.js, Cloudflare Workers, Firebase, SQL' },
        { id: 'ai', label: 'Yapay Zekâ', text: 'OpenAI / Azure OpenAI, Whisper, STT/TTS, içerik otomasyonu' },
      ] },
      { id: 'social', h: 'SOSYAL MEDYA', type: 'text', text: 'Tarihsel Wojak (Instagram 400K+, geçmişte 1M+, YouTube 100K+), Kırmızı ya da Mavi (YouTube 250K+), WTF Çeviri ve Galaktik Uzay (Instagram 200K+) dahil birçok hesabı sıfırdan kurdum ve yönetiyorum. Siccin ve Nazar filmlerinin ücretli tanıtımlarını yaptım.' },
      { id: 'education', h: 'EĞİTİM', type: 'edu', label: 'İstanbul Yeni Yüzyıl Üniversitesi', text: 'Ağız ve Diş Sağlığı (Ön Lisans) · 2026' },
    ],
  },
};

// CV'nin düz metni (modellere verilen hâli)
export function cvToText(cv) {
  const out = [cv.name, cv.title, cv.contact.map((c) => c.t).join(' · ')];
  for (const s of cv.sections) {
    out.push(s.h);
    if (s.type === 'text') out.push(s.text);
    else if (s.type === 'groups') for (const g of s.groups) { out.push(g.h); for (const it of g.items) out.push(`• ${it.label}: ${it.text}`); }
    else if (s.type === 'list') for (const it of s.items) out.push(`• ${it.label}: ${it.text}`);
    else if (s.type === 'rows') for (const r of s.rows) out.push(`${r.label}: ${r.text}`);
    else if (s.type === 'edu') out.push(`${s.label} · ${s.text}`);
  }
  return out.join('\n');
}
