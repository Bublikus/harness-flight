# ADR-0020: Directional shadow maps for bird silhouettes

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
Birds fly past the world-space slide and the biplane, but the scene used only hemisphere + directional lighting with no shadow maps. Without cast shadows, flybys and flocks read as floating sprites. Soft cinematic PCSS is unnecessary; a readable voxel-friendly silhouette on the board, plane, and nearby ground is enough, and must stay laptop-friendly. The slide face must stay crisp (MeshBasic + CanvasTexture); dunking it under Lambert alone makes copy muddy when the sun is oblique.

## Decision
Enable Three.js shadow maps on the R3F canvas with `PCFSoftShadowMap` (`shadows="soft"`). One directional sun `castShadow`s with a 2048² map and a tight orthographic frustum that recenters on `planePose` each frame. The sun sits on the audience/plane side of the board so the front receives light and bird silhouettes. Birds `castShadow`; plane voxels, terrain instances, beacons, and the slide frame `receiveShadow`. The slide texture stays `MeshBasicMaterial`; a coplanar `ShadowMaterial` catcher overlays bird/plane marks without relighting the copy.

## Consequences
Bird flybys and perches leave readable marks on the talk board, plane, and nearby ground. Extra fill cost is bounded by one shadow pass over casters inside a play-volume frustum, not the whole corridor at full res. Bias/`normalBias` may need retuning if acne or peter-panning appears on new materials. The shadow catcher opacity (~0.42) is a presentation knob. Variance / contact-shadow overlays remain available if soft ground blobs are wanted later without expanding the cascade.

## Alternatives considered
No shadows / brightness-only — cheapest, but flybys lack contact with the board.
MeshLambert slide face — receives shadows but washes or muddies CanvasTexture copy under hemisphere+sun.
ContactShadows under the plane only — misses bird→slide and bird→terrain marks.
CSM / large world shadow map — overkill and expensive for a linear talk corridor.
PCSS / high-res soft shadows — nicer falloff, heavier on laptop GPUs.
