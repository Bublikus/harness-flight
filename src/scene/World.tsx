import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { Terrain } from './Terrain'
import { Beacons } from './Beacons'
import { Birds } from './Birds'
import { Flight, type TurnDirection } from './Flight'
import { WorldSlide } from './WorldSlide'
import { planePose } from './worldPoses'

/**
 * Audience-side sun: board faces the plane/camera (−Z at takeoff), so the light
 * must sit in that half-space or the front never receives directional light/shadows.
 */
const SUN = new THREE.Vector3(-34, 52, -38).normalize()
const SUN_DIST = 55
const SHADOW_EXTENT = 36

function SunLight() {
  const light = useRef<THREE.DirectionalLight>(null)
  const target = useRef<THREE.Object3D>(null)
  const follow = useRef(new THREE.Vector3())

  useFrame(() => {
    const l = light.current
    const t = target.current
    if (!l || !t) return
    const focus = planePose.valid ? planePose.pos : follow.current
    follow.current.lerp(focus, 0.18)
    t.position.copy(follow.current)
    l.position.copy(follow.current).addScaledVector(SUN, SUN_DIST)
    if (l.target !== t) l.target = t
    t.updateMatrixWorld()
    l.updateMatrixWorld()
  })

  return (
    <>
      <directionalLight
        ref={light}
        castShadow
        intensity={1.55}
        position={[-34, 52, -38]}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={2}
        shadow-camera-near={1}
        shadow-camera-far={130}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
      />
      {/* Scene sibling — not a light child — so world position is correct. */}
      <object3D ref={target} />
    </>
  )
}

export function World({
  index,
  started,
  flying,
  approaching,
  facing,
  turnDirection,
  onApproach,
  onArrived,
}: {
  index: number
  started: boolean
  flying: boolean
  approaching: boolean
  facing: 1 | -1
  turnDirection: TurnDirection
  onApproach: () => void
  onArrived: () => void
}) {
  return (
    <Canvas
      shadows="soft"
      camera={{ fov: 58, near: 0.1, far: 320, position: [0, 14.2, -8] }}
      dpr={[1, 1.5]}
      onCreated={({ camera }) => camera.lookAt(0, 11.5, 8)}
    >
      <color attach="background" args={['#9fd6f7']} />
      <fog attach="fog" args={['#a8d8f5', 75, 190]} />
      <hemisphereLight args={['#c8e8ff', '#6a8a4a', 0.95]} />
      <SunLight />
      <Sky
        sunPosition={[-34, 52, -38]}
        turbidity={2.2}
        rayleigh={0.35}
        mieCoefficient={0.003}
        mieDirectionalG={0.7}
      />
      <Terrain />
      <Birds />
      <Beacons current={index} />
      <WorldSlide
        index={index}
        started={started}
        flying={flying}
        approaching={approaching}
        facing={facing}
      />
      <Flight
        index={index}
        flying={flying}
        turnDirection={turnDirection}
        onApproach={onApproach}
        onArrived={onArrived}
      />
    </Canvas>
  )
}
