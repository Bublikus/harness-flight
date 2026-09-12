# ADR-0033: Sky finale after last slide

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
ADR-0027 used the last checkpoint’s extra forward press as an in-place 180° and hid the closer until a return visit. That fight the talk: the last slide should stay the last *slide*, and “keep going” after it should look past the world, not turn the plane around.

## Decision
Pagination has one extra page after the twelve talk slides: `FINALE_PAGE = SLIDES.length`. It is not a thirteenth pose. First arrival at the last checkpoint still shows the last talk board. Forward from there (or clicking the extra sky dot) parks the plane at the last waypoint, sinks the last board via the existing hide spring, and eases chase-cam look-at from the plane to `FINALE_SKY` (past `ROUTE_END`, above the terminus). 3D fireworks launch there for as long as that page is parked; they fade when leaving. Hopping to the finale from earlier waypoints flies to the last pose first, then enters the look-up on arrival. Forward on the extra page is a no-op. Back / the last waypoint dot returns the last slide and eases look-at back to the plane.

## Consequences
The U-turn-and-return closer is gone; last slide is visible on first visit. HUD shows twelve waypoint dots plus one sky dot; the clock reads `FINALE` on the extra page. Speaker notes still sync to talk slides only. Fireworks stay in-world so the upward look frames them; mobile uses a smaller particle pool.

## Alternatives considered
Keep the about-face (ADR-0027) — fights “stay parked and look up.”
Hop to a new end pose — extra beacon, leaves the last checkpoint.
2D HUD overlay fireworks — camera tilt would not frame them.
Show the old `FINALE` board on the extra page — blocks the sky the finale is for.
