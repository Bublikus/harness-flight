import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getSlideArt } from '../SlideArt'
import { SLIDES, type Slide } from '../slides'
import { waypointPos } from './Beacons'
import { blockMaterials } from './blockTextures'
import { slidePose } from './worldPoses'

const WIDTH = 16
const HEIGHT = 7.5
const TEXTURE_WIDTH = 1536
const TEXTURE_HEIGHT = 720
const ART_BACKGROUNDS: Record<string, string> = {
  sky: '#7ec4ee',
  crt: '#1a1210',
  ghost: '#2a2430',
  chat: '#6a8cbf',
  hands: '#4a3a50',
  pile: '#c45c3a',
  dash: '#2a3a4a',
  gates: '#3a2a1a',
  bars: '#efe6d2',
  bug: '#8fd15a',
  tree: '#8ec8ee',
  flag: '#7ec4ee',
}

function lines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
) {
  const rows: string[] = []
  for (const word of text.split(' ')) {
    const next = rows.at(-1)
    if (!next || ctx.measureText(`${next} ${word}`).width > width) rows.push(word)
    else rows[rows.length - 1] = `${next} ${word}`
  }
  rows.forEach((row, i) => ctx.fillText(row, x, y + i * lineHeight))
  return y + rows.length * lineHeight
}

function drawArt(ctx: CanvasRenderingContext2D, id: string) {
  const art = getSlideArt(id)
  const x = 52
  const y = 205
  const size = 302
  const scale = size / 64

  ctx.fillStyle = ART_BACKGROUNDS[art.className]
  ctx.fillRect(x, y, size, size)
  ctx.strokeStyle = '#3a2414'
  ctx.lineWidth = 12
  ctx.strokeRect(x, y, size, size)
  for (const [cx, cy, w, h, fill] of art.cells) {
    ctx.fillStyle = fill
    ctx.fillRect(x + cx * scale, y + cy * scale, w * scale, h * scale)
  }
  if (!art.polygon) return
  ctx.fillStyle = art.polygon.fill
  ctx.beginPath()
  art.polygon.points.split(' ').forEach((point, i) => {
    const [px, py] = point.split(',').map(Number)
    if (i) ctx.lineTo(x + px * scale, y + py * scale)
    else ctx.moveTo(x + px * scale, y + py * scale)
  })
  ctx.fill()
}

function drawSlide(canvas: HTMLCanvasElement, slide: Slide) {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f4ead2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawArt(ctx, slide.id)

  ctx.fillStyle = '#5c3a1e'
  ctx.font = '28px "Press Start 2P", monospace'
  ctx.fillText(slide.era.toUpperCase(), 52, 82)

  ctx.fillStyle = '#1b140c'
  ctx.font = '44px "Press Start 2P", monospace'
  let y = lines(ctx, slide.title, 405, 170, 1070, 58)

  ctx.font = '600 40px Outfit, sans-serif'
  y = lines(ctx, slide.lead, 405, y + 28, 1070, 49)

  ctx.font = '36px Outfit, sans-serif'
  for (const point of slide.points) {
    ctx.fillStyle = '#3d7a28'
    ctx.fillRect(405, y + 16, 14, 14)
    ctx.fillStyle = '#1b140c'
    y = lines(ctx, point, 438, y, 1037, 45) + 12
  }
}

function routePose(index: number, facing: 1 | -1) {
  const [x, y, z] = waypointPos(index)
  const previous = index - facing
  const [rx, , rz] = waypointPos(
    previous >= 0 && previous < SLIDES.length ? previous : index + facing,
  )
  const sign = previous >= 0 && previous < SLIDES.length ? 1 : -1
  const dx = (x - rx) * sign
  const dz = (z - rz) * sign
  const length = Math.hypot(dx, dz)
  const forwardX = dx / length
  const forwardZ = dz / length
  return {
    x: x + forwardX * 4.8,
    y: y + 3,
    z: z + forwardZ * 4.8,
    rotation: Math.atan2(-forwardX, -forwardZ),
  }
}

function WorldSlideCard({
  index,
  started,
  flying,
  approaching,
  facing,
  active,
  onExited,
}: {
  index: number
  started: boolean
  flying: boolean
  approaching: boolean
  facing: 1 | -1
  active: boolean
  onExited: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const rise = useRef(0)
  const velocity = useRef(0)
  const scale = useRef(1)
  const { gl, viewport } = useThree()
  const slide = SLIDES[index]
  const pose = useMemo(() => routePose(index, facing), [index, facing])
  const raised = active && started && (!flying || approaching)
  const frame = useMemo(() => blockMaterials('plank', [WIDTH + 0.5, HEIGHT + 0.5, 0.34]), [])
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TEXTURE_WIDTH
    canvas.height = TEXTURE_HEIGHT
    drawSlide(canvas, slide)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    return { canvas, texture }
  }, [gl, slide])

  useEffect(() => {
    let active = true
    void document.fonts.ready.then(() => {
      if (!active) return
      drawSlide(canvas, slide)
      texture.needsUpdate = true
    })
    return () => {
      active = false
      texture.dispose()
    }
  }, [canvas, slide, texture])

  useFrame((state, dt) => {
    const card = group.current
    if (!card) return
    const target = raised ? 1 : 0
    if (
      !target &&
      Math.abs(rise.current) < 0.002 &&
      Math.abs(velocity.current) < 0.002
    ) {
      card.visible = false
      rise.current = 0
      velocity.current = 0
      if (active) {
        slidePose.valid = false
        slidePose.rise = 0
      }
      if (!active) onExited()
      return
    }

    const d = Math.min(dt, 0.05)
    card.visible = true
    velocity.current =
      (velocity.current + (target - rise.current) * 68 * d) *
      Math.exp(-9 * d)
    rise.current += velocity.current * d
    card.position.y = THREE.MathUtils.lerp(3.9, pose.y, rise.current)

    const worldWidth = viewport.getCurrentViewport(state.camera, card.position).width
    const targetScale = THREE.MathUtils.clamp(worldWidth * 0.86 / WIDTH, 0.46, 1)
    scale.current = THREE.MathUtils.damp(scale.current, targetScale, 8, d)
    card.scale.setScalar(scale.current)

    if (active) {
      card.updateWorldMatrix(true, false)
      card.getWorldPosition(slidePose.pos)
      // Local axes → world (board faces +Z toward the audience / plane).
      slidePose.right.set(1, 0, 0).transformDirection(card.matrixWorld)
      slidePose.up.set(0, 1, 0).transformDirection(card.matrixWorld)
      slidePose.normal.set(0, 0, 1).transformDirection(card.matrixWorld)
      const s = scale.current
      slidePose.half.set(
        ((WIDTH + 0.5) * 0.5) * s,
        ((HEIGHT + 0.5) * 0.5) * s,
        // Thicker than the 0.34 visual slab so a max-dt bird step cannot tunnel either face.
        Math.max(0.85, 0.17 * s + 0.7),
      )
      slidePose.rise = rise.current
      // Stay solid while the mesh is still up (sinking / departing included).
      slidePose.valid = rise.current > 0.08
    }
  })

  return (
    <group
      ref={group}
      position={[pose.x, 3.9, pose.z]}
      rotation={[0, pose.rotation, 0]}
      visible={false}
    >
      <mesh material={frame} castShadow receiveShadow>
        <boxGeometry args={[WIDTH + 0.5, HEIGHT + 0.5, 0.34]} />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Catch bird/plane shadows without dunking slide copy under Lambert lighting. */}
      <mesh position={[0, 0, 0.185]} receiveShadow>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <shadowMaterial transparent opacity={0.42} />
      </mesh>
    </group>
  )
}

export function WorldSlide({
  index,
  started,
  flying,
  approaching,
  facing,
}: {
  index: number
  started: boolean
  flying: boolean
  approaching: boolean
  facing: 1 | -1
}) {
  const [state, setState] = useState(() => ({
    current: index,
    cards: [{ index, facing }],
  }))
  if (state.current !== index)
    setState({
      current: index,
      cards: state.cards.some((card) => card.index === index)
        ? state.cards
        : [...state.cards, { index, facing }],
    })

  const remove = useCallback((exited: number) => {
    setState((state) =>
      exited === state.current
        ? state
        : {
            ...state,
            cards: state.cards.filter((card) => card.index !== exited),
          },
    )
  }, [])

  return state.cards.map((card) => (
    <WorldSlideCard
      key={SLIDES[card.index].id}
      {...card}
      started={started}
      flying={flying}
      approaching={approaching}
      active={card.index === index}
      onExited={() => remove(card.index)}
    />
  ))
}
