# ADR-0019: Corridor flybys between plane and slide

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0018’s distributed agents wander the corridor but rarely cross the audience’s view of the talk board. Occasional wildlife through the space between the chase plane and the risen world slide sells depth without hitching birds to hop/HUD state machines.

## Decision
`Flight` and the active `WorldSlide` publish world poses each frame into `worldPoses` (module refs). `Birds` rate-limits ~one flyby every ~5s: pick a nearby `fly` agent, steer it along a cubic Bezier from its current pose through a mid-point between plane and slide, then hand back to normal goal-seeking with continuous exit velocity (no teleport). Skip when the board is sunk or poses are invalid. Soft terrain floor still applies on the curve.

## Consequences
Slide passes feel intentional and rare. Coupling stays one-way via module poses (no React context). Tunables (`FLYBY_COOLDOWN`, near radius, curve speed) live in `Birds.tsx`. Extends ADR-0018; does not replace local flocks / perches.

## Alternatives considered
React context for poses — heavier than two Vector3 refs.
Script every bird through the corridor — constant distraction, worse perf.
Supersede ADR-0018 with a camera-tied system — loses distributed ambience.
