# AGENTS.md

Instructions for coding agents working in this repository.

## Mission

`harness-flight` is a Vite + React Three Fiber talk: a Minecraft-style plane flies typed waypoints covering AI-in-the-editor history, the Cursor Harness, and company-level time/quality math.

Live deploy: https://bublikus.github.io/harness-flight/

Before changing code, read:

1. [README.md](README.md)
2. [docs/adr/README.md](docs/adr/README.md) — lasting presentation/tech choices
3. [.cursor/rules/no-browser-visual-verify.mdc](.cursor/rules/no-browser-visual-verify.mdc)

## Repository mental model

- `src/slides.ts` — talk content (waypoints + speaker notes)
- `src/scene/` — R3F world: terrain, flight hops, birds, audio, camera, slides in world space
- `src/scene/route.ts` — seeded meandering path; hops follow the polyline
- `src/Hud.tsx` / `src/AssistOverlay.tsx` — presenter chrome
- `src/NotesApp.tsx` / `src/presentationSync.ts` — speaker-notes window + sync
- `docs/adr/` — Architecture Decision Records (do not silently rewrite Accepted decisions)
- `test/` — Vitest unit/smoke tests (pure logic; no WebGL)
- `.github/workflows/pages.yml` — deploy `main` → GitHub Pages
- `.github/workflows/ci.yml` — lint, test, build on push/PR

## Working agreements

- Prefer the fewest lines that solve the problem. No drive-by refactors.
- Presentation behavior is sacred: do not change hop feel, slide timing, copy, or visuals unless the task asks for it.
- Lasting technical choices get an ADR (`docs/adr/NNNN-kebab.md`); mark Accepted when the code lands; supersede instead of rewriting.
- **Do not** open a browser or start a second Vite server to “check” the scene. Use `tsc`, lint, tests, and code review. Trust the user’s eyes unless they explicitly ask for browser verification.
- Do not commit or push unless the user asks.
- Runtime pin: [`.nvmrc`](.nvmrc). Match CI and local major to it.

## Commands

```bash
npm install
npm run dev      # Vite; default port — do not silently kill listeners
npm run lint     # oxlint
npm test         # vitest (unit/smoke)
npm run build    # tsc -b && vite build
npm run preview  # vite preview of dist
```

## Verification

For readiness or logic changes: run `npm run lint`, `npm test`, and `npm run build`. Report exact exit status. Skip browser visual checks unless requested.
