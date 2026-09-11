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
| [0014](0014-world-space-slide-surface.md) | World-space slide surface | Accepted |
| [0015](0015-departing-slides-spring-down.md) | Departing world slides spring down | Accepted |
| [0016](0016-slide-assist-overlay.md) | Draggable slide-assist overlay | Accepted |
| [0017](0017-boids-flocks-world-ambience.md) | Boids flocks as world ambience | Superseded by ADR-0018 |
| [0018](0018-distributed-bird-agents.md) | Distributed bird agents with local flocks and perches | Accepted |
| [0019](0019-corridor-flybys-plane-slide.md) | Corridor flybys between plane and slide | Superseded by ADR-0021 |
| [0020](0020-directional-shadow-maps.md) | Directional shadow maps for bird silhouettes | Accepted |
| [0021](0021-one-flyby-per-slide-session.md) | One corridor flyby per slide session | Accepted |

Restore a talk version with `git log --oneline` then `git checkout <commit>`:

- `Add Harness Flight presentation with GitHub Pages deploy` — overlay HUD, dim the sign in flight (ADR-0004).
- `Record why this talk is a world, not a deck` — same overlay HUD, plus the ADR index.
- `Put talk copy on in-world signs that dock on posts` — in-world signs; HUD chrome hides in flight (ADR-0005).
- `Keep the chase cam on the plane during hops` — overlay card only when parked (ADR-0006).
- `Make waypoint hops interruptible and smooth` — banked U-turns, approach braking, seamless docking (ADR-0007).
- `Make presentation fully user-controlled` — directional D-pad with no timing constraints (ADR-0008/0009).
- `Keep every flight reversible` — side controls swap active hop endpoints at any time (ADR-0010).
- `Render slides in the flight world` — world-space CanvasTexture board (ADR-0014).
- `Sink departing world slides before unmounting` — outgoing boards stay until the spring settles (ADR-0015).
