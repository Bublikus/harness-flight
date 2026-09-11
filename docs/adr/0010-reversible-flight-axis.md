# ADR-0010: Reversible flight axis

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0008 disabled both turn buttons whenever the destination index was zero. During a return hop that made the flight irreversible even though the plane was still between two checkpoints.

## Decision
Flight state retains both endpoints of the active hop: the current destination and the checkpoint behind it. Either side button swaps those endpoints and forces the U-turn through its chosen side. The pair can be swapped repeatedly during any hop or after arrival. Side controls disable only before the first forward hop, when no checkpoint exists behind the plane.

## Consequences
Slide index no longer determines whether a turn is possible. Repeated left/right inputs can reverse an animation indefinitely without losing either endpoint. Up starts a new forward leg and makes its origin the new checkpoint behind.

## Alternatives considered
Always enable turns and clamp negative indices — appears interactive but does nothing at the route start.
Wrap slide zero to the last slide — surprising teleport across the whole presentation.
Track only route direction — insufficient when a hop is retargeted before arrival.
