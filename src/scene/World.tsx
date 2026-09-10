import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { SLIDES } from '../slides'
import { Terrain } from './Terrain'
import { Beacons } from './Beacons'
import { Flight } from './Flight'
import { WorldSign } from './WorldSign'

export function World({
  index,
  parked,
  flying,
  started,
  remaining,
  onArrived,
}: {
  index: number
  parked: number
  flying: boolean
  started: boolean
  remaining: number
  onArrived: () => void
}) {
  return (
    <Canvas
      camera={{ fov: 58, near: 0.1, far: 320, position: [0, 14.2, -8] }}
      dpr={[1, 1.5]}
      onCreated={({ camera }) => camera.lookAt(0, 16, 22)}
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
      {[...new Set([parked, index, Math.max(0, parked - 1)])].map((i) => {
        const pose =
          started && !flying && i === parked
            ? 'read'
            : flying && i === parked
              ? 'depart'
              : flying && i === index
                ? 'arrive'
                : 'dock'
        return (
          <WorldSign
            key={i}
            i={i}
            pose={pose}
            remaining={i === index ? remaining : SLIDES[i].durationSec}
          />
        )
      })}
      <Flight index={index} flying={flying} onArrived={onArrived} />
    </Canvas>
  )
}
