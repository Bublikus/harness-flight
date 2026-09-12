import { SLIDES, WAYPOINT_SPACING } from '../slides'

/** Stable talk layout — refresh does not reshuffle the valley. */
export const ROUTE_SEED = 20260912
/** Typical |Δx| of a bend; actual swings vary widely around this. */
export const ROUTE_AMPLITUDE = 30
/** Nominal hop length — spacing is irregular, not a period. */
export const ROUTE_WAVELENGTH = WAYPOINT_SPACING

export type WaypointPose = { x: number; y: number; z: number; yaw: number; s: number }
export type PathSample = { x: number; z: number; yaw: number; s: number; kappa: number }

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function wrapPi(a: number) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

const START_Z = 8
const AFTER_TURN = 8
const TAIL = 24
/** Extra Z behind start / past end for terminus hill mass (ADR-0028). */
const APPROACH = 32
const END_PAD = 32
const VALLEY_W = 22

function altitude(i: number) {
  return 11.5 + Math.sin(i * 0.45) * 1.4
}

function build() {
  const rnd = mulberry32(ROUTE_SEED)
  const poses: WaypointPose[] = []
  const frames: PathSample[] = []
  let x = 0
  let z = START_Z
  let yaw = 0
  let s = 0
  let lastSide = 0
  let streak = 0

  const stamp = () => {
    frames.push({ x, z, yaw, s, kappa: 0 })
  }
  const step = (ds: number) => {
    x += Math.sin(yaw) * ds
    z += Math.cos(yaw) * ds
    s += ds
    stamp()
  }
  const record = (i: number) => {
    poses.push({ x, y: altitude(i), z, yaw, s })
  }

  stamp()
  record(0)
  for (let i = 0; i < 12; i++) step(1)

  for (let i = 1; i < SLIDES.length; i++) {
    const bends = 1 + ((rnd() * 3) | 0)
    for (let b = 0; b < bends; b++) {
      let side = rnd() < 0.5 ? 1 : -1
      if (Math.abs(x) > 36 && Math.sign(x) === side) side = -side
      if (streak >= 2 && side === lastSide) side = -side
      if (side === lastSide) streak++
      else {
        lastSide = side
        streak = 1
      }
      const amp = ROUTE_AMPLITUDE * (0.28 + rnd() * 1.05)
      const destX = x + side * amp
      const curveLen = 16 + ((rnd() * 30) | 0)
      const cap = 0.42 + rnd() * 0.38
      const target = Math.asin(
        Math.max(-cap, Math.min(cap, (destX - x) / Math.max(curveLen, 1))),
      )
      const yaw0 = yaw
      for (let d = 0; d < curveLen; d++) {
        const t = (d + 0.5) / curveLen
        const e = t * t * (3 - 2 * t)
        yaw = yaw0 + (target - yaw0) * e
        step(1)
      }
      yaw = target
      if (b < bends - 1) {
        const roam = 3 + ((rnd() * 16) | 0)
        for (let d = 0; d < roam; d++) step(1)
      }
    }
    for (let d = 0; d < AFTER_TURN; d++) step(1)
    record(i)
    const rest = 12 + ((rnd() * 16) | 0)
    for (let d = 0; d < rest; d++) step(1)
  }
  for (let i = 0; i < TAIL; i++) step(1)

  for (let i = 0; i < frames.length; i++) {
    const a = frames[Math.max(0, i - 1)]
    const b = frames[Math.min(frames.length - 1, i + 1)]
    const ds = Math.max(1e-4, b.s - a.s)
    frames[i].kappa = wrapPi(b.yaw - a.yaw) / ds
  }

  return { poses, frames }
}

const { poses: WAYPOINTS, frames: FRAMES } = build()

let minX = 0
let maxX = 0
let maxZ = START_Z
for (const f of FRAMES) {
  if (f.x < minX) minX = f.x
  if (f.x > maxX) maxX = f.x
  if (f.z > maxZ) maxZ = f.z
}

export const ROUTE_X_MIN = Math.floor(minX) - VALLEY_W
export const ROUTE_X_MAX = Math.ceil(maxX) + VALLEY_W
export const ROUTE_Z_MIN = -APPROACH
export const ROUTE_Z_MAX = Math.ceil(maxZ) + END_PAD
export const ROUTE_VALLEY = 17
export const PATH_LENGTH = FRAMES[FRAMES.length - 1].s

const first = WAYPOINTS[0]
const lastWp = WAYPOINTS[WAYPOINTS.length - 1]
/** First / last checkpoint poses — terminus hill anchors (ADR-0028). */
export const ROUTE_START = { x: first.x, z: first.z, yaw: first.yaw }
export const ROUTE_END = { x: lastWp.x, z: lastWp.z, yaw: lastWp.yaw }
/** Firework cluster past the end terminus (ADR-0033). Along ≫ rim so trails hide behind hills; Y ≈ max rocket rise. */
export const FINALE_SKY = {
  x: lastWp.x + Math.sin(lastWp.yaw) * 80,
  y: lastWp.y + 27,
  z: lastWp.z + Math.cos(lastWp.yaw) * 80,
}

function frameAtZ(z: number): { x: number; yaw: number } {
  if (z <= START_Z) return { x: 0, yaw: 0 }
  const last = FRAMES[FRAMES.length - 1]
  if (z >= last.z) {
    return { x: last.x + Math.tan(last.yaw) * (z - last.z), yaw: last.yaw }
  }
  let lo = 0
  let hi = FRAMES.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (FRAMES[mid].z <= z) lo = mid
    else hi = mid
  }
  const a = FRAMES[lo]
  const b = FRAMES[hi]
  const t = (z - a.z) / Math.max(1e-6, b.z - a.z)
  return { x: a.x + (b.x - a.x) * t, yaw: a.yaw + (b.yaw - a.yaw) * t }
}

const tableLen = ROUTE_Z_MAX - ROUTE_Z_MIN + 1
const tableX = new Float64Array(tableLen)
const tableYaw = new Float64Array(tableLen)
for (let i = 0; i < tableLen; i++) {
  const f = frameAtZ(ROUTE_Z_MIN + i)
  tableX[i] = f.x
  tableYaw[i] = f.yaw
}

function lookup(table: Float64Array, z: number) {
  const u = z - ROUTE_Z_MIN
  if (u <= 0) return table[0]
  if (u >= table.length - 1) return table[table.length - 1]
  const i = u | 0
  return table[i] + (table[i + 1] - table[i]) * (u - i)
}

export function pathX(z: number) {
  return lookup(tableX, z)
}

export function pathYaw(z: number) {
  return lookup(tableYaw, z)
}

export function pathLateral(x: number, z: number) {
  return x - pathX(z)
}

function indexAtS(s: number) {
  if (s <= FRAMES[0].s) return 0
  if (s >= FRAMES[FRAMES.length - 1].s) return FRAMES.length - 1
  let lo = 0
  let hi = FRAMES.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (FRAMES[mid].s <= s) lo = mid
    else hi = mid
  }
  return lo
}

export function pathAt(s: number): PathSample {
  const i = indexAtS(s)
  const a = FRAMES[i]
  const b = FRAMES[Math.min(FRAMES.length - 1, i + 1)]
  const t = (s - a.s) / Math.max(1e-6, b.s - a.s)
  const u = Math.max(0, Math.min(1, t))
  return {
    x: a.x + (b.x - a.x) * u,
    z: a.z + (b.z - a.z) * u,
    yaw: a.yaw + (b.yaw - a.yaw) * u,
    s: a.s + (b.s - a.s) * u,
    kappa: a.kappa + (b.kappa - a.kappa) * u,
  }
}

export function nearestPath(x: number, z: number, hintS?: number): PathSample {
  const hint = hintS == null ? -1 : indexAtS(hintS)
  const lo = hint < 0 ? 0 : Math.max(0, hint - 48)
  const hi = hint < 0 ? FRAMES.length - 1 : Math.min(FRAMES.length - 1, hint + 48)
  let best = lo
  let bestD = Infinity
  for (let i = lo; i <= hi; i++) {
    const f = FRAMES[i]
    const d = (f.x - x) * (f.x - x) + (f.z - z) * (f.z - z)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return FRAMES[best]
}

export function waypointPose(i: number): WaypointPose {
  return WAYPOINTS[i]
}

export function waypointPos(i: number): [number, number, number] {
  const p = WAYPOINTS[i]
  return [p.x, p.y, p.z]
}
