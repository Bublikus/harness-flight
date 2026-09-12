# ADR-0034: Hermite arrival bridge

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
Parking used a wall-clock brake: 0.7s speed ease entered when `along ≤ v0·0.35`. The entry zone scales with speed, so slow approaches (v0 ≈ 6) got a ~2.4u window and the capture spring/dock finished the move abruptly, while fast hops felt right. Heading, speed, and position were three loosely coupled ramps rather than one path.

## Decision
The final approach is a time-parameterized cubic Hermite in XZ built from boundary conditions snapshotted once at entry: `P0`/`V0` = current position/velocity (C1 with flight), `P1` = pad, `V1` = 0.3 u/s along `parkYaw` (rolling finish, under `DOCK_SPEED`). Duration `T = clamp(2·chord/(v0+vEnd), 0.7, 1.4)` — the time to cover the chord under a linear speed ramp. Entry fires when that natural `T` falls to `TMAX`, so every arrival gets the same ~1.4s ease regardless of cruise speed; with `T·v0 ≈ 2·chord` the 1D profile is exactly linear deceleration. While bridging the curve owns position (`u = t/T`, no stall), heading tracks the curve tangent blended to `parkYaw`, `speed = |P'(t)|` feeds audio/motes/camera, and the capture spring is off. At `u = 1` the plane is on the pad exactly and the existing dock/settle runs. Degenerate short-chord entries clamp `V0` so `T·v0/chord ≤ 3` (largest overshoot-free ratio). Pivot (same-pose about-face) and takeoff/cruise physics are untouched.

## Consequences
Low- and high-speed arrivals share one wall-clock feel; the slowdown is a single curve instead of brake + spring + capture fighting. Fast hops now roll out over ~2× the old distance (still 1.4s). Position leaves the route polyline for the chord during the bridge — intended corner smoothing. Yaw can lag the tangent on near-180° parks; dock still waits for `facingPark` at the pad.

## Alternatives considered
Speed-scaled brake zone (previous, ADR-0007 era) — inconsistent feel at low v0.
Fixed-duration slerp of position — breaks C1 at entry, ignores velocity direction.
Longer brake time only — still leaves capture lerp to close the gap.
