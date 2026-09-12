# ADR-0036: Cyclable camera views as smoothed config objects

- Status: Accepted
- Date: 2026-09-13
- Deciders: this session

## Context

The chase cam lived as ~10 hardcoded constants inside `Flight.tsx`'s `useFrame`
(distance, height, follow stiffness, FOV + accel kick, pointer peek, finale
glance). We want multiple cinematic views the presenter can cycle from a HUD
button, without duplicating the camera math per view or hard-cutting between
rigs.

## Decision

Camera behavior is data: `src/scene/cameraViews.ts` exports `CAMERA_VIEWS`, an
array of `CameraView` config objects (offset dist/height/lateral, look
ahead/lift, fov + accel kick, follow/followAccel stiffness, pointer-orbit
scale, bank-roll coupling, drone spin, finale participation). View 0 reproduces
the pre-refactor chase cam exactly. `Flight.tsx` keeps a single generalized
camera block that reads a **smoothed copy** of the active view: every numeric
knob eases toward the target config at `VIEW_BLEND` (~0.5 s), so switching is a
continuous camera move, not a cut. The active index is a module store
(`activeCameraView`, same pattern as `worldPoses`) persisted under
`harness-flight-camera-view`; a `CameraDock` button (leftmost corner dock)
cycles it. A terrain clamp (`terrainHeight + CAM_MIN_CLEAR`) keeps low rigs out
of hills, and finale skyBlend effects scale per view.

## Consequences

- New views are one config object; no camera-math edits.
- All views share one follow/look/FOV pipeline, so per-view exotic motion is
  limited to what the knobs express (spin and bank-roll are the current
  extras).
- The smoothed-knob blend means mid-transition frames run a hybrid rig; knobs
  must stay sane under interpolation (they do — all are linear gains/offsets).

## Alternatives considered

- Per-view camera components/branches — duplicated follow logic, hard cuts.
- React state + props through World → Flight — re-renders the Canvas tree for
  a per-frame concern; module store matches the existing `planePose` pattern.
