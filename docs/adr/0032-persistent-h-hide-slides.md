# ADR-0032: Persistent H-hide across waypoints

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
ADR-0022 cleared the H-hide flag on every waypoint change so the next board always rose on approach. Presenters who clear the canvas to watch birds or the sky lose that clearance as soon as they hop, and the board whooshes back up uninvited.

## Decision
H toggles a session-scoped `slidesHidden` flag that does not reset on index change. WorldSlide’s existing `raised && !hidden` gate already keeps boards sunk (no rise whoosh) while the flag is on, including when landing at a new checkpoint. A second H clears the flag; the current board then rises if parked/approaching. Title-screen H stays a no-op; `spunAtLast` still forces hide independently.

## Consequences
Presenters can hop through waypoints with a clear sky until they allow boards again. First show after un-hiding still plays the rise whoosh once. Accidentally leaving hide on means empty checkpoints until H.

## Alternatives considered
Reset on hop (ADR-0022) — fights the “keep the sky clear” use case.
Separate “hide until next hop” vs “hide mode” keys — extra chrome for one presenter habit.
