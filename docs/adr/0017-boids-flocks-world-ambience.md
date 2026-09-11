# ADR-0017: Boids flocks as world ambience

- Status: Superseded by ADR-0018
- Date: 2026-09-11
- Deciders: this session

## Context
The voxel corridor reads as static scenery once the plane is parked or cruising. Soft life in the open sky (birds over trees and hills) sells “nature” without adding gameplay systems, HUD chrome, or talk-state coupling.

## Decision
`World` mounts a `Birds` scene system that runs classic Reynolds boids (separation, alignment, cohesion) over two small flocks of instanced voxel birds. Altitude stays above `terrainHeight` plus clearance, inside world X/Z bounds. Wing flap and velocity-facing orientation are visual only; flight controls, slides, and the assist overlay stay untouched.

## Consequences
The canvas gains a cheap ambient sim (~28 birds, four instanced meshes). Tunables live as constants in `Birds.tsx`. Agents must not hitch birds to the plane, HUD, or waypoint index.

## Alternatives considered
Particle noise / random wander — looks alive for a second, never reads as a flock.
Attach birds to the chase cam — breaks world immersion; couples to flight state.
Hundreds of agents or GPU compute — overkill for a talk laptop.
