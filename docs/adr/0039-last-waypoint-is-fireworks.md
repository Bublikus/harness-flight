# ADR-0039: Last waypoint is the fireworks finale

- Status: Accepted
- Date: 2026-09-14
- Deciders: this session

## Context
ADR-0033 added an extra pagination page after the twelve talk slides: hop to waypoint 12, show the last board and assist, then Space/click again to look up at fireworks. That extra step fought the closer — the last point on the route should already be the sky.

## Decision
Pagination has twelve items. The last route pose (`LAST_CHECKPOINT`) is the fireworks destination. Hopping there hides the board immediately; fireworks and the chase-cam look-up arm only when `flying` becomes false at that index (`finale = atLast && !flying`), not on a second Space. Last-pad dock does not wait on facing alignment. Waypoints 1–11 still raise boards and assist. Forward on the last page is a no-op; back restores waypoint 11. Greeting still starts at slide 1.

## Consequences
HUD shows twelve dots; the last is the sky marker and stays highlighted during fireworks. Speaker notes still index the twelve `SLIDES` rows, so the unused landing copy remains for notes at the finale. There is no thirteenth page or `pendingFinale` hop.

## Alternatives considered
Keep the extra sky page (ADR-0033) — the extra click after the last talk board.
Drop the last route pose — would shrink the flight to eleven hops.
Show the landing board then auto-fireworks — still a talk slide on the closer.
