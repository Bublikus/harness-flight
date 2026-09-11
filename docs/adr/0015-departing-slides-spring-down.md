# ADR-0015: Departing world slides spring down

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0014 mounts one world-space board for the active slide and drives a damped upward spring on approach. Changing the slide index would unmount that board immediately, so the outgoing card vanished instead of reversing the same motion.

## Decision
Keep outgoing boards mounted until their downward spring settles, then unmount them. Incoming and outgoing cards can coexist; only the active index is raised.

## Consequences
Hops show the previous slide sinking as the next rises. Two textured boards can overlap for the length of the spring. Cards that have settled at rest and are no longer active leave the scene graph.

## Alternatives considered
Unmount on index change — instant pop that fights the approach rise.
Hide without unmounting — leftover textures stay in the scene graph after they are gone.
