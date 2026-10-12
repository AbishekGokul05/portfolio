const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const args = process.argv.slice(2);
const dirIndex = args.indexOf('--dir');
const publicDir = path.resolve(process.cwd(), (dirIndex !== -1 ? args[dirIndex + 1] : process.env.SERVE_DIR) || '.');
const port = Number(process.env.PORT) || 3000;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const compressedCache = new Map();
function fail(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return fail(res, 405, 'Method not allowed'); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return fail(res, 400, 'Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  // Serve only public site files, not source, dependency, test or repository files.
  if (!/^\/(?:index\.html|projects\.html|experience\.html|resume\.html|(?:css|js|assets)\/.+)$/.test(pathname)) return fail(res, 404, '404 Not Found');
  const filePath = path.resolve(publicDir, '.' + pathname);
  if (!filePath.startsWith(publicDir + path.sep)) return fail(res, 403, '403 Forbidden');
  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) return fail(res, 404, '404 Not Found');
    const ext = path.extname(filePath).toLowerCase();
    let contents = await fs.promises.readFile(filePath);
    const etag = `W/"${crypto.createHash('sha256').update(contents).digest('hex').slice(0, 24)}"`;
    const headers = {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      // Filenames are intentionally stable, so do not mark them immutable for a year.
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'ETag': etag,
      'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff',
    };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
    const encodingHeader = req.headers['accept-encoding'] || '';
    const encodings = encodingHeader.split(',').map(item => item.trim().split(';')).filter(([, quality]) => !quality || Number(quality.trim().replace('q=', '')) > 0).map(([name]) => name);
    const encoding = encodings.includes('br') ? 'br' : encodings.includes('gzip') ? 'gzip' : null;
    if (encoding && contents.length > 1024 && ['.html', '.css', '.js', '.svg', '.json'].includes(ext)) {
      const cacheKey = `${filePath}:${etag}:${encoding}`;
      if (!compressedCache.has(cacheKey)) {
        if (compressedCache.size >= 64) compressedCache.delete(compressedCache.keys().next().value);
        compressedCache.set(cacheKey, encoding === 'br' ? await brotli(contents) : await gzip(contents));
      }
      contents = compressedCache.get(cacheKey);
      headers['Content-Encoding'] = encoding;
    }
    headers['Content-Length'] = contents.length;
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    fail(res, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? '404 Not Found' : '500 Internal Server Error');
  }
});
server.listen(port, () => console.log(`Portfolio: http://localhost:${port}\nServing: ${publicDir}`));
