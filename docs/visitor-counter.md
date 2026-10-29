# Footer visitor counter

The footer replaces the location with a small eye mark, **Visitors**, and the shared total. It uses the existing light/dark colors and shows a tooltip on hover or keyboard focus. An unavailable counter displays **—**, never a fabricated number.

## Enable on Vercel

1. In the portfolio's Vercel project, open **Storage** and create/connect an **Upstash Redis** database through the Marketplace. Use a database for this portfolio.
2. Make these server environment variables available to the project's **Production** deployment:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN` (the write token, not the read-only token)
   If the integration creates variables with another prefix, map their values to these exact names in Vercel's Environment Variables settings. Do not add `VITE_`: these credentials must stay on the server.
3. Optionally add `VISITOR_COOKIE_SECRET`, a stable random secret, to keep cookie signatures independent of Redis credential rotation. Without it, the server uses the Redis token to sign cookies.
4. Deploy this source to Vercel, or redeploy after changing the environment variables. `api/visitors.js` becomes `/api/visitors`; no extra package or separate server is required. Existing hash navigation needs no rewrite.
5. Open the production site. The first browser should show **1**. Refresh: it should stay **1**. Open in a separate browser or private window: it should become **2**. `GET /api/visitors` reads the total without incrementing it.

The Redis connection and deployment must be completed in your Vercel account before live numbers appear. This change does not create a database, choose a paid plan, or deploy the website.

Official setup references: [Vercel Redis storage](https://vercel.com/docs/redis), [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js), and [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

## What is counted

- An estimated number of unique browsers since tracking was enabled, not historical visits or a real-time online count.
- A signed first-party `HttpOnly`, `Secure`, `SameSite=Lax` cookie identifies a browser. Returning visits with that cookie do not increment the total. Cookie and Redis browser records expire after one year without a successful return visit.
- Redis atomically checks the browser marker and increments the total, so parallel requests with the same cookie cannot double-count. The footer shares its request across mounts to avoid duplicate requests during navigation.
- A different browser, cleared/blocked cookies, a simultaneous first visit in separate tabs before a cookie exists, or expired cookies can count the same person again. Bots are not guaranteed to be excluded. This is a lightweight public counter, not audited analytics.
- The implementation does not store names, email addresses, IP addresses, referrers, or browsing history. Redis holds the aggregate total and random browser markers. Hosting providers may maintain their own standard request logs.
- Vite development and Vercel preview deployments do not add to the production total. They show **—**. Redis outages also show **—**, with a short unavailable message in the tooltip.
- The count is fetched once per loaded browser tab. Reload to see visits made from other browsers. Tracking begins at zero and cannot recover visits from before setup.

## Validation

`npm test` checks the API with a mocked Redis REST boundary: first/repeat visits, concurrent requests sharing a cookie, a second browser, read-only totals, tampered cookies, origin checks, unavailable storage, preview isolation, and unsupported methods. Run `npm run lint` and `npm run build` as well. A live Redis/Vercel check is still required after connecting the integration.
