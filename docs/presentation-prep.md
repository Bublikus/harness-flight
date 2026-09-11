# Fly the Harness — Speaker Prep Binder

**Talk:** Fly the Harness · ~20 minutes editorial target (self-paced; app never enforces timing)  
**Live:** https://bublikus.github.io/harness-flight/  
**Source of truth:** `src/slides.ts` (12 waypoints + speaker notes)  
**This doc:** study / Q&A / stage briefing. Claims labeled **from the talk** are grounded in slides or notes. Claims labeled **extended context** are industry-common framing beyond what the deck asserts.

---

## 1. Executive thesis

**From the talk.** An agent is a plane with speed and autonomy; you are the chase cam that chooses the route. The industry moved from search → inline completion → chat → agents that can touch files, terminal, browser, and MCP — so the bottleneck is no longer seats or model access, but the **operating system around the model**: guardrails, on-demand context, verification gates, durable memory, and quality feedback while work is still cheap to fix. Dumping every rule into every prompt is a broken cockpit (1,564 lines → score 6.2). A harness loads skills, scoped rules, hooks, and live tools when needed (~90 lines → score 8.9), locks delivery behind eight gates (`/ship`), compounds lessons via learn / ADRs / audit, and turns agent capability into company math (€432k/year for the talk’s worked example) by stopping rework — not by generating tokens faster. Monday’s test: one real ticket through `/ship`.

**Title-screen contract (HUD):** *“Minecraft skies. Twelve waypoints. One operating system for the agent.”*

---

## 2. Talk arc / flight path (12 waypoints)

Use this section on stage. Each block: what the audience sees → what you say → takeaway.

### Waypoint 01 · Takeoff — **HARNESS**

| | |
|---|---|
| **Era** | 01 · Takeoff |
| **Lead** | The plane is the agent. You are the chase cam. |
| **On board** | Twelve waypoints. You set the pace. |
| **Core claim** | Operator chooses route; agent provides speed. This room is a self-paced flight. |
| **Talking points** | Open the metaphor. Welcome questions and pauses. Preview destination: a practical OS that makes agentic work repeatable and safe. |
| **Audience takeaway** | This is not “buy Copilot seats.” It is how you fly agents without crashing. |

### Waypoint 02 · 1995–2015 — **Search was the tool**

| | |
|---|---|
| **Lead** | IntelliSense guessed the next token. Seniors held the map in their heads. |
| **On board** | Juniors paid a 30–50% tax just finding files. |
| **Core claim** | Advantage was repository memory / navigation, not typing speed. |
| **Talking points** | Old productivity gap = context acquisition. Ask what changes when tools carry part of the map. |
| **Audience takeaway** | AI-in-editor history starts as a navigation tax story. |

### Waypoint 03 · 2016–2021 — **The next 12 tokens**

| | |
|---|---|
| **Lead** | Copilot finished the line you were already thinking. |
| **On board** | Lab: +56% on a 4-hour task. Real sprints: we count ~30%. |
| **Core claim** | Completion ≠ understanding; tool accelerated designed-in-head work. |
| **Talking points** | Lab = upper bound. Interrupts, reviews, ambiguity cut real gain. Could finish a line; could not own an outcome. |
| **Audience takeaway** | Inline help is acceleration of *your* plan, not delegation. |

### Waypoint 04 · 2022–2023 — **English became a compiler**

| | |
|---|---|
| **Lead** | The bottleneck moved from typing to specifying. |
| **On board** | McKinsey: 20–45% of SE hours — if the work is clear. |
| **Core claim** | Chat made intent executable; vague work stays vague. |
| **Talking points** | Precise framing is a core engineering skill. Bridge: describe → verify. |
| **Audience takeaway** | Spec quality is the new compile error. |

### Waypoint 05 · 2024–2026 — **Hands, not hints**

| | |
|---|---|
| **Lead** | Files, terminal, browser, MCP. It can ship a PR — or drop production. |
| **On board** | The question is no longer seats. It is the operating system. |
| **Core claim** | Capability raises leverage *and* blast radius; model access ≠ deployment strategy. |
| **Talking points** | Agents inspect, edit, execute, test, call externals. Thesis land: guardrails, context routing, verification around the model. |
| **Audience takeaway** | You need a harness, not more seats. |

### Waypoint 06 · The trap — **1,564 lines of noise**

| | |
|---|---|
| **Lead** | Every prompt swallowed both stacks and contradictory rules. |
| **On board** | Score: 6.2. Strong engine. Broken cockpit. |
| **Core claim** | Always-on mega-prompts create competition and cost, not clarity. Failure was context architecture, not the model. |
| **Talking points** | Contradictions → probabilistic behavior. Irrelevant context burns attention and money. |
| **Audience takeaway** | Bigger system prompt ≠ better agent. |

### Waypoint 07 · Cockpit — **On-demand, not always-on**

| | |
|---|---|
| **Lead** | Skills, scoped rules, hooks, live tools — loaded when needed. |
| **On board** | 1,564 lines → ~90. Score: 8.9. |
| **Core claim** | Cockpit layers + routing beat a larger prompt. |
| **Talking points** | Rules = stable boundaries. Skills = workflows. Hooks = invariants. Tools = live facts. Context arrives when relevant, leaves when not. |
| **Audience takeaway** | The harness is selective loading + enforcement. |

### Waypoint 08 · /ship — **Eight locked doors**

| | |
|---|---|
| **Lead** | Clarify → spec → build → test → ADR → review → commit → PR. |
| **On board** | Red door? It does not advance. You confirm the plan once. |
| **Core claim** | Gates produce evidence for the next stage; humans approve consequential decisions, not every mechanical step. |
| **Talking points** | Pipeline as locks, not suggestions. No timer advances work — readiness and verification do. |
| **Audience takeaway** | `/ship` is the delivery OS: evidence in, progress out. |

### Waypoint 09 · Company math — **€432k / year**

| | |
|---|---|
| **Lead** | Squad of 8 · €1.08M loaded. Lab numbers, then a reality discount. |
| **On board** | Copilot €162k → agent €356k → harness €432k. The extra is rework you stop buying. |
| **Core claim** | Harness value = avoided rework, safer delegation, consistent review — not faster generation. |
| **Talking points** | State assumptions first. Invite audience to plug in *their* numbers. |
| **Audience takeaway** | Argue inputs, not a universal %. Harness is the last increment that pays for quality. |

### Waypoint 10 · Quality — **Catch it while typing**

| | |
|---|---|
| **Lead** | A production bug still costs ~100× one caught in the editor. |
| **On board** | Lint at edit. Tests fail then pass. Two extra catches/month ≈ €14k. |
| **Core claim** | Feedback distance dominates cost; agents should see lint/test fail while they can still revise. |
| **Talking points** | Quality as early feedback. Small escape prevention can justify workflow before counting speed. |
| **Audience takeaway** | Close the loop in the editor, not in the postmortem. |

### Waypoint 11 · Memory — **It outlives the chat**

| | |
|---|---|
| **Lead** | learn, ADRs, quarterly audit — the company keeps the lesson. |
| **On board** | Cheap models do the typing. Expensive ones decide. |
| **Core claim** | Chats are disposable; decisions and operating knowledge must be durable and reviewable. |
| **Talking points** | ADRs preserve *why*. Learning updates future behavior. Audits remove stale guidance. Route spend by consequence. |
| **Audience takeaway** | Institutional memory is part of the harness. |

### Waypoint 12 · Landing — **Monday: one ticket**

| | |
|---|---|
| **Lead** | Run `/ship` on a real feature. That is the test. |
| **On board** | The plane is built. Fly it. |
| **Core claim** | Bounded experiment > transformation program. |
| **Talking points** | One ticket next week. Measure cycle time, review load, defects, where judgment still mattered. One owner, one retro, evidence the team can act on. |
| **Audience takeaway** | Leave with a Monday experiment, not a slide deck. |

---

## 3. Glossary (as used in this talk)

| Term | Meaning in this talk |
|---|---|
| **Harness** | The operating system around the agent: on-demand skills/rules/hooks/tools, gated delivery, quality loops, durable memory. Not the model itself. |
| **Agent / plane** | Model + tools that can act (files, terminal, browser, MCP) — speed and autonomy; can ship a PR or break production. |
| **Chase cam / you** | Human operator who sets route, confirms consequential plans, owns outcomes. |
| **Cockpit** | Layered control surface: rules, skills, hooks, live tools — vs always-on mega-prompt. |
| **Rules** | Stable boundaries / invariants that constrain behavior. |
| **Skills** | Packaged workflows loaded when the task needs them. |
| **Hooks** | Enforcement points that keep invariants true during the run. |
| **Live tools / MCP** | External/runtime facts and actions (not baked into a static prompt). |
| **Context routing** | Delivering the right context at the right moment; removing it when irrelevant. |
| **`/ship`** | Eight-gate delivery pipeline: clarify → spec → build → test → ADR → review → commit → PR. |
| **Locked doors / red door** | A stage that blocks advance until evidence exists; human confirms the plan once. |
| **Broken cockpit** | Mega-prompt that swallows stacks + contradictory rules (talk example: 1,564 lines, score 6.2). |
| **Score (6.2 / 8.9)** | Talk’s before/after quality signal for the same strong engine under bad vs good cockpit. Not a public benchmark name. |
| **Rework you stop buying** | Harness ROI beyond agent speed: fewer redo cycles, safer delegation, more consistent review. |
| **learn** | Mechanism that updates future agent/operator behavior from corrections (paired with ADRs and audit). |
| **ADR** | Architecture Decision Record — durable *why*; part of memory and of `/ship`. |
| **Quarterly audit** | Scheduled removal of stale guidance so memory does not rot. |
| **Feedback distance** | How far (in time/process) a defect travels before detection; shorter = cheaper. |
| **Waypoint** | One stop in the talk (and metaphorically one checkpoint in a campaign). |
| **Self-paced campaign** | Presenter controls advance; no autopilot timer (ADR-0009). |

**Extended context (not asserted by slides):** In industry usage, “agent harness” often also includes sandboxes, policy engines, eval suites, observability, and permission scopes. This talk emphasizes cockpit layers, `/ship` gates, quality-in-editor, and institutional memory — you can acknowledge the broader stack without claiming the deck covers every layer.

---

## 4. Architecture of a harness (from the slides)

### Layers (Waypoint 07)

```
┌─────────────────────────────────────────────┐
│                 Operator (chase cam)         │
│     route · plan confirmation · judgment     │
├─────────────────────────────────────────────┤
│  /ship gates (08)                            │
│  clarify → spec → build → test → ADR →       │
│  review → commit → PR                        │
├─────────────────────────────────────────────┤
│  Cockpit (07)                                │
│  rules │ skills │ hooks │ live tools/MCP     │
│  (on-demand load / unload)                   │
├─────────────────────────────────────────────┤
│  Quality loop (10)                           │
│  lint at edit · tests fail→pass              │
├─────────────────────────────────────────────┤
│  Memory (11)                                 │
│  learn · ADRs · quarterly audit              │
│  cheap models type · expensive decide        │
├─────────────────────────────────────────────┤
│  Model / agent runtime (05)                  │
│  files · terminal · browser · MCP            │
└─────────────────────────────────────────────┘
```

### How pieces connect (talk logic)

1. **Capability without OS** (05) → blast radius.
2. **Always-on prompt** (06) → noise, contradiction, cost.
3. **On-demand cockpit** (07) → smaller context, higher score.
4. **Gated pipeline** (08) → progress only with evidence; human at consequential doors.
5. **Math** (09) → value shows up as rework not purchased.
6. **Quality** (10) → defects die in the editor.
7. **Memory** (11) → lessons survive the chat window.
8. **Landing** (12) → prove on one Monday ticket.

### Product framing of *this* presentation app (meta)

The flight app *is* a tiny harness metaphor: user-paced progression, reversible hops, synced notes, assist diagrams on demand — not autopilot forcing the next slide (see ADR-0009, ADR-0013, ADR-0016).

---

## 5. Best practices & anti-patterns (called out in the talk)

### Best practices (**from the talk**)

- Load context **on demand**, not always-on (07).
- Separate **rules / skills / hooks / tools** by job (07).
- Treat delivery as **gates with evidence**, not vibes (08).
- Confirm the **plan once** at consequential moments; don’t rubber-stamp every mechanical step (08).
- Discount lab gains for real sprints (03, 09).
- Put **lint/tests** in the agent’s revision loop (10).
- Persist **why** (ADRs), update behavior (**learn**), prune (**audit**) (11).
- Route **model spend by consequence** (11).
- Start with **one real ticket**, measure, retro (12).

### Anti-patterns (**from the talk**)

- Mega-prompt that swallows both stacks and contradictory rules (06).
- Confusing **model strength** with **cockpit quality** (06: strong engine, broken cockpit).
- Buying **seats** instead of building an **OS** (05).
- Treating chat as magic that clarifies vague work (04).
- Advancing work on a **timer** instead of readiness (08 notes; mirrored by presentation ADR-0009).
- Letting chats be the only memory of decisions (11).
- Catching bugs only after production / late review when editor feedback was available (10).
- Launching a transformation program instead of a bounded experiment (12).

---

## 6. Comparisons & contrasts the talk makes

| Contrast | Talk position |
|---|---|
| **Model vs harness** | Engine can be strong while cockpit is broken (06 → 07). |
| **Seats vs operating system** | Question is no longer seats (05). |
| **Hints vs hands** | Inline completion vs agents that act (03 vs 05). |
| **Typing vs specifying** | Bottleneck moved to clear work (04). |
| **Completion vs understanding / ownership** | Finishing tokens ≠ owning outcomes (03). |
| **Always-on prompt vs on-demand cockpit** | 1,564 → ~90; 6.2 → 8.9 (06 → 07). |
| **Suggestions vs locked doors** | `/ship` gates block on red (08). |
| **Faster generation vs stopped rework** | Harness € increment is rework (09). |
| **Disposable chat vs company memory** | learn / ADR / audit (11). |
| **Cheap vs expensive models** | Typing vs deciding (11). |
| **Lab % vs reality discount** | +56% lab → ~30% real (03); apply discount in company math (09). |
| **Transformation vs Monday ticket** | One `/ship` feature is the test (12). |

---

## 7. Live demo / product notes (operate the presentation)

### What it is

Minecraft-style R3F flight talk: chase cam on a plane; twelve world waypoints; talk boards in world space; DOM HUD + assist overlay when presenting (ADR-0001, ADR-0014, ADR-0016).

### Start

- Title: **FLY THE HARNESS** — *A self-paced campaign*
- Start: **tap**, **Space**, or **↑**

### Audience / talk window controls

| Input | Effect |
|---|---|
| **↑** or **Space** | Start (if not started); else fly **forward** along current facing |
| **↓** | Fly **back** along facing axis (paginate reverse) |
| **←** | U-turn / return toward previous checkpoint (left bank) |
| **→** | U-turn / return (right bank) |
| **N** | Open speaker notes window (`?view=notes`) |
| Flight pad (on-screen) | Same intents: ↑ forward · ↓ back · ←/→ turn back |

**Important:** README still mentions “~95s per waypoint” and “P holds” — that is **stale**. ADR-0009 removed autopilot, countdown, and pause. **You set the pace.** Hops are interruptible; you can reverse mid-flight (ADR-0007, ADR-0010).

### Speaker notes (`?view=notes`)

- Open via **N** or manually append `?view=notes`.
- Syncs over same-origin `BroadcastChannel` + `localStorage` heartbeat/snapshot (ADR-0013).
- Status: Waiting / Saved snapshot / Live sync / Presentation unavailable.
- Notes keys: ←/PgUp previous · →/PgDn/Space next · Home/End first/last.
- Either window can navigate; hydrate works if notes open late.
- Shows current lead + speaker notes + “up next” preview.

### Assist overlay

- Draggable presenter diagram over the talk view (audience *can* see it — it is not private notes).
- Frame-drag moves; throw docks to edge with peek tab; image pan + wheel zoom.
- Pose/size/dock/per-slide view persist in `localStorage`.
- Images: `public/assist/1_*`, `2_*`, … (1-based waypoint). Currently only `.gitkeep` — drop assets before relying on them live; placeholder SVG shows “Drop N_*.png…” if missing.

### Stage checklist

1. Dual display or second window: talk fullscreen + notes on laptop.
2. Open notes early; confirm **Live sync**.
3. Practice ↑/↓ and a mid-hop ← reverse once.
4. Pre-position assist (docked) if using diagrams; do not surprise yourself hunting UI.
5. Budget ~20 minutes editorially; leave air for Q&A at 06–07 and 09–12.
6. Live URL backup: GitHub Pages; local `npm run dev` as fallback.

### Metaphor lines that land visually

- Plane = agent; chase cam = you (01).
- Beacons = waypoints / checkpoints.
- Red doors art on `/ship` (08) = blocked gates.
- Bar chart art on math (09); tree art on memory (11).

---

## 8. Q&A bank

Legend: **T** = answer grounded in talk · **E** = extended context (say so if you use it).

### A. Conceptual

**Q: What is a harness?**  
**T:** The operating system around the agent — on-demand skills, scoped rules, hooks, live tools, gated delivery, quality feedback, and memory that outlives chat — so agentic work is repeatable and safe (01, 07, 08, 10, 11).

**Q: Isn’t that just “good prompts”?**  
**T:** No. The trap was every turn swallowing stacks and contradictory rules (06). The fix was routing and enforcement, not a larger prompt (07: 1,564 → ~90).

**Q: How is a harness different from the model?**  
**T:** Strong engine + broken cockpit scored 6.2; same story after cockpit redesign scored 8.9 (06–07). Model access alone is not a deployment strategy (05).

**Q: What problem does it solve?**  
**T:** Agents can ship a PR or drop production (05). Without guardrails, context routing, and verification, leverage becomes blast radius.

**Q: Why the plane metaphor?**  
**T:** Agent has speed/autonomy; operator still chooses the route (01). You are the chase cam.

**Q: What is `/ship`?**  
**T:** Eight locked doors: clarify → spec → build → test → ADR → review → commit → PR. Red door does not advance; you confirm the plan once (08).

**Q: Skills vs rules vs hooks vs tools?**  
**T:** Rules = stable boundaries; skills = workflows; hooks = enforce invariants; tools = live facts — loaded when needed (07 notes).

**E (only if asked to map to Cursor/ecosystem):** Rules ≈ persistent project constraints; skills ≈ reusable playbooks; hooks ≈ automated checks on events; MCP/tools ≈ live integrations. Keep labeled as mapping, not slide text.

---

### B. Practical — how do I build one?

**Q: Where do we start Monday?**  
**T:** One real feature through `/ship`. Measure cycle time, review load, defects, where human judgment was still required. One owner, one retro (12).

**Q: Do we need to rewrite all prompts first?**  
**T:** Start by deleting always-on noise and loading context on demand (06→07). Then lock delivery behind gates (08).

**Q: How much process is too much?**  
**T:** Human approval at consequential decisions, not repeated permission for routine mechanics (08). Gates produce evidence; they should not become theater.

**Q: What do we measure?**  
**T:** From landing notes: cycle time, review load, defects, judgment moments. From math: replace talk inputs with your loaded cost and observed gains (09, 12). From quality: escapes caught earlier (10).

**Q: How do we avoid mega-prompt relapse?**  
**T:** On-demand load; quarterly audit to remove stale guidance (07, 11).

**Q: What about ADRs — more paperwork?**  
**T:** ADR is a locked door in `/ship` and the durable *why* in memory (08, 11). Chats are disposable; decisions should not be.

**E:** Common build order many teams use: (1) permissions/sandbox, (2) thin always-on rules, (3) skills for top workflows, (4) CI/hooks as gates, (5) evals on golden tasks, (6) memory/ADR hygiene. Not claimed by this deck — offer as optional roadmap.

---

### C. Organizational / ROI

**Q: What’s the €432k number?**  
**T:** Worked example: squad of 8, €1.08M loaded cost; lab numbers with a reality discount. Stack: Copilot €162k → agent €356k → harness €432k. Harness extra = rework you stop buying (09).

**Q: Are those universal savings?**  
**T:** No. State assumptions; invite the room to plug in their numbers (09 notes).

**Q: Why isn’t “more agent” enough?**  
**T:** Agent gets you to €356k in the example; harness adds the rest via rework, safer delegation, consistent review — not faster generation (09).

**Q: Who owns the harness?**  
**T:** Landing asks for one owner and one retrospective (12).  
**E:** In practice: platform/DX often owns shared rules/skills/hooks; squads own workflow skills and ADRs; security owns permissions. Say this is org design beyond the talk.

**Q: How do we justify to finance?**  
**T:** Quality slide: production bug ~100× editor catch; two extra catches/month ≈ €14k — can justify before counting speed (10). Plus company math framing (09).

**Q: Will this replace headcount?**  
**T:** Talk frames OS for agentic work and rework reduction, not headcount cuts. Stay with: leverage + safety + quality; Monday experiment produces evidence (05, 09, 12).  
**E:** Avoid promising FTE reduction unless your org has separate data.

**Q: Change management?**  
**T:** Bounded experiment beats transformation program (12). Self-paced culture mirrors the talk: no timer forces fake progress (08 notes / ADR-0009 as analogy).

---

### D. Technical deep-dives

**Q: What tools does the agent get?**  
**T:** Files, terminal, browser, MCP; inspect, edit, execute, test, external systems (05).

**Q: Why MCP?**  
**T:** Named as part of the agent surface (05); live tools provide facts not frozen in prompts (07).  
**E:** MCP = protocol for connecting tools/data to agents; reduces one-off integrations. Don’t invent product promises.

**Q: How do hooks differ from CI?**  
**T:** Talk: hooks enforce invariants during agent work (07).  
**E:** Overlap is real — many teams use pre-commit/CI as the “red door.” You can say harness wants the fail **while the agent can still revise** (10), which may be earlier than PR CI alone.

**Q: Cheap vs expensive models?**  
**T:** Cheap models do the typing; expensive ones decide (11). Route spend by consequence.

**Q: How do you get 1,564 → ~90?**  
**T:** Stop stuffing every instruction every turn; load skills/rules/hooks/tools when needed (06–07). Improvement from routing/enforcement, not a larger prompt.

**Q: What is the “score”?**  
**T:** Talk’s before/after signal (6.2 → 8.9). Treat as internal illustration of cockpit quality, not a named public benchmark — if pressed, say it’s the talk’s quality score for that harness redesign anecdote.

**Q: Eval strategy?**  
**E:** Not a dedicated slide. Safe bridge: `/ship` gates and fail→pass tests (08, 10) are runtime verification; offline evals are extended practice. “Here’s how we’d find out: golden tickets through `/ship`, track red-door rates and escapes.”

**Q: Multi-agent?**  
**E:** Not covered. Safe: talk is single-operator chase cam + one agent plane; multi-agent needs the same OS — clearer contracts and more doors, not less.

---

### E. Skeptical / pushback

**Q: “This is just waterfall with extra steps.”**  
**T:** Gates are evidence locks so a capable agent doesn’t skip verification; human confirms the plan once, not every keystroke (08). Monday test keeps it empirical (12).

**Q: “Our model is fine; we don’t need this.”**  
**T:** Strong engine, broken cockpit (06). Capability without OS is the risk (05).

**Q: “Lab numbers are marketing.”**  
**T:** Agree in spirit — talk already discounts: +56% lab → ~30% real (03); company math says lab then reality discount (09).

**Q: “English as compiler means PMs write code now.”**  
**T:** Bottleneck moved to specifying; vague work does not become clear because the UI accepts English (04). Still describe → verify.

**Q: “Agents will replace seniors.”**  
**T:** Seniors historically held the map (02); agents raise blast radius (05); chase cam still chooses the route (01). Memory/ADRs institutionalize senior judgment (11).

**Q: “€432k feels made up.”**  
**T:** It’s a worked example with stated inputs; replace with yours (09). Point to quality €14k vignette as smaller, falsifiable wedge (10).

**Q: “We tried Copilot and only got autocomplete.”**  
**T:** That’s waypoint 03 — next 12 tokens, not outcome ownership. Hands-not-hints is a different surface (05) and needs a harness (07–08).

**Q: “Too much process will kill speed.”**  
**T:** Harness value is rework you stop buying (09). Catching bugs while typing is cheaper than production (10). Red doors prevent advancing unfinished work, which is false speed.

**Q: “Show me the harness codebase.”**  
**T:** This repo is the *talk* about the harness (flight campaign), not the production agent OS. Point to `/ship` stages and cockpit layers as the spec (07–08); offer Monday ticket as the proof in *their* repo (12).

---

### F. Cursor / agents / ecosystem

**Q: Is this a Cursor sales talk?**  
**T:** README frames history of AI-in-the-editor, the Cursor Harness, and company math. The thesis is the OS around the agent (title HUD, 05–08). Stay on operating practice; don’t invent pricing/roadmap claims.

**Q: How does this map to Cursor features?**  
**E (mapping):** Rules ≈ project/user rules; Skills ≈ skill docs/workflows; Hooks ≈ agent hooks; MCP ≈ tools; `/ship`-like flows ≈ commanded multi-step workflows; ADRs/learn ≈ durable repo knowledge. Label as mapping.

**Q: What about ChatGPT / Claude / other IDEs?**  
**T:** History arc is tool-era agnostic through chat/agents (02–05). Harness principles (on-demand context, gates, memory, quality loop) travel; product names are illustrations.

**Q: MCP security?**  
**T:** Talk flags blast radius (05).  
**E:** Treat MCP servers like production integrations: least privilege, review, logging. Honesty: deep security architecture is outside this deck.

**Q: Will the model just ignore the harness?**  
**T:** Hooks + red doors + tests/lint in the loop exist to enforce, not merely suggest (07, 08, 10). Mega-prompts without enforcement were the failure mode (06).

---

## 9. Gaps & honesty

### What this talk does **not** cover (say so cleanly)

- Detailed security/threat model, sandboxing, secret handling  
- Formal eval harness design, offline benchmarks, statistical significance  
- Multi-agent orchestration topologies  
- Vendor pricing, contracts, or Cursor roadmap  
- Org design / RACI beyond “one owner, one retro”  
- Exact methodology behind 6.2 / 8.9 scores or the € model micro-assumptions beyond what’s on the slides  
- Accessibility / regulated-industry compliance specifics  
- How to migrate a 10-year monorepo in one quarter  

### Safe lines

- “That’s outside this flight path — here’s the principle from the talk, and how we’d learn the rest on one Monday ticket.”  
- “I won’t defend a universal percentage; plug in your loaded cost and measured gain.”  
- “The score is our cockpit anecdote, not a public leaderboard.”  
- “This presentation is the campaign; your repo is the proof.”  
- “I don’t know that number off-stage — we’d instrument red-door rates and escaped defects for two sprints and report back.”

### Numbers cheat (memorize sources)

| Figure | Slide | Caveat to voice |
|---|---|---|
| Juniors 30–50% file-finding tax | 02 | Historical navigation tax |
| Lab +56% / real ~30% | 03 | Lab upper bound |
| McKinsey 20–45% SE hours if clear | 04 | Conditional on clear work |
| 1,564 lines · score 6.2 | 06 | Broken cockpit anecdote |
| ~90 lines · score 8.9 | 07 | After on-demand cockpit |
| 8 doors in `/ship` | 08 | Gates, not suggestions |
| Squad 8 · €1.08M loaded | 09 | Stated assumptions |
| €162k → €356k → €432k | 09 | Copilot → agent → harness |
| ~100× prod vs editor | 10 | Classic cost-of-defect framing |
| 2 catches/mo ≈ €14k | 10 | Illustrative |
| Cheap type / expensive decide | 11 | Spend routing |

---

## 10. Suggested timing (editorial; not enforced by app)

| Block | Waypoints | ~min | Notes |
|---|---|---|---|
| Open + history | 01–04 | 5–6 | Keep stone-age brisk |
| Agent thesis | 05 | 1.5–2 | Land “operating system” |
| Trap → cockpit | 06–07 | 3–4 | Highest conceptual payload |
| `/ship` | 08 | 2 | Walk the eight doors |
| Math + quality | 09–10 | 3–4 | Invite their numbers |
| Memory + Monday | 11–12 | 2–3 | Close with CTA |
| Buffer / Q&A | — | rest | Prefer questions after 07 or 12 |

Total target ~20 minutes talking; self-pace for the room.

---

## 11. One-page cheat sheet (memorize)

**Thesis:** Plane = agent, you = chase cam. Problem isn’t seats — it’s the OS around the model.

**Arc:** Search tax → next-12-tokens → English compiler → hands/MCP → trap (1564/6.2) → cockpit on-demand (~90/8.9) → eight `/ship` doors → €432k via less rework → catch bugs while typing → memory outlives chat → Monday one ticket.

**Cockpit:** rules · skills · hooks · live tools — load when needed.

**`/ship`:** clarify → spec → build → test → ADR → review → commit → PR. Red = stop. Confirm plan once.

**Math line:** Copilot €162k → agent €356k → harness €432k (squad 8, €1.08M loaded; *your* inputs).

**Quality line:** ~100×; lint/tests in the agent loop; 2 catches/mo ≈ €14k.

**Memory line:** learn · ADRs · quarterly audit. Cheap types, expensive decides.

**Close:** Run `/ship` on one real feature. One owner. One retro. Fly it.

**Controls:** Space/↑ forward · ↓ back · ←/→ U-turn · N notes · no autopilot.

**Pushback:** Strong engine ≠ good cockpit. Lab ≠ reality. Harness buys rework you stop paying for.

**Honesty:** “Not on this flight path — Monday ticket is how we find out.”

---

## Appendix A — Full speaker notes (verbatim from `slides.ts`)

1. **HARNESS** — Open with the visual metaphor: an agent has speed and autonomy, but the operator still chooses the route. Set the contract for the room: this is a self-paced flight, so questions and pauses are welcome. Preview the destination: a practical operating system that makes agentic work repeatable and safe.

2. **Search was the tool** — Describe the old advantage as repository memory: knowing where to look mattered more than typing speed. The productivity gap was largely navigation and context acquisition, especially for newer teammates. Transition by asking what changed when tools began carrying part of that map for us.

3. **The next 12 tokens** — Separate completion from understanding: inline assistance accelerated code already designed in the developer’s head. Treat the lab result as an upper bound; interruptions, reviews, and ambiguous work reduce the gain in real delivery. The key limitation was scope: the tool could finish a line, but it could not own an outcome.

4. **English became a compiler** — Chat made intent executable, so precise problem framing became a core engineering skill. Emphasize the condition: vague work does not become clear just because the interface accepts English. This is the bridge from assistance to delegation—first describe, then verify.

5. **Hands, not hints** — List the new surface area briefly: agents can inspect, edit, execute, test, and call external systems. Capability raises both leverage and blast radius; model access alone is not a deployment strategy. Land the thesis: teams need guardrails, context routing, and verification around the model.

6. **1,564 lines of noise** — Use this as the anti-pattern: putting every instruction into every turn creates competition, not clarity. Contradictions become probabilistic behavior, while irrelevant context consumes attention and cost. The model was not the primary failure; the surrounding context architecture was.

7. **On-demand, not always-on** — Explain the cockpit layers: rules set stable boundaries, skills carry workflows, hooks enforce invariants, and tools provide live facts. Context should arrive at the moment it is relevant and disappear when it is not. The improvement came from better routing and enforcement, not from a larger prompt.

8. **Eight locked doors** — Walk the pipeline as gates rather than suggestions: each stage produces evidence required by the next. Human approval belongs at consequential decisions, not as repeated permission for routine mechanics. No timer advances the workflow; readiness and verification do.

9. **€432k / year** — State the assumptions before the headline: team size, loaded cost, observed gain, and a deliberate discount from lab conditions. The harness increment is not faster generation; it is avoided rework, safer delegation, and more consistent review. Invite the audience to replace the inputs with their own numbers rather than arguing over a universal percentage.

10. **Catch it while typing** — Frame quality as feedback distance: the earlier a defect is surfaced, the cheaper the context switch and repair. Agents should see lint and test failures while they can still revise the change, not after handing work to a reviewer. A small number of prevented escapes can justify the workflow even before counting speed.

11. **It outlives the chat** — Chats are disposable; decisions, corrections, and operating knowledge should be durable and reviewable. ADRs preserve why, learning updates future behavior, and audits remove stale guidance. Route model spend by consequence: use stronger reasoning for decisions and economical execution for routine work.

12. **Monday: one ticket** — Close with a bounded experiment, not a transformation program: choose one representative ticket next week. Measure cycle time, review load, defects, and where human judgment was still necessary. Ask for one owner and one retrospective; the goal is evidence the team can act on.

---

## Appendix B — Repo map for last-minute edits

| Need | Where |
|---|---|
| Slide copy / notes | `src/slides.ts` |
| Title HUD thesis | `src/Hud.tsx` → `TitleScreen` |
| Controls | `src/App.tsx` |
| Notes UI | `src/NotesApp.tsx` · `?view=notes` |
| Assist images | `public/assist/N_*` |
| Product decisions | `docs/adr/*` |
| Live deploy | ADR-0003 · README URL |

---

*End of binder. Print §11 for your pocket; keep §8 open on the notes machine during Q&A.*
