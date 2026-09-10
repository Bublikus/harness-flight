# ADR-0004: Overlay HUD; dim the sign while flying

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
The first shipped talk needed readable copy, a countdown, and next/prev/pause without covering the whole sky. During hops the world should stay visible so the flight reads as motion, not a loading screen.

## Decision
Talk copy, meter, top bar, and controls are a DOM overlay (`Hud`) stacked on the canvas. While `flying`, the overlay uses `hud-dim` so the sign fades to ~35% opacity; chrome stays clickable-disabled. The 3D world has beacons and a plane only — no in-world copy.

## Consequences
Copy is always screen-aligned and easy to restyle. The sign fights the sky: it is a 2D card, not an object in the world. Checkout of the first presentation commit restores this version. Later work that puts copy on posts supersedes this ADR rather than editing this Decision.

## Alternatives considered
Hide the entire HUD in flight — copy vanishes mid-sentence; first version kept a dimmed card.
World-space HTML signs — deferred; more motion and occlusion work than the first drop needed.
Native 3D text meshes — poor typography for long bullets.
