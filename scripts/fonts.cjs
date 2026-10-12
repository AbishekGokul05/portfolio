const fs = require('node:fs/promises');
const path = require('node:path');
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
async function fetchOK(url) {
  const response = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
(async () => {
  await fs.mkdir('assets/fonts', { recursive: true });
  const sources = [];
  for (const folder of ['css', 'js']) for (const file of await fs.readdir(folder)) {
    if (/\.(css|js)$/.test(file) && !file.includes('bundle')) sources.push(await fs.readFile(path.join(folder, file), 'utf8'));
  }
  for (const file of ['index.html', 'experience.html', 'projects.html', 'resume.html']) sources.push(await fs.readFile(file, 'utf8'));
  const jp = [...new Set(sources.join('').match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu))].join('');
  const fonts = [
    { slug: 'inter', family: 'Inter:wght@400..900', license: 'ofl/inter/OFL.txt' },
    { slug: 'bangers', family: 'Bangers', license: 'ofl/bangers/OFL.txt' },
    { slug: 'permanent-marker', family: 'Permanent+Marker', license: 'apache/permanentmarker/LICENSE.txt' },
    { slug: 'noto-serif-jp', family: 'Noto+Serif+JP:wght@600..900', text: jp, license: 'ofl/notoserifjp/OFL.txt' },
  ];
  let output = '/* Local Google Fonts; licenses are included in assets/fonts. Regenerate with npm run fonts. */\n';
  for (const font of fonts) {
    const url = `https://fonts.googleapis.com/css2?family=${font.family}&display=swap${font.text ? `&text=${encodeURIComponent(font.text)}` : ''}`;
    const css = await (await fetchOK(url)).text();
    const block = font.text ? css : css.slice(css.lastIndexOf('/* latin */'));
    const remote = block.match(/url\((https:[^)]+)\)/)?.[1];
    if (!remote) throw new Error(`Missing font URL for ${font.slug}: ${css}`);
    const filename = `${font.slug}.woff2`;
    await fs.writeFile(`assets/fonts/${filename}`, Buffer.from(await (await fetchOK(remote)).arrayBuffer()));
    output += block.replace(/url\(https:[^)]+\)/, `url('../assets/fonts/${filename}')`) + '\n';
    let license;
    try { license = await (await fetchOK(`https://raw.githubusercontent.com/google/fonts/main/${font.license}`)).text(); }
    catch (error) {
      if (font.slug !== 'permanent-marker') throw error;
      license = await (await fetchOK('https://raw.githubusercontent.com/google/fonts/main/ofl/permanentmarker/OFL.txt')).text();
    }
    await fs.writeFile(`assets/fonts/${font.slug}-LICENSE.txt`, license);
  }
  await fs.writeFile('css/fonts.css', output);
  console.log('Self-hosted fonts generated. Japanese subset includes all current source glyphs.');
})();
