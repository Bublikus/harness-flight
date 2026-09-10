# ADR-0003: Deploy the live talk from main to GitHub Pages

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
The talk must be shareable at a stable URL without a Node host. The repo is already on GitHub (`Bublikus/harness-flight`). Builds are static Vite output.

## Decision
GitHub Actions on `main` (and `workflow_dispatch`) runs `npm ci` + `npm run build` and deploys `dist` with `actions/deploy-pages`. Vite `base` is `'./'` so the app works under `https://bublikus.github.io/harness-flight/`. Live URL is documented in the README.

## Consequences
Every push to `main` is a public talk drop — treat `main` as the presented build. Relative `base` avoids broken assets on project Pages. There is no staging URL; preview is local `npm run dev` or a branch that is not `main`.

## Alternatives considered
Vercel/Netlify — extra account and custom domain for a static talk.
GitHub Pages from `/docs` without Actions — fights Vite's `dist` output.
Hash-based client router host — unnecessary; this app is a single screen.
