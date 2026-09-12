# ADR-0035: Sharp plane over desktop motion blur

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
ADR-0031's `MotionBlur` Effect is a fullscreen sample of the composer input. The chase-cam plane sat in that buffer, so hops smeared the hero as well as the world. The settings toggle must still gate the composer; lighting and shadows on the plane must stay.

## Decision
The plane lives on `PLANE_LAYER`. While streak intensity is live, the desktop composer camera sees only layer 0 (terrain, slides, birds). After the blur presents, a second `gl.render` composites layer 1 on top with depth cleared. A 1×1 warmup render keeps the plane in the shadow maps (Three.js tests the main camera's layers during the shadow pass). Parked / zero-intensity frames skip exclusion so the composer is a no-op pass of the full scene.

## Consequences
World streaks during hops; the biplane stays sharp. One extra offscreen render plus a plane overlay while streaking (desktop only). The overlay must null `scene.background` — a Color background `forceClear`s the framebuffer and would wipe the composer output. Birds that cross in front of the plane can draw under the overlay. Toggle-off still unmounts the composer (ADR-0031).

## Alternatives considered
Stencil / mask skip in the blur shader — plane color still sits in the input, so samples streak into neighbors.
Always composite without hiding the plane — sharp plane over a ghost halo of its own smear.
Disable blur globally — rejected; the toggle and world cue stay.
