# ADR-0001: Vite + R3F Minecraft flight as the talk surface

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
The talk needs to feel like a campaign, not a slide deck: a plane, a sky, and twelve stops. The audience should watch a world, not a sequence of stacked HTML panels. The stack has to stay small enough to ship on GitHub Pages in one repo.

## Decision
The presentation is a Vite + React app whose primary view is a React Three Fiber canvas. `App` owns talk state (started, waypoint index, flying, pause, remaining). `World` is the canvas (terrain, sky, beacons, chase-cam `Flight`). A DOM overlay handles title screen and HUD chrome. Content copy is not a separate deck tool.

## Consequences
Talk pacing, camera, and scenery share one runtime — restoring a version is a git checkout. Three.js/r3f is a real dependency; 2D print/export is not a first-class path. Agents must treat `src/scene/` as the stage and `src/App.tsx` as the director, not as generic CRUD UI.

## Alternatives considered
Reveal/Marp/Google Slides — faster to author, kills the flight metaphor.
Full Minecraft/Three.js game loop — too much simulation for a 20-minute talk.
Video recording — not interactive; Space/P would not work live.
