# ADR-0037: Spatial Web Audio for world SFX

- Status: Accepted
- Date: 2026-09-13
- Deciders: this session

## Context
ADR-0024 put all talk SFX through one master `GainNode` (mono). Bird chirps only gated by plane distance; fireworks and slide whooshes had no left/right or distance attenuation. Headphones and a chase cam make that feel flat once birds and finale bursts are in the mix.

## Decision
Keep procedural synthesis and the master gain last in the chain for mute/volume. Publish chase-camera pose each frame as `audioListenerPose` (fallback: plane yaw+pos) and sync `AudioContext.listener`. World one-shots with a known position (bird chirps, firework launch/burst, hop/rise whooshes) route through a short-lived HRTF `PannerNode` with inverse distance (`refDistance` ≈ 10, aligned with bird `HEAR_R`). Engine/wind beds stay centered into master so they do not pan wildly with the chase cam. Concurrent panners stay under existing bird/firework voice caps. Mobile still skips audio via `audioEnabled()`.

## Consequences
Nearby birds and finale bursts read in stereo space; beds remain stable. Extra node churn per one-shot is bounded by voice limits. Listener must be updated while the context is running (Flight frame + at play time).

## Alternatives considered
StereoPannerNode only — L/R without distance; weaker for flybys.
Always-on plane-attached engine panner — risk of L/R wobble with orbit/spin camera views.
Sample libraries / Howler 3D — still no assets preferred (ADR-0024).
