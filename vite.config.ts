import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import githubContributions from "./api/github-contributions.js";

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'public-github-calendar',
    configureServer(server) {
      server.middlewares.use('/api/github-contributions', async (request, response) => {
        const result = await githubContributions.fetch(new Request('http://localhost/api/github-contributions', { method: request.method }));
        response.statusCode = result.status;
        result.headers.forEach((value, name) => response.setHeader(name, value));
        response.end(await result.text());
      });
    },
  }],
});
