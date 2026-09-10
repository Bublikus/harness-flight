import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C } from './colors'

function Voxel({
  p,
  s = [1, 1, 1],
  c,
}: {
  p: [number, number, number]
  s?: [number, number, number]
  c: string
}) {
  return (
    <mesh position={p}>
      <boxGeometry args={s} />
      <meshLambertMaterial color={c} />
    </mesh>
  )
}

export function Plane() {
  const prop = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (prop.current) prop.current.rotation.x += dt * 28
  })

  return (
    <group>
      <Voxel p={[0, 0, 0]} s={[1.2, 0.9, 3.4]} c={C.planeRed} />
      <Voxel p={[0, 0.15, 1.9]} s={[0.7, 0.7, 0.7]} c={C.planeCream} />
      <Voxel p={[0, 0.05, -2]} s={[0.8, 0.7, 0.9]} c={C.planeRed} />
      <Voxel p={[0, 0.9, -2.1]} s={[0.2, 1.1, 0.8]} c={C.planeCream} />
      <Voxel p={[0, 0.35, -2.5]} s={[1.8, 0.15, 0.5]} c={C.planeCream} />
      <Voxel p={[0, 0.2, 0.1]} s={[5.6, 0.18, 1.1]} c={C.planeCream} />
      <Voxel p={[0, 0.85, 0.15]} s={[4.2, 0.12, 0.8]} c={C.planeCream} />
      <Voxel p={[-2.7, 0.05, 0.1]} s={[0.2, 0.7, 0.2]} c={C.planeDark} />
      <Voxel p={[2.7, 0.05, 0.1]} s={[0.2, 0.7, 0.2]} c={C.planeDark} />
      <mesh ref={prop} position={[0, 0.1, 2.45]}>
        <boxGeometry args={[0.12, 1.6, 0.12]} />
        <meshLambertMaterial color={C.planeDark} />
      </mesh>
      <Voxel p={[0, 0.1, 2.55]} s={[0.22, 0.22, 0.22]} c="#d4af37" />
      <group position={[0, 0.85, 0.35]}>
        <Voxel p={[0, 0.45, 0]} s={[0.42, 0.42, 0.42]} c={C.skin} />
        <Voxel p={[0, 0.08, 0]} s={[0.38, 0.4, 0.28]} c={C.shirt} />
        <Voxel p={[-0.12, -0.28, 0]} s={[0.16, 0.32, 0.16]} c={C.pants} />
        <Voxel p={[0.12, -0.28, 0]} s={[0.16, 0.32, 0.16]} c={C.pants} />
        <Voxel p={[0, 0.58, 0.02]} s={[0.46, 0.12, 0.46]} c="#2b2218" />
      </group>
    </group>
  )
}
