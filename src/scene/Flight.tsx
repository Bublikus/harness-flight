import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Plane } from './Plane'
import { waypointPos } from './Beacons'
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
    <group ref={group} position={waypointPos(0)}>
      <Plane />
    </group>
  )
}
