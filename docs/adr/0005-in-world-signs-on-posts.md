# ADR-0005: In-world signs that dock on waypoint posts

- Status: Proposed
- Date: 2026-09-11
- Deciders: this session

## Context
An overlay sign that merely dims in flight still reads as a slide deck glued onto a skybox. The talk metaphor is waypoints in a world: copy should live on the posts you fly to, and the HUD should get out of the way during hops.

## Decision
Talk copy is a shared `SignCard` mounted in the scene via `WorldSign` (drei `Html` on a wooden board at `waypointPos`). Parked, the sign lifts in front of the camera; in flight it docks small on the post. Overlay `Hud` keeps only chrome (brand, clock, controls, dots) and uses `hud-away` to fully hide that chrome while flying. `App` tracks `parked` separately from `index` so the previous sign can settle while the next waypoint is the flight target.

## Consequences
Checkout of the commit that accepts this ADR is the in-world-sign talk. Overlay and world share `SignCard` so typography stays one source. Html-in-canvas has scale/occlusion quirks; animation lives in `WorldSign` and must not be rewritten as a second overlay. Beacon number labels also hide while flying.

## Alternatives considered
Keep overlay + dim (ADR-0004) — simpler, weaker metaphor.
Duplicate copy in overlay and world — two sources of truth, flicker.
Pause the world and crossfade full-screen slides between hops — abandons flight as the transition.
