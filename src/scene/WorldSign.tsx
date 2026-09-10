import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { SLIDES } from '../slides'
import { SignCard } from '../Hud'
import { waypointPos } from './Beacons'

export type SignPose = 'read' | 'depart' | 'arrive' | 'dock'

export function WorldSign({
  i,
  pose,
  remaining,
}: {
  i: number
  pose: SignPose
  remaining: number
}) {
  const g = useRef<THREE.Group>(null)
  const face = useRef<THREE.Group>(null)
  const [wx, py, wz] = waypointPos(i)
  const s = SLIDES[i]
  const pos = useRef(new THREE.Vector3(wx, 6.15, wz + 0.55))
  const vel = useRef(new THREE.Vector3())
  const tumble = useRef(new THREE.Vector3())
  const tumbleVel = useRef(new THREE.Vector3())
  const sc = useRef(0.18)
  const scVel = useRef(0)
  const prev = useRef(pose)
  const cardOn = useRef(pose === 'read')
  const [showCard, setShowCard] = useState(pose === 'read')

  useFrame((state, dt) => {
    const node = g.current
    const bill = face.current
    if (!node || !bill) return
    const d = Math.min(dt, 0.04)

    if (prev.current !== pose) {
      prev.current = pose
      if (pose === 'read') {
        vel.current.set((Math.random() - 0.5) * 4, 16, 5)
        tumbleVel.current.set(-8, 7, 4)
        scVel.current = 2.4
      } else if (pose === 'depart') {
        vel.current.set((Math.random() - 0.5) * 10, 24, -22)
        tumbleVel.current.set(12, -16, 10)
        scVel.current = 0.6
      } else if (pose === 'arrive') {
        vel.current.set((Math.random() - 0.5) * 3, 10, 2)
        tumbleVel.current.set(-3, 4, 2)
      }
    }

    const ty =
      pose === 'read' ? py + 3.8 : pose === 'arrive' ? py + 1.6 : pose === 'depart' ? py + 5.5 : 6.15
    const tz =
      pose === 'read' ? wz + 1.1 : pose === 'arrive' ? wz + 0.8 : pose === 'depart' ? wz - 4 : wz + 0.55
    const tsc = pose === 'read' ? 1 : pose === 'arrive' ? 0.55 : pose === 'depart' ? 0.72 : 0.2
    const stiff = pose === 'depart' ? 4.2 : pose === 'read' ? 16 : 12
    const damp = pose === 'depart' ? 1.8 : pose === 'read' ? 4.6 : 5

    vel.current.x += (wx - pos.current.x) * stiff * d
    vel.current.y += (ty - pos.current.y) * stiff * d
    vel.current.z += (tz - pos.current.z) * stiff * d
    vel.current.multiplyScalar(Math.exp(-damp * d))
    pos.current.addScaledVector(vel.current, d)

    scVel.current += (tsc - sc.current) * (pose === 'depart' ? 6 : 14) * d
    scVel.current *= Math.exp(-5 * d)
    sc.current += scVel.current * d

    const ttx = pose === 'read' ? 0 : pose === 'dock' ? 0.12 : 0.04
    const ttz = pose === 'read' ? 0 : 0.08
    tumbleVel.current.x += (ttx - tumble.current.x) * 8 * d
    tumbleVel.current.z += (ttz - tumble.current.z) * 8 * d
    tumbleVel.current.multiplyScalar(Math.exp(pose === 'depart' ? -1.6 * d : -3.8 * d))
    tumble.current.addScaledVector(tumbleVel.current, d)

    const sway = pose === 'dock' ? Math.sin(state.clock.elapsedTime * 1.6 + i) * 0.12 : 0
    node.position.copy(pos.current)
    node.scale.setScalar(Math.max(0.1, sc.current))
    node.rotation.set(tumble.current.x, tumble.current.y + sway, tumble.current.z)

    bill.lookAt(state.camera.position)

    const wantCard = pose === 'read' || pose === 'depart' || pose === 'arrive' || sc.current > 0.35
    if (wantCard !== cardOn.current) {
      cardOn.current = wantCard
      setShowCard(wantCard)
    }
  })

  return (
    <group ref={g} position={[wx, 6.15, wz + 0.55]} scale={0.18}>
      <group ref={face}>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[7.1, 2.7, 0.22]} />
          <meshLambertMaterial color="#5c3a1e" />
        </mesh>
        <mesh position={[0, 0, -0.18]}>
          <boxGeometry args={[7.45, 3.0, 0.14]} />
          <meshLambertMaterial color="#3a2414" />
        </mesh>
        {showCard && (
          <Html
            transform
            sprite
            occlude={false}
            distanceFactor={9}
            position={[0, 0, 0.14]}
            style={{ pointerEvents: 'none' }}
          >
            <SignCard slide={s} remaining={remaining} world />
          </Html>
        )}
      </group>
    </group>
  )
}
