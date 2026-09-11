# ADR-0009: User-paced presentation

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0002 assigned a duration to every waypoint so autopilot could advance a roughly 20-minute talk. That makes discussion, questions, and live delivery race a countdown instead of following the presenter.

## Decision
Presentation state changes only through explicit user input. Slides keep typed content and index-derived world positions, but have no durations. The automatic interval, countdown, time meter, pause command, and autopilot state are removed.

## Consequences
Every waypoint can remain open indefinitely. The presenter controls all progression through the flight pad or keyboard. The talk can still target 20 minutes editorially, but the application never enforces it.

## Alternatives considered
Keep autopilot disabled by default — timing machinery still constrains the model and UI.
Add configurable durations — still solves a requirement the presentation no longer has.
Pause automatically on interaction — hidden timing remains surprising.
