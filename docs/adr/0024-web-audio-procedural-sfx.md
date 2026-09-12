# ADR-0024: Web Audio procedural SFX

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
The talk already sells a voxel flight; silence after takeoff undercuts that. Shipping `.mp3`/`.wav` beds would add decode work, autoplay risk, and assets to keep in sync with hop timing. The presenter also needs a one-key mute that stays quiet enough for a live room.

## Decision
All flight sound is synthesized in `src/scene/FlightAudio.ts` with the Web Audio API: layered oscillators plus filtered noise for the engine, a second filtered-noise path for cruise wind, a short noise whoosh on hop/start, and an optional triangle blip on first start. `AudioContext` is created or resumed only from a user gesture (title tap, Space / ↑ start, later hops, or M once the talk has started). M toggles mute and persists it in `localStorage`. Flight feeds the existing WindMotes cruise intensity (`windVis`) into the mix; WindMotes itself is not an audio owner.

## Consequences
No audio files in the repo. First-frame silence until a gesture, including a notes-sync start on a machine that has not been touched. Volumes stay low on a master gain so they do not drown a speaker. Mute is a preference, not session-local.

## Alternatives considered
Bundled samples — extra assets, same autoplay rules, worse hop sync.
Howler / tone.js — another dependency for a four-voice bed.
Audio worklet / 3D panner — more machinery than a chase-cam talk needs.
