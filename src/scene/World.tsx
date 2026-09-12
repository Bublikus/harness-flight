import { lazy, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Beacons } from './Beacons'
import { Birds } from './Birds'
import { isMobileWorld } from './device'
import { Flight, type TurnDirection } from './Flight'
import { Terrain } from './Terrain'
import { WorldSlide } from './WorldSlide'
import { planePose } from './worldPoses'

const SpeedMotionBlur = lazy(() =>
  import('./SpeedMotionBlur').then((m) => ({ default: m.SpeedMotionBlur })),
)

/**
 * Audience-side sun: board faces the plane/camera (−Z at takeoff), so the light
 * must sit in that half-space or the front never receives directional light/shadows.
 */
const SUN = new THREE.Vector3(-34, 52, -38).normalize()
const SUN_DIST = 55
const SHADOW_EXTENT = 36

/** Soft Minecraft sky: color by view elevation only — no cube-face seams. */
function SoftSky({ mobile }: { mobile: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          topColor: { value: new THREE.Color('#f3e0c4') },
          horizonColor: { value: new THREE.Color('#3d8ad4') },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position.z = gl_Position.w;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 topColor;
          uniform vec3 horizonColor;
          varying vec3 vWorldPosition;
          void main() {
            vec3 dir = normalize(vWorldPosition - cameraPosition);
            // Narrow band: white only near the horizon; mid/zenith stay blue.
            float t = pow(smoothstep(-0.05, 0.28, dir.y), 0.72);
            gl_FragColor = vec4(mix(horizonColor, topColor, t), 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )

  useFrame(({ camera }) => {
    mesh.current?.position.copy(camera.position)
  })

  return (
    <mesh ref={mesh} scale={80} material={material} frustumCulled={false}>
      <sphereGeometry args={[1, mobile ? 16 : 32, mobile ? 8 : 16]} />
    </mesh>
  )
}

function SunLight({ mobile }: { mobile: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null)
  const target = useRef<THREE.Object3D>(null)
  const follow = useRef(new THREE.Vector3())
  const map = mobile ? 1024 : 2048

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
        shadow-mapSize={[map, map]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={mobile ? 1 : 2}
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
  finale,
  slideHidden,
  turnDirection,
  onApproach,
  onArrived,
}: {
  index: number
  started: boolean
  flying: boolean
  approaching: boolean
  facing: 1 | -1
  finale: boolean
  slideHidden: boolean
  turnDirection: TurnDirection
  onApproach: () => void
  onArrived: () => void
}) {
  const mobile = isMobileWorld()
  return (
    <Canvas
      shadows={mobile ? true : 'soft'}
      camera={{ fov: 58, near: 0.1, far: 320, position: [0, 14.2, -8] }}
      dpr={mobile ? [1, 1] : [1, 1.5]}
      onCreated={({ camera }) => camera.lookAt(0, 11.5, 8)}
    >
      <color attach="background" args={['#f3e0c4']} />
      <fog attach="fog" args={['#6aa8d8', 75, 190]} />
      <hemisphereLight args={['#c8e8ff', '#6a8a4a', 0.95]} />
      <SunLight mobile={mobile} />
      <SoftSky mobile={mobile} />
      <Terrain />
      <Birds />
      <Beacons current={index} />
      <WorldSlide
        index={index}
        finale={finale}
        started={started}
        flying={flying}
        approaching={approaching}
        facing={facing}
        hidden={slideHidden}
      />
      <Flight
        index={index}
        flying={flying}
        facing={facing}
        turnDirection={turnDirection}
        onApproach={onApproach}
        onArrived={onArrived}
      />
      {/* Desktop only — EffectComposer never mounts (or loads) on mobile. */}
      {!mobile && (
        <Suspense fallback={null}>
          <SpeedMotionBlur />
        </Suspense>
      )}
    </Canvas>
  )
}
