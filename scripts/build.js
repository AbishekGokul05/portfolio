const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dist = path.join(root, 'dist');
const entries = ['index.html', 'experience.html', 'projects.html', 'resume.html', 'css', 'js', 'assets'];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  const destination = path.join(dist, entry);

  if (!fs.existsSync(source)) {
    continue;
  }

  fs.cpSync(source, destination, { recursive: true });
}

console.log('Static site built in dist/');
