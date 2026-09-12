# ADR-0030: Full world with mobile runtime opts

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
ADR-0029 thinned the mobile world (2× grid, crust fill, fewer props) so phones could run the talk. That traded away the Minecraft density the corridor is built for. Phones still need lower GPU cost; the preferred path is keep full geometry and spend less drawing/uploading it.

## Decision
Everyone gets the same full-density terrain (1× grid, full column fill, full trees/decor/clouds). Mobile-only runtime opts via `isMobileWorld()`: canvas DPR capped at `[1,1]`, basic PCF shadows at 1024² (desktop keeps soft 2048²), cheaper SoftSky tessellation, frustum-culled instanced terrain, and **Z-chunk streaming** (~48-unit strips, keep ±2 around the plane, build at most one new chunk per frame, unload distant strips). Desktop still builds the whole map once with frustum culling off (chase cam looks back).

## Consequences
Mobile sees the same valley richness as desktop while only a band of instances is resident. Chunk build can hitch one frame when entering a new strip; unload frees GPU geometry. Supersedes ADR-0029’s dual world LOD. Further cuts (bird count, fog) remain available if needed.

## Alternatives considered
Keep ADR-0029 dual build — rejects the “full world everywhere” requirement.
Disable shadows on mobile — cheapest, but loses bird→slide contact.
Surface-only crust without streaming — still changes the look and reopens sky gaps on steep slopes.
