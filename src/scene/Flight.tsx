import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Plane } from './Plane'
import { waypointPos } from './Beacons'

export type TurnDirection = -1 | 0 | 1

const tmp = new THREE.Vector3()
const look = new THREE.Vector3()
const behind = new THREE.Vector3()
const dest = new THREE.Vector3()

const CRUISE = 26
const YAW_RATE = 3.3
const SLOWDOWN_RADIUS = 28
const ARRIVAL_RADIUS = 2
const DOCK_RADIUS = 0.01
const TWO_PI = Math.PI * 2

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

    if (flying && dist > ARRIVAL_RADIUS) {
      arrived.current = false
      const targetYawRate = THREE.MathUtils.clamp(err * 4, -YAW_RATE, YAW_RATE)
      yawRate.current +=
        (targetYawRate - yawRate.current) * (1 - Math.exp(-d * 8))
      yaw.current = wrapPi(yaw.current + yawRate.current * d)

      const aligned = THREE.MathUtils.clamp(Math.cos(err), 0, 1)
      const turnFactor = turning ? 0.32 + 0.28 * aligned : 0.55 + 0.45 * aligned
      const approach =
        0.18 +
        THREE.MathUtils.smoothstep(
          horiz,
          ARRIVAL_RADIUS,
          SLOWDOWN_RADIUS,
        ) *
          0.82
      const targetSpeed = CRUISE * turnFactor * approach
      speed.current += (targetSpeed - speed.current) * (1 - Math.exp(-d * 3.2))

      g.position.x += Math.sin(yaw.current) * speed.current * d
      g.position.z += Math.cos(yaw.current) * speed.current * d
      g.position.y += (dest.y - g.position.y) * (1 - Math.exp(-d * 1.5))

      g.rotation.y = yaw.current
      const bank = (-yawRate.current / YAW_RATE) * 0.68
      const pitch = turning ? 0.16 : 0.07
      g.rotation.z += (bank - g.rotation.z) * (1 - Math.exp(-d * 6))
      g.rotation.x += (pitch - g.rotation.x) * (1 - Math.exp(-d * 5))
    } else if (flying) {
      if (!approaching.current) {
        approaching.current = true
        onApproach()
      }
      yawRate.current += (0 - yawRate.current) * (1 - Math.exp(-d * 8))
      speed.current += (0 - speed.current) * (1 - Math.exp(-d * 8))
      g.position.lerp(dest, 1 - Math.exp(-d * 7))
      g.rotation.z += (0 - g.rotation.z) * (1 - Math.exp(-d * 6))
      g.rotation.x += (0 - g.rotation.x) * (1 - Math.exp(-d * 6))

      if (g.position.distanceTo(dest) < DOCK_RADIUS && !arrived.current) {
        arrived.current = true
        speed.current = 0
        g.position.copy(dest)
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
      g.position.y = dest.y + bob
      g.rotation.y = yaw.current
      g.rotation.z += (0 - g.rotation.z) * (1 - Math.exp(-d * 3))
      g.rotation.x += (0 - g.rotation.x) * (1 - Math.exp(-d * 3))
    }

    cameraYaw.current = wrapPi(
      cameraYaw.current +
        wrapPi(yaw.current - cameraYaw.current) * (1 - Math.exp(-d * 7)),
    )
    tmp.set(Math.sin(cameraYaw.current), 0, Math.cos(cameraYaw.current))
    behind.copy(g.position).addScaledVector(tmp, -12)
    behind.y += 4.8
    state.camera.position.copy(behind)
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
