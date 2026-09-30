import puppeteer from 'puppeteer-core';
export async function launch(binding, opts = {}) {
  const browser = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', `--proxy-server=${process.env.HTTPS_PROXY || ''}`] });
  browser.sessionId = () => 'local-' + Date.now();
  return browser;
}
export default { launch };
