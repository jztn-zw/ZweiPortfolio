# Clean page URLs

Pages use `/`, `/numbers`, `/skills`, and `/projects/greenway` through the browser History API. Internal page clicks retain the existing transition curtain and deferred module loading. Back and Forward use the same route handoff.

`src/lib/routes.ts` centralizes page matching and converts old `#/numbers`, `#/skills`, and `#/projects/greenway` bookmarks with `replaceState`. Old content skip URLs become standard content anchors on the matching clean path. Home section links such as `/#projects` remain ordinary section anchors, and skip links still focus the main content.

The click handler preserves native behavior for modified clicks, new-tab targets, downloads, external destinations, assets, and API links. Same-page anchors scroll and focus without a page transition or duplicate history entry.

`vercel.json` rewrites the three page paths to `/index.html` so direct visits and refreshes can load the SPA. These explicit rules leave assets, video files, and `/api` functions outside the rewrite list. Trailing page slashes normalize to the clean path. Vite supplies SPA fallback for development and preview. No deployment is performed by this change.

Regression tests in `tests/page-navigation.test.js` cover route swaps, interrupted animations, theme coexistence, clean direct links, legacy bookmarks, Back/Forward, section focus, native link behavior, and rewrite coverage.

Vercel reference: https://vercel.com/docs/routing/rewrites
