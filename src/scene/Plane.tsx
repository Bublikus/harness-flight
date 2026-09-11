import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blockMaterials } from './blockTextures'

function Voxel({
  p,
  s = [1, 1, 1],
  kind,
}: {
  p: [number, number, number]
  s?: [number, number, number]
  kind: string
}) {
  const material = useMemo(() => blockMaterials(kind, s), [kind, s])
  return (
    <mesh position={p} material={material}>
      <boxGeometry args={s} />
    </mesh>
  )
}

export function Plane() {
  const prop = useRef<THREE.Mesh>(null)
  const propMat = useMemo(() => blockMaterials('planeDark', [0.12, 1.6, 0.12]), [])
  useFrame((_, dt) => {
    if (prop.current) prop.current.rotation.x += dt * 28
  })

  return (
    <group>
      <Voxel p={[0, 0, 0]} s={[1.2, 0.9, 3.4]} kind="planeRed" />
      <Voxel p={[0, 0.15, 1.9]} s={[0.7, 0.7, 0.7]} kind="planeCream" />
      <Voxel p={[0, 0.05, -2]} s={[0.8, 0.7, 0.9]} kind="planeRed" />
      <Voxel p={[0, 0.9, -2.1]} s={[0.2, 1.1, 0.8]} kind="planeCream" />
      <Voxel p={[0, 0.35, -2.5]} s={[1.8, 0.15, 0.5]} kind="planeCream" />
      <Voxel p={[0, 0.2, 0.1]} s={[5.6, 0.18, 1.1]} kind="planeCream" />
      <Voxel p={[0, 0.85, 0.15]} s={[4.2, 0.12, 0.8]} kind="planeCream" />
      <Voxel p={[-2.7, 0.05, 0.1]} s={[0.2, 0.7, 0.2]} kind="planeDark" />
      <Voxel p={[2.7, 0.05, 0.1]} s={[0.2, 0.7, 0.2]} kind="planeDark" />
      <mesh ref={prop} position={[0, 0.1, 2.45]} material={propMat}>
        <boxGeometry args={[0.12, 1.6, 0.12]} />
      </mesh>
      <Voxel p={[0, 0.1, 2.55]} s={[0.22, 0.22, 0.22]} kind="gold" />
      <group position={[0, 0.85, 0.35]}>
        <Voxel p={[0, 0.45, 0]} s={[0.42, 0.42, 0.42]} kind="skin" />
        <Voxel p={[0, 0.08, 0]} s={[0.38, 0.4, 0.28]} kind="shirt" />
        <Voxel p={[-0.12, -0.28, 0]} s={[0.16, 0.32, 0.16]} kind="pants" />
        <Voxel p={[0.12, -0.28, 0]} s={[0.16, 0.32, 0.16]} kind="pants" />
        <Voxel p={[0, 0.58, 0.02]} s={[0.46, 0.12, 0.46]} kind="hat" />
      </group>
    </group>
  )
}
