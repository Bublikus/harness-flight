# ADR-0028: Terminus mountain framing

- Status: Accepted
- Date: 2026-09-12
- Deciders: this session

## Context
The valley mesh only spans `ROUTE_Z_MIN`…`ROUTE_Z_MAX` and soft side ridges. From the first and last checkpoints, looking back/out or past the arc ends showed flat bounds and empty sky instead of a closed world.

## Decision
`terrainHeight` raises modest hill bowls anchored on `ROUTE_START` / `ROUTE_END` (first and last checkpoint poses from `route.ts`). Soft rises sit behind the start and ahead of the end in path-local coordinates, plus light lateral mass near each terminus; the flight corridor stays open. Approach/end Z padding is widened so the bowls have depth. Scale stays hill-like on both ends (~block height ≤12 after caps) — enough to hide mesh edges, not towering walls. `out`/`side` and `padCurtain` are capped/softened so the longer end runout and angled end yaw cannot outgrow the start bowl; corridor ridges are damped under gate mass so terminus and mid-valley ridges do not double-stack. Mid-route corridor ridges stay as before — we do not wall the whole valley.

## Consequences
Start and end approaches read as matched enclosed hill gates rather than flat cutoffs (end no longer reads as a mountain wall). Birds and trees follow the raised heights automatically. Extra Z padding adds some mesh cost only at the termini.

## Alternatives considered
Sky/fog-only edge fade — still reads as a cut world when looking past a checkpoint.
Full-corridor cliff walls — kills the open valley flythrough.
Separate decorative meshes — second height source; easy to desync from the block terrain.
