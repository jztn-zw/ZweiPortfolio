import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

// Build actual page content without running browser effects or contacting APIs.
const server = await createServer({ configFile: false, envDir: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom' })
try {
  const { pagePaths, getSeo, siteUrl, renderPage } = await server.ssrLoadModule('/src/seo-render.tsx')
  const template = await readFile('dist/index.html', 'utf8')
  const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
  const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
  const routeModules = { minimal: 'src/pages/Minimal.tsx', minimalSkills: 'src/pages/MinimalSkills.tsx', minimalGreenway: 'src/pages/MinimalGreenWay.tsx', minimalVyora: 'src/pages/MinimalVyora.tsx', minimalEverwell: 'src/pages/Everwell.tsx' }
  const styles = key => {
    const files = new Set(), visited = new Set()
    const visit = id => {
      if (!id || visited.has(id)) return
      visited.add(id)
      const entry = manifest[id]
      if (!entry) return
      for (const css of entry.css ?? []) files.add(css)
      for (const dependency of entry.imports ?? []) visit(dependency)
    }
    visit(key)
    return [...files].filter(file => !template.includes(`href="/${file}"`)).map(file => `<link rel="stylesheet" href="/${file}" />`).join('\n')
  }
  const sitemapUrls = new Set()
  for (const [page, routePath] of Object.entries(pagePaths)) {
    const seo = getSeo(page)
    const content = renderPage(page)
    const metadata = [
      `<meta name="description" content="${escape(seo.description)}" />`,
      '<meta name="robots" content="index, follow, max-image-preview:large" />',
      `<link rel="canonical" href="${seo.url}" />`,
      ...Object.entries({ title: seo.title, description: seo.description, url: seo.url, image: seo.image, type: 'website', site_name: seo.siteName }).map(([key, value]) => `<meta property="og:${key}" content="${escape(value)}" />`),
      ...Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image }).map(([key, value]) => `<meta name="twitter:${key}" content="${escape(value)}" />`),
      `<script type="application/ld+json" id="portfolio-schema">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>`,
    ].join('\n')
    let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(seo.title)}</title>`).replace(/\s*<meta name="description"[^>]*>/, '').replace('</head>', `${metadata}\n</head>`)
    if (content) {
      const module = routeModules[page] ?? 'src/pages/MinimalProjects.tsx'
      html = html.replace('</head>', `${styles(module)}\n<noscript><style>.startup-screen{display:none}</style></noscript>\n</head>`)
        .replace('<div id="root" inert></div>', `<div id="root">${content}</div>`)
        .replace('<html lang="en"', '<html lang="en" data-view="minimal"')
      // Minimal already paints usable content; don't cover it with the boot screen.
      const start = html.indexOf('    <div class="startup-screen"')
      const end = html.indexOf('    <div id="root">', start)
      if (start !== -1 && end !== -1) html = html.slice(0, start) + html.slice(end)
    }
    const directory = path.join('dist', routePath.slice(1))
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'index.html'), html)
    if (page === 'minimal') await writeFile('dist/index.html', html)
    if (page !== 'ai' && page !== 'numbers') sitemapUrls.add(seo.url)
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...sitemapUrls].map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
  console.log(`SEO: generated ${Object.keys(pagePaths).length} page documents and ${sitemapUrls.size} canonical sitemap URLs.`)
} finally {
  await server.close()
}
