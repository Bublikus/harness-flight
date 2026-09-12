# ADR-0026: Irregular route; hops follow the polyline

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
ADR-0025 made the valley a seeded polyline but used alternating S-bends (periodic cadence) and kept hop chords that cut inside curves. The road looked stamped, and the plane ignored the ground line it was supposed to sell.

## Decision
`src/scene/route.ts` stays the single XZ source of truth. Bends are seeded (`20260912`) with irregular side, amplitude, curve length, and 1–3 turns per hop — not an alternating sine. Checkpoints still sit `AFTER_TURN` onto a landing straight, yaw from that tangent. Flight chases a look-ahead on the polyline (remaining arc, not the chord). The plane still flies along its nose (ADR-0007): short-arc yaw, interruptible U-turn via `turnDirection`, capture/wind-bank unchanged. Roll adds path curvature (`kappa`) on top of turn-rate bank.

## Consequences
The valley does not repeat. Hops stay in the river corridor and lean into bends. Reverse hops follow the path backward. Chord shortcuts are gone; a long bend takes longer than the old straight-line hop.

## Alternatives considered
Keep chord hops — plane crosses ridges and sells a straight world.
Follow a spline with teleported s — pops; fights ADR-0007’s nose-along-velocity.
Regular sine meander — readable, obviously fake.
