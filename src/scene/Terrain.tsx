import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blockMaterials } from './blockTextures'
import { isMobileWorld } from './device'
import {
  pathLateral,
  pathX,
  ROUTE_END,
  ROUTE_START,
  ROUTE_X_MAX,
  ROUTE_X_MIN,
  ROUTE_Z_MAX,
  ROUTE_Z_MIN,
} from './route'
import { planePose } from './worldPoses'

/** Z-span per streamed strip — mobile only; density stays 1×1 full fill. */
const CHUNK_Z = 48
/** Loaded strips on each side of the plane (fog far ≈ 190). */
const CHUNK_KEEP = 2
const CHUNK_COUNT = Math.ceil((ROUTE_Z_MAX - ROUTE_Z_MIN) / CHUNK_Z)

function n2(x: number, z: number) {
  return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1
}

/** Hill bowl behind start (dir=-1) or ahead of end (dir=+1); corridor stays open. */
function terminusLift(x: number, z: number, p: { x: number; z: number; yaw: number }, dir: 1 | -1) {
  const dx = x - p.x
  const dz = z - p.z
  const along = dx * Math.sin(p.yaw) + dz * Math.cos(p.yaw)
  const across = dx * Math.cos(p.yaw) - dz * Math.sin(p.yaw)
  // Caps keep longer end runout / angled yaw from towering past start-scale hills.
  const out = Math.min(10, Math.max(0, along * dir - 2))
  const side = Math.min(8, Math.max(0, Math.abs(across) - 10))
  // Back/forward hills reach farther; side mass stays local to the terminus.
  const alongNear = Math.exp((-along * along) / (32 * 32))
  const sideNear = Math.exp((-along * along) / (16 * 16))
  const h = alongNear * out * 0.4 + sideNear * side * 0.25
  if (h < 0.4) return 0
  return Math.min(8, h + 1.4 + n2(x + dir * 9, z) * 1.0)
}

/** Extra mass on the Z padding belts so mesh edges stay closed. */
function padCurtain(z: number) {
  const a = Math.max(0, ROUTE_Z_MIN + 14 - z)
  const b = Math.max(0, z - (ROUTE_Z_MAX - 14))
  const t = Math.max(a, b)
  return t > 0 ? t * 0.18 + 1.2 + n2(3, z) * 0.9 : 0
}

/**
 * Screen-left takeoff flank (looking +Z: camera right = −X, so +across is left).
 * Peaks on ROUTE_X_MAX and runs along the rim so the start cam cannot see the grass cliff.
 */
function startViewLeftFlank(x: number, z: number) {
  const dx = x - ROUTE_START.x
  const dz = z - ROUTE_START.z
  const along = dx * Math.sin(ROUTE_START.yaw) + dz * Math.cos(ROUTE_START.yaw)
  const across = dx * Math.cos(ROUTE_START.yaw) - dz * Math.sin(ROUTE_START.yaw)
  // +across = world +X = screen left at start. Keep corridor open.
  if (across < 14) return 0
  // Strongest at the mesh rim; fills inward to the corridor shoulder.
  const fromEdge = ROUTE_X_MAX - across
  const band = Math.exp(-(fromEdge * fromEdge) / (9 * 9))
  // Long enough that the left rim stays raised through the start FOV.
  const near = Math.exp((-along * along) / (58 * 58))
  const h = near * band * (10.5 + n2(x * 0.7, z + 5) * 1.5)
  if (h < 0.5) return 0
  return Math.min(12, h)
}

export function terrainHeight(x: number, z: number) {
  const lat = pathLateral(x, z)
  const ridge = Math.max(0, Math.abs(lat) - 16) * 0.27
  const hills = Math.sin(z * 0.07) * 1.2 + Math.sin(x * 0.2 + z * 0.05) * 0.9
  const mtn = ridge > 0 ? ridge + n2(x, z) * 1.4 : 0
  const gates =
    terminusLift(x, z, ROUTE_START, -1) +
    terminusLift(x, z, ROUTE_END, 1) +
    padCurtain(z) +
    startViewLeftFlank(x, z)
  // Angled end bowl sits in corridor-ridge zone — damp ridges under gates so ends match.
  const mtnEff = gates > 0 ? mtn * Math.max(0, 1 - gates / 8) : mtn
  return Math.max(0, Math.round(hills + mtnEff + gates))
}

/** Canopy tops matching tree placement in `build` — for ambient bird perches. */
export function treePerches(): { x: number; y: number; z: number }[] {
  const out: { x: number; y: number; z: number }[] = []
  for (let z = ROUTE_Z_MIN; z < ROUTE_Z_MAX; z++) {
    for (let x = ROUTE_X_MIN; x <= ROUTE_X_MAX; x++) {
      if (isRiver(x, z)) continue
      const lat = pathLateral(x, z)
      const bank = Math.abs(lat - riverLat(z))
      if (bank < 2.7 && bank >= 1.6 && Math.abs(lat) < 14) continue
      const h = terrainHeight(x, z)
      const top = h >= 9 ? 'snow' : h >= 6 ? 'stone' : 'grass'
      if (top === 'grass' && h <= 3 && Math.abs(lat) > 3) {
        const t = n2(x * 3, z * 3)
        if (t > 0.993) {
          const th = 3 + Math.floor(n2(z, x) * 2)
          out.push({ x, y: h + th + 2.35, z })
        } else if (t > 0.987) {
          const th = 4 + Math.floor(n2(x, z) * 2)
          out.push({ x, y: h + th + 2.35, z })
        }
      }
      if (top === 'stone' && h >= 6 && n2(x, z) > 0.988) {
        out.push({ x, y: h + 5.35, z })
      }
    }
  }
  return out
}

function riverLat(z: number) {
  return Math.sin(z * 0.045) * 2
}

function isRiver(x: number, z: number) {
  const lat = pathLateral(x, z)
  return Math.abs(lat - riverLat(z)) < 1.6 && Math.abs(lat) < 14
}

type Bucket = {
  id: string
  pos: number[]
  scale?: [number, number, number]
}

function bucket(id: string, scale?: [number, number, number]): Bucket {
  return { id, pos: [], scale }
}

function emptyBuckets(): Record<string, Bucket> {
  return {
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
}

/** Full-density columns for z ∈ [z0, z1). Same recipe as desktop — no grid/crust LOD. */
function buildRange(z0: number, z1: number): Bucket[] {
  const B = emptyBuckets()

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

  for (let z = z0; z < z1; z++) {
    for (let x = ROUTE_X_MIN; x <= ROUTE_X_MAX; x++) {
      const r = n2(x, z)
      const lat = pathLateral(x, z)
      if (isRiver(x, z)) {
        push(B.water, x, 0, z)
        if (r > 0.82) push(B.lily, x, 0.58, z)
        continue
      }

      const bank = Math.abs(lat - riverLat(z))
      if (bank < 2.7 && bank >= 1.6 && Math.abs(lat) < 14) {
        push(r > 0.5 ? B.sand : B.gravel, x, 0, z)
        if (r > 0.72) push(B.reed, x, 1.2, z)
        continue
      }

      const h = terrainHeight(x, z)
      const top = h >= 9 ? 'snow' : h >= 6 ? 'stone' : 'grass'
      // Full column fill — surface-only crust left sky gaps under steep slopes.
      for (let y = 0; y <= h; y++) {
        if (y === h) {
          if (top === 'snow') push(B.snow, x, y, z)
          else if (top === 'stone') {
            const ore = n2(x * 5, z * 5)
            push(ore > 0.92 ? B.coal : ore > 0.84 ? B.iron : B.stone, x, y, z)
          } else push(B.grass, x, y, z)
        } else push(h >= 6 ? B.stone : B.dirt, x, y, z)
      }

      if (top === 'grass' && h <= 3 && Math.abs(lat) > 3) {
        const t = n2(x * 3, z * 3)
        if (t > 0.993) oak(x, h, z)
        else if (t > 0.987) birchTree(x, h, z)
        else if (t > 0.91) push(B.tall, x, h + 0.7, z)
        else if (t > 0.88) push(r > 0.5 ? B.flowerY : B.flowerR, x, h + 0.7, z)
        else if (t > 0.868) push(B.pumpkin, x, h + 0.7, z)
        else if (t > 0.86) push(B.mush, x, h + 0.55, z)
        else if (t > 0.855) {
          push(B.wool, x, h + 0.7, z)
          push(B.dirt, x, h + 0.35, z + 0.35)
        }
      }

      if (top === 'stone' && h >= 6 && r > 0.988) spruceTree(x, h, z)
    }
  }

  return Object.values(B)
}

function buildClouds(): Bucket {
  const cloud = bucket('cloud')
  for (let i = 0; i < 28; i++) {
    const cz = 20 + i * 28 + n2(i, 2) * 10
    const cx = pathX(cz) + (n2(i, 9) - 0.5) * 50
    const cy = 26 + n2(i, 4) * 8
    const s = 2 + Math.floor(n2(i, 7) * 3)
    for (let x = -s; x <= s; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = -s; z <= s; z++) {
          if (Math.abs(x) + Math.abs(z) > s + 1) continue
          cloud.pos.push(cx + x, cy + y, cz + z)
        }
      }
    }
  }
  return cloud
}

function buildFull(): Bucket[] {
  const ground = buildRange(ROUTE_Z_MIN, ROUTE_Z_MAX)
  const clouds = buildClouds()
  const cloudBucket = ground.find((b) => b.id === 'cloud')!
  cloudBucket.pos = clouds.pos
  return ground
}

function chunkZ0(i: number) {
  return ROUTE_Z_MIN + i * CHUNK_Z
}

function buildChunk(i: number) {
  return buildRange(chunkZ0(i), Math.min(ROUTE_Z_MAX, chunkZ0(i) + CHUNK_Z))
}

function centerChunk(z: number) {
  return Math.max(0, Math.min(CHUNK_COUNT - 1, Math.floor((z - ROUTE_Z_MIN) / CHUNK_Z)))
}

function Instanced({ data, cull }: { data: Bucket; cull: boolean }) {
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
    m.computeBoundingSphere()
    // Desktop keeps everything drawn (chase cam looks back); mobile culls for fill rate.
    m.frustumCulled = cull
    m.receiveShadow = true
    // Ground / canopy take bird shadows; skip casting (thousands of instances).
    return m
  }, [data, cull])

  useEffect(
    () => () => {
      // Shared blockMaterials cache — dispose geometry only.
      mesh.geometry.dispose()
    },
    [mesh],
  )

  return <primitive object={mesh} />
}

function BucketMeshes({ buckets, cull }: { buckets: Bucket[]; cull: boolean }) {
  return (
    <>
      {buckets.map((b) =>
        b.pos.length ? <Instanced key={b.id} data={b} cull={cull} /> : null,
      )}
    </>
  )
}

function TerrainFull() {
  const world = useMemo(buildFull, [])
  return (
    <group>
      <BucketMeshes buckets={world} cull={false} />
    </group>
  )
}

/** Full-density strips around the plane — load/unload along Z, one chunk per frame. */
function TerrainStreamed() {
  const clouds = useMemo(buildClouds, [])
  const cache = useRef(new Map<number, Bucket[]>())
  const [ids, setIds] = useState<number[]>(() => {
    const c = centerChunk(ROUTE_START.z)
    const init: number[] = []
    for (let i = c - CHUNK_KEEP; i <= c + CHUNK_KEEP; i++) {
      if (i < 0 || i >= CHUNK_COUNT) continue
      cache.current.set(i, buildChunk(i))
      init.push(i)
    }
    return init
  })

  useFrame(() => {
    const z = planePose.valid ? planePose.pos.z : ROUTE_START.z
    const c = centerChunk(z)
    const want = new Set<number>()
    for (let i = c - CHUNK_KEEP; i <= c + CHUNK_KEEP; i++) {
      if (i >= 0 && i < CHUNK_COUNT) want.add(i)
    }

    let changed = false
    for (const i of cache.current.keys()) {
      if (!want.has(i)) {
        cache.current.delete(i)
        changed = true
      }
    }
    for (const i of want) {
      if (cache.current.has(i)) continue
      cache.current.set(i, buildChunk(i))
      changed = true
      break
    }
    if (changed) setIds([...cache.current.keys()].sort((a, b) => a - b))
  })

  return (
    <group>
      {ids.map((i) => (
        <BucketMeshes key={i} buckets={cache.current.get(i)!} cull />
      ))}
      {clouds.pos.length ? <Instanced data={clouds} cull /> : null}
    </group>
  )
}

export function Terrain() {
  return isMobileWorld() ? <TerrainStreamed /> : <TerrainFull />
}
