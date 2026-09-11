# ADR-0014: World-space slide surface

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0011 animates the slide as a fixed DOM overlay. That keeps copy readable, but it cannot participate in camera perspective or WebGL depth, so the plane can never pass in front of the card. Earlier full-size HTML signs also scaled into the camera and obscured the scene.

## Decision
Render the active slide into a bounded CanvasTexture on a 16 by 7.5 world-unit Three.js board. Place the board just beyond the destination checkpoint, orient its front toward the incoming route, and use the normal depth buffer so the plane, checkpoint, and terrain can occlude it.

Keep the slide hidden during cruise. The existing final-approach signal mounts it near the ground behind the checkpoint and drives a damped upward spring; it remains in place while parked. Clamp responsive world scaling between 0.46 and 1 so narrow viewports remain readable without allowing the board to fill the camera.

## Consequences
The slide gains real perspective and parallax, and intersections with the plane have correct depth. Slide copy and pixel art share the existing typed content, but DOM selection and browser-native text accessibility are not available on the WebGL surface. Texture resolution and bounded scaling must be maintained when the card layout changes.

## Alternatives considered
Use transformed drei Html with blending occlusion — still couples sizing and compositing to DOM/CSS and can regress into a camera-filling overlay.
Keep ADR-0011's overlay — cannot provide world perspective or plane occlusion.
Model text and art as individual meshes — adds substantial geometry and layout complexity without improving this static presentation.
