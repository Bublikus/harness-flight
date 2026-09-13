export type Slide = {
  id: string
  era: string
  title: string
  lead: string
  points: string[]
  speakerNotes: string[]
}

export const SLIDES: Slide[] = [
  {
    id: 'takeoff',
    era: '01 · Takeoff',
    title: 'HARNESS',
    lead: 'The plane is the `agent`. You are the *chase cam*.',
    points: ['Twelve waypoints. You set the *pace*.'],
    speakerNotes: [
      'Open with the visual metaphor: an agent has speed and autonomy, but the operator still chooses the route.',
      'Set the contract for the room: this is a self-paced flight, so questions and pauses are welcome.',
      'Preview the destination: a practical operating system that makes agentic work repeatable and safe.',
    ],
  },
  {
    id: 'stone-age',
    era: '02 · 1995–2015',
    title: 'Search was the tool',
    lead: '*IntelliSense* guessed the next token. Seniors held the *map* in their heads.',
    points: ['Juniors paid a 30–50% tax just finding files.'],
    speakerNotes: [
      'Describe the old advantage as repository memory: knowing where to look mattered more than typing speed.',
      'The productivity gap was largely navigation and context acquisition, especially for newer teammates.',
      'Transition by asking what changed when tools began carrying part of that map for us.',
    ],
  },
  {
    id: 'inline',
    era: '03 · 2016–2021',
    title: 'The next 12 tokens',
    lead: '*Copilot* finished the line you were already thinking.',
    points: [
      'Lab: `+56%` on a 4-hour task. Real sprints: we count `~30%`.',
    ],
    speakerNotes: [
      'Separate completion from understanding: inline assistance accelerated code already designed in the developer’s head.',
      'Treat the lab result as an upper bound; interruptions, reviews, and ambiguous work reduce the gain in real delivery.',
      'The key limitation was scope: the tool could finish a line, but it could not own an outcome.',
    ],
  },
  {
    id: 'chat',
    era: '04 · 2022–2023',
    title: 'English became a compiler',
    lead: 'The bottleneck moved from typing to *specifying*.',
    points: ['*McKinsey*: `20–45%` of SE hours — if the work is clear.'],
    speakerNotes: [
      'Chat made intent executable, so precise problem framing became a core engineering skill.',
      'Emphasize the condition: vague work does not become clear just because the interface accepts English.',
      'This is the bridge from assistance to delegation—first describe, then verify.',
    ],
  },
  {
    id: 'agent',
    era: '05 · 2024–2026',
    title: 'Hands, not hints',
    lead: 'Files, terminal, browser, `MCP`. It can ship a *PR* — or drop production.',
    points: ['The question is no longer seats. It is the *operating system*.'],
    speakerNotes: [
      'List the new surface area briefly: agents can inspect, edit, execute, test, and call external systems.',
      'Capability raises both leverage and blast radius; model access alone is not a deployment strategy.',
      'Land the thesis: teams need guardrails, context routing, and verification around the model.',
    ],
  },
  {
    id: 'trap',
    era: '06 · The trap',
    title: '`1,564` lines of noise',
    lead: 'Every prompt swallowed both stacks and contradictory rules.',
    points: ['Score: `6.2`. Strong engine. Broken cockpit.'],
    speakerNotes: [
      'Use this as the anti-pattern: putting every instruction into every turn creates competition, not clarity.',
      'Contradictions become probabilistic behavior, while irrelevant context consumes attention and cost.',
      'The model was not the primary failure; the surrounding context architecture was.',
    ],
  },
  {
    id: 'harness',
    era: '07 · Cockpit',
    title: 'On-demand, not always-on',
    lead: '*Skills*, scoped rules, *hooks*, live tools — loaded when needed.',
    points: ['1,564 lines → `~90`. Score: `8.9`.'],
    speakerNotes: [
      'Explain the cockpit layers: rules set stable boundaries, skills carry workflows, hooks enforce invariants, and tools provide live facts.',
      'Context should arrive at the moment it is relevant and disappear when it is not.',
      'The improvement came from better routing and enforcement, not from a larger prompt.',
    ],
  },
  {
    id: 'pipeline',
    era: '08 · /ship',
    title: 'Eight locked doors',
    lead: '`/ship`: *Clarify* → *spec* → *build* → *test* → `ADR` → *review* → *commit* → *PR*.',
    points: ['*Red door*? It does not advance. You confirm the plan once.'],
    speakerNotes: [
      'Walk the pipeline as gates rather than suggestions: each stage produces evidence required by the next.',
      'Human approval belongs at consequential decisions, not as repeated permission for routine mechanics.',
      'No timer advances the workflow; readiness and verification do.',
    ],
  },
  {
    id: 'math',
    era: '09 · Company math',
    title: '`€432k` / year',
    lead: 'Squad of 8 · €1.08M loaded. Lab numbers, then a reality discount.',
    points: ['*Copilot* `€162k` → *agent* `€356k` → *harness* `€432k`. The extra is rework you stop buying.'],
    speakerNotes: [
      'State the assumptions before the headline: team size, loaded cost, observed gain, and a deliberate discount from lab conditions.',
      'The harness increment is not faster generation; it is avoided rework, safer delegation, and more consistent review.',
      'Invite the audience to replace the inputs with their own numbers rather than arguing over a universal percentage.',
    ],
  },
  {
    id: 'quality',
    era: '10 · Quality',
    title: 'Catch it while typing',
    lead: 'A production bug still costs `~100×` one caught in the editor.',
    points: ['*Lint* at edit. Tests fail then pass. Two extra catches/month ≈ `€14k`.'],
    speakerNotes: [
      'Frame quality as feedback distance: the earlier a defect is surfaced, the cheaper the context switch and repair.',
      'Agents should see lint and test failures while they can still revise the change, not after handing work to a reviewer.',
      'A small number of prevented escapes can justify the workflow even before counting speed.',
    ],
  },
  {
    id: 'compound',
    era: '11 · Memory',
    title: 'It outlives the chat',
    lead: '`learn`, `ADRs`, quarterly audit — the company keeps the lesson.',
    points: ['*Cheap* models do the typing. *Expensive* ones decide.'],
    speakerNotes: [
      'Chats are disposable; decisions, corrections, and operating knowledge should be durable and reviewable.',
      'ADRs preserve why, learning updates future behavior, and audits remove stale guidance.',
      'Route model spend by consequence: use stronger reasoning for decisions and economical execution for routine work.',
    ],
  },
  {
    id: 'landing',
    era: '12 · Landing',
    title: 'Monday: one ticket',
    lead: 'Run `/ship` on a real feature. That is the test.',
    points: ['The plane is built. Fly it.'],
    speakerNotes: [
      'Close with a bounded experiment, not a transformation program: choose one representative ticket next week.',
      'Measure cycle time, review load, defects, and where human judgment was still necessary.',
      'Ask for one owner and one retrospective; the goal is evidence the team can act on.',
    ],
  },
]

/** Last talk checkpoint — same pose as the extra sky-finale page. */
export const LAST_CHECKPOINT = SLIDES.length - 1
/** Extra pagination index after the last slide; not a 13th hop. */
export const FINALE_PAGE = SLIDES.length

export function waypointIndex(page: number) {
  return Math.min(page, LAST_CHECKPOINT)
}

export const FINALE: Slide = {
  id: 'finale',
  era: 'End',
  title: 'Your move',
  lead: 'The plane is the `agent`. You still pick the *route*.',
  points: ['`/ship`. Questions.'],
  speakerNotes: [
    'Hold for questions. The ask remains one real ticket through /ship.',
    'If energy is high, invite the first owner and the first retrospective date.',
  ],
}

export const WAYPOINT_SPACING = 58
