# ADR-0031: Desktop postprocessing motion blur

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
Chase-cam hops already sell speed with FOV fisheye and camera lag. A true postprocessing streak would reinforce that on desktop without repeating mobile GPU cost (ADR-0030 already caps DPR, shadows, and streaming). There is no built-in MotionBlur in `@react-three/postprocessing`; `realism-effects` velocity buffers are heavier than this talk needs.

## Decision
Desktop mounts `@react-three/postprocessing` `EffectComposer` with a small custom `MotionBlur` Effect (radial + camera-view velocity). Intensity eases from `planePose.speed`. Mobile uses `isMobileWorld()` and never mounts the composer. Existing FOV fisheye stays; both run together on desktop.

## Consequences
Desktop pays one extra fullscreen pass while flying; parked intensity settles to zero. The blur module is lazy-loaded so mobile never downloads the postprocessing chunk. Existing FOV fisheye stays. Future desktop effects can share the same composer.

## Alternatives considered
`realism-effects` VelocityDepthNormalPass + MotionBlurEffect — real object motion vectors, but large dep and cost for a chase-cam talk.
Fake blur via wind motes / chromatic aberration only — not postprocessing motion blur.
Always-on composer with disabled pass on mobile — still constructs the pipeline; gate at mount instead.
