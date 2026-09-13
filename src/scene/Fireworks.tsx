import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isMobileWorld } from './device'
import { playFireworkBurst, playFireworkLaunch } from './FlightAudio'
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
  wave: number
  phase: number
  amp: number
  freq: number
  fuse: number
  grav: number
  tr: number
  tg: number
  tb: number
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
    wave: 0,
    phase: 0,
    amp: 0,
    freq: 0,
    fuse: 0,
    grav: 1,
    tr: 1,
    tg: 1,
    tb: 1,
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
  if (!s) return null
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
  s.wave = 0
  s.phase = Math.random() * Math.PI * 2
  s.amp = 0
  s.freq = 0
  s.fuse = 0
  s.grav = 1
  paint(s, c, 0.1)
  s.tr = s.r
  s.tg = s.g
  s.tb = s.b
  return s
}

function sway(s: Spark, wave: number, amp: number, freq: number) {
  s.wave = wave
  s.amp = amp
  s.freq = freq
}

function recolor(s: Spark, c: number[]) {
  s.tr = Math.min(1, c[0] + (Math.random() - 0.5) * 0.08)
  s.tg = Math.min(1, c[1] + (Math.random() - 0.5) * 0.08)
  s.tb = Math.min(1, c[2] + (Math.random() - 0.5) * 0.08)
}

function fuseAt(pool: Spark[], x: number, y: number, z: number, delay: number, fuse: number, c: number[]) {
  const s = take(pool)
  if (!s) return
  s.x = x + (Math.random() - 0.5) * 3.2 * DIST
  s.y = y + (Math.random() - 0.35) * 2.4 * DIST
  s.z = z + (Math.random() - 0.5) * 3.2 * DIST
  s.vx = (Math.random() - 0.5) * 2.4 * DIST
  s.vy = (Math.random() - 0.25) * 2.8 * DIST
  s.vz = (Math.random() - 0.5) * 2.4 * DIST
  s.life = delay
  s.max = delay
  s.size = (fuse === 1 ? 2.15 : 1.05) * DIST
  s.rocket = false
  s.spin = 2.4
  s.stretch = 1
  s.wave = 2
  s.phase = Math.random() * Math.PI * 2
  s.amp = 3.5
  s.freq = 9
  s.fuse = fuse
  s.grav = 0.55
  paint(s, c, 0.08)
  s.tr = s.r
  s.tg = s.g
  s.tb = s.b
}

function crackle(pool: Spark[], x: number, y: number, z: number, c: number[], cheap: boolean) {
  const n = cheap ? 2 : 4
  for (let i = 0; i < n; i++) {
    emit(
      pool,
      x,
      y,
      z,
      (Math.random() - 0.5) * 3.4,
      (Math.random() - 0.2) * 3.2,
      (Math.random() - 0.5) * 3.4,
      0.55 + Math.random() * 0.35,
      0.28 + Math.random() * 0.22,
      8,
      c,
    )
  }
}

function drip(pool: Spark[], x: number, y: number, z: number, c: number[], cheap: boolean) {
  const n = cheap ? 2 : 3
  for (let i = 0; i < n; i++) {
    const s = emit(
      pool,
      x,
      y - 0.3,
      z,
      (Math.random() - 0.5) * 1.1,
      -2.4 - Math.random() * 1.8,
      (Math.random() - 0.5) * 1.1,
      0.65 + Math.random() * 0.25,
      0.4 + Math.random() * 0.28,
      3,
      c,
    )
    if (s) {
      s.grav = 1.7
      if (!cheap && i === 0 && Math.random() < 0.45) s.fuse = 3
    }
  }
}

function explode(pool: Spark[], x: number, y: number, z: number, n: number, depth = 0, cheap = false) {
  const c = PALETTE[(Math.random() * PALETTE.length) | 0]
  const c2 = PALETTE[(Math.random() * PALETTE.length) | 0]
  const shift = Math.random() < 0.6
  // 0 sphere 1 ring 2 flower 3 cross 4 chunk 5 palm 6 heart 7 star 8 spiral 9 helix
  const kind = (Math.random() * 10) | 0

  const born = (
    vx: number,
    vy: number,
    vz: number,
    size: number,
    life: number,
    spin: number,
    wave = 0,
    amp = 0,
    freq = 0,
  ) => {
    const s = emit(pool, x, y, z, vx, vy, vz, size, life, spin, c)
    if (!s) return null
    if (wave) sway(s, wave, amp, freq)
    if (shift) recolor(s, c2)
    return s
  }

  if (kind === 1) {
    const tilt = Math.random() * 0.7
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const spd = 5.5 + Math.random() * 2.2
      const s = born(
        Math.cos(a) * spd,
        1.1 + Math.sin(a) * spd * tilt,
        Math.sin(a) * spd,
        1.85,
        1.45,
        0,
        i & 1 ? 1 : 0,
        5.5,
        7,
      )
      if (!s) return
    }
    if (!cheap && n > 16) {
      for (let i = 0; i < n >> 1; i++) {
        const a = (i / (n >> 1)) * Math.PI * 2
        const spd = 4.2
        if (!born(0, Math.cos(a) * spd + 1.2, Math.sin(a) * spd, 1.55, 1.25, 0, 2, 4, 8)) return
      }
    }
  } else if (kind === 2) {
    if (!born(0, 1.2, 0, 3.2, 1.8, 0.35)) return
    const petals = n > 18 ? 8 : 6
    const per = Math.max(1, Math.floor((n - 1) / petals))
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2
      for (let k = 1; k <= per; k++) {
        const spd = 3.6 + k * 2.2
        const s = born(
          Math.cos(a) * spd,
          1.6,
          Math.sin(a) * spd,
          1.35 + k * 0.15,
          1.35 + k * 0.12,
          1.4,
          1,
          3 + k,
          6,
        )
        if (!s) return
        if (k === per && Math.random() < 0.4) s.fuse = 3
      }
    }
  } else if (kind === 3) {
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
        const s = born(dx * spd, dy * spd + 0.4, dz * spd, 1.7, 1.3 + k * 0.1, 0, 2, 4.5, 9)
        if (!s) return
      }
    }
  } else if (kind === 4) {
    const side = Math.ceil(Math.cbrt(n))
    let i = 0
    for (let ix = 0; ix < side && i < n; ix++) {
      for (let iy = 0; iy < side && i < n; iy++) {
        for (let iz = 0; iz < side && i < n; iz++) {
          const ox = ix - (side - 1) / 2
          const oy = iy - (side - 1) / 2
          const oz = iz - (side - 1) / 2
          const s = born(ox * 2.6, oy * 2.6 + 1.2, oz * 2.6, 1.7, 1.55, 0, i & 1 ? 3 : 0, 3.2, 5)
          if (!s) return
          if (i % 5 === 0) s.fuse = 2
          i++
        }
      }
    }
  } else if (kind === 5) {
    const arms = cheap ? 6 : 9
    const per = Math.max(2, Math.floor(n / arms))
    for (let p = 0; p < arms; p++) {
      const a = (p / arms) * Math.PI * 2
      for (let k = 1; k <= per; k++) {
        const spd = 2.8 + k * 1.5
        const s = born(
          Math.cos(a) * spd,
          4.2 + k * 0.55,
          Math.sin(a) * spd,
          1.25 + k * 0.1,
          1.7 + k * 0.18,
          0.8,
          1,
          6.5,
          4.5,
        )
        if (!s) return
        s.grav = 1.85
        s.stretch = 1.35
        if (k === per) s.fuse = 3
      }
    }
  } else if (kind === 6) {
    const yaw = Math.random() * Math.PI * 2
    const cy = Math.cos(yaw)
    const sy = Math.sin(yaw)
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2
      const hx = 16 * Math.sin(t) ** 3 * 0.4
      const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.4
      const s = born(hx * cy, hy + 1.1, hx * sy, 1.55, 1.5, 0.6, 1, 3.8, 6)
      if (!s) return
    }
  } else if (kind === 7) {
    const tips = 5
    const per = Math.max(2, Math.floor(n / tips))
    const yaw = Math.random() * Math.PI
    for (let p = 0; p < tips; p++) {
      const a0 = (p / tips) * Math.PI * 2 + Math.PI / 2
      const a1 = ((p + 2) / tips) * Math.PI * 2 + Math.PI / 2
      const x0 = Math.cos(a0) * 8.2
      const y0 = Math.sin(a0) * 8.2
      const x1 = Math.cos(a1) * 8.2
      const y1 = Math.sin(a1) * 8.2
      for (let k = 0; k < per; k++) {
        const u = k / per
        const hx = x0 + (x1 - x0) * u
        const hy = y0 + (y1 - y0) * u
        const s = born(hx * Math.cos(yaw), hy + 1.2, hx * Math.sin(yaw), 1.6, 1.4, 0, 3, 4, 7)
        if (!s) return
        if (k === 0) s.fuse = 2
      }
    }
  } else if (kind === 8) {
    for (let i = 0; i < n; i++) {
      const a = i * 0.52
      const rad = 2.1 + i * 0.38
      const s = born(Math.cos(a) * rad, 1.4 + i * 0.12, Math.sin(a) * rad, 1.4, 1.55 + i * 0.02, 1.2, 2, 7, 8)
      if (!s) return
      if (i % 6 === 0) s.fuse = 2
    }
  } else if (kind === 9) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      const spd = 3.4 + Math.random() * 4.8
      const s = born(
        Math.sin(b) * Math.cos(a) * spd,
        Math.cos(b) * spd * 0.82,
        Math.sin(b) * Math.sin(a) * spd,
        1.3 + Math.random() * 0.6,
        1.35 + Math.random() * 0.7,
        (Math.random() - 0.5) * 6,
        2,
        8 + Math.random() * 4,
        6 + Math.random() * 5,
      )
      if (!s) return
      if (i % 7 === 0) s.fuse = 2
    }
  } else {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      const spd = 3.2 + Math.random() * 5.5
      const s = born(
        Math.sin(b) * Math.cos(a) * spd,
        Math.cos(b) * spd * 0.82,
        Math.sin(b) * Math.sin(a) * spd,
        1.35 + Math.random() * 0.7,
        1.2 + Math.random() * (i % 5 === 0 ? 1.4 : 0.8),
        (Math.random() - 0.5) * 6,
        i % 3 === 0 ? 1 : i % 3 === 1 ? 3 : 0,
        5.5,
        6.5,
      )
      if (!s) return
      if (i % 5 === 0) s.fuse = 2
      else if (i % 8 === 0) s.fuse = 3
    }
  }

  if (depth > 0) return
  const extra = Math.random()
  if (extra < (cheap ? 0.28 : 0.42)) {
    const pops = extra < (cheap ? 0.08 : 0.12) ? (cheap ? 2 : 3) : extra < 0.22 ? 2 : 1
    for (let i = 0; i < pops; i++) fuseAt(pool, x, y, z, 0.2 + i * 0.16 + Math.random() * 0.22, 1, i ? c2 : c)
  }
}

function launch(pool: Spark[], cheap: boolean) {
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
  s.fuse = Math.random() < (cheap ? 0.09 : 0.13) ? 4 : 0
  s.grav = 1
  if (Math.random() < 0.38) {
    s.wave = 1 + ((Math.random() * 2) | 0)
    s.amp = 4.5 + Math.random() * 5
    s.freq = 7 + Math.random() * 5
  } else {
    s.wave = 0
    s.amp = 0
    s.freq = 0
  }
  s.phase = Math.random() * Math.PI * 2
  paint(s, [0.89, 0.72, 0.29], 0.08)
  s.tr = s.r
  s.tg = s.g
  s.tb = s.b
  playFireworkLaunch({ x: s.x, y: s.y, z: s.z })
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
      launch(sparks, mobile)
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
      if (s.life <= 0) {
        if (s.rocket) {
          explode(sparks, s.x, s.y, s.z, burst, 0, mobile)
          playFireworkBurst(false, { x: s.x, y: s.y, z: s.z })
          if (s.fuse === 4) {
            const shells = mobile ? 2 : 3
            for (let k = 0; k < shells; k++) {
              fuseAt(
                sparks,
                s.x,
                s.y,
                s.z,
                0.22 + k * 0.2,
                1,
                PALETTE[(Math.random() * PALETTE.length) | 0],
              )
            }
          }
        } else if (s.fuse === 1) {
          explode(sparks, s.x, s.y, s.z, mobile ? 8 : 16, 1, mobile)
          playFireworkBurst(true, { x: s.x, y: s.y, z: s.z })
        } else if (s.fuse === 2) {
          crackle(sparks, s.x, s.y, s.z, [s.r, s.g, s.b], mobile)
        } else if (s.fuse === 3) {
          drip(sparks, s.x, s.y, s.z, [s.r, s.g, s.b], mobile)
        }
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
          crumb.wave = 1
          crumb.phase = Math.random() * Math.PI * 2
          crumb.amp = 2.4
          crumb.freq = 10
          crumb.fuse = 0
          crumb.grav = 1
          crumb.r = s.r
          crumb.g = s.g
          crumb.b = s.b
          crumb.tr = s.r
          crumb.tg = s.g
          crumb.tb = s.b
        }
      }
      const drag = s.rocket ? 0.28 : 2.1
      s.vx *= Math.exp(-d * drag)
      s.vz *= Math.exp(-d * drag)
      s.vy = s.rocket ? s.vy : s.vy * Math.exp(-d * 0.55) - 6.5 * d * s.grav
      s.x += s.vx * d
      s.y += s.vy * d
      s.z += s.vz * d
      if (s.wave) {
        const a = s.phase + (s.max - s.life) * s.freq
        const w = Math.sin(a) * s.amp
        if (s.wave === 1) {
          const h = Math.hypot(s.vx, s.vz) || 1
          s.x += (-s.vz / h) * w * d
          s.z += (s.vx / h) * w * d
          s.y += Math.cos(a * 0.7) * s.amp * 0.45 * d
        } else if (s.wave === 2) {
          s.x += Math.cos(a) * s.amp * d
          s.z += Math.sin(a) * s.amp * d
        } else {
          s.x += Math.sin(a) * s.amp * d
          s.y += Math.sin(a * 1.7 + 1) * s.amp * 0.55 * d
          s.z += Math.cos(a * 1.3) * s.amp * d
        }
      }
      const u = Math.max(0, s.life / s.max)
      const fade = 1 - u
      const pop = s.rocket ? 1 : 0.28 + 0.72 * u
      dummy.position.set(s.x, s.y, s.z)
      dummy.rotation.set(s.spin * fade, s.spin * 1.6 * fade, 0)
      dummy.scale.set(s.size * pop, s.size * pop * s.stretch, s.size * pop)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
      tint.setRGB(s.r + (s.tr - s.r) * fade, s.g + (s.tg - s.g) * fade, s.b + (s.tb - s.b) * fade)
      inst.setColorAt(i, tint)
    }
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geo, mat, max]} frustumCulled={false} />
}
