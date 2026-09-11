import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Terrain } from './Terrain'
import { Beacons } from './Beacons'
import { Birds } from './Birds'
import { Flight, type TurnDirection } from './Flight'
import { WorldSlide } from './WorldSlide'

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
      camera={{ fov: 58, near: 0.1, far: 320, position: [0, 14.2, -8] }}
      dpr={[1, 1.5]}
      onCreated={({ camera }) => camera.lookAt(0, 11.5, 8)}
    >
      <color attach="background" args={['#9fd6f7']} />
      <fog attach="fog" args={['#a8d8f5', 75, 190]} />
      <hemisphereLight args={['#c8e8ff', '#6a8a4a', 1.05]} />
      <directionalLight position={[20, 80, 10]} intensity={1.4} />
      <Sky
        sunPosition={[20, 80, 30]}
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
