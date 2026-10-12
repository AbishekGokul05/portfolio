const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const crypto = require('node:crypto');
(async () => {
  if (fs.existsSync('tests/fixtures/content-baseline.json')) throw new Error('A protected baseline already exists. Do not overwrite it during presentation changes.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  const baseline = { pages: {}, hashes: {} };
  for (const name of ['index', 'projects', 'experience', 'resume']) {
    await page.goto(`http://localhost:3000/${name}.html`);
    await page.waitForFunction(() => window.portfolioData);
    baseline.pages[name] = await page.evaluate(() => ({
      text: Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main dt, main dd')).filter(n => !n.closest('.quote-panel')).map(n => n.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean),
      links: Array.from(document.querySelectorAll('main a[href]')).map(n => n.getAttribute('href')),
    }));
    if (name === 'index') baseline.data = await page.evaluate(() => window.portfolioData);
    await page.screenshot({ path: `test-results/before-${name}.png`, fullPage: true });
  }
  for (const file of ['js/data.js', 'assets/resume/resume.pdf']) baseline.hashes[file] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  fs.mkdirSync('tests/fixtures', { recursive: true });
  fs.writeFileSync('tests/fixtures/content-baseline.json', JSON.stringify(baseline, null, 2));
  await browser.close();
})();
