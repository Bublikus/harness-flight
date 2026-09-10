# ADR-0002: Talk content as typed waypoints in slides.ts

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
Twelve stops must share era, title, lead, bullets, duration, and a world position. The talk is ~20 minutes; autopilot needs a duration per stop. Authors will edit copy more often than they edit the renderer.

## Decision
All talk copy and timing live in `src/slides.ts` as a typed `SLIDES` array (`id`, `era`, `title`, `lead`, `points`, `durationSec`). World positions are derived from index (`waypointPos`: Z along the route, slight sine on X/Y). Art keys off `id` via `SlideArt`. HUD, beacons, and flight all read this one module.

## Consequences
Adding a waypoint is a data change plus optional art. Timing math (`TOTAL_SEC`, countdown) stays honest if durations change. There is no CMS or i18n layer — copy edits are code reviews. Do not scatter per-slide strings into scene components.

## Alternatives considered
Markdown/MDX per slide — nicer for writers, splits the source of truth from the 3D route.
JSON/CMS — extra runtime and deploy surface for a single talk.
Hard-coded JSX scenes per waypoint — copy edits would touch the renderer.
