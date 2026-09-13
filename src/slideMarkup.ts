/** Slide canvas markup: `` `code` `` chips, `*emphasis*` / `**emphasis**`. */

export type Kind = 'text' | 'code' | 'em'
export type Piece = { kind: Kind; text: string }
export type SlideFonts = { body: string; em: string; code: string }

const MARK = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g
const CHIP = '#3a2414'
const GOLD = '#e2b84a'
const INK = '#1b140c'
const OAK = '#5c3a1e'
const PAD_X = 7
const PAD_Y = 4

export function parseMarkup(raw: string): Piece[] {
  const re = new RegExp(MARK.source, 'g')
  const pieces: Piece[] = []
  let last = 0
  for (const m of raw.matchAll(re)) {
    const i = m.index
    if (i > last) pieces.push({ kind: 'text', text: raw.slice(last, i) })
    pieces.push({ kind: m[1] != null ? 'code' : 'em', text: m[1] ?? m[2] ?? m[3] })
    last = i + m[0].length
  }
  if (last < raw.length) pieces.push({ kind: 'text', text: raw.slice(last) })
  return pieces
}

export function plain(raw: string) {
  return parseMarkup(raw).map((p) => p.text).join('')
}

type Atom = Piece

function atoms(raw: string): Atom[] {
  const out: Atom[] = []
  for (const p of parseMarkup(raw)) {
    if (p.kind !== 'text') {
      out.push(p)
      continue
    }
    for (const part of p.text.split(/(\s+)/)) {
      if (!part) continue
      out.push({ kind: 'text', text: /^\s+$/.test(part) ? ' ' : part })
    }
  }
  return out
}

function measure(ctx: CanvasRenderingContext2D, atom: Atom, fonts: SlideFonts) {
  if (atom.text === ' ') {
    ctx.font = fonts.body
    return ctx.measureText(' ').width
  }
  if (atom.kind === 'code') {
    ctx.font = fonts.code
    return ctx.measureText(atom.text).width + PAD_X * 2
  }
  ctx.font = atom.kind === 'em' ? fonts.em : fonts.body
  return ctx.measureText(atom.text).width
}

function wrap(ctx: CanvasRenderingContext2D, raw: string, width: number, fonts: SlideFonts) {
  const rows: Atom[][] = []
  let row: Atom[] = []
  let used = 0
  const commit = () => {
    while (row[0]?.text === ' ') row.shift()
    while (row.at(-1)?.text === ' ') row.pop()
    if (row.length) rows.push(row)
    row = []
    used = 0
  }
  for (const atom of atoms(raw)) {
    const w = measure(ctx, atom, fonts)
    if (atom.text === ' ') {
      if (row.length) {
        row.push(atom)
        used += w
      }
      continue
    }
    if (row.length && used + w > width) commit()
    row.push(atom)
    used += w
  }
  commit()
  return rows.length ? rows : [[]]
}

function box(m: TextMetrics, fallback: number) {
  return {
    up: m.actualBoundingBoxAscent || fallback * 0.8,
    down: m.actualBoundingBoxDescent || fallback * 0.2,
  }
}

function paintChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fonts: SlideFonts,
) {
  ctx.font = fonts.body
  const body = box(ctx.measureText('Hg'), 28)
  const mid = y - body.up * 0.52
  ctx.font = fonts.code
  const code = box(ctx.measureText(text), 14)
  const w = Math.ceil(ctx.measureText(text).width + PAD_X * 2)
  const h = Math.ceil(code.up + code.down + PAD_Y * 2)
  const left = Math.round(x)
  const top = Math.round(mid - h / 2)
  ctx.fillStyle = CHIP
  ctx.fillRect(left, top, w, h)
  ctx.fillStyle = GOLD
  ctx.fillText(text, left + PAD_X, top + PAD_Y + code.up)
  return w
}

function paintRow(
  ctx: CanvasRenderingContext2D,
  row: Atom[],
  x: number,
  y: number,
  fonts: SlideFonts,
) {
  let cx = x
  for (const atom of row) {
    if (atom.kind === 'code') {
      cx += paintChip(ctx, atom.text, cx, y, fonts)
      continue
    }
    ctx.font = atom.kind === 'em' ? fonts.em : fonts.body
    ctx.fillStyle = atom.kind === 'em' ? OAK : INK
    ctx.fillText(atom.text, cx, y)
    cx += ctx.measureText(atom.text).width
  }
}

export function lines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
  fonts: SlideFonts,
) {
  const rows = wrap(ctx, text, width, fonts)
  rows.forEach((row, i) => paintRow(ctx, row, x, y + i * lineHeight, fonts))
  return y + rows.length * lineHeight
}
