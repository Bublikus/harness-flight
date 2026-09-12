import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Plane } from './Plane'
import { waypointPos } from './Beacons'
import { setFlightMix } from './FlightAudio'
import { planePose } from './worldPoses'

export type TurnDirection = -1 | 0 | 1

const tmp = new THREE.Vector3()
const look = new THREE.Vector3()
const behind = new THREE.Vector3()
const dest = new THREE.Vector3()
const CRUISE = 26
const YAW_RATE = 3.3
const SLOWDOWN_RADIUS = 28
const ARRIVAL_RADIUS = 2
const DOCK_RADIUS = 0.12
const DOCK_SPEED = 0.35
const CAPTURE = 2.4
const TWO_PI = Math.PI * 2
/** Chase-cam peek: ~6° yaw, ~1u pitch height, soft follow. */
const ORBIT_YAW = 0.11
const ORBIT_PITCH_Y = 1
const ORBIT_LERP = 5

function wrapPi(a: number) {
  while (a > Math.PI) a -= TWO_PI
  while (a < -Math.PI) a += TWO_PI
  return a
}

const WIND_COUNT = 6
const WIND_PTS = 28
const WIND_RANGE = 12
const WIND_SEGS = WIND_PTS - 1

function placeMote(
  p: THREE.Vector3,
  origin: THREE.Vector3,
  yaw: number,
  along: number,
  lat: number,
  y: number,
) {
  const s = Math.sin(yaw)
  const c = Math.cos(yaw)
  p.set(origin.x + s * along + c * lat, origin.y + y, origin.z + c * along - s * lat)
}

type Streak = {
  p: THREE.Vector3
  hist: Float32Array
  n: number
  age: number
  life: number
  spd: number
  phase: number
  wob: number
}

function recycle(m: Streak, origin: THREE.Vector3, yaw: number, ahead: boolean) {
  const side = Math.random() < 0.5 ? -1 : 1
  placeMote(
    m.p,
    origin,
    yaw,
    ahead ? 2 + Math.random() * 8 : -6.5 + Math.random() * 10,
    side * (2.6 + Math.random() * 4.8),
    2 + Math.random() * 3.4,
  )
  m.age = ahead ? 0 : Math.random() * 0.45
  m.life = 1.2 + Math.random() * 1.4
  m.spd = 0.65 + Math.random() * 1.05
  m.phase = Math.random() * TWO_PI
  m.wob = 0.45 + Math.random() * 0.9
  const x = m.p.x - origin.x
  const y = m.p.y - origin.y
  const z = m.p.z - origin.z
  for (let i = 0; i < WIND_PTS; i++) {
    m.hist[i * 3] = x
    m.hist[i * 3 + 1] = y
    m.hist[i * 3 + 2] = z
  }
  m.n = 1
}

function seedStreaks(): Streak[] {
  return Array.from({ length: WIND_COUNT }, () => ({
    p: new THREE.Vector3(),
    hist: new Float32Array(WIND_PTS * 3),
    n: 0,
    age: 0,
    life: 1,
    spd: 1,
    phase: Math.random() * TWO_PI,
    wob: 0.6,
  }))
}

function scatter(streaks: Streak[], origin: THREE.Vector3, yaw: number, ahead: boolean) {
  for (const m of streaks) recycle(m, origin, yaw, ahead)
}

/** Sparse curved wind streaks — visible only while cruising. */
function WindMotes({
  vis,
  yaw,
}: {
  vis: RefObject<number>
  yaw: RefObject<number>
}) {
  const streaks = useMemo(seedStreaks, [])
  const geo = useMemo(() => {
    const n = WIND_COUNT * WIND_SEGS * 2
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1))
    return g
  }, [])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { opacity: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float alpha;
          varying float vAlpha;
          void main() {
            vAlpha = alpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float opacity;
          varying float vAlpha;
          void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, opacity * vAlpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )
  const seeded = useRef(false)
  const lastVis = useRef(0)

  useFrame((state, dt) => {
    if (!planePose.valid) return
    const d = Math.min(dt, 0.05)
    const v = vis.current
    const fadeIn = lastVis.current < 0.02 && v >= 0.02
    const idle = v < 0.01 && lastVis.current < 0.01
    lastVis.current = v
    mat.uniforms.opacity.value = Math.min(1, v * 0.84)
    if (idle) return

    const origin = planePose.pos
    const y = yaw.current
    if (!seeded.current || fadeIn) {
      scatter(streaks, origin, y, false)
      seeded.current = true
    }

    const t = state.clock.elapsedTime
    const gust = Math.pow(0.5 + 0.5 * Math.sin(t * 0.29) * Math.sin(t * 0.67 + 1.4), 3)
    const wx = -1.7 + Math.sin(t * 0.23) * 0.85 + Math.sin(t * 0.47 + 0.6) * 0.4
    const wy = -0.22 + Math.sin(t * 0.31 + 0.8) * 0.2
    const wz = 0.65 + Math.sin(t * 0.17 + 1.2) * 0.75
    const rangeSq = WIND_RANGE * WIND_RANGE
    const arr = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array
    const alp = (geo.attributes.alpha as THREE.BufferAttribute).array as Float32Array
    const ox = origin.x
    const oy = origin.y
    const oz = origin.z
    let wri = 0
    let ari = 0

    for (const m of streaks) {
      const w = t * (1.15 + m.spd * 0.85) + m.phase
      const amp = m.wob * (2.8 + 4.2 * gust)
      m.p.x += (wx + Math.sin(w) * amp) * m.spd * d
      m.p.y += (wy + Math.sin(w * 1.32 + 0.5) * amp * 0.42) * m.spd * d
      m.p.z += (wz + Math.cos(w * 0.9) * amp) * m.spd * d
      m.age += d
      if (m.age > m.life || m.p.distanceToSquared(origin) > rangeSq) {
        recycle(m, origin, y, true)
      } else {
        for (let i = WIND_PTS - 1; i > 0; i--) {
          const a = i * 3
          const b = a - 3
          m.hist[a] = m.hist[b]
          m.hist[a + 1] = m.hist[b + 1]
          m.hist[a + 2] = m.hist[b + 2]
        }
        m.hist[0] = m.p.x - ox
        m.hist[1] = m.p.y - oy
        m.hist[2] = m.p.z - oz
        if (m.n < WIND_PTS) m.n++
      }

      for (let k = 0; k < WIND_SEGS; k++) {
        const i0 = k + 1 < m.n ? k : Math.max(0, m.n - 1)
        const i1 = k + 1 < m.n ? k + 1 : Math.max(0, m.n - 1)
        const fade0 = 1 - i0 / WIND_SEGS
        const fade1 = 1 - i1 / WIND_SEGS
        arr[wri++] = ox + m.hist[i0 * 3]
        arr[wri++] = oy + m.hist[i0 * 3 + 1]
        arr[wri++] = oz + m.hist[i0 * 3 + 2]
        arr[wri++] = ox + m.hist[i1 * 3]
        arr[wri++] = oy + m.hist[i1 * 3 + 1]
        arr[wri++] = oz + m.hist[i1 * 3 + 2]
        alp[ari++] = fade0
        alp[ari++] = fade1
      }
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.alpha.needsUpdate = true
  })

  return (
    <lineSegments geometry={geo} material={mat} frustumCulled={false} />
  )
}

export function Flight({
  index,
  flying,
  turnDirection,
  onApproach,
  onArrived,
}: {
  index: number
  flying: boolean
  turnDirection: TurnDirection
  onApproach: () => void
  onArrived: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const approaching = useRef(false)
  const arrived = useRef(false)
  const lastIndex = useRef(index)
  const lastTurnDirection = useRef(turnDirection)
  const yaw = useRef(0)
  const cameraYaw = useRef(0)
  const yawRate = useRef(0)
  const speed = useRef(0)
  const parkedAt = useRef(0)
  const bankZ = useRef(0)
  const pitchX = useRef(0)
  const windPhase = useRef(Math.random() * TWO_PI)
  const windVis = useRef(0)
  const orbitTarget = useRef({ x: 0, y: 0 })
  const orbit = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        orbitTarget.current.x = 0
        orbitTarget.current.y = 0
        return
      }
      orbitTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1
      orbitTarget.current.y = 1 - (e.clientY / window.innerHeight) * 2
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const d = Math.min(dt, 0.05)

    if (
      lastIndex.current !== index ||
      lastTurnDirection.current !== turnDirection
    ) {
      lastIndex.current = index
      lastTurnDirection.current = turnDirection
      approaching.current = false
      arrived.current = false
    }

    dest.set(...waypointPos(index))
    const dx = dest.x - g.position.x
    const dz = dest.z - g.position.z
    const dist = Math.hypot(dx, dz, dest.y - g.position.y)
    const horiz = Math.hypot(dx, dz)
    const desired = horiz > 0.05 ? Math.atan2(dx, dz) : yaw.current
    let err = wrapPi(desired - yaw.current)
    if (turnDirection && Math.abs(err) > Math.PI / 2)
      err = turnDirection * Math.abs(err)
    const turning = Math.abs(err) > 0.4

    if (flying) {
      if (dist > ARRIVAL_RADIUS) {
        arrived.current = false
      } else if (!approaching.current) {
        approaching.current = true
        onApproach()
      }

      const capturing = dist <= ARRIVAL_RADIUS
      const steer =
        capturing ? THREE.MathUtils.smoothstep(horiz, 0.05, ARRIVAL_RADIUS) : 1
      const targetYawRate =
        THREE.MathUtils.clamp(err * 4, -YAW_RATE, YAW_RATE) * steer
      yawRate.current +=
        (targetYawRate - yawRate.current) * (1 - Math.exp(-d * 8))
      yaw.current = wrapPi(
        yaw.current + yawRate.current * d * (capturing ? 1 / 3 : 1),
      )

      const aligned = THREE.MathUtils.clamp(Math.cos(err), 0, 1)
      const turnFactor = turning ? 0.32 + 0.28 * aligned : 0.55 + 0.45 * aligned
      const cruise =
        0.18 +
        THREE.MathUtils.smoothstep(horiz, ARRIVAL_RADIUS, SLOWDOWN_RADIUS) * 0.82
      const approach = 0.18 * THREE.MathUtils.smoothstep(horiz, 0, ARRIVAL_RADIUS)
      const targetSpeed = CRUISE * turnFactor * (capturing ? approach : cruise)
      speed.current += (targetSpeed - speed.current) * (1 - Math.exp(-d * 3.2))

      g.position.x += Math.sin(yaw.current) * speed.current * d
      g.position.z += Math.cos(yaw.current) * speed.current * d
      g.position.y += (dest.y - g.position.y) * (1 - Math.exp(-d * 1.5))
      // Capture fade is 0 at the 2u boundary so the pull cannot spike velocity.
      if (capturing && dist > 1e-5) {
        const fade = THREE.MathUtils.smoothstep(
          ARRIVAL_RADIUS - dist,
          0,
          ARRIVAL_RADIUS,
        )
        g.position.lerp(dest, 1 - Math.exp(-d * CAPTURE * fade))
      }

      g.rotation.y = yaw.current
      const bank = (-yawRate.current / YAW_RATE) * 0.68 * (capturing ? 0.5 : 1)
      const pitch = (turning ? 0.16 : 0.07) * (capturing ? steer : 1)
      bankZ.current += (bank - bankZ.current) * (1 - Math.exp(-d * 6))
      pitchX.current += (pitch - pitchX.current) * (1 - Math.exp(-d * 5))

      if (
        g.position.distanceTo(dest) < DOCK_RADIUS &&
        speed.current < DOCK_SPEED &&
        !arrived.current
      ) {
        arrived.current = true
        parkedAt.current = state.clock.elapsedTime
        onArrived()
      }
    } else {
      yawRate.current += (0 - yawRate.current) * (1 - Math.exp(-d * 6))
      speed.current += (0 - speed.current) * (1 - Math.exp(-d * 5))
      const parkedFor = state.clock.elapsedTime - parkedAt.current
      const bob =
        Math.sin(parkedFor * 2.2) *
        0.12 *
        THREE.MathUtils.smoothstep(parkedFor, 0, 0.8)
      const settle = 1 - Math.exp(-d * 5)
      g.position.x += (dest.x - g.position.x) * settle
      g.position.z += (dest.z - g.position.z) * settle
      g.position.y += (dest.y + bob - g.position.y) * settle
      g.rotation.y = yaw.current
      bankZ.current += (0 - bankZ.current) * (1 - Math.exp(-d * 3))
      pitchX.current += (0 - pitchX.current) * (1 - Math.exp(-d * 3))
    }

    // Soft wind buffet: always-on, irregular phase drift + occasional gusts.
    const t = state.clock.elapsedTime
    windPhase.current +=
      d *
      (0.2 +
        0.14 * Math.sin(t * 0.09) +
        0.1 * Math.sin(t * 0.23 + 1.7) +
        0.07 * Math.sin(t * 0.51 + 0.4))
    const p = windPhase.current
    // ~1.8× prior peak; no speed/capture damp — stays on at checkpoints.
    const windAmp = 0.1
    const gustPulse =
      Math.pow(0.5 + 0.5 * Math.sin(t * 0.27 + p * 0.35), 4) *
      (0.55 + 0.45 * Math.sin(t * 0.63 + 2.1))
    const gust =
      Math.sin(t * 1.15 + p) * 0.4 +
      Math.sin(t * 2.1 + p * 1.7 + 1.2) * 0.26 +
      Math.sin(t * 3.55 + p * 0.6 + 2.1) * 0.16 +
      Math.sin(t * 0.48 + p * 2.2 + 0.8) * 0.18
    const roll = gust * windAmp * (1 + 0.55 * gustPulse)
    g.rotation.z = bankZ.current + roll
    g.rotation.x =
      pitchX.current +
      (Math.sin(t * 0.95 + p * 0.9 + 0.4) * 0.55 +
        Math.sin(t * 2.4 + p * 1.4) * 0.3 +
        Math.sin(t * 1.7 + p * 2.1 + 1.1) * 0.15) *
        windAmp *
        (0.28 + 0.12 * gustPulse)

    // Cruise-only air motes: fade through the slowdown, gone at capture/park.
    const cruise =
      flying
        ? THREE.MathUtils.smoothstep(dist, ARRIVAL_RADIUS, SLOWDOWN_RADIUS) *
          THREE.MathUtils.smoothstep(speed.current, 3.5, 16)
        : 0
    windVis.current += (cruise - windVis.current) * (1 - Math.exp(-d * 3.6))
    setFlightMix(flying, windVis.current)

    planePose.pos.copy(g.position)
    planePose.valid = true

    cameraYaw.current = wrapPi(
      cameraYaw.current +
        wrapPi(yaw.current - cameraYaw.current) * (1 - Math.exp(-d * 7)),
    )
    const orbitEase = 1 - Math.exp(-d * ORBIT_LERP)
    orbit.current.x += (orbitTarget.current.x - orbit.current.x) * orbitEase
    orbit.current.y += (orbitTarget.current.y - orbit.current.y) * orbitEase
    const camAz = cameraYaw.current + orbit.current.x * ORBIT_YAW
    tmp.set(Math.sin(camAz), 0, Math.cos(camAz))
    behind.copy(g.position).addScaledVector(tmp, -12)
    behind.y += 4.8 + orbit.current.y * ORBIT_PITCH_Y
    state.camera.position.copy(behind)
    tmp.set(Math.sin(cameraYaw.current), 0, Math.cos(cameraYaw.current))
    look.copy(g.position).addScaledVector(tmp, 6)
    look.y = g.position.y + 1.15
    state.camera.lookAt(look)
  })

  return (
    <>
      <group ref={group} position={waypointPos(0)}>
        <Plane />
      </group>
      <WindMotes vis={windVis} yaw={yaw} />
    </>
  )
}
