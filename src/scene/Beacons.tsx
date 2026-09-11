import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { SLIDES, WAYPOINT_SPACING } from '../slides'
import { blockMaterials } from './blockTextures'

export function waypointPos(i: number): [number, number, number] {
  const z = 8 + i * WAYPOINT_SPACING
  const x = Math.sin(i * 0.62) * 6
  const y = 11.5 + Math.sin(i * 0.45) * 1.4
  return [x, y, z]
}

const POST = 8

function Block({
  p,
  s,
  kind,
}: {
  p: [number, number, number]
  s: [number, number, number]
  kind: string
}) {
  const material = useMemo(() => blockMaterials(kind, s), [kind, s])
  return (
    <mesh position={p} material={material}>
      <boxGeometry args={s} />
    </mesh>
  )
}

export function Beacons({ current, flying }: { current: number; flying: boolean }) {
  return (
    <group>
      {SLIDES.map((s, i) => {
        const [x, , z] = waypointPos(i)
        const on = i === current
        return (
          <group key={s.id} position={[x, 0, z]}>
            <Block p={[0, 0.4, 0]} s={[1.5, 0.8, 1.5]} kind="cobble" />
            <Block p={[0, 0.9, 0]} s={[1.1, 0.3, 1.1]} kind="stone" />
            <Block p={[0, POST / 2, 0]} s={[0.7, POST, 0.7]} kind={on ? 'wood' : 'spruce'} />
            <Block p={[0, POST - 0.7, 0]} s={[2.6, 0.45, 0.65]} kind="darkOak" />
            <Block p={[0, POST, 0]} s={[1.35, 1.35, 1.35]} kind={on ? 'glowstone' : 'lanternOff'} />
            <Block p={[0, POST + 0.8, 0]} s={[1.7, 0.25, 1.7]} kind="darkOak" />
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
