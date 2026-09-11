# ADR-0018: Distributed bird agents with local flocks and perches

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0017’s two Reynolds flocks read as one or two dense black clumps: strong cohesion plus tight spawn rings pull every bird onto the same center. Ambience should feel like wildlife spread across the corridor — different headings and jobs — without hitching to flight, HUD, or talk state.

## Decision
`Birds` scatters ~34 voxel agents across the world AABB. Most belong to small local groups (weak alignment/cohesion within group only); some are solo. Strong global separation plus per-bird goal waypoints (wander / forage / commute) and wander noise replace a shared flock attractor. Optional perch cycle uses canopy tops from `treePerches()` in `Terrain` (same placement rules as rendered trees): fly → approach → idle flap → takeoff. Altitude still clears `terrainHeight`.

## Consequences
Sky life is distributed and less “one blob.” Tunables stay constants in `Birds.tsx`. `treePerches` must stay in sync with tree spawning in `Terrain.build`. Slightly more CPU than two pure boid loops; count stays laptop-friendly.

## Alternatives considered
Tune ADR-0017 weights only — clumps return as soon as agents meet.
One global flock with huge separation — still one coordinated mass.
GPU / hundreds of agents — overkill for a talk laptop.
