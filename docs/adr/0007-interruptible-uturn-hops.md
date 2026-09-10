# ADR-0007: Interruptible hops with a banked U-turn

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
Hops were atomic: Prev/Next were disabled until arrival, and the plane lerped its position at the destination regardless of heading. Reversing mid-hop would look like a slide, not a turn.

## Decision
The plane always flies along its nose. Heading steers toward the current waypoint with an eased short-arc yaw and bank proportional to actual turn rate. Prev/Next/arrows/Space retarget the waypoint immediately; a ~180° error becomes a tight banked U-turn, then cruise. The chase camera orbits at a fixed distance using heading only: it keeps the plane centered, leaves the bank visible, and cannot cut through the world while catching up. Talk copy still only appears when parked (ADR-0006). Bottom controls stay clickable in flight so a hop can be reversed.

## Consequences
A hop is no longer a cutscene. Rapid retargets just update the aim point. The fixed-distance camera stays above nearby tree canopies. Speed eases down over the final 28 units, a forgiving capture radius absorbs frame-time variation, then the plane glides to within 0.01 units before locking exactly onto the waypoint. Idle bob starts at zero and eases in after docking, preventing a phase-change jump.

## Alternatives considered
Keep hops atomic — cannot undo a skip.
Lerp position while slerping yaw — fuselage slides sideways on a 180.
Instant yaw snap — readable, not a plane.
