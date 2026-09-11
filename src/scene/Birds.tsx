import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SLIDES, WAYPOINT_SPACING } from '../slides'
import { blockMaterials } from './blockTextures'
import { terrainHeight, treePerches } from './Terrain'

/** Scattered agents · small local flocks · optional tree perches. */
const COUNT = 34
const X_MAX = 17
const Z_MIN = -6
const Z_MAX = SLIDES.length * WAYPOINT_SPACING + 24
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
const APPROACH_R = 1.15

type Purpose = 'wander' | 'forage' | 'commute' | 'solo'
type Phase = 'fly' | 'approach' | 'perch'

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
  const x = rnd(-X_MAX + 1.5, X_MAX - 1.5)
  const z = rnd(Z_MIN + 4, Z_MAX - 4)
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
    const x = rnd(-X_MAX + 2, X_MAX - 2)
    const z = rnd(Z_MIN + 8, Z_MAX - 8)
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
  const aim = useMemo(() => new THREE.Vector3(), [])
  const occupied = useMemo(() => new Set<number>(), [])
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

    for (let i = 0; i < birds.length; i++) {
      const b = birds[i]

      if (b.mode === 'perch' && b.perch) {
        b.p.copy(b.perch)
        b.v.set(0.02, 0, 0.01)
        b.perchUntil -= t
        if (b.perchUntil <= 0) {
          b.mode = 'fly'
          b.perch = null
          skyPoint(b.purpose, b.goal)
          const heading = rnd(0, Math.PI * 2)
          b.v.set(Math.cos(heading), 0.35, Math.sin(heading)).multiplyScalar(b.minSp + 0.8)
          b.retargetAt = time + rnd(3, 10)
        }
      } else if (b.mode === 'approach' && b.perch) {
        tmp.copy(b.perch).sub(b.p)
        const d = tmp.length()
        if (d < APPROACH_R) {
          b.mode = 'perch'
          b.p.copy(b.perch)
          b.v.set(0, 0, 0)
          b.perchUntil = rnd(2.2, 7.5)
        } else {
          steer.copy(tmp).normalize()
          b.v.lerp(steer.multiplyScalar(b.minSp * 0.85), Math.min(1, t * 2.2))
          b.p.addScaledVector(b.v, t)
        }
      } else {
        if (time > b.retargetAt || b.p.distanceToSquared(b.goal) < 9) {
          skyPoint(b.purpose, b.goal)
          b.retargetAt = time + rnd(4, 14)
          if (
            b.purpose !== 'commute' &&
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
            sep.addScaledVector(tmp, 1 / (d * d))
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

        if (b.p.x < -X_MAX) steer.x += BOUND_W
        else if (b.p.x > X_MAX) steer.x -= BOUND_W
        if (b.p.z < Z_MIN) steer.z += BOUND_W
        else if (b.p.z > Z_MAX) steer.z -= BOUND_W

        const floor = terrainHeight(b.p.x, b.p.z) + CLEARANCE
        const ceiling = floor + ALT_PAD
        if (b.p.y < floor) steer.y += BOUND_W * 1.7
        else if (b.p.y > ceiling) steer.y -= BOUND_W

        b.v.addScaledVector(steer, t)
        limit(b.v, b.minSp, b.maxSp)
        b.p.addScaledVector(b.v, t)
        if (b.p.y < floor) b.p.y = floor
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

      const flapAmp = b.mode === 'perch' ? 0.18 : 0.75
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
      <instancedMesh ref={bodyRef} args={[undefined, undefined, COUNT]} frustumCulled={false} material={bodyMat}>
        <boxGeometry args={[0.7, 0.34, 0.9]} />
      </instancedMesh>
      <instancedMesh ref={beakRef} args={[undefined, undefined, COUNT]} frustumCulled={false} material={beakMat}>
        <boxGeometry args={[0.2, 0.14, 0.28]} />
      </instancedMesh>
      <instancedMesh ref={wingLRef} args={[undefined, undefined, COUNT]} frustumCulled={false} material={wingMat}>
        <boxGeometry args={[1.05, 0.1, 0.42]} />
      </instancedMesh>
      <instancedMesh ref={wingRRef} args={[undefined, undefined, COUNT]} frustumCulled={false} material={wingMat}>
        <boxGeometry args={[1.05, 0.1, 0.42]} />
      </instancedMesh>
    </group>
  )
}
