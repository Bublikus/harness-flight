# ADR-0025: Seeded meandering route as layout source

- Status: Superseded by ADR-0026
- Date: 2026-09-12
- Deciders: this session

## Context
Waypoints sat on a near-straight +Z corridor (`z = 8 + i * spacing`, a few units of sine on X). Terrain, river, ridges, and bird bounds used the same `x ≈ 0` spine. The talk reads as a runway, not a valley you fly through.

## Decision
One seeded XZ polyline in `src/scene/route.ts` is the layout source of truth. Alternating S-bends (seed `20260912`, amplitude `30`, wavelength `58`) stay generally +Z. Each checkpoint is placed on the landing straight just after a curve (`AFTER_TURN = 8`) with yaw from that straight’s tangent. Terrain height, river, trees, beacons, boards, and bird commute/bounds derive from `pathX` / `pathLateral` / `waypointPose`. Plane hops still fly the chord toward the next pose.

## Consequences
Refresh does not reshuffle the talk. Boards and beacons sit on readable straights after visible bends; the valley and river follow the same line. Hop chords may cut inside a curve — that is accepted. `worldPoses` remains the live plane/slide frame, not a second layout.

## Alternatives considered
Per-slide X offsets — a second coordinate source; easy to desync ground from hops.
High-frequency noise on X — wobble, not a winding road; checkpoints land mid-turn.
Spline the hop itself — fights the existing interruptible chord-and-bank flight (ADR-0007).
