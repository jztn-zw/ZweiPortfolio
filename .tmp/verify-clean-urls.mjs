import assert from 'node:assert/strict';
import { preview } from 'vite';
const server = await preview({ preview: { host: '127.0.0.1', port: 5188, strictPort: true, open: false } });
try {
  for (const path of ['/', '/numbers', '/skills', '/projects/greenway']) {
    const response = await fetch(`http://127.0.0.1:5188${path}`, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes('<div id="root">'), `${path}: root mount missing`);
    assert.ok(/type="module"[^>]+src="\/assets\//.test(html), `${path}: app bundle missing`);
    console.log(`${path}: 200, app entry available on a direct request`);
  }
} finally {
  await new Promise((resolve, reject) => {
    server.httpServer.close(error => error ? reject(error) : resolve());
    server.httpServer.closeAllConnections();
  });
}