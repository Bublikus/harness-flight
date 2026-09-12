# ADR-0022: Presenter H-toggle for the current slide

- Status: Superseded by ADR-0032
- Date: 2026-09-11
- Deciders: this session

## Context
A parked world board can still block the view of birds, flybys, and the sky. The presenter already has N for speaker notes; they need a session-local way to clear the current canvas without paginating, and without a new HUD button on the greeting page.

## Decision
H (in-session, ignored while typing in a field) toggles a `slideHidden` flag on the active board. That flag is another input to WorldSlide’s existing rise spring (`raised && !hidden`): hide targets 0 (sink), show targets 1 (rise), same damping as departing/arriving boards. Birds and flybys already treat `slidePose.rise` below the low-rise threshold as not blocking. The flag resets when the waypoint index changes so the next board always arrives shown. Title-screen H is a no-op so Space / ↑ / tap still start.

## Consequences
Hide/show reads as the same sink/rise motion as hops. Hidden state does not persist across waypoints. Title lists N and H faintly; no extra chrome button.

## Alternatives considered
Opacity fade or instant unmount — pops, and would need a separate bird-collision path.
Keep hidden across slides — next waypoint would arrive already sunk unless we special-case it.
HUD hide button — fights the title’s pad-only chrome.
