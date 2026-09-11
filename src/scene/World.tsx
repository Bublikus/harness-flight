import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Terrain } from './Terrain'
import { Beacons } from './Beacons'
import { Flight, type TurnDirection } from './Flight'

export function World({
  index,
  flying,
  turnDirection,
  onArrived,
}: {
  index: number
  flying: boolean
  turnDirection: TurnDirection
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
      <hemisphereLight args={['#c8e8ff', '#5a7a3a', 0.9]} />
      <directionalLight position={[20, 80, 10]} intensity={1.45} />
      <Sky
        sunPosition={[20, 80, 30]}
        turbidity={2.2}
        rayleigh={0.35}
        mieCoefficient={0.003}
        mieDirectionalG={0.7}
      />
      <Terrain />
      <Beacons current={index} flying={flying} />
      <Flight
        index={index}
        flying={flying}
        turnDirection={turnDirection}
        onArrived={onArrived}
      />
    </Canvas>
  )
}
