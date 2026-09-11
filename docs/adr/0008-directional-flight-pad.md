# ADR-0008: Directional flight pad

- Status: Superseded by ADR-0010
- Date: 2026-09-11
- Deciders: this session

## Context
Prev/Next labels described slide navigation, not flying. A return hop also chose its U-turn side implicitly, so the presenter could not direct the maneuver.

## Decision
Controls use a compact D-pad. Up flies to the next slide. Left and right both target the previous checkpoint while forcing the 180-degree turn through that side. The center is an inert hub. The down position remains reserved for a future command. Keyboard arrows mirror the pad; Space remains a forward shortcut.

## Consequences
The controls describe aircraft intent and remain usable during hops. Returning to the same checkpoint can look different depending on the selected turn side. The target waypoint and turn direction travel as separate state so steering does not infer presenter intent.

## Alternatives considered
Keep Prev/Next buttons — clear for a deck, weak for a flight.
Use left/right for adjacent slides — direction would still not choose the U-turn side.
Assign down now — no useful backward-flight behavior has been designed.
