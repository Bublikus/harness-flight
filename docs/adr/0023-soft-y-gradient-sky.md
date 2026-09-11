# ADR-0023: Soft Y-gradient sky dome

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
`@react-three/drei` `Sky` wraps three-stdlib’s Preetham sky on a unit `BoxGeometry`. Fragment color uses `normalize(interpolated world position)`, so planar cube faces create hard blue↔white cuts at the vertical face edges — especially left/right of the chase cam. The talk wants a seamless Minecraft-ish soft blue→white sky without changing fog or lighting.

## Decision
Replace drei `Sky` with a camera-centered inverted sphere whose fragment color is a smoothstep mix of horizon and zenith colors from view-direction Y only (`SoftSky` in `World.tsx`). Fog, hemisphere, and directional sun stay as before.

## Consequences
No azimuthal seams from any yaw. Loses Preetham sun disk / Mie glow (sun lighting is already a separate directional light). Tunable via two color uniforms.

## Alternatives considered
Keep Preetham, swap `BoxGeometry` for `SphereGeometry` — fixes seams but keeps unused atmospheric machinery for a flat Minecraft look.
Cube-map / textured dome — overkill; vertical texture seams risk returning.
