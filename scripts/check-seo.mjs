import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'

const origin = 'https://jaztincontreras.vercel.app'
const routes = JSON.parse(await readFile('vercel.json', 'utf8')).rewrites
const home = await readFile('dist/index.html', 'utf8')
assert.ok(home.includes('id="minimal-title"'), 'Homepage must contain actual portfolio HTML')
assert.ok(!home.includes('id="startup-screen"'), 'Prerendered Minimal must remain visible')
assert.ok(home.includes('id="root"') && !home.includes('id="root" inert'))
assert.ok(home.includes('/documents/JaztinAbramContrerasCV.pdf'))
assert.ok(home.includes('jaztin-abram-contreras-58508b446'))
for (const route of [{ source: '/', destination: '/index.html' }, ...routes]) {
  const html = await readFile(`dist${route.destination}`, 'utf8')
  assert.equal([...html.matchAll(/<title>/g)].length, 1, route.source)
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, route.source)
  assert.equal([...html.matchAll(/name="description"/g)].length, 1, route.source)
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1]
  assert.ok(canonical.startsWith(origin), route.source)
  assert.ok(!canonical.includes('?') && !canonical.includes('#'), route.source)
  assert.ok(!html.includes('noindex'), route.source)
  assert.ok(html.includes('property="og:title"') && html.includes('name="twitter:card"'))
  const graph = JSON.parse(html.match(/id="portfolio-schema">([\s\S]*?)<\/script>/)[1])
  assert.equal(graph['@context'], 'https://schema.org')
  const website = graph['@graph'].find(item => item['@type'] === 'WebSite')
  assert.equal(website.name, 'Jaztin Abram Contreras')
  assert.equal(website.url, `${origin}/`)
  for (const list of graph['@graph'].filter(item => ['ItemList', 'BreadcrumbList'].includes(item['@type']))) {
    for (const [index, item] of list.itemListElement.entries()) {
      assert.equal(item.position, index + 1)
      const url = item.url ?? item.item
      assert.ok(url.startsWith(origin) && !url.includes('undefined'))
      await access(url === `${origin}/` ? 'dist/index.html' : `dist${new URL(url).pathname}/index.html`)
    }
  }
  for (const asset of html.matchAll(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+)"/g)) await access(`dist${asset[1]}`)
  if (!route.source.startsWith('/experience')) {
    assert.match(html, /<h1\b/)
    assert.ok(!html.includes('id="startup-screen"'))
    assert.ok(html.includes('MinimalLayout-') || route.source === '/projects/everwell', 'Page styles must be included')
  }
}
for (const project of ['greenway', 'vyora', 'everwell']) {
  const html = await readFile(`dist/projects/${project}/index.html`, 'utf8')
  assert.match(html, new RegExp(project, 'i'))
  assert.ok(html.includes(`${origin}/projects/${project}`))
  const graph = JSON.parse(html.match(/id="portfolio-schema">([\s\S]*?)<\/script>/)[1])
  assert.ok(graph['@graph'].some(item => item['@type'] === 'BreadcrumbList'))
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
assert.equal(urls.length, new Set(urls).size)
assert.equal(urls.length, 9)
assert.ok(!urls.includes(`${origin}/minimal`) && !urls.includes(`${origin}/experience`))
for (const url of urls) await access(url === `${origin}/` ? 'dist/index.html' : `dist${new URL(url).pathname}/index.html`)
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`))
assert.equal(await readFile('dist/googlee99f7eddb4b95915.html', 'utf8'), await readFile('public/googlee99f7eddb4b95915.html', 'utf8'))
console.log(`SEO checks passed: ${routes.length + 1} route documents, ${urls.length} canonical URLs, page content, styles, schema, and verification file.`)
