/* A repeatable local lab sample, not a field Core Web Vitals/INP claim. */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
  const results = [];
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.lab = { lcp: 0, cls: 0, longTasks: 0, shifts: [] };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.lab.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
        window.lab.cls += entry.value;
        window.lab.shifts.push({ value: entry.value, nodes: entry.sources?.map(source => source.node?.className) });
      } }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.lab.longTasks += Math.max(0, entry.duration - 50); }).observe({ type: 'longtask', buffered: true });
    });
    const cdp = await context.newCDPSession(page);
    if (mobile) {
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await page.goto(`${process.env.PERF_URL || 'http://localhost:4174'}/index.html`);
    await page.waitForTimeout(8000);
    results.push({ device: mobile ? 'mobile: 4x CPU, 1.6 Mbps, 150 ms latency' : 'desktop: unthrottled local', ...await page.evaluate(() => ({
      ...window.lab,
      transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0),
      scene: document.querySelector('[data-origami-study]').dataset.sceneState,
      externalRequests: performance.getEntriesByType('resource').filter(entry => new URL(entry.name).origin !== location.origin).map(entry => entry.name),
    })) });
    await page.screenshot({ path: `test-results/performance-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: false });
    await context.close();
  }
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/performance.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
