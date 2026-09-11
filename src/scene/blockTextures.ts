import * as THREE from 'three'

const S = 16

function n(x: number, y: number, s: number) {
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233 + s * 45.164) * 43758.5453) % 1
}

function tex(paint: (set: (x: number, y: number, hex: string) => void) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')!
  paint((x, y, hex) => {
    ctx.fillStyle = hex
    ctx.fillRect(x, y, 1, 1)
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.needsUpdate = true
  return texture
}

function noise(set: (x: number, y: number, hex: string) => void, palette: string[], seed: number) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      set(x, y, palette[Math.floor(n(x >> 1, y >> 1, seed) * palette.length)])
    }
  }
}

function rings(set: (x: number, y: number, hex: string) => void, a: string, b: string, seed: number) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - 7.5, y - 7.5)
      const ring = Math.floor(d + n(x, y, seed) * 0.6)
      set(x, y, ring % 2 ? a : b)
    }
  }
}

function bark(set: (x: number, y: number, hex: string) => void, tones: string[], crack: string, seed: number) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const col = tones[Math.floor(n(x * 0.35, y, seed) * tones.length)]
      const split = x % 5 === 2 && n(x, y, seed + 3) > 0.45
      set(x, y, split ? crack : col)
    }
  }
}

function planks(set: (x: number, y: number, hex: string) => void, boards: string[], line: string, seed: number) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const row = Math.floor(y / 4)
      const gap = y % 4 === 3 || (x === 7 && row % 2 === 0) || (x === 3 && row % 2 === 1)
      const tone = boards[(row + Math.floor(n(x, row, seed) * 2)) % boards.length]
      set(x, y, gap ? line : tone)
    }
  }
}

function cobble(set: (x: number, y: number, hex: string) => void, stones: string[], grout: string, seed: number) {
  noise(set, stones, seed)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (x % 4 === 0 || y % 4 === 3) set(x, y, grout)
      else if (n(x, y, seed + 1) > 0.86) set(x, y, grout)
    }
  }
}

function wool(set: (x: number, y: number, hex: string) => void, base: string, lint: string, seed: number) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      set(x, y, n(x, y, seed) > 0.78 ? lint : base)
    }
  }
}

const paints: Record<string, (set: (x: number, y: number, hex: string) => void) => void> = {
  grassTop: (set) => noise(set, ['#2a5c18', '#3d7a28', '#5a9a3c', '#8fd15a', '#c9b458'], 1),
  grassSide: (set) => {
    noise(set, ['#6b3d20', '#8a5a32', '#7a4a28', '#9a6a3e'], 2)
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const fringe = 4 + Math.floor(n(x, 0, 11) * 2) + (x % 3 === 0 ? 1 : 0)
        if (y < fringe) set(x, y, ['#3d7a28', '#5a9a3c', '#4f8c32'][Math.floor(n(x, y, 4) * 3)])
      }
    }
  },
  dirt: (set) => noise(set, ['#4a2410', '#6b3d20', '#8a5a32', '#c48a50'], 3),
  stone: (set) => cobble(set, ['#7b7b7b', '#8a8a8a', '#6e6e6e', '#9a9a9a'], '#5c5c5c', 5),
  gravel: (set) => noise(set, ['#4a4a44', '#8b8680', '#c4bfb6', '#6e5a40'], 6),
  water: (set) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const wave = (x + y + Math.floor(n(x, y, 7) * 2)) % 5
        set(x, y, wave < 2 ? '#7ec8f0' : wave === 2 ? '#3a6ea5' : '#1a3a68')
      }
    }
  },
  sand: (set) => noise(set, ['#a89460', '#c2b280', '#efe0b0', '#8a7038'], 8),
  oakBark: (set) => bark(set, ['#6b4a22', '#7a5528', '#5a3c1c', '#8a6230'], '#3a2414', 9),
  oakEnd: (set) => rings(set, '#c4a06a', '#8a6230', 10),
  birchBark: (set) => {
    noise(set, ['#d7d2c4', '#efeae0', '#c8c2b4'], 11)
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (n(x, y, 12) > 0.88 || (x % 7 === 2 && n(y, x, 13) > 0.55)) set(x, y, '#2a2418')
      }
    }
  },
  birchEnd: (set) => rings(set, '#efeae0', '#c8c2b4', 14),
  spruceBark: (set) => bark(set, ['#3d2a1a', '#4a3420', '#2a1c12'], '#1a1008', 15),
  spruceEnd: (set) => rings(set, '#6b4a22', '#3d2a1a', 16),
  leaves: (set) => noise(set, ['#163820', '#2f7a28', '#5a9a3c', '#8fd15a'], 17),
  birchLeaves: (set) => noise(set, ['#4a8c28', '#8fd15a', '#c6f06a', '#2f7a28'], 18),
  spruceLeaves: (set) => noise(set, ['#0e2414', '#1e4a28', '#3a6a3e', '#24661e'], 19),
  snow: (set) => noise(set, ['#b8c4d4', '#ffffff', '#e8eef5', '#8a9aac'], 20),
  coal: (set) => {
    cobble(set, ['#7b7b7b', '#6e6e6e', '#8a8a8a'], '#5c5c5c', 21)
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (n(x, y, 22) > 0.72) set(x, y, n(x, y, 23) > 0.5 ? '#1a1a1a' : '#2a2a2a')
      }
    }
  },
  iron: (set) => {
    cobble(set, ['#7b7b7b', '#8a8a8a', '#6e6e6e'], '#5c5c5c', 24)
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (n(x, y, 25) > 0.8) set(x, y, n(x, y, 26) > 0.5 ? '#c4b8a4' : '#d8c8a8')
      }
    }
  },
  flowerY: (set) => noise(set, ['#f2d04a', '#ffe566', '#c9a028', '#3d7a28'], 27),
  flowerR: (set) => noise(set, ['#d43c32', '#f25a48', '#a02820', '#3d7a28'], 28),
  tall: (set) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const blade = x % 3 === 1
        set(x, y, blade ? (n(x, y, 29) > 0.4 ? '#3d7a28' : '#5a9a3c') : '#2a5c1e')
      }
    }
  },
  reed: (set) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        set(x, y, x % 4 === 1 ? '#8a6230' : n(x, y, 30) > 0.5 ? '#4a8c3a' : '#3d7a28')
      }
    }
  },
  lily: (set) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5)
        set(x, y, d > 7 ? '#2a5080' : d > 6 ? '#24661e' : n(x, y, 31) > 0.6 ? '#4a9a38' : '#3d8a3a')
      }
    }
  },
  pumpkinSide: (set) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const groove = x % 4 === 0
        set(x, y, groove ? '#8a4a12' : n(x, y, 32) > 0.7 ? '#f2a03a' : '#e0892a')
      }
    }
  },
  pumpkinTop: (set) => {
    noise(set, ['#e0892a', '#f2a03a', '#c46e18'], 33)
    for (let y = 6; y < 10; y++) {
      for (let x = 6; x < 10; x++) set(x, y, '#4a7a28')
    }
  },
  mush: (set) => {
    noise(set, ['#c45c48', '#d46a54', '#a04838'], 34)
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (n(x, y, 35) > 0.84) set(x, y, '#f4ead2')
      }
    }
  },
  wool: (set) => wool(set, '#f4f0e6', '#d8d2c6', 36),
  cloud: (set) => wool(set, '#ffffff', '#9aa6b4', 37),
  plank: (set) => planks(set, ['#c4a06a', '#b08c58', '#d4b27a'], '#6b4a22', 38),
  cobble: (set) => cobble(set, ['#8b8680', '#7b7b7b', '#9a9a9a', '#6e6e6e'], '#4a4a4a', 39),
  darkOak: (set) => planks(set, ['#3a2a22', '#4a3428', '#2a1c16'], '#1a1008', 40),
  glowstone: (set) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const cell = (Math.floor(x / 4) + Math.floor(y / 4)) % 2
        set(x, y, cell ? '#ffe566' : n(x, y, 41) > 0.5 ? '#f2d04a' : '#cc9900')
      }
    }
  },
  lanternOff: (set) => noise(set, ['#e0892a', '#c46e18', '#8a4a12', '#f2a03a'], 42),
  planeRed: (set) => wool(set, '#c43c32', '#a02820', 43),
  planeCream: (set) => planks(set, ['#efe6d2', '#e0d4b8', '#f4ead2'], '#b08c58', 44),
  planeDark: (set) => planks(set, ['#3a2a22', '#2a1c16'], '#1a1008', 45),
  gold: (set) => {
    cobble(set, ['#d4af37', '#f2d04a', '#c49a20'], '#8a7010', 46)
  },
  skin: (set) => noise(set, ['#c68642', '#d4a05a', '#b87438', '#e0b070'], 47),
  shirt: (set) => wool(set, '#3d5a9a', '#2a4480', 48),
  pants: (set) => wool(set, '#3a4a2a', '#2a381c', 49),
  hat: (set) => wool(set, '#2b2218', '#1a140e', 50),
}

const faces: Record<string, [string, string, string]> = {
  grass: ['grassSide', 'grassTop', 'dirt'],
  wood: ['oakBark', 'oakEnd', 'oakEnd'],
  birch: ['birchBark', 'birchEnd', 'birchEnd'],
  spruce: ['spruceBark', 'spruceEnd', 'spruceEnd'],
  pumpkin: ['pumpkinSide', 'pumpkinTop', 'pumpkinSide'],
}

const extras: Partial<Record<string, THREE.MeshLambertMaterialParameters>> = {
  glowstone: { emissive: '#cc9900', emissiveIntensity: 0.7 },
  lanternOff: { emissive: '#6b2f08', emissiveIntensity: 0.22 },
}

const maps = new Map<string, THREE.CanvasTexture>()
const mats = new Map<string, THREE.Material | THREE.Material[]>()

function map(id: string, rx: number, ry: number) {
  let base = maps.get(id)
  if (!base) {
    const paint = paints[id]
    if (!paint) throw new Error(`unknown block texture ${id}`)
    base = tex(paint)
    maps.set(id, base)
  }
  const tiled = base.clone()
  tiled.repeat.set(rx, ry)
  tiled.needsUpdate = true
  return tiled
}

function lambert(id: string, rx: number, ry: number, extra?: THREE.MeshLambertMaterialParameters) {
  return new THREE.MeshLambertMaterial({
    map: map(id, rx, ry),
    ...extra,
    ...extras[id],
  })
}

export function blockMaterials(
  kind: string,
  scale: [number, number, number] = [1, 1, 1],
): THREE.Material | THREE.Material[] {
  const key = `${kind}:${scale}`
  const hit = mats.get(key)
  if (hit) return hit
  const [sx, sy, sz] = scale
  const [side, top, bottom] = faces[kind] ?? [kind, kind, kind]
  const extra = extras[kind]
  const made =
    side === top && top === bottom && sx === 1 && sy === 1 && sz === 1
      ? lambert(side, 1, 1, extra)
      : [
          lambert(side, sz, sy, extra),
          lambert(side, sz, sy, extra),
          lambert(top, sx, sz, extra),
          lambert(bottom, sx, sz, extra),
          lambert(side, sx, sy, extra),
          lambert(side, sx, sy, extra),
        ]
  mats.set(key, made)
  return made
}
