import { useMemo } from 'react'
import * as THREE from 'three'
import { blockMaterials } from './blockTextures'
import { SLIDES, WAYPOINT_SPACING } from '../slides'

const W = 22
const LEN = SLIDES.length * WAYPOINT_SPACING + 40

function n2(x: number, z: number) {
  return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1
}

function height(x: number, z: number) {
  const ridge = Math.max(0, Math.abs(x) - 16) * 0.55
  const hills = Math.sin(z * 0.07) * 1.4 + Math.sin(x * 0.2 + z * 0.05) * 1.1
  const mtn = ridge > 0 ? ridge + n2(x, z) * 3 : 0
  return Math.max(0, Math.round(hills + mtn))
}

function riverX(z: number) {
  return Math.sin(z * 0.045) * 7
}

function isRiver(x: number, z: number) {
  return Math.abs(x - riverX(z)) < 1.6 && Math.abs(x) < 14
}

type Bucket = {
  id: string
  pos: number[]
  scale?: [number, number, number]
}

function bucket(id: string, scale?: [number, number, number]): Bucket {
  return { id, pos: [], scale }
}

function build(): Bucket[] {
  const B = {
    grass: bucket('grass'),
    dirt: bucket('dirt'),
    stone: bucket('stone'),
    gravel: bucket('gravel'),
    water: bucket('water'),
    sand: bucket('sand'),
    wood: bucket('wood'),
    birch: bucket('birch'),
    spruce: bucket('spruce'),
    leaves: bucket('leaves'),
    birchLeaves: bucket('birchLeaves'),
    spruceLeaves: bucket('spruceLeaves'),
    snow: bucket('snow'),
    coal: bucket('coal'),
    iron: bucket('iron'),
    flowerY: bucket('flowerY', [0.35, 0.7, 0.35]),
    flowerR: bucket('flowerR', [0.35, 0.7, 0.35]),
    tall: bucket('tall', [0.22, 1.05, 0.22]),
    reed: bucket('reed', [0.28, 1.9, 0.28]),
    lily: bucket('lily', [0.9, 0.12, 0.9]),
    pumpkin: bucket('pumpkin', [0.85, 0.75, 0.85]),
    mush: bucket('mush', [0.45, 0.45, 0.45]),
    wool: bucket('wool', [0.7, 0.55, 0.9]),
    cloud: bucket('cloud'),
  }

  const push = (b: Bucket, x: number, y: number, z: number) => {
    b.pos.push(x, y, z)
  }

  const oak = (x: number, h: number, z: number) => {
    const th = 3 + Math.floor(n2(z, x) * 2)
    for (let i = 1; i <= th; i++) push(B.wood, x, h + i, z)
    for (let lx = -2; lx <= 2; lx++) {
      for (let lz = -2; lz <= 2; lz++) {
        for (let ly = 0; ly <= 2; ly++) {
          if (Math.abs(lx) + Math.abs(lz) + ly > 4) continue
          push(B.leaves, x + lx, h + th + ly, z + lz)
        }
      }
    }
  }

  const birchTree = (x: number, h: number, z: number) => {
    const th = 4 + Math.floor(n2(x, z) * 2)
    for (let i = 1; i <= th; i++) push(B.birch, x, h + i, z)
    for (let lx = -1; lx <= 1; lx++) {
      for (let lz = -1; lz <= 1; lz++) {
        for (let ly = 0; ly <= 2; ly++) {
          if (Math.abs(lx) + Math.abs(lz) > 2) continue
          push(B.birchLeaves, x + lx, h + th + ly, z + lz)
        }
      }
    }
  }

  const spruceTree = (x: number, h: number, z: number) => {
    const th = 5
    for (let i = 1; i <= th; i++) push(B.spruce, x, h + i, z)
    for (let ly = 0; ly < 4; ly++) {
      const r = 3 - ly
      for (let lx = -r; lx <= r; lx++) {
        for (let lz = -r; lz <= r; lz++) {
          if (Math.abs(lx) + Math.abs(lz) > r + 1) continue
          push(B.spruceLeaves, x + lx, h + 2 + ly, z + lz)
        }
      }
    }
  }

  for (let z = -20; z < LEN; z++) {
    for (let x = -W; x <= W; x++) {
      const r = n2(x, z)
      if (isRiver(x, z)) {
        push(B.water, x, 0, z)
        if (r > 0.82) push(B.lily, x, 0.58, z)
        continue
      }

      const bank = Math.abs(x - riverX(z))
      if (bank < 2.7 && bank >= 1.6 && Math.abs(x) < 14) {
        push(r > 0.5 ? B.sand : B.gravel, x, 0, z)
        if (r > 0.72) push(B.reed, x, 1.2, z)
        continue
      }

      const h = height(x, z)
      const top = h >= 9 ? 'snow' : h >= 6 ? 'stone' : 'grass'
      if (top === 'snow') push(B.snow, x, h, z)
      else if (top === 'stone') {
        const ore = n2(x * 5, z * 5)
        push(ore > 0.92 ? B.coal : ore > 0.84 ? B.iron : B.stone, x, h, z)
      } else push(B.grass, x, h, z)
      if (h > 0) push(h >= 6 ? B.stone : B.dirt, x, h - 1, z)
      if (h > 1 && top !== 'snow') push(B.dirt, x, h - 2, z)

      if (top === 'grass' && h <= 3 && Math.abs(x) > 3) {
        const t = n2(x * 3, z * 3)
        if (t > 0.984) oak(x, h, z)
        else if (t > 0.972) birchTree(x, h, z)
        else if (t > 0.91) push(B.tall, x, h + 0.7, z)
        else if (t > 0.88) push(r > 0.5 ? B.flowerY : B.flowerR, x, h + 0.7, z)
        else if (t > 0.868) push(B.pumpkin, x, h + 0.7, z)
        else if (t > 0.86) push(B.mush, x, h + 0.55, z)
        else if (t > 0.855) {
          push(B.wool, x, h + 0.7, z)
          push(B.dirt, x, h + 0.35, z + 0.35)
        }
      }

      if (top === 'stone' && h >= 6 && r > 0.97) spruceTree(x, h, z)
    }
  }

  for (let i = 0; i < 28; i++) {
    const cz = 20 + i * 28 + n2(i, 2) * 10
    const cx = (n2(i, 9) - 0.5) * 50
    const cy = 26 + n2(i, 4) * 8
    const s = 2 + Math.floor(n2(i, 7) * 3)
    for (let x = -s; x <= s; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = -s; z <= s; z++) {
          if (Math.abs(x) + Math.abs(z) > s + 1) continue
          push(B.cloud, cx + x, cy + y, cz + z)
        }
      }
    }
  }

  return Object.values(B)
}

function Instanced({ data }: { data: Bucket }) {
  const mesh = useMemo(() => {
    const [sx, sy, sz] = data.scale ?? [1, 1, 1]
    const geo = new THREE.BoxGeometry(sx, sy, sz)
    const mat = blockMaterials(data.id, [sx, sy, sz])
    const m = new THREE.InstancedMesh(geo, mat, data.pos.length / 3)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < data.pos.length; i += 3) {
      dummy.position.set(data.pos[i], data.pos[i + 1], data.pos[i + 2])
      dummy.updateMatrix()
      m.setMatrixAt(i / 3, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    const tint = new THREE.Color()
    for (let i = 0; i < data.pos.length; i += 3) {
      const shade = 0.945 + n2(data.pos[i] + 3, data.pos[i + 2] + 7) * 0.11
      tint.setRGB(shade, shade, shade)
      m.setColorAt(i / 3, tint)
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.frustumCulled = false
    return m
  }, [data])

  return <primitive object={mesh} />
}

export function Terrain() {
  const world = useMemo(build, [])
  return (
    <group>
      {world.map((b) => (b.pos.length ? <Instanced key={b.id} data={b} /> : null))}
    </group>
  )
}
