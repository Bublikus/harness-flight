# ADR-0029: Mobile world LOD

- Status: Superseded by ADR-0030
- Date: 2026-09-12
- Deciders: this session

## Context
Full-column voxel fill for terminus hills and the corridor (~1.1M instanced cubes), plus 2048² soft shadows and DPR up to 1.5, made the talk unusable on phones. Desktop still wants the solid Minecraft look and bird silhouettes. The existing `(hover: none), (pointer: coarse)` gate already marks “phone / tablet” for audio.

## Decision
Gate a lighter **world** path with `isMobileWorld()` (same media query). On mobile only: 2× terrain grid with scaled ground blocks, 2-layer crust instead of bedrock fill, fewer trees/clouds and no ground clutter, frustum cull terrain instances, cap canvas DPR at 1, use basic PCF shadows at 1024². Flight, chase cam, fisheye, wind lines, route, slides, birds, and beacons stay shared. Desktop keeps the rich build.

## Consequences
Phones drop roughly an order of magnitude of terrain instances while the valley still reads as solid from chase height. Desktop visuals and ADR-0020 soft shadows are unchanged. Resizing from coarse↔fine pointer mid-session does not hot-swap LOD (matchMedia at mount). Further cuts (bird count, fog distance) remain available if needed.

## Alternatives considered
One shared low-poly world — hurts the desktop talk aesthetic.
Disable shadows on mobile — cheapest, but loses bird→slide contact the talk relies on.
Runtime chunk streaming — correct long-term, far more code than a dual build.
