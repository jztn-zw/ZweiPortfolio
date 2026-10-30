# Ask AI setup

The frontend and `/api/chat` backend deploy together in the existing Vercel project.
Gemini is primary; Groq handles quota exhaustion and temporary failures before a reply starts.

## Local development

1. Create keys in [Google AI Studio](https://aistudio.google.com/api-keys) and [Groq Console](https://console.groq.com/keys). Keep the projects/accounts on their Free tier, without enabling paid billing.
2. Put the keys in `.env.local` at the project root:

   ```dotenv
   GEMINI_API_KEY=your_actual_gemini_key
   GROQ_API_KEY=your_actual_groq_key
   GEMINI_MODEL=gemini-3.5-flash-lite
   GROQ_MODEL=qwen/qwen3.8-27b
   ```

3. Run `npm run dev`. Restart it after changing keys. The Vite server runs the real chat backend locally.
4. Open `http://127.0.0.1:5173/ask-ai` and send a question. The answer streams into the conversation; provider selection is handled in the background.

`.env.local` is ignored by Git. Do not use `VITE_` prefixes for secrets or paste keys into chat, screenshots, source code, or commits.

## Vercel

1. Open the existing portfolio project → Settings → Environment Variables.
2. Add `GEMINI_API_KEY` and `GROQ_API_KEY`. Optionally add the two model variables above; these are already the defaults.
3. Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. The visitor counter already uses these names. Chat uses separate Redis keys and never modifies visitor totals. Hosted chat stays unavailable if shared rate-limit storage is missing.
4. Select the intended deployment environments, save, and redeploy your portfolio. Local `.env.local` values do not upload automatically.

The project pins Node 22.x and explicitly includes the four shared TypeScript source files in the chat function. This preserves the `.ts` import paths used by the backend after Vercel emits compiled `.js` copies. Node 22's built-in type stripping runs these erasable-TypeScript sources. `includeFiles` must be a single glob string: `src/{data/portfolio,lib/chatLanguage,lib/personalChat,lib/workInquiry}.ts`. Keep this glob in sync if adding shared runtime modules; `tests/chat-package.test.js` verifies its type and actual file matches, then boots a minimal isolated function package without the frontend tree or local environment file. Deploy the updated source and configuration together to fix `ERR_MODULE_NOT_FOUND` errors for `src/data/portfolio.ts`.

## Limits and behavior

- Replies use Jaztin’s first-person portfolio voice and only the confirmed public information. If asked, the chat honestly identifies itself as automated; it never claims Jaztin is personally typing live.
- Public hobbies and preferences live in `personalProfile` in `src/data/portfolio.ts`. The chat has a short “Off the keyboard” starter and a warm, lightly playful voice. Relationship and other unprovided private-life questions get a friendly local boundary reply before any provider request. Shared interests do not enable general sports news, recipes or game guides.
- Shared language handling expands common chat abbreviations and contractions before scope checks. Garbled text, repeated keyboard patterns and symbol-only messages receive a local clarification, including when mixed with a portfolio keyword. This is a deterministic filter rather than a model classifier; it intentionally asks for clearer wording when it cannot identify a supported question.
- Client inquiries about building websites, apps, systems or automation, hiring and project pricing receive a local invitation to email Jaztin. The UI offers a verified email link. These replies consume no provider quota and never promise a price, deadline or completed action.
- A conservative local scope check runs on the server before rate-limit storage or either provider. Unrelated requests, greetings, acknowledgements and requests for unprovided private details get brief saved replies, spending no Gemini/Groq quota. Ambiguous questions may be redirected; explicit portfolio questions and supported follow-ups can reach the AI. Assistant messages never establish scope on their own.
- Five questions per minute per network address, twelve per minute across the site, and one hundred per UTC day across the site. These application limits are separate from provider free quotas. Multiple visitors on the same network share its allowance.
- Gemini is attempted first. A quota error, timeout, or temporary upstream failure can switch to Groq. Short cooldowns are shared through Redis on Vercel; local development uses memory.
- Authentication, model configuration, invalid request, and safety errors do not switch providers. Configure model names that are supported by your account.
- Once response text starts, an interrupted answer offers Retry rather than splicing another provider's response into it.
- Stop and navigation away abort the client request. The backend propagates cancellation where the host supports it and enforces a twenty-second timeout per provider.
- Messages and answer history are sent to the selected AI provider. Google free-tier data terms and Groq's data terms apply. Chat history remains in the tab's session storage; this app does not save conversations in Redis.
- Confirmed public facts come from `src/data/portfolio.ts`, assembled in `server/portfolioContext.js`. Generated answers can still be inaccurate. Curated portfolio notes remain available on errors.
- `/api/chat` GET reports configuration availability without calling an AI provider. It does not prove that a key, model permission, or provider quota is valid.
- Free models are not a billing lock: keep paid billing disabled in both accounts. There is no automatic upgrade, model rotation, or key rotation in this application.

## Validation

`npm test` exercises validation, streaming, quota fallback, cancellation, and rate limits using mocked providers. A real-key check is a separate request against the local backend; it consumes a small amount of free quota.
