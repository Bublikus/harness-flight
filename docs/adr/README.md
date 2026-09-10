# Architecture Decision Records

Index of lasting presentation choices. Procedure: `adr` skill.

| # | Title | Status |
|---|---|---|
| [0001](0001-r3f-minecraft-flight-talk.md) | Vite + R3F Minecraft flight as the talk surface | Accepted |
| [0002](0002-typed-waypoints-in-slides.md) | Talk content as typed waypoints in `slides.ts` | Accepted |
| [0003](0003-github-pages-from-main.md) | Deploy the live talk from `main` to GitHub Pages | Accepted |
| [0004](0004-overlay-hud-dim-in-flight.md) | Overlay HUD; dim the sign while flying | Accepted |
| [0005](0005-in-world-signs-on-posts.md) | In-world signs that dock on waypoint posts | Proposed |

Restore a talk version with `git log --oneline` then `git checkout <commit>`:

- `Add Harness Flight presentation with GitHub Pages deploy` — overlay HUD, dim the sign in flight (ADR-0004).
- The commit that accepts ADR-0005 — talk copy on in-world signs; HUD chrome fully hides in flight.
