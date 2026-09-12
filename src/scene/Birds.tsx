import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blockMaterials } from './blockTextures'
import { pathLateral, pathX, ROUTE_VALLEY, ROUTE_Z_MAX, ROUTE_Z_MIN } from './route'
import { terrainHeight, treePerches } from './Terrain'
import { planePose, slidePose } from './worldPoses'

/** Scattered agents · small local flocks · optional tree perches · rare slide flybys. */
const COUNT = 20
const SEP_R = 5.2
const VIS_R = 5.5
const SEP_W = 2.35
const ALIGN_W = 0.28
const COH_W = 0.18
const BOUND_W = 1.45
const GOAL_W = 0.55
const WANDER_W = 0.32
const MIN_SPEED = 3.4
const MAX_SPEED = 7.6
const CLEARANCE = 3.4
const ALT_PAD = 12
const PERCH_CHANCE = 0.018
/** Settle onto perch by distance — never teleport from farther than this. */
const LAND_R = 0.12
const ALT_LIFT = 7
const SEP_MIN_D = 0.4
/** Retry delay only — session gate (one initiated flyby per slide) is the limiter. */
const FLYBY_COOLDOWN = 5
const FLYBY_NEAR = 52
const FLYBY_SPEED = 9.2
const TRAP_DWELL = 1.5
const OSC_ALONG = 1.2
/** Biplane AABB ≈ wings 5.6 × fuselage ~5.1 × height ~1.5 → enclosing r≈3.9; keep agents clear. */
const PLANE_R = 5.4
const PLANE_HARD = 4.6
const PLANE_REP = 5.8
/** Inflate slide half-extents; collide while the mesh is still visibly risen. */
const SLIDE_RISE_BLOCK = 0.08
const SLIDE_PAD = 0.9
const SLIDE_HARD = 0.85
const SLIDE_REP = 6.4
const SLIDE_SHELL = 2.8
const CORRIDOR_PLANE = 5.6
const CORRIDOR_SLIDE = 2.2
const RESOLVE = 0.55

type Purpose = 'wander' | 'forage' | 'commute' | 'solo'
type Phase = 'fly' | 'approach' | 'perch' | 'flyby'

type Bird = {
  p: THREE.Vector3
  v: THREE.Vector3
  phase: number
  group: number
  purpose: Purpose
  mode: Phase
  goal: THREE.Vector3
  perch: THREE.Vector3 | null
  perchUntil: number
  retargetAt: number
  minSp: number
  maxSp: number
  /** Cubic Bezier control points + param (only while mode === 'flyby'). */
  c0: THREE.Vector3
  c1: THREE.Vector3
  c2: THREE.Vector3
  c3: THREE.Vector3
  u: number
  arc: number
  /** Used a corridor pass this slide session — not eligible again until index changes. */
  flybySpent: boolean
  gapTime: number
  lastAlong: number
  /** Locked lateral eject sign; 0 = not ejecting. */
  ejectSide: number
}

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function pickPurpose(i: number): Purpose {
  const r = (i * 17 + 3) % 10
  if (r < 2) return 'solo'
  if (r < 5) return 'wander'
  if (r < 8) return 'forage'
  return 'commute'
}

function skyPoint(purpose: Purpose, out: THREE.Vector3) {
  const z = rnd(ROUTE_Z_MIN + 4, ROUTE_Z_MAX - 4)
  const x = pathX(z) + rnd(-ROUTE_VALLEY + 1.5, ROUTE_VALLEY - 1.5)
  const floor = terrainHeight(x, z) + CLEARANCE
  const loft =
    purpose === 'forage' ? rnd(1.2, 4.5) : purpose === 'commute' ? rnd(5, ALT_PAD - 1) : rnd(2.5, ALT_PAD - 0.5)
  return out.set(x, floor + loft, z)
}

function seedBirds(perches: { x: number; y: number; z: number }[]): Bird[] {
  const groups = Math.max(6, Math.floor(COUNT / 3))
  const out: Bird[] = []
  for (let i = 0; i < COUNT; i++) {
    const purpose = pickPurpose(i)
    const group = purpose === 'solo' ? -1 - i : i % groups
    const z = rnd(ROUTE_Z_MIN + 8, ROUTE_Z_MAX - 8)
    const x = pathX(z) + rnd(-ROUTE_VALLEY + 2, ROUTE_VALLEY - 2)
    const y = terrainHeight(x, z) + CLEARANCE + rnd(2, 9)
    const heading = rnd(0, Math.PI * 2)
    const minSp = MIN_SPEED + rnd(0, 1.1)
    const maxSp = Math.min(MAX_SPEED, minSp + rnd(1.4, 3.2))
    const sp = rnd(minSp, maxSp)
    const goal = new THREE.Vector3()
    skyPoint(purpose, goal)
    out.push({
      p: new THREE.Vector3(x, y, z),
      v: new THREE.Vector3(Math.cos(heading), rnd(-0.08, 0.12), Math.sin(heading)).multiplyScalar(sp),
      phase: rnd(0, Math.PI * 2),
      group,
      purpose,
      mode: 'fly',
      goal,
      perch: null,
      perchUntil: 0,
      retargetAt: rnd(2, 9),
      minSp,
      maxSp,
      c0: new THREE.Vector3(),
      c1: new THREE.Vector3(),
      c2: new THREE.Vector3(),
      c3: new THREE.Vector3(),
      u: 0,
      arc: 1,
      flybySpent: false,
      gapTime: 0,
      lastAlong: 0,
      ejectSide: 0,
    })
  }
  // Nudge a few onto nearby perches so the world isn't empty of perched birds at t=0.
  for (let k = 0; k < Math.min(4, perches.length); k++) {
    const b = out[k * 5 + 2]
    if (!b || b.purpose === 'commute') continue
    const pe = perches[(k * 11) % perches.length]
    b.mode = 'perch'
    b.perch = new THREE.Vector3(pe.x + rnd(-0.25, 0.25), pe.y, pe.z + rnd(-0.25, 0.25))
    b.p.copy(b.perch)
    b.v.set(0, 0, 0)
    b.perchUntil = rnd(1.5, 5)
  }
  return out
}

function limit(v: THREE.Vector3, min: number, max: number) {
  const s = v.length()
  if (s < 1e-4) {
    v.set(0, 0, 1).multiplyScalar(min)
    return
  }
  if (s < min) v.multiplyScalar(min / s)
  else if (s > max) v.multiplyScalar(max / s)
}

function faceVelocity(dummy: THREE.Object3D, dir: THREE.Vector3, aim: THREE.Vector3) {
  aim.copy(dummy.position).add(dir)
  dummy.up.set(0, 1, 0)
  dummy.lookAt(aim)
}

function nearestPerch(
  p: THREE.Vector3,
  perches: { x: number; y: number; z: number }[],
  occupied: Set<number>,
  tmp: THREE.Vector3,
) {
  let best = -1
  let bestD = 38
  for (let i = 0; i < perches.length; i++) {
    if (occupied.has(i)) continue
    const pe = perches[i]
    const d = tmp.set(pe.x, pe.y, pe.z).distanceTo(p)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** Cubic Bezier B(t). */
function bezier(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
) {
  const u = 1 - t
  const uu = u * u
  const tt = t * t
  return out
    .set(0, 0, 0)
    .addScaledVector(p0, uu * u)
    .addScaledVector(p1, 3 * uu * t)
    .addScaledVector(p2, 3 * u * tt)
    .addScaledVector(p3, tt * t)
}

/** B'(t) for tangent / velocity. */
function bezierDeriv(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
  scratch: THREE.Vector3,
) {
  const u = 1 - t
  out.set(0, 0, 0)
  out.addScaledVector(scratch.copy(p1).sub(p0), 3 * u * u)
  out.addScaledVector(scratch.copy(p2).sub(p1), 6 * u * t)
  out.addScaledVector(scratch.copy(p3).sub(p2), 3 * t * t)
  return out
}

function approxArc(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  scratch: THREE.Vector3,
  prev: THREE.Vector3,
) {
  let len = 0
  bezier(p0, p1, p2, p3, 0, prev)
  for (let i = 1; i <= 12; i++) {
    bezier(p0, p1, p2, p3, i / 12, scratch)
    len += scratch.distanceTo(prev)
    prev.copy(scratch)
  }
  return Math.max(len, 1)
}

function softFloor(b: Bird, t: number) {
  const floor = terrainHeight(b.p.x, b.p.z) + CLEARANCE
  if (b.p.y < floor) {
    b.p.y += Math.min(floor - b.p.y, ALT_LIFT * t)
    if (b.v.y < 0) b.v.y *= 0.25
  }
}

/** Soft sphere push off the biplane (Plane.tsx voxel bounds). */
function planeForce(
  p: THREE.Vector3,
  out: THREE.Vector3,
  scratch: THREE.Vector3,
) {
  out.set(0, 0, 0)
  if (!planePose.valid) return out
  scratch.copy(p).sub(planePose.pos)
  const d = scratch.length()
  if (d >= PLANE_R || d < 1e-5) return out
  scratch.multiplyScalar(1 / d)
  const w = (1 - d / PLANE_R) ** 2
  return out.copy(scratch).multiplyScalar(PLANE_REP * w)
}

function slideLive() {
  return slidePose.valid && slidePose.rise >= SLIDE_RISE_BLOCK
}

function audienceFace(scratch: THREE.Vector3) {
  return slidePose.normal.dot(scratch.copy(planePose.pos).sub(slidePose.pos)) > 0 ? 1 : -1
}

function toSlideLocal(p: THREE.Vector3, out: THREE.Vector3, scratch: THREE.Vector3) {
  scratch.copy(p).sub(slidePose.pos)
  return out.set(scratch.dot(slidePose.right), scratch.dot(slidePose.up), scratch.dot(slidePose.normal))
}

/** Soft OBB push — same clearance on both faces; eject along the current-side normal. */
function slideForce(
  p: THREE.Vector3,
  v: THREE.Vector3,
  out: THREE.Vector3,
  scratch: THREE.Vector3,
  local: THREE.Vector3,
) {
  out.set(0, 0, 0)
  if (!slideLive()) return out
  const { half, right, up, normal } = slidePose
  toSlideLocal(p, local, scratch)
  const hx = half.x + SLIDE_PAD
  const hy = half.y + SLIDE_PAD
  const hz = half.z + SLIDE_PAD
  const onFace = Math.abs(local.x) <= hx && Math.abs(local.y) <= hy
  const side = local.z >= 0 ? 1 : -1
  const absZ = Math.abs(local.z)
  if (onFace) {
    if (absZ <= hz) {
      out.copy(normal).multiplyScalar(side * SLIDE_REP * (1 + (1 - (hz - absZ) / Math.max(hz, 1e-4))))
      return out
    }
    const gap = absZ - hz
    if (gap < SLIDE_SHELL) {
      const approaching = v.dot(normal) * side < 0
      const w = (1 - gap / SLIDE_SHELL) ** 2 * (approaching ? 1.55 : 1)
      out.copy(normal).multiplyScalar(side * SLIDE_REP * 0.9 * w)
      return out
    }
    return out
  }
  const cx = THREE.MathUtils.clamp(local.x, -hx, hx)
  const cy = THREE.MathUtils.clamp(local.y, -hy, hy)
  const cz = THREE.MathUtils.clamp(local.z, -hz, hz)
  out
    .set(0, 0, 0)
    .addScaledVector(right, local.x - cx)
    .addScaledVector(up, local.y - cy)
    .addScaledVector(normal, local.z - cz)
  const d = out.length()
  if (d >= SLIDE_SHELL || d < 1e-5) {
    out.set(0, 0, 0)
    return out
  }
  out.multiplyScalar(((1 - d / SLIDE_SHELL) ** 2 * SLIDE_REP * 0.85) / d)
  return out
}

/** Nudge position out of solids without a hard teleport. */
function softResolve(
  p: THREE.Vector3,
  scratch: THREE.Vector3,
  local: THREE.Vector3,
  t: number,
) {
  if (planePose.valid) {
    scratch.copy(p).sub(planePose.pos)
    const d = scratch.length()
    if (d < PLANE_HARD && d > 1e-5) {
      scratch.multiplyScalar((PLANE_HARD - d) * RESOLVE * Math.min(1, t * 14) / d)
      p.add(scratch)
    } else if (d < 1e-5) {
      p.y += PLANE_HARD * RESOLVE * 0.5
    }
  }
  if (!slideLive()) return
  const { half, normal } = slidePose
  toSlideLocal(p, local, scratch)
  const hx = half.x + SLIDE_HARD
  const hy = half.y + SLIDE_HARD
  const hz = half.z + SLIDE_HARD
  if (Math.abs(local.x) > hx || Math.abs(local.y) > hy || Math.abs(local.z) > hz) return
  // Out the current face — never the shallow lateral axis through the thin slab.
  const k = Math.min(1, t * 16)
  p.addScaledVector(normal, (local.z >= 0 ? 1 : -1) * (hz - Math.abs(local.z)) * k)
}

/** Swept test: if prev→curr pierces the board, stay on the entry side. */
function slideSweep(
  prev: THREE.Vector3,
  curr: THREE.Vector3,
  vel: THREE.Vector3,
  scratch: THREE.Vector3,
  local: THREE.Vector3,
  prevL: THREE.Vector3,
) {
  if (!slideLive()) return
  const { half, normal } = slidePose
  const hx = half.x + SLIDE_HARD
  const hy = half.y + SLIDE_HARD
  const hz = half.z + SLIDE_HARD
  toSlideLocal(prev, prevL, scratch)
  toSlideLocal(curr, local, scratch)
  let hit = Math.abs(local.x) <= hx && Math.abs(local.y) <= hy && Math.abs(local.z) <= hz
  if (!hit && prevL.z * local.z <= 0) {
    const dz = local.z - prevL.z
    if (Math.abs(dz) > 1e-8) {
      const t0 = -prevL.z / dz
      if (t0 >= 0 && t0 <= 1) {
        const x0 = prevL.x + (local.x - prevL.x) * t0
        const y0 = prevL.y + (local.y - prevL.y) * t0
        hit = Math.abs(x0) <= hx && Math.abs(y0) <= hy
      }
    }
  }
  if (!hit) return
  const side = prevL.z >= 0 ? 1 : -1
  curr.addScaledVector(normal, side * (hz + 0.06) - local.z)
  const inward = vel.dot(normal) * side
  if (inward < 0) vel.addScaledVector(normal, -inward * side)
}

/** Keep a path node on this face of the board (no cross-canvas control points). */
function pinToFace(
  p: THREE.Vector3,
  face: number,
  clear: number,
  scratch: THREE.Vector3,
  local: THREE.Vector3,
) {
  if (!slideLive()) return
  const { half, normal } = slidePose
  toSlideLocal(p, local, scratch)
  if (Math.abs(local.x) > half.x + SLIDE_PAD || Math.abs(local.y) > half.y + SLIDE_PAD) return
  const need = face * (half.z + clear)
  if (local.z * face >= half.z + clear) return
  p.addScaledVector(normal, need - local.z)
}

/** Shorten the start handle toward c0 so B'(0) keeps the current heading. */
function shortenToFace(
  c0: THREE.Vector3,
  c1: THREE.Vector3,
  face: number,
  clear: number,
  scratch: THREE.Vector3,
  local: THREE.Vector3,
) {
  if (!slideLive()) return
  const { half } = slidePose
  for (let i = 0; i < 8; i++) {
    toSlideLocal(c1, local, scratch)
    if (Math.abs(local.x) > half.x + SLIDE_PAD || Math.abs(local.y) > half.y + SLIDE_PAD) return
    if (local.z * face >= half.z + clear) return
    c1.lerp(c0, 0.4)
  }
}

/** Full plane clearance for path nodes — softResolve only nudges 55% and fights the curve. */
function clearPlane(p: THREE.Vector3, scratch: THREE.Vector3) {
  if (!planePose.valid) return
  scratch.copy(p).sub(planePose.pos)
  const d = scratch.length()
  const need = PLANE_HARD + 0.6
  if (d < need && d > 1e-5) p.addScaledVector(scratch, (need - d) / d)
  else if (d < 1e-5) p.y += need
}

/** If p→goal would pierce the board, cancel the through component and steer around. */
function slideDetour(
  p: THREE.Vector3,
  goal: THREE.Vector3,
  steer: THREE.Vector3,
  scratch: THREE.Vector3,
  local: THREE.Vector3,
  goalL: THREE.Vector3,
) {
  if (!slideLive()) return
  const { half, right, up, normal } = slidePose
  toSlideLocal(p, local, scratch)
  toSlideLocal(goal, goalL, scratch)
  if (local.z * goalL.z > 0 && Math.abs(local.z) > half.z && Math.abs(goalL.z) > half.z) return
  const dz = goalL.z - local.z
  if (Math.abs(dz) < 1e-8) return
  const t0 = -local.z / dz
  if (t0 < 0 || t0 > 1) return
  const hx = half.x + 0.4
  const hy = half.y + 0.4
  const x0 = local.x + (goalL.x - local.x) * t0
  const y0 = local.y + (goalL.y - local.y) * t0
  if (Math.abs(x0) > hx || Math.abs(y0) > hy) return
  const side = local.z >= 0 ? 1 : -1
  const inward = steer.dot(normal) * side
  if (inward < 0) steer.addScaledVector(normal, -inward)
  const dx = hx + 1.5 - Math.abs(local.x)
  const dy = hy + 1.5 - Math.abs(local.y)
  if (dy < dx) steer.addScaledVector(up, (local.y >= 0 ? 1 : -1) * 2.4)
  else steer.addScaledVector(right, (local.x >= 0 ? 1 : -1) * 2.4)
}

/**
 * Mid-point in the open-air corridor between plane and slide:
 * between them along the chord, clear of both solids, on the audience side of the board.
 */
function corridorMid(
  out: THREE.Vector3,
  axis: THREE.Vector3,
  scratch: THREE.Vector3,
) {
  axis.copy(slidePose.pos).sub(planePose.pos)
  const span = axis.length()
  if (span < 1e-4) axis.copy(slidePose.normal)
  else axis.multiplyScalar(1 / span)

  const face = audienceFace(scratch)
  const front = slidePose.half.z + CORRIDOR_SLIDE
  // Audience-side stand-off, then blend toward the plane clearance shell along the chord.
  out.copy(slidePose.pos).addScaledVector(slidePose.normal, face * front)
  scratch.copy(planePose.pos).addScaledVector(axis, CORRIDOR_PLANE)
  if (span > CORRIDOR_PLANE + front + 1) {
    out.lerp(scratch, 0.42)
  } else {
    // Tight gap: stay on the board face and step sideways clear of the plane.
    out.addScaledVector(slidePose.right, (Math.random() < 0.5 ? 1 : -1) * rnd(3.8, 5.8))
  }
  out.addScaledVector(slidePose.up, rnd(0.3, 1.5))
  out.addScaledVector(slidePose.right, rnd(-1.6, 1.6))
  softResolve(out, scratch, axis, 1)
  softResolve(out, scratch, axis, 1)
  const floor = terrainHeight(out.x, out.z) + CLEARANCE + 0.5
  if (out.y < floor) out.y = floor
  return out
}

/** Audience-side slab between plane and slide, within board XY. */
function inCorridor(p: THREE.Vector3, scratch: THREE.Vector3, local: THREE.Vector3) {
  if (!planePose.valid || !slideLive()) return false
  toSlideLocal(p, local, scratch)
  if (Math.abs(local.x) > slidePose.half.x + 2.4 || Math.abs(local.y) > slidePose.half.y + 2.4)
    return false
  scratch.copy(planePose.pos).sub(slidePose.pos)
  const aud = slidePose.normal.dot(scratch) > 0 ? 1 : -1
  if (local.z * aud < slidePose.half.z - 0.2) return false
  scratch.copy(slidePose.pos).sub(planePose.pos)
  const spanSq = scratch.lengthSq()
  if (spanSq < 1e-4) return true
  const u =
    ((p.x - planePose.pos.x) * scratch.x +
      (p.y - planePose.pos.y) * scratch.y +
      (p.z - planePose.pos.z) * scratch.z) /
    spanSq
  return u > -0.1 && u < 1.08
}

function chordAxis(out: THREE.Vector3) {
  out.copy(slidePose.pos).sub(planePose.pos)
  if (out.lengthSq() < 1e-6) out.copy(slidePose.normal)
  else out.normalize()
  return out
}

function pickExitSide(p: THREE.Vector3, v: THREE.Vector3, scratch: THREE.Vector3) {
  scratch.copy(p).sub(slidePose.pos)
  const along = Math.sign(scratch.dot(slidePose.right))
  if (along) return along
  const byV = Math.sign(v.dot(slidePose.right))
  return byV || 1
}

/** Lateral + up + away from the plane/slide mid; no chord (ping-pong) component. */
function outboundDir(p: THREE.Vector3, side: number, out: THREE.Vector3, scratch: THREE.Vector3) {
  const mx = (planePose.pos.x + slidePose.pos.x) * 0.5
  const my = (planePose.pos.y + slidePose.pos.y) * 0.5
  const mz = (planePose.pos.z + slidePose.pos.z) * 0.5
  out.copy(slidePose.right).multiplyScalar(side)
  out.addScaledVector(slidePose.up, 0.5)
  scratch.set(p.x - mx, p.y - my, p.z - mz)
  if (scratch.lengthSq() > 1e-6) out.addScaledVector(scratch.normalize(), 0.65)
  if (out.lengthSq() < 1e-6) out.copy(slidePose.right).multiplyScalar(side)
  else out.normalize()
  scratch.copy(slidePose.pos).sub(planePose.pos)
  if (scratch.lengthSq() > 1e-6) {
    scratch.normalize()
    out.addScaledVector(scratch, -out.dot(scratch))
  }
  if (out.lengthSq() < 1e-6) out.copy(slidePose.right).multiplyScalar(side)
  else out.normalize()
  return out
}

function handoffOutbound(b: Bird, time: number, scratch: THREE.Vector3, scratch2: THREE.Vector3) {
  const side = b.ejectSide || pickExitSide(b.p, b.v, scratch)
  b.ejectSide = side
  outboundDir(b.p, side, scratch, scratch2)
  // Keep the curve's exit tangent — replacing v here was a heading snap at pin/eject.
  b.goal.copy(b.p).addScaledVector(scratch, rnd(28, 44))
  const floor = terrainHeight(b.goal.x, b.goal.z) + CLEARANCE
  b.goal.y = THREE.MathUtils.clamp(b.goal.y, floor + 2, floor + ALT_PAD - 1)
  b.flybySpent = true
  b.retargetAt = time + rnd(6, 12)
  b.gapTime = 0
}

export function Birds() {
  const perches = useMemo(treePerches, [])
  const birds = useMemo(() => seedBirds(perches), [perches])
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const wingLRef = useRef<THREE.InstancedMesh>(null)
  const wingRRef = useRef<THREE.InstancedMesh>(null)
  const beakRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const steer = useMemo(() => new THREE.Vector3(), [])
  const sep = useMemo(() => new THREE.Vector3(), [])
  const ali = useMemo(() => new THREE.Vector3(), [])
  const coh = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tmp2 = useMemo(() => new THREE.Vector3(), [])
  const mid = useMemo(() => new THREE.Vector3(), [])
  const aim = useMemo(() => new THREE.Vector3(), [])
  const axis = useMemo(() => new THREE.Vector3(), [])
  const local = useMemo(() => new THREE.Vector3(), [])
  const prev = useMemo(() => new THREE.Vector3(), [])
  const prevL = useMemo(() => new THREE.Vector3(), [])
  const goalL = useMemo(() => new THREE.Vector3(), [])
  const avoid = useMemo(() => new THREE.Vector3(), [])
  const occupied = useMemo(() => new Set<number>(), [])
  const nextFlybyAt = useRef(4)
  const sessionIndex = useRef(-1)
  const flybyAllowed = useRef(true)
  const bodyMat = useMemo(() => blockMaterials('hat') as THREE.Material, [])
  const wingMat = useMemo(() => blockMaterials('planeDark') as THREE.Material, [])
  const beakMat = useMemo(() => blockMaterials('gold') as THREE.Material, [])

  useFrame((state, dt) => {
    const body = bodyRef.current
    const wingL = wingLRef.current
    const wingR = wingRRef.current
    const beak = beakRef.current
    if (!body || !wingL || !wingR || !beak) return
    const t = Math.min(dt, 0.05)
    const time = state.clock.elapsedTime

    occupied.clear()
    for (const b of birds) {
      if (b.mode !== 'perch' && b.mode !== 'approach') continue
      if (!b.perch) continue
      for (let i = 0; i < perches.length; i++) {
        const pe = perches[i]
        if (Math.abs(pe.x - b.perch.x) < 0.6 && Math.abs(pe.z - b.perch.z) < 0.6) {
          occupied.add(i)
          break
        }
      }
    }

    // One initiated corridor flyby per slide session (index unchanged).
    if (slidePose.index !== sessionIndex.current) {
      sessionIndex.current = slidePose.index
      flybyAllowed.current = true
      nextFlybyAt.current = time + 2.2
      for (const b of birds) {
        b.flybySpent = false
        b.ejectSide = 0
        b.gapTime = 0
        b.lastAlong = 0
      }
    }

    let flybyBusy = false
    for (const b of birds) {
      if (b.mode === 'flyby') {
        flybyBusy = true
        break
      }
    }
    if (
      flybyAllowed.current &&
      !flybyBusy &&
      time >= nextFlybyAt.current &&
      planePose.valid &&
      slidePose.valid &&
      slidePose.rise > 0.45
    ) {
      corridorMid(mid, axis, tmp)
      const face = audienceFace(tmp2)
      let best = -1
      let bestD = FLYBY_NEAR
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i]
        if (b.mode !== 'fly' || b.flybySpent) continue
        if (inCorridor(b.p, tmp, local)) continue
        // Front-of-board only — a back-side start would cross the canvas to reach mid.
        const along = slidePose.normal.dot(tmp.copy(b.p).sub(slidePose.pos))
        if (along * face < slidePose.half.z + 0.4) continue
        const d = b.p.distanceTo(mid)
        if (d < bestD && d > 6) {
          bestD = d
          best = i
        }
      }
      if (best >= 0) {
        const b = birds[best]
        const sp = Math.max(b.v.length(), b.minSp)
        tmp.copy(b.v)
        if (tmp.lengthSq() < 1e-4) tmp.set(1, 0, 0)
        else tmp.normalize()
        // Exit laterally along the board, staying on the audience side (not through canvas).
        const side = Math.random() < 0.5 ? 1 : -1
        const front = slidePose.half.z + CORRIDOR_SLIDE
        // Hermite start: c0 = pose, c1 along current v so B'(0) matches heading.
        const handle = Math.min(12, Math.max(2.4, sp * 0.38))

        b.c0.copy(b.p)
        b.c1.copy(b.p).addScaledVector(tmp, handle)
        // Approach mid from the plane side of the corridor.
        b.c2.copy(mid).addScaledVector(slidePose.normal, face * 0.6)
        b.c2.addScaledVector(slidePose.right, rnd(-1.2, 1.2))
        // Exit: skim past mid along board right, still clear of the surface.
        b.c3
          .copy(mid)
          .addScaledVector(slidePose.right, side * rnd(14, 22))
          .addScaledVector(slidePose.up, rnd(1.2, 3.0))
          .addScaledVector(slidePose.normal, face * (front * 0.35))
        shortenToFace(b.c0, b.c1, face, CORRIDOR_SLIDE * 0.25, tmp, local)
        pinToFace(b.c2, face, CORRIDOR_SLIDE * 0.4, tmp, local)
        pinToFace(b.c3, face, CORRIDOR_SLIDE * 0.25, tmp, local)
        clearPlane(b.c2, tmp)
        clearPlane(b.c3, tmp)
        pinToFace(b.c2, face, CORRIDOR_SLIDE * 0.4, tmp, local)
        pinToFace(b.c3, face, CORRIDOR_SLIDE * 0.25, tmp, local)
        softResolve(b.c2, tmp, local, 1)
        softResolve(b.c3, tmp, local, 1)
        b.u = 0
        b.arc = approxArc(b.c0, b.c1, b.c2, b.c3, tmp, tmp2)
        b.mode = 'flyby'
        flybyAllowed.current = false
        nextFlybyAt.current = time + FLYBY_COOLDOWN + rnd(-0.6, 1.2)
      } else {
        nextFlybyAt.current = time + 1.2
      }
    }

    for (let i = 0; i < birds.length; i++) {
      const b = birds[i]

      if (b.mode === 'flyby') {
        // Sample current u first (0 on the stick frame = current pose), then advance.
        const prevSp = Math.max(b.v.length(), b.minSp)
        const spd = THREE.MathUtils.damp(prevSp, FLYBY_SPEED, 3.2, t)
        prev.copy(b.p)
        tmp2.copy(b.v)
        bezier(b.c0, b.c1, b.c2, b.c3, b.u, b.p)
        bezierDeriv(b.c0, b.c1, b.c2, b.c3, b.u, b.v, tmp)
        const tanLen = b.v.length()
        if (tanLen > 1e-4) b.v.multiplyScalar(spd / tanLen)
        else b.v.copy(tmp2).setLength(spd)
        if (b.u > 0) {
          slideSweep(prev, b.p, b.v, tmp, local, prevL)
          softResolve(b.p, tmp, local, t)
        }
        softFloor(b, t)
        if (b.u >= 1) {
          b.mode = 'fly'
          // Hand back: lateral + away from the corridor mid — not a goal that recrosses.
          handoffOutbound(b, time, tmp, tmp2)
        } else {
          b.u = Math.min(1, b.u + (spd * t) / b.arc)
        }
      } else if (b.mode === 'perch' && b.perch) {
        // Soft settle — remaining gap is at most LAND_R after approach.
        b.p.lerp(b.perch, Math.min(1, t * 10))
        b.v.set(0.02, 0, 0.01)
        b.perchUntil -= t
        if (b.perchUntil <= 0) {
          b.mode = 'fly'
          b.perch = null
          skyPoint(b.purpose, b.goal)
          // Lift along prior perch facing + up (no heading teleport).
          tmp.set(1, 0.55, 0.15).normalize()
          b.v.copy(tmp).multiplyScalar(b.minSp + 0.5)
          b.retargetAt = time + rnd(3, 10)
        }
      } else if (b.mode === 'approach' && b.perch) {
        tmp.copy(b.perch).sub(b.p)
        const d = tmp.length()
        if (d < LAND_R) {
          b.mode = 'perch'
          b.v.set(0, 0, 0)
          b.perchUntil = rnd(2.2, 7.5)
        } else {
          // Arrive: slow as distance shrinks — continuous integrate, no snap.
          const desired = Math.min(b.minSp * 0.9, Math.max(0.35, d * 1.6))
          steer.copy(tmp).multiplyScalar(desired / d)
          planeForce(b.p, avoid, tmp2)
          steer.add(avoid)
          slideForce(b.p, b.v, avoid, tmp2, local)
          steer.add(avoid)
          slideDetour(b.p, b.perch, steer, tmp2, local, goalL)
          b.v.lerp(steer, Math.min(1, t * 3.2))
          prev.copy(b.p)
          b.p.addScaledVector(b.v, t)
          slideSweep(prev, b.p, b.v, tmp, local, prevL)
          softResolve(b.p, tmp, local, t)
        }
      } else {
        if (time > b.retargetAt || b.p.distanceToSquared(b.goal) < 9) {
          if (b.flybySpent && inCorridor(b.p, tmp, local)) {
            const side = b.ejectSide || pickExitSide(b.p, b.v, tmp)
            outboundDir(b.p, side, tmp, tmp2)
            b.goal.copy(b.p).addScaledVector(tmp, rnd(28, 40))
            const floor = terrainHeight(b.goal.x, b.goal.z) + CLEARANCE
            b.goal.y = THREE.MathUtils.clamp(b.goal.y, floor + 2, floor + ALT_PAD - 1)
          } else {
            skyPoint(b.purpose, b.goal)
          }
          b.retargetAt = time + rnd(4, 14)
          if (
            b.purpose !== 'commute' &&
            !b.flybySpent &&
            perches.length &&
            Math.random() < PERCH_CHANCE * (b.purpose === 'forage' ? 2.4 : 1)
          ) {
            const idx = nearestPerch(b.p, perches, occupied, tmp)
            if (idx >= 0) {
              const pe = perches[idx]
              b.mode = 'approach'
              b.perch = new THREE.Vector3(pe.x + rnd(-0.2, 0.2), pe.y, pe.z + rnd(-0.2, 0.2))
              occupied.add(idx)
            }
          }
        }

        sep.set(0, 0, 0)
        ali.set(0, 0, 0)
        coh.set(0, 0, 0)
        let nVis = 0
        let nSep = 0

        for (let j = 0; j < birds.length; j++) {
          if (i === j) continue
          const o = birds[j]
          if (o.mode === 'perch') continue
          tmp.copy(b.p).sub(o.p)
          const d = tmp.length()
          if (d < SEP_R && d > 1e-4) {
            sep.addScaledVector(tmp, 1 / (Math.max(d, SEP_MIN_D) * Math.max(d, SEP_MIN_D)))
            nSep++
          }
          if (b.group >= 0 && o.group === b.group && d < VIS_R) {
            ali.add(o.v)
            coh.add(o.p)
            nVis++
          }
        }

        steer.set(0, 0, 0)
        if (nSep) steer.addScaledVector(sep.multiplyScalar(1 / nSep), SEP_W)
        if (nVis) {
          ali.multiplyScalar(1 / nVis).sub(b.v)
          steer.addScaledVector(ali, ALIGN_W)
          coh.multiplyScalar(1 / nVis).sub(b.p)
          steer.addScaledVector(coh, COH_W)
        }

        tmp.copy(b.goal).sub(b.p)
        const gLen = tmp.length()
        if (gLen > 1e-3) steer.addScaledVector(tmp.multiplyScalar(1 / gLen), GOAL_W)

        // Soft wander noise — unique per bird, keeps paths from looking scripted.
        const w = time * 0.55 + b.phase
        steer.x += Math.sin(w * 1.3) * WANDER_W
        steer.y += Math.sin(w * 0.9 + 1.1) * WANDER_W * 0.45
        steer.z += Math.cos(w * 1.1) * WANDER_W

        const lat = pathLateral(b.p.x, b.p.z)
        if (lat < -ROUTE_VALLEY) steer.x += BOUND_W
        else if (lat > ROUTE_VALLEY) steer.x -= BOUND_W
        if (b.p.z < ROUTE_Z_MIN) steer.z += BOUND_W
        else if (b.p.z > ROUTE_Z_MAX) steer.z -= BOUND_W

        const floor = terrainHeight(b.p.x, b.p.z) + CLEARANCE
        const ceiling = floor + ALT_PAD
        if (b.p.y < floor) steer.y += BOUND_W * 1.7
        else if (b.p.y > ceiling) steer.y -= BOUND_W

        planeForce(b.p, avoid, tmp)
        steer.add(avoid)
        slideForce(b.p, b.v, avoid, tmp, local)
        steer.add(avoid)
        slideDetour(b.p, b.goal, steer, tmp, local, goalL)

        b.v.addScaledVector(steer, t)
        limit(b.v, b.minSp, b.maxSp)

        // Trap eject: dwell or chord-axis reversal in the plane–slide gap.
        if (inCorridor(b.p, tmp, local)) {
          chordAxis(axis)
          const along = b.v.dot(axis)
          const osc =
            b.lastAlong * along < 0 &&
            Math.abs(b.lastAlong) > OSC_ALONG &&
            Math.abs(along) > OSC_ALONG
          b.lastAlong = along
          b.gapTime += t
          if (!b.ejectSide && (osc || b.gapTime > TRAP_DWELL))
            b.ejectSide = pickExitSide(b.p, b.v, tmp)
          if (b.ejectSide) {
            outboundDir(b.p, b.ejectSide, avoid, tmp2)
            b.goal.copy(b.p).addScaledVector(avoid, 34)
            avoid.multiplyScalar(Math.max(b.maxSp, FLYBY_SPEED * 0.85))
            b.v.lerp(avoid, 0.6)
            b.v.addScaledVector(axis, -b.v.dot(axis))
            limit(b.v, b.minSp, Math.max(b.maxSp, FLYBY_SPEED * 0.85))
            const loft = terrainHeight(b.goal.x, b.goal.z) + CLEARANCE
            b.goal.y = THREE.MathUtils.clamp(b.goal.y, loft + 2, loft + ALT_PAD - 1)
            b.retargetAt = Math.max(b.retargetAt, time + 5)
            b.flybySpent = true
          }
        } else {
          b.gapTime = 0
          b.lastAlong = 0
          b.ejectSide = 0
        }

        prev.copy(b.p)
        b.p.addScaledVector(b.v, t)
        slideSweep(prev, b.p, b.v, tmp, local, prevL)
        softResolve(b.p, tmp, local, t)
        softFloor(b, t)
      }

      const speed = Math.max(b.v.length(), 0.05)
      tmp.copy(b.v).multiplyScalar(1 / speed)
      if (b.mode === 'perch') tmp.set(1, 0, 0.15).normalize()

      dummy.position.copy(b.p)
      faceVelocity(dummy, tmp, aim)
      dummy.updateMatrix()
      body.setMatrixAt(i, dummy.matrix)

      dummy.position.copy(b.p).addScaledVector(tmp, 0.42)
      faceVelocity(dummy, tmp, aim)
      dummy.updateMatrix()
      beak.setMatrixAt(i, dummy.matrix)

      const flapAmp = b.mode === 'perch' ? 0.18 : b.mode === 'flyby' ? 0.95 : 0.75
      const flapHz = b.mode === 'perch' ? 4.5 : 9 + speed * 0.35
      const flap = Math.sin(time * flapHz + b.phase) * flapAmp
      const bank = THREE.MathUtils.clamp(-b.v.x * 0.08, -0.35, 0.35)

      dummy.position.copy(b.p)
      faceVelocity(dummy, tmp, aim)
      dummy.rotateZ(flap + bank)
      dummy.translateX(-0.5)
      dummy.updateMatrix()
      wingL.setMatrixAt(i, dummy.matrix)

      dummy.position.copy(b.p)
      faceVelocity(dummy, tmp, aim)
      dummy.rotateZ(-flap + bank)
      dummy.translateX(0.5)
      dummy.updateMatrix()
      wingR.setMatrixAt(i, dummy.matrix)
    }

    body.instanceMatrix.needsUpdate = true
    wingL.instanceMatrix.needsUpdate = true
    wingR.instanceMatrix.needsUpdate = true
    beak.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
        castShadow
        material={bodyMat}
      >
        <boxGeometry args={[0.7, 0.34, 0.9]} />
      </instancedMesh>
      <instancedMesh
        ref={beakRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
        castShadow
        material={beakMat}
      >
        <boxGeometry args={[0.2, 0.14, 0.28]} />
      </instancedMesh>
      <instancedMesh
        ref={wingLRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
        castShadow
        material={wingMat}
      >
        <boxGeometry args={[1.05, 0.1, 0.42]} />
      </instancedMesh>
      <instancedMesh
        ref={wingRRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
        castShadow
        material={wingMat}
      >
        <boxGeometry args={[1.05, 0.1, 0.42]} />
      </instancedMesh>
    </group>
  )
}
