# ADR-0006: Chase-cam hops; talk copy only when parked

- Status: Superseded by ADR-0011
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0005 mounted `SignCard` in the scene and tossed it on `arrive`/`depart`. Screen-space `Html` does not shrink with distance, so the next card filled the look-at during a hop and hid the plane — the hop stopped feeling like flight.

## Decision
The transition *is* the chase-cam flight: camera stays behind the plane, plane stays in frame. Talk copy is an overlay `SignCard` shown only while parked. In flight the card and HUD chrome are gone. Waypoint posts stay in the world as beacons, not as flying billboards.

## Consequences
Hops read as play, not as a slide wiping in. Parked cards sit at the top of the HUD so the plane remains visible underneath. Restoring ADR-0005’s in-flight cards would regress this.

## Alternatives considered
Keep world `Html` but hide it unless `read` — still sits on the plane’s waypoint and covers the fuselage.
True 3D text on posts — readable only when parked next to a beacon, too small for a talk.
Overlay that merely dims in flight (ADR-0004) — the half-transparent card still fights the camera.
