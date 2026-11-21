# Portfolio search setup

`npm run build` generates a static HTML document for every route. Minimal pages contain the actual React-rendered portfolio content before JavaScript runs; the interactive application still mounts normally. Full Experience keeps its animation and design. Both modes use the same canonical Minimal URLs so search signals are not split between copies.

Metadata is maintained in `src/lib/seo.ts`. The production origin is `https://jaztincontreras.vercel.app`; update `siteUrl` if the primary domain changes. Titles and descriptions use confirmed skills and project details rather than hidden keyword lists. Person, WebSite, and page/project JSON-LD identify the developer and his work without claiming reviews or client results.

`scripts/build-seo.mjs` creates the canonical sitemap and robots file in `dist`, includes the correct page styles, and preserves the Google ownership verification file. Keep the Vercel route rewrites pointing to each generated HTML document. Do not deploy only the original source `index.html`.

Validation: run `npm run build`, `npm run test:seo`, `npm test`, and `npm run lint`.

After production deployment:

1. Open `/robots.txt`, `/sitemap.xml`, and `/googlee99f7eddb4b95915.html` on the live domain.
2. Verify ownership in Google Search Console and submit `https://jaztincontreras.vercel.app/sitemap.xml`.
3. Inspect the homepage and case-study URLs, test the live pages, and request indexing.
4. Check indexed pages and actual search queries over time. Titles and descriptions help explain relevance; indexing, rankings, and search-result wording remain Google's decisions.

References: [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
