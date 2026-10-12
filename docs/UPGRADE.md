# Manga / origami presentation upgrade

## Content protection

The original `js/data.js` and `assets/resume/resume.pdf` were not edited. Before implementation, a browser capture recorded the original portfolio data, main-content text blocks, links, and SHA-256 hashes of those files in `tests/fixtures/content-baseline.json`. Regression tests compare against that capture.

Existing project titles, descriptions, approaches, technologies, deployment information, dates, profile information, resume copy, quotes, and links are retained. Added text is limited to interaction controls and decorative labels. Original images are retained alongside optimized derivatives.

## Implemented direction

The design uses one original procedural origami sculpture rather than loading an external model or adding several competing 3D scenes. It extends the site's existing manga vocabulary:

- Faceted origami crane, washi grain, colored/monochrome paper materials, restrained petals, soft pre-painted contact shadow, and an understated display base.
- Pointer/drag interaction and accessible left/right/reset controls. No custom cursor, scroll-jacking, mandatory animation, or sound.
- Layered portrait frame/nameplate/lettering and small pointer-controlled card tilts.
- Manga-volume project borders and paper edges; native dialog with a brief shoji-panel reveal.
- Emakimono-inspired career cards, folded numbered markers, chapter progress and highlighted milestones.
- Paper lantern in the contact area, shoji-filtered background lighting, dimensional print/seal details, and a lightweight CSS shuriken.
- Physical quote-page treatment with stable measured height and explicit controls.
- Resume paper edges without rotating the document, readable sections, and print styling.
- Native cross-document transitions where supported, with ordinary navigation as fallback.

Alternative proposals from the idea catalog—kitsune mask, bonsai, desk diorama, koi pond, zen garden, folding-fan skills UI, wooden-plaque cards, and torii landscapes—are intentionally not combined into this design. The shuriken and lantern use CSS rather than opening extra WebGL contexts. Ink-fluid simulation and a curved-page mesh are also not included; quotes use lightweight CSS perspective.

## Performance / resilience

- Largest WebP variants total approximately **0.55 MB**, compared with **11.69 MB** for the original PNG collection. Responsive delivery typically selects smaller variants. Originals remain on disk and are available as image-error fallbacks.
- Fonts are self-hosted, with a source-derived Japanese glyph subset and bundled licenses.
- The Three.js module is loaded only near the home-page illustration. It is not requested initially with reduced motion, persisted paused motion, or Data Saver enabled.
- A local SVG is visible before loading and remains available if WebGL/module loading fails. All essential content is ordinary HTML.
- The single renderer caps pixel ratio, lowers resolution after sustained slow frames, stops offscreen/in hidden tabs, reacts to motion preferences, handles context loss/restoration, and disposes resources on navigation.
- The production build pre-renders portfolio data and supplies no-JavaScript project details. Source development pages still use the original client-side renderer.
- The Node server compresses text assets, supports ETags, avoids year-long immutable caching for unversioned files, and returns actual 404 responses for missing assets.

### Local lab sample

Measured against the production preview on this machine, with a cold browser context, using `scripts/measure-performance.cjs`:

| Profile | LCP | Cumulative observed layout shifts | Resource transfer during sample |
| --- | --- | --- | --- |
| Desktop, local/unthrottled, 1440 × 1000 | 0.65 s | 0.0001 | ~309 KB |
| Mobile emulation, 390 × 844, 4× CPU slowdown, 1.6 Mbps, 150 ms latency | 1.94 s | 0.0047 | ~224 KB |

The desktop scene was active during measurement. On mobile it remained below the loading threshold until scrolling, so this is initial-page performance, not mobile 3D frame-rate measurement. No external resource requests occurred. These are single local samples, not production field data; the shift sum is a diagnostic rather than a full field session-window CLS implementation. INP and low-end-device sustained frame rates have not been field-measured.

## Verification

`npm test` builds and exercises the production output with Playwright and axe-core. Coverage includes:

- 4 pages × 10 widths × 2 themes = **80 layout/theme combinations**.
- Document/body/container overflow, text clipping and successfully loaded images.
- Exact original data equality, original main-content text/link checks, and protected-file SHA-256 checks.
- Automated WCAG A/AA checks on all four pages in both themes and on the mobile project dialog.
- All seven project case files, keyboard focus cycling, Escape, close button, focus return and technology highlighting.
- Mobile navigation, theme persistence and resume anchors.
- Quote text/order, stable height and manual controls under reduced motion.
- Scene initialization, controls, theme switching, persisted pause, static fallback, blocked WebGL and context recovery.
- Dynamically generated card tilt attachment and timeline numbers.
- Mobile scene use and verification that draw calls stop while paused or offscreen.
- Production content with JavaScript disabled, PDF delivery, compression, ETags, and missing/private-file responses.

Screenshots are captured for mobile/tablet/desktop layouts and the scene. Automated tests and visual checks were run in installed desktop Chrome, including mobile emulation. **Physical iOS/Android devices and Safari/Firefox have not been tested.** A production deployment should still receive cross-browser, real-device and field-performance validation.
