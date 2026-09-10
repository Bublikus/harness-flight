import { Html } from '@react-three/drei'
import { SLIDES, WAYPOINT_SPACING } from '../slides'

export function waypointPos(i: number): [number, number, number] {
  const z = 8 + i * WAYPOINT_SPACING
  const x = Math.sin(i * 0.62) * 6
  const y = 11.5 + Math.sin(i * 0.45) * 1.4
  return [x, y, z]
}

const POST = 5.4

export function Beacons({ current }: { current: number }) {
  return (
    <group>
      {SLIDES.map((s, i) => {
        const [x, , z] = waypointPos(i)
        const on = i === current
        return (
          <group key={s.id} position={[x, 0, z]}>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[1.1, 0.7, 1.1]} />
              <meshLambertMaterial color="#7b7b7b" />
            </mesh>
            <mesh position={[0, POST / 2, 0]}>
              <boxGeometry args={[0.5, POST, 0.5]} />
              <meshLambertMaterial color={on ? '#8a5a28' : '#6b4a22'} />
            </mesh>
            <mesh position={[0, POST + 0.15, 0.18]}>
              <boxGeometry args={[0.18, 0.7, 0.18]} />
              <meshLambertMaterial color="#3a2a22" />
            </mesh>
            <mesh position={[0, POST - 0.15, 0.45]}>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshLambertMaterial
                color={on ? '#ffe566' : '#c4a060'}
                emissive={on ? '#cc9900' : '#000'}
                emissiveIntensity={on ? 0.7 : 0}
              />
            </mesh>
            <Html position={[0, POST + 1.35, 0]} center distanceFactor={28}>
              <div className="beacon-label">{String(i + 1).padStart(2, '0')}</div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
