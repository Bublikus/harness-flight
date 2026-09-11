# ADR-0012: Bidirectional pagination

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
The directional pad used Up for pagination while Down remained reserved. Left and Right already swap the active hop endpoints and choose the side of the U-turn, so pagination must remain meaningful after the plane reverses its route orientation.

## Decision
The route starts facing increasing slide indices, with Up targeting index +1 and Down targeting index -1. Any successful command to a target behind the current facing flips the persistent orientation. This includes Down pagination and Left or Right endpoint swaps; orientation therefore follows the resulting flight direction rather than the button used. Up and Down exchange index directions after each backward turn, and repeated Down turns alternate direction naturally. Pagination remains available during flight, and each button disables only when its facing-adjusted target is outside the slide range. Keyboard arrows mirror the buttons.

## Consequences
Top always targets the slide ahead of the plane and Bottom always targets the slide behind it. A successful Bottom command turns the plane around, so the same button then points back toward the slide it just left. Users can retarget an active flight and repeatedly reverse both the hop and subsequent pagination without changing plane, camera, or world behavior.

## Alternatives considered
Use Left and Right for pagination — removes explicit U-turn-side control.
Keep Up and Down bound to fixed index directions — ignores the plane's reversed orientation.
Disable Down while flying — makes reverse pagination timing-dependent.
