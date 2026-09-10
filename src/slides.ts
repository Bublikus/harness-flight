export type Slide = {
  id: string
  era: string
  title: string
  lead: string
  points: string[]
  durationSec: number
}

/** 12 waypoints × ~95s ≈ 19 min, plus takeoff/landing ≈ 20 min. */
export const SLIDES: Slide[] = [
  {
    id: 'takeoff',
    era: '01 · Takeoff',
    title: 'HARNESS',
    lead: 'The plane is the agent. You are the chase cam.',
    points: ['Twelve waypoints. Space skips. P holds.'],
    durationSec: 90,
  },
  {
    id: 'stone-age',
    era: '02 · 1995–2015',
    title: 'Search was the tool',
    lead: 'IntelliSense guessed the next token. Seniors held the map in their heads.',
    points: ['Juniors paid a 30–50% tax just finding files.'],
    durationSec: 100,
  },
  {
    id: 'inline',
    era: '03 · 2016–2021',
    title: 'The next 12 tokens',
    lead: 'Copilot finished the line you were already thinking.',
    points: [
      'Lab: +56% on a 4-hour task. Real sprints: we count ~30%.',
    ],
    durationSec: 110,
  },
  {
    id: 'chat',
    era: '04 · 2022–2023',
    title: 'English became a compiler',
    lead: 'The bottleneck moved from typing to specifying.',
    points: ['McKinsey: 20–45% of SE hours — if the work is clear.'],
    durationSec: 100,
  },
  {
    id: 'agent',
    era: '05 · 2024–2026',
    title: 'Hands, not hints',
    lead: 'Files, terminal, browser, MCP. It can ship a PR — or drop production.',
    points: ['The question is no longer seats. It is the operating system.'],
    durationSec: 95,
  },
  {
    id: 'trap',
    era: '06 · The trap',
    title: '1,564 lines of noise',
    lead: 'Every prompt swallowed both stacks and contradictory rules.',
    points: ['Score: 6.2. Strong engine. Broken cockpit.'],
    durationSec: 95,
  },
  {
    id: 'harness',
    era: '07 · Cockpit',
    title: 'On-demand, not always-on',
    lead: 'Skills, scoped rules, hooks, live tools — loaded when needed.',
    points: ['1,564 lines → ~90. Score: 8.9.'],
    durationSec: 110,
  },
  {
    id: 'pipeline',
    era: '08 · /ship',
    title: 'Eight locked doors',
    lead: 'Clarify → spec → build → test → ADR → review → commit → PR.',
    points: ['Red door? It does not advance. You confirm the plan once.'],
    durationSec: 95,
  },
  {
    id: 'math',
    era: '09 · Company math',
    title: '€432k / year',
    lead: 'Squad of 8 · €1.08M loaded. Lab numbers, then a reality discount.',
    points: ['Copilot €162k → agent €356k → harness €432k. The extra is rework you stop buying.'],
    durationSec: 120,
  },
  {
    id: 'quality',
    era: '10 · Quality',
    title: 'Catch it while typing',
    lead: 'A production bug still costs ~100× one caught in the editor.',
    points: ['Lint at edit. Tests fail then pass. Two extra catches/month ≈ €14k.'],
    durationSec: 100,
  },
  {
    id: 'compound',
    era: '11 · Memory',
    title: 'It outlives the chat',
    lead: 'learn, ADRs, quarterly audit — the company keeps the lesson.',
    points: ['Cheap models do the typing. Expensive ones decide.'],
    durationSec: 90,
  },
  {
    id: 'landing',
    era: '12 · Landing',
    title: 'Monday: one ticket',
    lead: 'Run /ship on a real feature. That is the test.',
    points: ['The plane is built. Fly it.'],
    durationSec: 95,
  },
]

export const TOTAL_SEC = SLIDES.reduce((s, x) => s + x.durationSec, 0)
export const WAYPOINT_SPACING = 58
