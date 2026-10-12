const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const { parseHTML } = require('linkedom');

async function build() {
  const root = path.resolve(__dirname, '..');
  const dist = path.join(root, 'dist');
  await esbuild.build({
    entryPoints: [path.join(root, 'src/origami-scene.js')],
    outfile: path.join(root, 'js/origami.bundle.js'),
    bundle: true, minify: true, format: 'esm', target: 'es2020', legalComments: 'linked',
  });
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  for (const entry of ['index.html', 'experience.html', 'projects.html', 'resume.html', 'css', 'js', 'assets']) {
    fs.cpSync(path.join(root, entry), path.join(dist, entry), { recursive: true });
  }
  // Render the existing data source at build time. No duplicated portfolio copy.
  // JS upgrades this HTML when available; crawlers/no-JS users still get the content.
  for (const page of ['index', 'experience', 'projects', 'resume']) {
    const file = path.join(dist, `${page}.html`);
    const { window } = parseHTML(fs.readFileSync(file, 'utf8'));
    const sandbox = vm.createContext({ window, document: window.document, console, setTimeout: () => 0 });
    for (const script of ['image-manifest.js', 'data.js', 'main.js']) {
      vm.runInContext(fs.readFileSync(path.join(root, 'js', script), 'utf8'), sandbox);
    }
    vm.runInContext('renderSiteChrome()', sandbox);
    const render = { index: 'renderHomePage', experience: 'renderExperiencePage', projects: 'renderProjectsPage' }[page];
    if (render) vm.runInContext(`${render}()`, sandbox);
    window.document.querySelector('.project-popup')?.remove();
    if (page === 'projects') {
      const noscript = window.document.createElement('noscript');
      const heading = window.document.createElement('h2');
      heading.textContent = 'Project details';
      noscript.append(heading);
      for (const project of window.portfolioData.projects) {
        const article = window.document.createElement('article');
        article.className = 'manga-panel current-project-body';
        const title = window.document.createElement('h3');
        title.textContent = project.title;
        article.append(title);
        for (const value of [project.problem, project.approach, project.deployment, project.aiFlag, project.technologies.join(', ')]) {
          const p = window.document.createElement('p'); p.textContent = value; article.append(p);
        }
        for (const [label, href] of [['GitHub', project.githubUrl], ['Live Demo', project.liveUrl]]) {
          if (!href) continue;
          const a = window.document.createElement('a'); a.href = href; a.textContent = label; article.append(a);
        }
        noscript.append(article);
      }
      window.document.querySelector('.projects-section').append(noscript);
    }
    fs.writeFileSync(file, '<!DOCTYPE html>\n' + window.document.documentElement.outerHTML);
  }
  console.log('Built dist/: optimized assets, bundled 3D, and pre-rendered portfolio content.');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
