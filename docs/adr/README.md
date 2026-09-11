# Architecture Decision Records

Index of lasting presentation choices. Procedure: `adr` skill.

| # | Title | Status |
|---|---|---|
| [0001](0001-r3f-minecraft-flight-talk.md) | Vite + R3F Minecraft flight as the talk surface | Accepted |
| [0002](0002-typed-waypoints-in-slides.md) | Talk content as typed waypoints in `slides.ts` | Superseded by ADR-0009 |
| [0003](0003-github-pages-from-main.md) | Deploy the live talk from `main` to GitHub Pages | Accepted |
| [0004](0004-overlay-hud-dim-in-flight.md) | Overlay HUD; dim the sign while flying | Superseded by ADR-0005 |
| [0005](0005-in-world-signs-on-posts.md) | In-world signs that dock on waypoint posts | Superseded by ADR-0006 |
| [0006](0006-chase-cam-hops-overlay-when-parked.md) | Chase-cam hops; talk copy only when parked | Superseded by ADR-0011 |
| [0007](0007-interruptible-uturn-hops.md) | Interruptible hops with a banked U-turn | Accepted |
| [0008](0008-directional-flight-pad.md) | Directional flight pad | Superseded by ADR-0010 |
| [0009](0009-user-paced-presentation.md) | User-paced presentation | Accepted |
| [0010](0010-reversible-flight-axis.md) | Reversible flight axis | Accepted |
| [0011](0011-slide-rises-on-final-approach.md) | Slide rises on final approach | Superseded by ADR-0014 |
| [0012](0012-bidirectional-pagination.md) | Bidirectional pagination | Accepted |
| [0013](0013-synchronized-speaker-notes.md) | Synchronized speaker notes | Accepted |
| [0014](0014-world-space-slide-surface.md) | World-space slide surface | Proposed |

Restore a talk version with `git log --oneline` then `git checkout <commit>`:

- `Add Harness Flight presentation with GitHub Pages deploy` — overlay HUD, dim the sign in flight (ADR-0004).
- `Record why this talk is a world, not a deck` — same overlay HUD, plus the ADR index.
- `Put talk copy on in-world signs that dock on posts` — in-world signs; HUD chrome hides in flight (ADR-0005).
- `Keep the chase cam on the plane during hops` — overlay card only when parked (ADR-0006).
- `Make waypoint hops interruptible and smooth` — banked U-turns, approach braking, seamless docking (ADR-0007).
- `Make presentation fully user-controlled` — directional D-pad with no timing constraints (ADR-0008/0009).
- `Keep every flight reversible` — side controls swap active hop endpoints at any time (ADR-0010).
