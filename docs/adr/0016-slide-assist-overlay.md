# ADR-0016: Draggable slide-assist overlay

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
The 3D talk board is the audience surface. The presenter also needs a zoomable diagram that can appear over the world, then get out of the way without leaving the talk view.

## Decision
The talk view hosts one DOM assist overlay. Frame-drag moves it with inertia; a fast or far throw docks it off an edge with a peek tab. Image-drag pans and wheel zooms toward the cursor. Size, pose, dock, and per-slide view persist in `localStorage`. Images are local files in `public/assist/` named `1_*`, `2_*`, matching the 1-based waypoint.

## Consequences
Diagrams can be shown live and hidden off-stage. New slides need a matching file drop, then a rebuild so the glob sees them. The overlay is presenter chrome on the same page the audience sees.

## Alternatives considered
Speaker-notes tab only — safer for the room, useless when presenting from the talk window.
Fit-only images with no pan/zoom — too weak for a detailed diagram.
Remote/CMS assets — extra moving parts for a Pages-hosted talk.
