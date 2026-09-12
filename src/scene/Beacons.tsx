import { useMemo } from 'react'
import { SLIDES } from '../slides'
import { blockMaterials } from './blockTextures'
import { waypointPose } from './route'

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
    <mesh position={p} material={material} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  )
}

export function Beacons({ current }: { current: number }) {
  return (
    <group>
      {SLIDES.map((s, i) => {
        const p = waypointPose(i)
        const on = i === current
        return (
          <group key={s.id} position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
            <Block p={[0, 0.4, 0]} s={[1.5, 0.8, 1.5]} kind="cobble" />
            <Block p={[0, 0.9, 0]} s={[1.1, 0.3, 1.1]} kind="stone" />
            <Block p={[0, POST / 2, 0]} s={[0.7, POST, 0.7]} kind={on ? 'wood' : 'spruce'} />
            <Block p={[0, POST - 0.7, 0]} s={[2.6, 0.45, 0.65]} kind="darkOak" />
            <Block p={[0, POST, 0]} s={[1.35, 1.35, 1.35]} kind={on ? 'glowstone' : 'lanternOff'} />
            <Block p={[0, POST + 0.8, 0]} s={[1.7, 0.25, 1.7]} kind="darkOak" />
          </group>
        )
      })}
    </group>
  )
}
