import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isMobileWorld } from './device'
import { FINALE_SKY, ROUTE_END } from './route'

/** Compensates FINALE_SKY along 36→80 so finale cam still sees big cubes. */
const DIST = 80 / 36

/** Grass, gold HUD, glowstone, wood, water, sky, plane red, HUD lilac, snow, pumpkin. */
const PALETTE = [
  [0.35, 0.6, 0.24],
  [0.89, 0.72, 0.29],
  [0.95, 0.82, 0.29],
  [0.48, 0.34, 0.19],
  [0.23, 0.43, 0.65],
  [0.49, 0.78, 0.94],
  [0.77, 0.24, 0.2],
  [0.91, 0.69, 1],
  [0.91, 0.93, 0.96],
  [0.88, 0.54, 0.16],
]

type Spark = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  max: number
  size: number
  r: number
  g: number
  b: number
  rocket: boolean
  spin: number
  stretch: number
}

function spark(): Spark {
  return {
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
    max: 1,
    size: 1,
    r: 1,
    g: 1,
    b: 1,
    rocket: false,
    spin: 0,
    stretch: 1,
  }
}

function take(pool: Spark[]) {
  for (const s of pool) if (s.life <= 0) return s
  return null
}

function paint(s: Spark, c: number[], jitter: number) {
  s.r = Math.min(1, c[0] + (Math.random() - 0.5) * jitter)
  s.g = Math.min(1, c[1] + (Math.random() - 0.5) * jitter)
  s.b = Math.min(1, c[2] + (Math.random() - 0.5) * jitter)
}

function emit(
  pool: Spark[],
  x: number,
  y: number,
  z: number,
  vx: number,
  vy: number,
  vz: number,
  size: number,
  life: number,
  spin: number,
  c: number[],
) {
  const s = take(pool)
  if (!s) return false
  s.x = x
  s.y = y
  s.z = z
  s.vx = vx * DIST
  s.vy = vy * DIST
  s.vz = vz * DIST
  s.life = life
  s.max = life
  s.size = size * DIST
  s.rocket = false
  s.spin = spin
  s.stretch = 1
  paint(s, c, 0.1)
  return true
}

function explode(pool: Spark[], x: number, y: number, z: number, n: number) {
  const c = PALETTE[(Math.random() * PALETTE.length) | 0]
  const kind = (Math.random() * 5) | 0

  if (kind === 1) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const spd = 5.5 + Math.random() * 2.2
      if (!emit(pool, x, y, z, Math.cos(a) * spd, 1.1, Math.sin(a) * spd, 1.85, 1.45, 0, c)) return
    }
    return
  }

  if (kind === 2) {
    if (!emit(pool, x, y, z, 0, 1.2, 0, 3.2, 1.8, 0.35, c)) return
    const petals = n > 18 ? 8 : 6
    const per = Math.max(1, Math.floor((n - 1) / petals))
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2
      for (let k = 1; k <= per; k++) {
        const spd = 3.6 + k * 2.2
        if (
          !emit(
            pool,
            x,
            y,
            z,
            Math.cos(a) * spd,
            1.6,
            Math.sin(a) * spd,
            1.35 + k * 0.15,
            1.35 + k * 0.12,
            1.4,
            c,
          )
        )
          return
      }
    }
    return
  }

  if (kind === 3) {
    const dirs = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ]
    const per = Math.max(2, Math.floor(n / 6))
    for (const [dx, dy, dz] of dirs) {
      for (let k = 1; k <= per; k++) {
        const spd = 3 + k * 2.4
        if (!emit(pool, x, y, z, dx * spd, dy * spd + 0.4, dz * spd, 1.7, 1.3 + k * 0.1, 0, c))
          return
      }
    }
    return
  }

  if (kind === 4) {
    const side = Math.ceil(Math.cbrt(n))
    let i = 0
    for (let ix = 0; ix < side && i < n; ix++) {
      for (let iy = 0; iy < side && i < n; iy++) {
        for (let iz = 0; iz < side && i < n; iz++) {
          const ox = ix - (side - 1) / 2
          const oy = iy - (side - 1) / 2
          const oz = iz - (side - 1) / 2
          if (!emit(pool, x, y, z, ox * 2.6, oy * 2.6 + 1.2, oz * 2.6, 1.7, 1.55, 0, c)) return
          i++
        }
      }
    }
    return
  }

  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const b = Math.acos(2 * Math.random() - 1)
    const spd = 3.2 + Math.random() * 5.5
    if (
      !emit(
        pool,
        x,
        y,
        z,
        Math.sin(b) * Math.cos(a) * spd,
        Math.cos(b) * spd * 0.82,
        Math.sin(b) * Math.sin(a) * spd,
        1.35 + Math.random() * 0.7,
        1.2 + Math.random() * (i % 5 === 0 ? 1.4 : 0.8),
        (Math.random() - 0.5) * 6,
        c,
      )
    )
      return
  }
}

function launch(pool: Spark[]) {
  const s = take(pool)
  if (!s) return
  // Ellipse: wide across landscape, shallow along-track so near edge stays past rim.
  const across = (Math.random() - 0.5) * 100
  const along = (Math.random() - 0.5) * 12
  const yaw = ROUTE_END.yaw
  const life = 0.5 + Math.random() * 0.5
  const vy = (16 + Math.random() * 11) * DIST
  const T = vy * life
  s.x = FINALE_SKY.x + Math.sin(yaw) * along + Math.cos(yaw) * across
  s.z = FINALE_SKY.z + Math.cos(yaw) * along - Math.sin(yaw) * across
  // Spawn 2×T below burst (was ~1×T); double vy so apex stays put.
  s.y = FINALE_SKY.y - 18 - Math.random() * 12 - T
  s.vx = (Math.random() - 0.5) * 2.2 * DIST
  s.vy = vy * 2
  s.vz = (Math.random() - 0.5) * 2.2 * DIST
  s.life = life
  s.max = s.life
  s.size = 1.15 * DIST
  s.rocket = true
  s.spin = 0
  s.stretch = 2.8
  paint(s, [0.89, 0.72, 0.29], 0.08)
}

export function Fireworks({ active }: { active: boolean }) {
  const mobile = useMemo(() => isMobileWorld(), [])
  const max = mobile ? 72 : 168
  const burst = mobile ? 14 : 28
  const pool = useRef<Spark[] | null>(null)
  const next = useRef(0)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tint = useMemo(() => new THREE.Color(), [])
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1)
    const n = g.attributes.position.count
    const col = new Float32Array(n * 3)
    const face = [1, 0.78, 0.92, 0.62, 0.86, 0.7]
    for (let i = 0; i < n; i++) {
      const s = face[(i / 4) | 0]
      col[i * 3] = s
      col[i * 3 + 1] = s
      col[i * 3 + 2] = s
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        fog: true,
        toneMapped: true,
        vertexColors: true,
      }),
    [],
  )

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const sparks = (pool.current ??= Array.from({ length: max }, spark))
    const inst = mesh.current
    if (!inst) return
    if (active && state.clock.elapsedTime >= next.current) {
      launch(sparks)
      next.current =
        state.clock.elapsedTime + (mobile ? 0.65 + Math.random() * 0.7 : 0.32 + Math.random() * 0.55)
    }

    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i]
      if (s.life <= 0) {
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        inst.setMatrixAt(i, dummy.matrix)
        continue
      }
      s.life -= d
      if (s.rocket && s.life <= 0) {
        explode(sparks, s.x, s.y, s.z, burst)
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        inst.setMatrixAt(i, dummy.matrix)
        continue
      }
      if (s.rocket && Math.random() < (mobile ? 0.12 : 0.45)) {
        const crumb = take(sparks)
        if (crumb) {
          crumb.x = s.x
          crumb.y = s.y
          crumb.z = s.z
          crumb.vx = (Math.random() - 0.5) * 0.8 * DIST
          crumb.vy = -1.2 * DIST
          crumb.vz = (Math.random() - 0.5) * 0.8 * DIST
          crumb.life = 0.22 + Math.random() * 0.2
          crumb.max = crumb.life
          crumb.size = 0.85 * DIST
          crumb.rocket = false
          crumb.spin = 0
          crumb.stretch = 1
          crumb.r = s.r
          crumb.g = s.g
          crumb.b = s.b
        }
      }
      const drag = s.rocket ? 0.28 : 2.1
      s.vx *= Math.exp(-d * drag)
      s.vz *= Math.exp(-d * drag)
      s.vy = s.rocket ? s.vy : s.vy * Math.exp(-d * 0.55) - 6.5 * d
      s.x += s.vx * d
      s.y += s.vy * d
      s.z += s.vz * d
      const u = Math.max(0, s.life / s.max)
      const pop = s.rocket ? 1 : 0.28 + 0.72 * u
      dummy.position.set(s.x, s.y, s.z)
      dummy.rotation.set(s.spin * (1 - u), s.spin * 1.6 * (1 - u), 0)
      dummy.scale.set(s.size * pop, s.size * pop * s.stretch, s.size * pop)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
      tint.setRGB(s.r, s.g, s.b)
      inst.setColorAt(i, tint)
    }
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geo, mat, max]} frustumCulled={false} />
}
