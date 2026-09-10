import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Plane } from './Plane'
import { waypointPos } from './Beacons'

const tmp = new THREE.Vector3()
const look = new THREE.Vector3()
const behind = new THREE.Vector3()
const dest = new THREE.Vector3()
const fwd = new THREE.Vector3()

export function Flight({
  index,
  flying,
  onArrived,
}: {
  index: number
  flying: boolean
  onArrived: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const arrived = useRef(false)
  const lastIndex = useRef(index)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return

    if (lastIndex.current !== index) {
      lastIndex.current = index
      arrived.current = false
    }

    dest.set(...waypointPos(index))
    const dist = g.position.distanceTo(dest)

    if (flying && dist > 0.35) {
      const k = 1 - Math.exp(-dt * 1.15)
      g.position.lerp(dest, k)
      fwd.copy(dest).sub(g.position)
      const yaw = Math.atan2(fwd.x, fwd.z)
      const bank = THREE.MathUtils.clamp(-fwd.x * 0.12, -0.45, 0.45)
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, yaw, k)
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, bank, k)
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.08, k)
    } else {
      if (flying && !arrived.current) {
        arrived.current = true
        onArrived()
      }
      const bob = Math.sin(state.clock.elapsedTime * 2.2) * 0.12
      g.position.y = dest.y + bob
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 1 - Math.exp(-dt * 3))
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0, 1 - Math.exp(-dt * 3))
    }

    g.getWorldDirection(tmp)
    behind.set(0, 3.4, -15.5)
    behind.applyQuaternion(g.quaternion)
    behind.add(g.position)
    state.camera.position.lerp(behind, 1 - Math.exp(-dt * 2.4))
    look.copy(g.position).add(tmp.multiplyScalar(12)).setY(g.position.y + 4.4)
    state.camera.lookAt(look)
  })

  return (
    <group ref={group} position={waypointPos(0)}>
      <Plane />
    </group>
  )
}
