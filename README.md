# Manga-Style Portfolio

Static personal portfolio for Abishek Gokul built with plain HTML, CSS, and JavaScript.

## Run and deploy

Requires Node.js 18+.

```bash
npm start
```

The site will run at `http://localhost:3000` by default. Deployment platforms can use:

- Start command: `npm start`
- Build command: `npm run build` (optional static build)
- Static output directory: `dist`

Other useful commands:

```bash
npm run dev      # same as npm start
npm run build    # copies the static site into dist/
npm run preview  # serves dist/ after building
```

## Pages

- `index.html` - home chapter with hero, quote sequence, philosophy, education, experience preview, current project, and contact
- `experience.html` - education, experience, and current status as a manga journey map
- `projects.html` - project archive rendered from centralized JavaScript data
- `resume.html` - manga dossier layout with the supplied resume PDF embedded

## Structure

- `css/themes.css` - ink mode and colored manga mode variables
- `css/style.css` - base layout, page structure, project archive, journey map, and resume layout
- `css/manga.css` - panels, screentone, speech/quote treatment, portrait frame, sound effects, and scroll shuriken
- `css/responsive.css` - tablet and mobile adjustments
- `js/data.js` - centralized profile, status, education, experience, project, quote, and contact data
- `js/theme.js` - persistent ink/color theme toggle using `localStorage`
- `js/main.js` - page rendering, navigation state, and project expansion
- `js/animations.js` - quote sequence, reveal animations, and scroll-following shuriken
- `assets/images` - supplied profile and project visuals
- `assets/resume/resume.pdf` - supplied resume file

## Notes

The site remains static and lightweight, but frequently changing portfolio information now lives in `js/data.js` so it can later be replaced by API-backed data.
