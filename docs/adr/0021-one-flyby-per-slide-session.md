# ADR-0021: One corridor flyby per slide session

- Status: Accepted
- Date: 2026-09-11
- Deciders: this session

## Context
ADR-0019 scheduled a corridor pass ~once every 5s whenever the board was up. After a Bezier finished, the bird was often still in the plane–slide gap; the next pick, or plane/slide repulsion, sent it back through the same air — a loop in front of the plane. The good single front-of-board pass should stay; repeating it on one checkpoint should not.

## Decision
`WorldSlide` publishes the active waypoint `index` on `slidePose`. While that index is unchanged, `Birds` initiates at most one corridor flyby. Pagination (index change) resets the allowance and each agent’s `flybySpent` flag. Selection skips `flybySpent` birds and anyone still inside the corridor volume. On curve complete, the bird gets a one-way outbound heading (board-lateral + up + away from the plane/slide mid, chord component stripped) and is marked spent. If a flying agent dwells in the gap >~1.5s or reverses along the corridor axis, the same outbound eject applies — continuous, no teleport. The ~5s cooldown remains only as a retry delay.

## Consequences
Each parked checkpoint gets one front pass, then wildlife leaves the view. Trap eject can also clear wanderers that never flew the scripted curve. Index is a module field on `slidePose` (same one-way pose coupling as ADR-0019). Extends ADR-0018; supersedes ADR-0019’s rate-limit schedule.

## Alternatives considered
Cooldown-only after a flyby — still re-picks a bird left in the gap, and wanderers still ping-pong.
Watch slide-pose jumps instead of index — works, but `slidePose.index` is already published each frame.
React context / `Birds` prop for index — heavier than one number on the existing pose ref.
Teleport out of the corridor — visible pop; violates the no-teleport bird contract.
