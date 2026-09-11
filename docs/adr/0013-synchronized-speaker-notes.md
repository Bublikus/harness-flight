# ADR-0013: Synchronized speaker notes

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
Presenters need private, readable guidance that follows the audience-facing waypoint without adding timers or burdening the Three.js flight view. The notes may be opened or reloaded after the presentation has already advanced, and either window may temporarily be unavailable.

## Decision
Serve a lightweight notes view from the existing Vite entry point under `?view=notes`, loaded through a separate dynamic import so it does not render or load the Three.js world. Pressing N on the talk view opens that window without retaining `window.opener`.

Synchronize slide indices and navigation commands over a same-origin `BroadcastChannel`. Mirror the current slide as a small timestamped `localStorage` snapshot, and use storage events as the transport fallback. The presentation publishes a heartbeat so the notes view can distinguish live synchronization from a saved or stale snapshot. Notes navigation remains entirely user-paced.

## Consequences
Late-opened and reloaded notes hydrate immediately, then converge on the live presentation state. Either tab can change slides, and no server, dependency, opener reference, or automatic progression is required. The views must share an origin, and browsers that disable both channel and storage features cannot synchronize.

## Alternatives considered
Use `window.opener` callbacks — couples window lifecycles and breaks with `noopener`.
Render notes over the presentation — exposes private notes and keeps the heavy scene active.
Add a synchronization package or server — unnecessary for same-origin tabs on one device.
