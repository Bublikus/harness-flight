import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { assistCols, assistSrcs } from './assistImages'
import { plain } from './slideMarkup'
import { SLIDES } from './slides'
import './assist.css'

const KEY = 'harness-flight-assist-v1'
const MIN_W = 280
const MIN_H = 200
const ZOOM = 1.12 ** 0.2
const CLICK = 3
const FIT_PAD = 12

type Dock = 'left' | 'right' | 'top' | 'bottom'
type View = { z: number; x: number; y: number }
const GRID: View = { z: 1, x: 0, y: 0 }
type Saved = {
  x: number
  y: number
  w: number
  h: number
  dock: Dock | null
  home: { x: number; y: number }
  views: Record<string, View>
}

type Pose = Saved & { vx: number; vy: number; restore: boolean; pending: Dock | null }

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n))
}

function nearView(a: View, b: View) {
  return Math.abs(a.z - b.z) < 0.04 && Math.hypot(a.x - b.x, a.y - b.y) < 4
}

function hitPhoto(grid: HTMLElement, x: number, y: number) {
  for (const img of grid.querySelectorAll('img')) {
    const r = img.getBoundingClientRect()
    if (x >= r.left && x < r.right && y >= r.top && y < r.bottom) return img
  }
  return null
}

function pickPhoto(grid: HTMLElement, img: HTMLImageElement | null) {
  const many = grid.querySelectorAll('img').length > 1
  grid.classList.toggle('is-picking', !!img && many)
  for (const el of grid.querySelectorAll('img')) el.classList.toggle('is-selected', el === img)
}

function photoBox(img: HTMLImageElement) {
  const r = img.getBoundingClientRect()
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  if (!nw || !nh) return r
  const s = Math.min(r.width / nw, r.height / nh)
  const w = nw * s
  const h = nh * s
  return { left: r.left + (r.width - w) / 2, top: r.top + (r.height - h) / 2, width: w, height: h }
}

function fitPhoto(img: HTMLImageElement, stage: DOMRectReadOnly, v: View): View {
  const r = photoBox(img)
  const gx = (r.left - stage.left - v.x) / v.z
  const gy = (r.top - stage.top - v.y) / v.z
  const gw = r.width / v.z
  const gh = r.height / v.z
  const z = clamp(Math.min((stage.width - FIT_PAD * 2) / gw, (stage.height - FIT_PAD * 2) / gh), 0.4, 8)
  return { z, x: stage.width / 2 - (gx + gw / 2) * z, y: stage.height / 2 - (gy + gh / 2) * z }
}

function load(): Saved {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let w = 440
  let h = 300
  let home = { x: vw - 440 - 24, y: 72 }
  let views: Record<string, View> = {}
  let dock: Dock = 'right'
  let from: { x: number; y: number } | undefined
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as Saved
      if (s.w && s.h) {
        w = clamp(s.w, MIN_W, vw - 16)
        h = clamp(s.h, MIN_H, vh - 16)
        home = {
          x: clamp(s.home?.x ?? home.x, 16, vw - w - 16),
          y: clamp(s.home?.y ?? home.y, 16, vh - h - 16),
        }
        views = s.views ?? {}
        dock = s.dock ?? 'right'
        if (Number.isFinite(s.x) && Number.isFinite(s.y)) from = { x: s.x, y: s.y }
      }
    }
  } catch {
    /* keep defaults */
  }
  return { ...park(dock, w, h, from && { x: from.x + w / 2, y: from.y + h / 2 }), w, h, dock, home, views }
}

function save(s: Saved) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      dock: s.dock,
      home: s.home,
      views: s.views,
    }),
  )
}

function tabAt(p: { x: number; y: number; w: number; h: number }) {
  return { x: p.x + p.w / 2, y: p.y + p.h / 2 }
}

/** Park off `dock`. `at` is the peek-tab / pointer point (canvas side-center), not the card origin. */
function park(dock: Dock, w: number, h: number, at?: { x: number; y: number }) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const tab = 36
  const cy = at
    ? clamp(at.y - h / 2, tab - h / 2, vh - tab - h / 2)
    : clamp(vh / 2 - h / 2, 8, vh - h - 8)
  const cx = at
    ? clamp(at.x - w / 2, tab - w / 2, vw - tab - w / 2)
    : clamp(vw / 2 - w / 2, 8, vw - w - 8)
  if (dock === 'left') return { x: -w, y: cy }
  if (dock === 'right') return { x: vw, y: cy }
  if (dock === 'top') return { x: cx, y: -h }
  return { x: cx, y: vh }
}

function visibleFrac(p: { x: number; y: number; w: number; h: number }) {
  const x0 = Math.max(p.x, 0)
  const y0 = Math.max(p.y, 0)
  const x1 = Math.min(p.x + p.w, window.innerWidth)
  const y1 = Math.min(p.y + p.h, window.innerHeight)
  return (Math.max(0, x1 - x0) * Math.max(0, y1 - y0)) / (p.w * p.h)
}

function ensureExit(side: Dock, p: Pose) {
  const out = 700
  if (side === 'left') p.vx = Math.min(p.vx, -out)
  else if (side === 'right') p.vx = Math.max(p.vx, out)
  else if (side === 'top') p.vy = Math.min(p.vy, -out)
  else p.vy = Math.max(p.vy, out)
}

function holdOnscreen(p: Pose) {
  if (p.dock === 'left') p.x = Math.max(p.x, -p.w)
  else if (p.dock === 'right') p.x = Math.min(p.x, window.innerWidth)
  else if (p.dock === 'top') p.y = Math.max(p.y, -p.h)
  else if (p.dock === 'bottom') p.y = Math.min(p.y, window.innerHeight)
}

function nudgeDocked(p: Pose, dx: number, dy: number, at: { x: number; y: number }) {
  if (!p.dock) return
  p.x += dx
  p.y += dy
  holdOnscreen(p)
  if (visibleFrac(p) > 0.2) return
  const tab = 36
  const wrap = 20
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (p.dock === 'left' || p.dock === 'right') {
    const min = tab - p.h / 2
    const max = vh - tab - p.h / 2
    const next = p.y < min - wrap ? 'top' : p.y > max + wrap ? 'bottom' : null
    if (next) {
      p.dock = next
      Object.assign(p, park(next, p.w, p.h, at))
    }
    return
  }
  const min = tab - p.w / 2
  const max = vw - tab - p.w / 2
  const next = p.x < min - wrap ? 'left' : p.x > max + wrap ? 'right' : null
  if (next) {
    p.dock = next
    Object.assign(p, park(next, p.w, p.h, at))
  }
}

function flickDock(vx: number, vy: number): [Dock, Dock | null] {
  if (Math.abs(vx) >= Math.abs(vy)) {
    return [vx < 0 ? 'left' : 'right', vy < 0 ? 'top' : vy > 0 ? 'bottom' : null]
  }
  return [vy < 0 ? 'top' : 'bottom', vx < 0 ? 'left' : vx > 0 ? 'right' : null]
}

function pickDock(x: number, y: number, w: number, h: number, vx: number, vy: number): Dock | null {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const offL = Math.max(0, -x) / w
  const offR = Math.max(0, x + w - vw) / w
  const offT = Math.max(0, -y) / h
  const offB = Math.max(0, y + h - vh) / h
  const off = { left: offL, right: offR, top: offT, bottom: offB }
  const worst = Math.max(offL, offR, offT, offB)
  const caught = worst >= 0.42
  const near = (side: Dock) =>
    side === 'left'
      ? x < w * 0.35
      : side === 'right'
        ? x + w > vw - w * 0.35
        : side === 'top'
          ? y < h * 0.35
          : y + h > vh - h * 0.35
  const swallow = (side: Dock) => {
    const fast = Math.abs(side === 'left' || side === 'right' ? vx : vy) > 900
    return (caught && off[side] > 0) || (fast && near(side))
  }
  // Flick direction wins over nearest overflow so the hide continues the throw
  if (Math.hypot(vx, vy) > 40) {
    const [dir, alt] = flickDock(vx, vy)
    if (swallow(dir)) return dir
    if (alt && swallow(alt)) return alt
  }
  if (!caught) return null
  if (offL === worst) return 'left'
  if (offR === worst) return 'right'
  if (offT === worst) return 'top'
  return 'bottom'
}

const HIDE = 'harness-assist-hide'
const TOGGLE = 'harness-assist-toggle'

/** Park the on-screen canvas (no-op if already docked). Peek-tab click still uses the same path. */
export function hideAssistOverlay() {
  window.dispatchEvent(new Event(HIDE))
}

/** Tuck if expanded; expand to home if parked / peek-only / mid-tuck. */
export function toggleAssistOverlay() {
  window.dispatchEvent(new Event(TOGGLE))
}

export function AssistOverlay({ index }: { index: number }) {
  const root = useRef<HTMLElement>(null)
  const peek = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const pose = useRef<Pose>({ ...load(), vx: 0, vy: 0, restore: false, pending: null })
  const parkAim = useRef<{ x: number; y: number } | null>(null)
  const hidePeek = useRef(false)
  const drag = useRef<{
    kind: 'move' | 'pan' | 'resize'
    px: number
    py: number
    t: number
    moved: boolean
    docked: boolean
    fromTab: boolean
  } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{
    dist: number
    z: number
    x: number
    y: number
    cx: number
    cy: number
  } | null>(null)
  const zoomAim = useRef<(View & { i: number }) | null>(null)
  const indexRef = useRef(index)
  indexRef.current = index
  const [shownIndex, setShownIndex] = useState(index)
  const shownRef = useRef(shownIndex)
  shownRef.current = shownIndex
  const srcs = assistSrcs(shownIndex)
  const srcKey = srcs.join('\0')
  const start = pose.current
  const lastDock = useRef<Dock>(start.dock ?? 'right')
  const [dock, setDock] = useState<Dock | null>(start.dock)

  const viewOf = () => pose.current.views[shownRef.current] ?? { z: 1, x: 0, y: 0 }

  const aimOf = (): View => {
    const a = zoomAim.current
    return a && a.i === shownRef.current ? a : viewOf()
  }

  const paint = () => {
    const el = root.current
    if (!el) return
    const p = pose.current
    el.style.transform = `translate(${p.x}px, ${p.y}px)`
    el.style.width = `${p.w}px`
    el.style.height = `${p.h}px`
    el.dataset.dock = p.dock ?? ''
    el.classList.toggle('docked', !!p.dock)
    el.classList.toggle('dragging', !!drag.current || !!p.pending)
    const parked = p.dock ?? p.pending
    if (parked) lastDock.current = parked
    const side = hidePeek.current ? null : parked ?? lastDock.current
    setDock((prev) => (side === prev ? prev : side))
    const tab = peek.current
    if (tab) {
      tab.dataset.dock = side ?? ''
      tab.style.visibility = side ? '' : 'hidden'
      tab.setAttribute('aria-label', p.dock ? 'Show assist canvas' : 'Hide assist canvas')
      tab.setAttribute('aria-hidden', side ? 'false' : 'true')
      tab.tabIndex = side ? 0 : -1
    }
    const image = sheet.current
    if (!image) return
    const v = viewOf()
    image.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`
  }

  const revealPeek = (side: Dock) => {
    hidePeek.current = false
    const tab = peek.current
    if (!tab) return
    tab.dataset.dock = side
    tab.style.visibility = ''
    tab.setAttribute('aria-label', 'Show assist canvas')
    tab.setAttribute('aria-hidden', 'false')
    tab.tabIndex = 0
    tab.classList.add('tuck')
    void tab.offsetWidth
    tab.classList.remove('tuck')
    setDock(side)
  }

  const writeView = (next: View) => {
    pose.current.views[shownRef.current] = next
    const image = sheet.current
    if (image) image.style.transform = `translate(${next.x}px, ${next.y}px) scale(${next.z})`
  }

  useEffect(() => {
    paint()
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.04, (now - last) / 1000)
      last = now
      const a = zoomAim.current
      if (a && a.i !== shownRef.current) zoomAim.current = null
      else if (a) {
        const v = viewOf()
        const t = 1 - Math.exp(-14 * dt)
        const next = {
          z: v.z + (a.z - v.z) * t,
          x: v.x + (a.x - v.x) * t,
          y: v.y + (a.y - v.y) * t,
        }
        if (Math.abs(a.z - next.z) < 0.002 && Math.hypot(a.x - next.x, a.y - next.y) < 0.5) {
          writeView({ z: a.z, x: a.x, y: a.y })
          zoomAim.current = null
          save(pose.current)
        } else writeView(next)
      }
      const p = pose.current
      if (drag.current) return
      if (p.restore && !p.dock) {
        p.x += (p.home.x - p.x) * (1 - Math.exp(-14 * dt))
        p.y += (p.home.y - p.y) * (1 - Math.exp(-14 * dt))
        if (Math.hypot(p.home.x - p.x, p.home.y - p.y) < 1) {
          p.x = p.home.x
          p.y = p.home.y
          p.restore = false
          save(p)
        }
        paint()
        return
      }
      if (p.dock) return
      p.vx = clamp(p.vx, -2400, 2400)
      p.vy = clamp(p.vy, -2400, 2400)
      const side = p.pending ?? pickDock(p.x, p.y, p.w, p.h, p.vx, p.vy) ?? pickDock(p.x, p.y, p.w, p.h, 0, 0)
      if (side) {
        p.pending = side
        ensureExit(side, p)
        const to = park(side, p.w, p.h, tabAt(p))
        p.x += p.vx * dt
        p.y += p.vy * dt
        // Dock axis only; keep along-edge pose until the sheet is off-screen
        if (side === 'left' || side === 'right') {
          p.vy *= Math.exp(-8 * dt)
          p.vx += (to.x - p.x) * 8 * dt
        } else {
          p.vx *= Math.exp(-8 * dt)
          p.vy += (to.y - p.y) * 8 * dt
        }
        const done =
          (side === 'right' && p.x >= to.x - 2) ||
          (side === 'left' && p.x <= to.x + 2) ||
          (side === 'bottom' && p.y >= to.y - 2) ||
          (side === 'top' && p.y <= to.y + 2)
        if (done) {
          const end = park(side, p.w, p.h, parkAim.current ?? tabAt(p))
          parkAim.current = null
          p.x = end.x
          p.y = end.y
          p.vx = 0
          p.vy = 0
          p.dock = side
          p.pending = null
          setShownIndex(indexRef.current)
          const slideIn = hidePeek.current
          save(p)
          const node = root.current
          if (node) {
            node.classList.add('dragging')
            node.style.transform = `translate(${end.x}px, ${end.y}px)`
            void node.offsetWidth
          }
          paint()
          if (slideIn) {
            requestAnimationFrame(() => {
              if (pose.current.dock === side && !drag.current) revealPeek(side)
            })
          }
          return
        }
        paint()
        return
      }
      p.vx *= Math.exp(-5 * dt)
      p.vy *= Math.exp(-5 * dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      const speed = Math.hypot(p.vx, p.vy)
      if (speed < 8) {
        if (speed > 0) {
          p.vx = 0
          p.vy = 0
          p.x = clamp(p.x, 16, window.innerWidth - p.w - 16)
          p.y = clamp(p.y, 16, window.innerHeight - p.h - 16)
          p.home = { x: p.x, y: p.y }
          save(p)
          paint()
        }
        return
      }
      paint()
    }
    raf = requestAnimationFrame(tick)
    const onResize = () => {
      const p = pose.current
      p.w = clamp(p.w, MIN_W, window.innerWidth - 16)
      p.h = clamp(p.h, MIN_H, window.innerHeight - 16)
      if (p.dock) Object.assign(p, park(p.dock, p.w, p.h, tabAt(p)))
      else {
        p.x = clamp(p.x, 16, window.innerWidth - p.w - 16)
        p.y = clamp(p.y, 16, window.innerHeight - p.h - 16)
      }
      paint()
      save(p)
    }
    const tuck = () => {
      const p = pose.current
      if (p.dock || p.pending) return
      const side = lastDock.current
      hidePeek.current = true
      parkAim.current = null
      p.restore = false
      p.pending = side
      p.dock = null
      if (side === 'left' || side === 'right') p.vy = 0
      else p.vx = 0
      ensureExit(side, p)
      const active = document.activeElement
      if (active instanceof HTMLElement && active.closest('.assist')) active.blur()
      save(p)
      paint()
    }
    const expand = () => {
      const p = pose.current
      if (!p.dock && !p.pending) return
      hidePeek.current = false
      parkAim.current = null
      p.dock = null
      p.pending = null
      p.restore = false
      p.x = p.home.x
      p.y = p.home.y
      p.vx = 0
      p.vy = 0
      save(p)
      paint()
    }
    const onToggle = () => {
      const p = pose.current
      if (p.dock || p.pending) expand()
      else tuck()
    }
    const onUp = (e: globalThis.PointerEvent) => {
      pointers.current.delete(e.pointerId)
      if (pinch.current) {
        pinch.current = pointers.current.size >= 2 ? pinch.current : null
        if (pinch.current) return
        save(pose.current)
        paint()
        return
      }
      const d = drag.current
      const p = pose.current
      if (d?.kind === 'move' && d.fromTab && !d.docked && !d.moved) {
        tuck()
      } else if (d?.kind === 'move' && d.docked && (!d.moved || visibleFrac(p) >= 2 / 3)) {
        hidePeek.current = false
        parkAim.current = null
        p.dock = null
        p.pending = null
        p.restore = false
        p.x = p.home.x
        p.y = p.home.y
        p.vx = 0
        p.vy = 0
      } else if (d?.kind === 'move' && d.docked) {
        const side =
          pickDock(p.x, p.y, p.w, p.h, p.vx, p.vy) ??
          pickDock(p.x, p.y, p.w, p.h, 0, 0) ??
          p.dock ??
          'right'
        hidePeek.current = true
        parkAim.current = { x: e.clientX, y: e.clientY }
        p.pending = side
        p.dock = null
        if (side === 'left' || side === 'right') p.vy = 0
        else p.vx = 0
        ensureExit(side, p)
      } else if (d?.kind === 'move' && !p.dock) {
        // Keep exact release pose + velocity; RAF coasts into park / settle (no teleport)
        const side = pickDock(p.x, p.y, p.w, p.h, p.vx, p.vy) ?? pickDock(p.x, p.y, p.w, p.h, 0, 0)
        if (side) {
          hidePeek.current = true
          parkAim.current = null
          p.pending = side
          p.dock = null
          ensureExit(side, p)
        } else {
          p.pending = null
        }
      } else if (d?.kind === 'pan' && !d.moved) {
        const node = stage.current
        const grid = sheet.current
        const img = grid && hitPhoto(grid, e.clientX, e.clientY)
        if (node && grid && img) {
          const box = node.getBoundingClientRect()
          const painted = viewOf()
          const fit = fitPhoto(img, box, painted)
          const next = nearView(aimOf(), fit) ? GRID : fit
          zoomAim.current = { i: shownRef.current, ...next }
          pickPhoto(grid, next === GRID ? null : img)
        }
      }
      drag.current = null
      const el = root.current
      if (el && !pose.current.pending) {
        el.classList.remove('dragging')
        void el.offsetWidth
      }
      save(p)
      paint()
    }
    const onWinMove = (e: globalThis.PointerEvent) => {
      if (pointers.current.has(e.pointerId))
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const pin = pinch.current
      if (pin && pointers.current.size >= 2) {
        const pts = [...pointers.current.values()]
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
        if (pin.dist < 8) return
        const node = stage.current
        if (!node) return
        const box = node.getBoundingClientRect()
        const cx = (pts[0].x + pts[1].x) / 2 - box.left
        const cy = (pts[0].y + pts[1].y) / 2 - box.top
        const next = clamp(pin.z * (dist / pin.dist) ** 0.2, 0.4, 8)
        const k = next / pin.z
        zoomAim.current = {
          i: shownRef.current,
          z: next,
          x: cx - (pin.cx - pin.x) * k,
          y: cy - (pin.cy - pin.y) * k,
        }
        return
      }
      const d = drag.current
      if (!d) return
      const now = performance.now()
      const dx = e.clientX - d.px
      const dy = e.clientY - d.py
      if (Math.hypot(dx, dy) > CLICK) d.moved = true
      const dt = Math.max(0.008, (now - d.t) / 1000)
      const box = pose.current
      if (d.kind === 'move') {
        if (box.dock) {
          if (d.moved) {
            nudgeDocked(box, dx, dy, { x: e.clientX, y: e.clientY })
            if (Math.hypot(dx, dy) > CLICK) {
              box.vx = dx / dt
              box.vy = dy / dt
            }
          }
        } else {
          box.x += dx
          box.y += dy
          if (Math.hypot(dx, dy) > CLICK) {
            box.vx = dx / dt
            box.vy = dy / dt
          }
        }
        paint()
      } else if (d.kind === 'pan') {
        if (d.moved) {
          const v = viewOf()
          writeView({ ...v, x: v.x + dx, y: v.y + dy })
          const aim = zoomAim.current
          if (aim && aim.i === shownRef.current) {
            aim.x += dx
            aim.y += dy
          }
        }
      } else {
        box.w = clamp(box.w + dx, MIN_W, window.innerWidth - 16)
        box.h = clamp(box.h + dy, MIN_H, window.innerHeight - 16)
        paint()
      }
      d.px = e.clientX
      d.py = e.clientY
      d.t = now
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return
      const typing =
        e.target instanceof HTMLElement &&
        !!e.target.closest('input, textarea, select, [contenteditable="true"]')
      if (typing) return
      const p = pose.current
      if (p.dock || p.pending) return
      e.preventDefault()
      tuck()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onWinMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener(HIDE, tuck)
    window.addEventListener(TOGGLE, onToggle)
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onWinMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener(HIDE, tuck)
      window.removeEventListener(TOGGLE, onToggle)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    paint()
  }, [shownIndex, srcKey, dock])

  useEffect(() => {
    const grid = sheet.current
    if (grid) pickPhoto(grid, null)
  }, [shownIndex, srcKey])

  useEffect(() => {
    if (pose.current.dock) setShownIndex(index)
  }, [index])

  useEffect(() => {
    const node = stage.current
    if (!node) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const box = node.getBoundingClientRect()
      const cx = e.clientX - box.left
      const cy = e.clientY - box.top
      const v = aimOf()
      const next = clamp(v.z * (e.deltaY < 0 ? ZOOM : 1 / ZOOM), 0.4, 8)
      const k = next / v.z
      zoomAim.current = {
        i: shownRef.current,
        z: next,
        x: cx - (cx - v.x) * k,
        y: cy - (cy - v.y) * k,
      }
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  const begin = (kind: 'move' | 'pan' | 'resize', e: PointerEvent<HTMLElement>, fromTab = false) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = pose.current
    p.vx = 0
    p.vy = 0
    p.restore = false
    drag.current = {
      kind,
      px: e.clientX,
      py: e.clientY,
      t: performance.now(),
      moved: false,
      docked: !!p.dock,
      fromTab,
    }
  }

  const beginPan = (e: PointerEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size >= 2) {
      drag.current = null
      const pts = [...pointers.current.values()]
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      const node = stage.current
      if (!node || dist < 8) return
      const box = node.getBoundingClientRect()
      const cx = (pts[0].x + pts[1].x) / 2 - box.left
      const cy = (pts[0].y + pts[1].y) / 2 - box.top
      const v = aimOf()
      pinch.current = { dist, z: v.z, x: v.x, y: v.y, cx, cy }
      return
    }
    begin('pan', e)
  }

  const slide = SLIDES[shownIndex]
  const n = String(shownIndex + 1).padStart(2, '0')
  const cols = assistCols(srcs.length)
  const leftover = srcs.length % cols

  return (
    <aside
      ref={root}
      className={start.dock ? 'assist docked' : 'assist'}
      style={{
        transform: `translate(${start.x}px, ${start.y}px)`,
        width: start.w,
        height: start.h,
      }}
      data-dock={start.dock ?? ''}
    >
      <header className="assist-bar" onPointerDown={(e) => begin('move', e)}>
        <span>ASSIST · {n}</span>
        <span className="assist-title">{plain(slide.title)}</span>
      </header>
      <div ref={stage} className="assist-view" onPointerDown={beginPan}>
        <div
          ref={sheet}
          className="assist-grid"
          data-n={srcs.length}
          data-cols={cols}
        >
          {(leftover ? srcs.slice(0, -leftover) : srcs).map((src) => (
            <img key={src} src={src} alt="" draggable={false} />
          ))}
          {leftover > 0 && (
            <div className="assist-last-row">
              {srcs.slice(-leftover).map((src) => (
                <img key={src} src={src} alt="" draggable={false} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="assist-resize" onPointerDown={(e) => begin('resize', e)} />
      <button
        ref={peek}
        type="button"
        className="assist-tab"
        data-dock={dock ?? ''}
        aria-label={start.dock ? 'Show assist canvas' : 'Hide assist canvas'}
        aria-hidden={!dock}
        tabIndex={dock ? 0 : -1}
        onPointerDown={(e) => begin('move', e, true)}
      >
        {n}
      </button>
    </aside>
  )
}
