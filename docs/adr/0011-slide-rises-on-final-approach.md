# ADR-0011: Slide rises on final approach

- Status: Superseded by ADR-0014
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0006 kept the slide hidden until the plane had fully docked. The resulting instant appearance was clear but disconnected from the checkpoint and world.

## Decision
The slide remains hidden throughout cruise and turns. When the plane enters the existing two-unit docking glide, the destination slide mounts front-facing and rises from the bottom of the viewport to its reading position. Its 0.72-second motion matches the final approach; plane, camera, terrain, and controls do not change.

## Consequences
The slide appears to emerge from the checkpoint immediately before docking without becoming an obstacle during flight. The card remains a screen-space overlay, avoiding the scale and occlusion failures of ADR-0005.

## Alternatives considered
Restore a 3D HTML sign — it can cover the plane and scale incorrectly.
Show the slide throughout slowdown — obscures too much of the flight.
Wait until docking — preserves the abrupt appearance this decision fixes.
