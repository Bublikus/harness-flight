# ADR-0038: Hop parks the assist overlay

- Status: Accepted
- Date: 2026-09-14
- Deciders: this session

## Context
The assist canvas is presenter chrome over the world. Once it is pulled on-screen, a hop (Space, pad, waypoint dots) used to leave it up, covering the flight. Auto-raising it on approach would copy the world-board rise and fight the “get this out of the way and fly” intent.

## Decision
Any `go()` that leaves the current index first parks the overlay on the same tuck path as a peek-tab hide, then runs the hop. The overlay stays docked after landing; approach and waypoint change do not restore it. Peek-tab click still toggles hide without flying. H still only toggles in-world slides.

## Consequences
Presenters can hop with a clear view; the peek tab remains to pull the canvas back. A hop from a focused canvas still flies (Space is not treated as a tab click). Accidental hops tuck a canvas the presenter meant to keep up until they show it again.

## Alternatives considered
Restore on approach — same surprise as pre-ADR-0032 world boards.
Hide-only key, hops leave the canvas — extra step before every flight.
Peek-tab Space toggles hide without flying — steals the hop the presenter asked for.
