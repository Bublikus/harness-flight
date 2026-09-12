import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blockMaterials } from './blockTextures'
import { PLANE_LAYER } from './layers'

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
    <mesh position={p} material={material} castShadow receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  )
}

function Snappy() {
  return (
    <group position={[0, 0.64, 0.74]}>
      <Voxel p={[0, 0.22, 0]} s={[0.54, 0.4, 0.46]} kind="snappy" />
      <Voxel p={[0, 0.4, 0]} s={[0.42, 0.28, 0.38]} kind="snappy" />
      <Voxel p={[0, 0.05, 0]} s={[0.44, 0.24, 0.4]} kind="snappy" />
      <Voxel p={[0, 0.2, 0.2]} s={[0.32, 0.3, 0.1]} kind="snappy" />
      <Voxel p={[-0.1, 0.4, 0.2]} s={[0.07, 0.07, 0.05]} kind="snappyFace" />
      <Voxel p={[0.1, 0.4, 0.2]} s={[0.07, 0.07, 0.05]} kind="snappyFace" />
      <Voxel p={[-0.05, 0.325, 0.26]} s={[0.04, 0.03, 0.04]} kind="snappyFace" />
      <Voxel p={[0, 0.31, 0.26]} s={[0.05, 0.03, 0.04]} kind="snappyFace" />
      <Voxel p={[0.05, 0.325, 0.26]} s={[0.04, 0.03, 0.04]} kind="snappyFace" />
      <Voxel p={[-0.08, 0.58, 0]} s={[0.07, 0.1, 0.07]} kind="snappy" />
      <Voxel p={[0, 0.62, 0]} s={[0.08, 0.12, 0.08]} kind="snappy" />
      <Voxel p={[0.08, 0.58, 0]} s={[0.07, 0.1, 0.07]} kind="snappy" />
      <Voxel p={[-0.3, 0.38, 0]} s={[0.1, 0.12, 0.1]} kind="snappy" />
      <Voxel p={[-0.32, 0.38, 0.04]} s={[0.05, 0.07, 0.05]} kind="snappyEar" />
      <Voxel p={[0.3, 0.38, 0]} s={[0.1, 0.12, 0.1]} kind="snappy" />
      <Voxel p={[0.32, 0.38, 0.04]} s={[0.05, 0.07, 0.05]} kind="snappyEar" />
      <Voxel p={[-0.3, 0.06, 0.02]} s={[0.07, 0.26, 0.07]} kind="snappy" />
      <Voxel p={[0.3, 0.06, 0.02]} s={[0.07, 0.26, 0.07]} kind="snappy" />
      <Voxel p={[-0.1, -0.12, 0.02]} s={[0.1, 0.12, 0.12]} kind="snappy" />
      <Voxel p={[0.1, -0.12, 0.02]} s={[0.1, 0.12, 0.12]} kind="snappy" />
    </group>
  )
}

export function Plane() {
  const root = useRef<THREE.Group>(null)
  const prop = useRef<THREE.Mesh>(null)
  const propMat = useMemo(() => blockMaterials('planeDark', [0.12, 1.6, 0.12]), [])
  useLayoutEffect(() => {
    root.current?.traverse((o) => o.layers.set(PLANE_LAYER))
  })
  useFrame((_, dt) => {
    if (prop.current) prop.current.rotation.z += dt * 28
  })

  return (
    <group ref={root}>
      <Voxel p={[0, 0, 0]} s={[1.2, 0.9, 3.4]} kind="planeRed" />
      <Voxel p={[0, 0.15, 1.9]} s={[0.7, 0.7, 0.7]} kind="planeCream" />
      <Voxel p={[0, 0.05, -2]} s={[0.8, 0.7, 0.9]} kind="planeRed" />
      <Voxel p={[0, 0.9, -2.1]} s={[0.2, 1.1, 0.8]} kind="planeCream" />
      <Voxel p={[0, 0.35, -2.5]} s={[1.8, 0.15, 0.5]} kind="planeCream" />
      <Voxel p={[0, 0.2, 0.1]} s={[5.6, 0.18, 1.1]} kind="planeCream" />
      <Voxel p={[0, 0.85, 0.15]} s={[4.2, 0.12, 0.8]} kind="planeCream" />
      <Voxel p={[-2.7, 0.05, 0.1]} s={[0.2, 0.7, 0.2]} kind="planeDark" />
      <Voxel p={[2.7, 0.05, 0.1]} s={[0.2, 0.7, 0.2]} kind="planeDark" />
      <mesh ref={prop} position={[0, 0.1, 2.45]} material={propMat} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.6, 0.12]} />
      </mesh>
      <Voxel p={[0, 0.1, 2.55]} s={[0.22, 0.22, 0.22]} kind="gold" />
      <Snappy />
    </group>
  )
}
