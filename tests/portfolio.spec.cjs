const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const crypto = require('node:crypto');
const baseline = require('./fixtures/content-baseline.json');
const pages = ['index', 'projects', 'experience', 'resume'];

for (const [file, hash] of Object.entries(baseline.hashes)) {
  test(`original file is unchanged: ${file}`, () => {
    expect(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')).toBe(hash);
  });
}

for (const name of pages) {
  test(`${name}: preserves every original content block and link`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${name}.html`);
    await expect(page.locator('body')).toHaveClass(/manga-enhanced/);
    const content = await page.locator('main').textContent();
    const normalized = content.replace(/\s+/g, ' ').trim();
    for (const text of baseline.pages[name].text) expect(normalized, text).toContain(text);
    const links = await page.locator('main a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
    for (const href of baseline.pages[name].links) expect(links).toContain(href);
    expect(await page.evaluate(() => window.portfolioData)).toEqual(baseline.data);
  });
}

for (const width of [320, 390, 640, 768, 820, 920, 1024, 1280, 1440, 1920]) {
  test(`alignment and assets at ${width}px, every page and both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const failed = [];
    page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
    for (const theme of ['ink', 'color']) for (const name of pages) {
      await page.goto(`/${name}.html`);
      await page.evaluate(theme => window.portfolioTheme.set(theme), theme);
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(n => n.complete && n.naturalWidth > 0), { message: `${name}/${theme}: image failed to load` }).toBeTruthy();
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth), `${name}/${theme}: document overflow`).toBeTruthy();
      const overflow = await page.locator('main .container, .nav-container, .resume-section-nav, .footer-inner').evaluateAll(nodes => nodes.filter(node => {
        const r = node.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1;
      }).map(node => node.className));
      expect(overflow, `${name}/${theme}: container overflow`).toEqual([]);
      const clipped = await page.locator('main h1, main h2, main h3, main p:not(.sound-effect), main dd, .brand, .project-more').evaluateAll(nodes => nodes.filter(n => {
        if (!n.getClientRects().length || n.closest('.quote-measure') || n.closest('.visually-hidden') || n.closest('[aria-hidden="true"]')) return false;
        return n.clientWidth > 0 && n.scrollWidth > n.clientWidth + 2;
      }).map(n => ({ tag: n.tagName, text: n.textContent.slice(0, 90), width: n.clientWidth, scroll: n.scrollWidth })));
      expect(clipped, `${name}/${theme}: clipped text`).toEqual([]);
      await expect.poll(() => page.locator('main img').evaluateAll(nodes => nodes.every(n => n.complete && n.naturalWidth > 0))).toBeTruthy();
      if ([390, 768, 1440].includes(width)) await page.screenshot({ path: `test-results/layout-${name}-${theme}-${width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });
}

for (const theme of ['ink', 'color']) for (const name of pages) {
  test(`${name}/${theme}: accessibility`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${name}.html`);
    await page.evaluate(theme => window.portfolioTheme.set(theme), theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  });
}

test('all case files, native focus containment, Escape, focus return and technology filtering', async ({ page }) => {
  await page.goto('/projects.html');
  const buttons = page.getByRole('button', { name: 'Open Case File' });
  for (let i = 0; i < baseline.data.projects.length; i++) {
    const project = baseline.data.projects[i];
    await buttons.nth(i).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (const text of [project.title, project.description, project.problem, project.approach, project.deployment, project.aiFlag, ...project.technologies]) await expect(dialog).toContainText(text);
    await expect(page.getByRole('button', { name: 'Close case file', exact: true })).toBeFocused();
    for (let tab = 0; tab < 7; tab++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('dialog'))).toBeTruthy();
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(buttons.nth(i)).toBeFocused();
  }
  await page.getByRole('button', { name: 'FastAPI', exact: true }).first().click();
  await expect(page.locator('.project-card.is-tech-match')).toHaveCount(2);
  await page.getByRole('button', { name: 'FastAPI', exact: true }).first().click();
  await expect(page.locator('.project-card.is-tech-muted')).toHaveCount(0);
});

test('mobile case file scrolls, closes, and passes accessibility', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects.html');
  const firstProjectWithGithub = baseline.data.projects.findIndex(project => project.githubUrl);
  await page.getByRole('button', { name: 'Open Case File' }).nth(firstProjectWithGithub).click();
  const dialog = page.getByRole('dialog');
  const github = dialog.getByRole('link', { name: 'GitHub', exact: true });
  await github.scrollIntoViewIfNeeded();
  await expect(github).toBeInViewport();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.map(v => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'Close case file', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test('mobile navigation, Escape, anchors and persisted theme', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/index.html');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.click();
  await expect(page.locator('.main-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.locator('[data-theme-toggle]').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await menu.click();
  await page.locator('.main-nav a[href="resume.html"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.locator('.resume-section-nav a[href="#resume-skills"]').click();
  await page.waitForTimeout(700);
  expect((await page.locator('#resume-skills').boundingBox()).y).toBeGreaterThan(100);
});

test('quotes keep a stable height, preserve text, and support manual controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator('[data-quote-stage]');
  await stage.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const height = (await stage.boundingBox()).height;
  for (let i = 0; i < 4; i++) {
    await expect(page.locator('[data-quote-text]')).toHaveText(`"${baseline.data.quotes[i].text}"`);
    expect(Math.abs((await stage.boundingBox()).height - height)).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: 'Next quote' }).click();
  }
  await expect(page.getByRole('button', { name: 'Play quotes' })).toBeDisabled();
});

test('3D loads, renders, rotates, pauses, changes materials and survives context loss', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/index.html');
  const scene = page.locator('[data-origami-study]');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-scene-state', 'ready', { timeout: 20000 });
  await page.waitForTimeout(1800);
  await expect(scene.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Rotate crane right' }).click();
  await page.getByRole('button', { name: 'Reset crane view' }).click();
  await scene.screenshot({ path: 'test-results/origami-color.png' });
  await page.locator('[data-theme-toggle]').click();
  await scene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await scene.screenshot({ path: 'test-results/origami-ink.png' });
  await page.getByRole('button', { name: 'Pause decorative motion' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await expect(scene.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Enable decorative motion' }).click();
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-scene-state', 'ready');
  await page.evaluate(() => {
    const canvas = document.querySelector('.origami-viewport canvas');
    window.testGL = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    window.testGL.loseContext();
  });
  await expect(scene).toHaveAttribute('data-scene-state', 'unavailable');
  await expect(scene.locator('.origami-fallback')).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.testGL.restoreContext());
  await expect(scene).toHaveAttribute('data-scene-state', 'ready');
  expect(errors).toEqual([]);
});

test('blocked WebGL uses SVG; reduced motion never requests the 3D bundle', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await reduced.newPage();
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('http://localhost:4173/index.html');
  await page.waitForTimeout(500);
  expect(requests.some(url => url.includes('origami.bundle'))).toBeFalsy();
  await expect(page.locator('.origami-fallback')).toBeVisible();
  await reduced.close();
  const context = await browser.newContext();
  const blocked = await context.newPage();
  await blocked.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args); };
  });
  await blocked.goto('http://localhost:4173/index.html');
  await expect(blocked.locator('[data-origami-study]')).toHaveAttribute('data-scene-state', 'unavailable');
  await expect(blocked.locator('.origami-fallback')).toBeVisible();
  await expect(blocked.getByRole('link', { name: 'View Projects', exact: true })).toBeVisible();
  await context.close();
});

test('production content remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const name of pages) {
    await page.goto(`http://localhost:4173/${name}.html`);
    await expect(page.locator('main h1')).toBeVisible();
    if (name === 'projects') {
      await expect(page.locator('.project-card')).toHaveCount(baseline.data.projects.length);
      await expect(page.locator('noscript p').filter({ hasText: baseline.data.projects[1].approach })).toBeVisible();
    }
    if (name === 'experience') await expect(page.locator('main')).toContainText(baseline.data.experience[0].description);
    if (name === 'index') await expect(page.locator('main')).toContainText(baseline.data.profile.summary);
  }
  await context.close();
});

test('generated cards receive tilt interactions and timeline markers retain their numbers', async ({ page }) => {
  await page.goto('/projects.html');
  const card = page.locator('.project-card').first();
  await expect(card).toHaveAttribute('data-tilt', '');
  await card.scrollIntoViewIfNeeded();
  const bounds = await card.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .2);
  await expect.poll(() => card.evaluate(n => n.style.getPropertyValue('--tilt-y'))).not.toBe('');
  await page.mouse.move(0, 0);
  await expect.poll(() => card.evaluate(n => n.style.getPropertyValue('--tilt-y'))).toBe('');
  await page.goto('/experience.html');
  expect(await page.locator('.journey-marker').evaluateAll(nodes => nodes.map(n => n.dataset.number))).toEqual(['01', '02', '03']);
});

test('mobile 3D stays usable and stops drawing offscreen or when motion is paused', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.drawCount = 0;
    for (const method of ['drawArrays', 'drawElements']) {
      const original = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function(...args) { window.drawCount++; return original.apply(this, args); };
    }
  });
  await page.goto('http://localhost:4173/index.html');
  const scene = page.locator('[data-origami-study]');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-scene-state', 'ready');
  await page.getByRole('button', { name: 'Rotate crane left' }).tap();
  await page.waitForTimeout(300);
  const first = await page.evaluate(() => window.drawCount);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.drawCount)).toBeGreaterThan(first);
  await page.screenshot({ path: 'test-results/mobile-3d.png' });
  await page.getByRole('button', { name: 'Pause decorative motion' }).tap();
  await scene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const paused = await page.evaluate(() => window.drawCount);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.drawCount)).toBe(paused);
  await page.getByRole('button', { name: 'Enable decorative motion' }).tap();
  await page.waitForTimeout(300);
  const offscreen = await page.evaluate(() => window.drawCount);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.drawCount)).toBe(offscreen);
  await context.close();
});

test('server compression, revalidation, downloads and true 404s', async ({ request }) => {
  const response = await request.get('/js/origami.bundle.js', { headers: { 'accept-encoding': 'br' } });
  expect(response.headers()['content-encoding']).toBe('br');
  expect(Number(response.headers()['content-length'])).toBeLessThan(150000);
  const cached = await request.get('/js/origami.bundle.js', { headers: { 'if-none-match': response.headers().etag } });
  expect(cached.status()).toBe(304);
  expect((await request.get('/assets/resume/resume.pdf')).headers()['content-type']).toBe('application/pdf');
  expect((await request.get('/assets/missing.png')).status()).toBe(404);
  expect((await request.get('/.git/config')).status()).toBe(404);
});
