# Manga-Style Portfolio

Abishek Gokul's static HTML/CSS/JavaScript portfolio, with a progressively enhanced Japanese paper-and-ink treatment. Portfolio information and the original resume are preserved.

## Run

Node.js 22+ is required for the asset/build tools.

```bash
npm ci
npm run build
npm run preview
```

Open **http://localhost:3000**. `npm start` / `npm run dev` serve the source files for development. The production `dist/` build also pre-renders the existing data into HTML, so portfolio content is available without JavaScript.

Deploy `dist/` to a static host, or use `npm run preview` on a Node host after building. Enable Brotli/gzip on your static host; the supplied Node server already handles compression and ETag revalidation.

## Presentation

- One original procedural Three.js origami crane: folded-paper facets, subtle paper grain, restrained sakura petals, pointer/drag rotation, and keyboard-accessible rotate/reset controls.
- Lazy-loaded renderer with adaptive pixel ratio, offscreen/hidden-tab suspension, reduced-motion and Data Saver fallbacks, context-loss recovery, and resource cleanup.
- Layered portrait, manga-volume project cards, shoji-inspired case-file reveals, folded timeline markers, scroll-style paper edges, and a contact lantern.
- Theme-aware materials for INK and COLOR, preserving the existing theme preference.
- Stable-height quote pages with previous/next/pause controls; automatic cycling stops offscreen, while hovered/focused, when paused, and under reduced motion.
- Native project dialogs with focus management, Escape/backdrop closing, mobile scrolling, and focus restoration.
- Global decorative-motion control in the footer; device reduced-motion preference takes precedence.
- Responsive WebP variants, local fonts, readable/printable resume, and normal HTML navigation.

This implements the coordinated **manga/origami direction**, not all competing hero concepts at once. Alternate kitsune, bonsai, desk, pond, and shrine environments are not installed.

## Source map

| Path | Purpose |
| --- | --- |
| `index.html`, `projects.html`, `experience.html`, `resume.html` | Original page structure and content |
| `js/data.js` | Original portfolio data, unchanged by the presentation upgrade |
| `js/main.js` | Content rendering, navigation, responsive images, accessible case files |
| `js/animations.js` | Motion preference, quotes, reveals and scroll ornaments |
| `js/enhancements.js` | Pointer depth, chapter progress, lantern and lazy scene loading |
| `src/origami-scene.js` | Editable Three.js scene source |
| `js/origami.bundle.js` | Generated, self-contained browser module |
| `css/enhancements.css` | Responsive visual layer, fallbacks and print styling |
| `css/fonts.css`, `assets/fonts/` | Local font files and licenses |
| `js/image-manifest.js` | Generated dimensions and WebP variants |
| `scripts/build.js` | Bundle the scene and pre-render the original data into `dist/` |
| `tests/fixtures/content-baseline.json` | Original content/link snapshot and protected-file hashes |

Original PNGs remain in `assets/images/`. Font licenses and the Three.js MIT license are included in `assets/fonts/` and `assets/licenses/`.

## Asset maintenance

```bash
npm run images    # regenerate WebP variants and their manifest after changing PNGs
npm run fonts     # refresh local fonts; regenerate the Japanese glyph subset from source
npm run bundle    # rebuild only the 3D module during development
npm run build     # rebuild the full deployable site
```

Font regeneration needs network access; normal builds and runtime do not. The Japanese subset includes glyphs found in the HTML/CSS/JS source. Run `npm run fonts` after adding Japanese labels. Keep the generated assets in version control.

## Verification

```bash
npm test
npm run test:report
```

Tests use an installed Chrome by default. Set `PLAYWRIGHT_CHANNEL` for another installed Chromium channel. Screenshots, traces, and the HTML report are generated in ignored `test-results/` and `playwright-report/` directories.

The suite checks original content/links/hashes, four pages at ten widths (320–1920px) in both themes, text/container overflow, images, accessibility, dialogs, navigation, filters, quotes, 3D controls, motion suspension, WebGL failure/recovery, no-JavaScript production content, compression, and downloads.

For a repeatable local performance sample, start the production preview and run:

```bash
# Bash example; PowerShell: $env:PERF_URL='http://localhost:3000'
PERF_URL=http://localhost:3000 node scripts/measure-performance.cjs
```

The resulting report is a **local lab sample**, not a field Core Web Vitals or INP guarantee. See `docs/UPGRADE.md` for scope, measured results, and remaining validation limits. Content baseline changes should be deliberate; do not regenerate the baseline merely to make a failing test pass.
