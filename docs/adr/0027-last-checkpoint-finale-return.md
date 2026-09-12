# ADR-0027: Last-checkpoint about-face; finale on return

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
The last talk board sits at the final route pose. Forward past that checkpoint had no hop left (or would have needed a new end pose). The closer should not appear on that first “keep going” press — the plane turns around on the same beacon, and the end card waits until the presenter actually comes back.

## Decision
Twelve route poses stay the talk waypoints. `FINALE` is a second board at the last pose, not a thirteenth hop. First arrival at the last checkpoint shows the last talk slide. While parked there facing past the end, Up/Space is an in-place 180° (existing yaw / `turnDirection`, no chord). The last board sinks and stays down until they leave; finale does not rise during the turn. Leaving after that visit arms `finaleReady`. The next arrival at the last checkpoint raises the finale.

## Consequences
Forward at the end is always a turn, then the route runs backward. Finale is gated by a completed first visit plus a later return, not by the about-face itself. Notes and beacons stay on the twelve talk slides.

## Alternatives considered
Hop to a new finale pose on last-↑ — extra beacon, flashes the closer on the first press.
Show finale at the end of the 180° — they never left; the closer pops during the turn.
Disable Up at the last checkpoint — no way to reverse without Down or a side U-turn.
