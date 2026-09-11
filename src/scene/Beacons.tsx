import { Html } from '@react-three/drei'
import { SLIDES, WAYPOINT_SPACING } from '../slides'

export function waypointPos(i: number): [number, number, number] {
  const z = 8 + i * WAYPOINT_SPACING
  const x = Math.sin(i * 0.62) * 6
  const y = 11.5 + Math.sin(i * 0.45) * 1.4
  return [x, y, z]
}

const POST = 8

export function Beacons({ current, flying }: { current: number; flying: boolean }) {
  return (
    <group>
      {SLIDES.map((s, i) => {
        const [x, , z] = waypointPos(i)
        const on = i === current
        return (
          <group key={s.id} position={[x, 0, z]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.5, 0.8, 1.5]} />
              <meshLambertMaterial color="#5c5c5c" />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[1.1, 0.3, 1.1]} />
              <meshLambertMaterial color="#8b8680" />
            </mesh>
            <mesh position={[0, POST / 2, 0]}>
              <boxGeometry args={[0.7, POST, 0.7]} />
              <meshLambertMaterial color={on ? '#8a5a28' : '#6b4a22'} />
            </mesh>
            <mesh position={[0, POST - 0.7, 0]}>
              <boxGeometry args={[2.6, 0.45, 0.65]} />
              <meshLambertMaterial color="#3a2a22" />
            </mesh>
            <mesh position={[0, POST, 0]}>
              <boxGeometry args={[1.35, 1.35, 1.35]} />
              <meshLambertMaterial
                color={on ? '#ffe566' : '#e0892a'}
                emissive={on ? '#cc9900' : '#6b2f08'}
                emissiveIntensity={on ? 0.9 : 0.25}
              />
            </mesh>
            <mesh position={[0, POST + 0.8, 0]}>
              <boxGeometry args={[1.7, 0.25, 1.7]} />
              <meshLambertMaterial color="#3a2a22" />
            </mesh>
            {!flying && (
              <Html position={[0, POST + 1.55, 0]} center distanceFactor={28}>
                <div className="beacon-label">{String(i + 1).padStart(2, '0')}</div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
