/** Procedural talk SFX via Web Audio — no sample files. Unlock on a user gesture. */

const MUTE_KEY = 'harness-flight-mute'
const VOLUME_KEY = 'harness-flight-volume'
/** Max master gain at volume=1. ~0.85 keeps a little headroom for stacked fireworks. */
const MASTER = 0.85

import { isMobileWorld } from './device'

/** Match HUD mobile media: no AudioContext / SFX on touch / coarse pointers. */
export function audioEnabled() {
  return !isMobileWorld()
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let engineGain: GainNode | null = null
let windGain: GainNode | null = null
let oscA: OscillatorNode | null = null
let oscC: OscillatorNode | null = null
let noise: AudioBuffer | null = null

export function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function readVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY)
    if (raw == null) return 1
    const n = Number(raw)
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1
  } catch {
    return 1
  }
}

function applyMaster() {
  if (!master || !ctx) return
  const level = readMuted() ? 0 : MASTER * readVolume()
  master.gain.setTargetAtTime(level, ctx.currentTime, 0.04)
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
  applyMaster()
}

export function setVolume(volume: number) {
  const next = Math.min(1, Math.max(0, volume))
  try {
    localStorage.setItem(VOLUME_KEY, String(next))
  } catch {
    /* ignore quota / private mode */
  }
  applyMaster()
}

export function toggleMuted(): boolean {
  const next = !readMuted()
  setMuted(next)
  return next
}

function live() {
  return !!ctx && ctx.state === 'running'
}

function noiseBuffer(c: AudioContext) {
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function buildBeds(c: AudioContext, dest: GainNode) {
  noise = noiseBuffer(c)
  const grit = c.createBufferSource()
  grit.buffer = noise
  grit.loop = true

  oscA = c.createOscillator()
  oscA.type = 'sawtooth'
  oscA.frequency.value = 74
  const a = c.createGain()
  a.gain.value = 0.2

  oscC = c.createOscillator()
  oscC.type = 'sine'
  oscC.frequency.value = 37
  const sub = c.createGain()
  sub.gain.value = 0.38

  const tone = c.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 260
  tone.Q.value = 0.65

  engineGain = c.createGain()
  engineGain.gain.value = 0

  oscA.connect(a).connect(tone)
  oscC.connect(sub).connect(tone)
  tone.connect(engineGain).connect(dest)

  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 70
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 240
  windGain = c.createGain()
  windGain.gain.value = 0
  grit.connect(hp).connect(lp).connect(windGain).connect(dest)

  oscA.start()
  oscC.start()
  grit.start()
}

/** Create / resume the context. Call only from a user gesture. */
export function unlockAudio() {
  if (!audioEnabled()) return
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = readMuted() ? 0 : MASTER * readVolume()
    master.connect(ctx.destination)
    buildBeds(ctx, master)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export function playStartBlip() {
  if (!live() || !master || !ctx || readMuted()) return
  const now = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'triangle'
  o.frequency.setValueAtTime(660, now)
  o.frequency.exponentialRampToValueAtTime(420, now + 0.08)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.045, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)
  o.connect(g).connect(master)
  o.start(now)
  o.stop(now + 0.11)
  o.onended = () => {
    o.disconnect()
    g.disconnect()
  }
}

function playWhoosh(fromHz: number, toHz: number, attack: number, dur: number) {
  if (!live() || !master || !ctx || !noise || readMuted()) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filt = ctx.createBiquadFilter()
  filt.type = 'bandpass'
  filt.Q.value = 0.75
  filt.frequency.setValueAtTime(fromHz, now)
  filt.frequency.exponentialRampToValueAtTime(toHz, now + dur - 0.04)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.14, now + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  src.connect(filt).connect(g).connect(master)
  src.start(now)
  src.stop(now + dur + 0.02)
  src.onended = () => {
    src.disconnect()
    filt.disconnect()
    g.disconnect()
  }
}

export function playHopWhoosh() {
  playWhoosh(260, 2200, 0.028, 0.3)
}

/** Appear counterpart to the hop/sink whoosh — same noise, rising sweep, slower swell. */
export function playRiseWhoosh() {
  playWhoosh(180, 2400, 0.06, 0.38)
}

/** Cap concurrent finale fireworks one-shots so dense bursts stay under the mix. */
const FW_MAX = 8
let fwVoices = 0

function fwGate() {
  return live() && !!master && !!ctx && !!noise && !readMuted() && fwVoices < FW_MAX
}

function fwRelease() {
  fwVoices = Math.max(0, fwVoices - 1)
}

/** Short rising whoosh when a rocket leaves the ground. */
export function playFireworkLaunch() {
  if (!fwGate() || !ctx || !master || !noise) return
  const now = ctx.currentTime
  const dur = 0.16 + Math.random() * 0.08
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filt = ctx.createBiquadFilter()
  filt.type = 'bandpass'
  filt.Q.value = 0.9 + Math.random() * 0.4
  const lo = 320 + Math.random() * 180
  filt.frequency.setValueAtTime(lo, now)
  filt.frequency.exponentialRampToValueAtTime(lo * (4.5 + Math.random() * 2), now + dur)
  const g = ctx.createGain()
  const peak = 0.055 + Math.random() * 0.025
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(peak, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  src.connect(filt).connect(g).connect(master)
  fwVoices++
  src.onended = () => {
    fwRelease()
    src.disconnect()
    filt.disconnect()
    g.disconnect()
  }
  src.start(now)
  src.stop(now + dur + 0.02)
}

/**
 * Burst boom at apex — heavy low-frequency thump like distant massive fireworks,
 * with a quieter mid crackle on top. `secondary` = delayed shells (softer boom).
 */
export function playFireworkBurst(secondary = false) {
  if (!fwGate() || !ctx || !master || !noise) return
  const now = ctx.currentTime
  const scale = secondary ? 0.4 : 1
  const boomDur = (secondary ? 0.35 : 0.55) + Math.random() * 0.2
  const crackDur = (secondary ? 0.1 : 0.18) + Math.random() * 0.06

  // Deep body: noise through a low shelf / lowpass — the “massive” whoomp.
  const body = ctx.createBufferSource()
  body.buffer = noise
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.7
  const bodyHz = (secondary ? 140 : 90) + Math.random() * (secondary ? 80 : 70)
  lp.frequency.setValueAtTime(bodyHz * (2.2 + Math.random()), now)
  lp.frequency.exponentialRampToValueAtTime(bodyHz * 0.45, now + boomDur)
  const bg = ctx.createGain()
  const bodyPeak = (secondary ? 0.09 : 0.16) + Math.random() * 0.05
  bg.gain.setValueAtTime(0.0001, now)
  bg.gain.exponentialRampToValueAtTime(bodyPeak * scale, now + 0.012)
  bg.gain.exponentialRampToValueAtTime(0.0001, now + boomDur)
  body.connect(lp).connect(bg).connect(master)

  // Sub thump: very low sine — felt more than heard, like a ground boom.
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  const subHz = (secondary ? 55 : 38) + Math.random() * (secondary ? 35 : 28)
  sub.frequency.setValueAtTime(subHz * 1.35, now)
  sub.frequency.exponentialRampToValueAtTime(subHz * 0.65, now + boomDur * 0.85)
  const sg = ctx.createGain()
  const subPeak = (secondary ? 0.11 : 0.22) + Math.random() * 0.06
  sg.gain.setValueAtTime(0.0001, now)
  sg.gain.exponentialRampToValueAtTime(subPeak * scale, now + 0.01)
  sg.gain.exponentialRampToValueAtTime(0.0001, now + boomDur)
  sub.connect(sg).connect(master)

  // Soft mid crackle so bursts still read as fireworks, not only bass hits.
  const crack = ctx.createBufferSource()
  crack.buffer = noise
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.1 + Math.random() * 0.8
  const mid = (secondary ? 700 : 480) + Math.random() * 600
  bp.frequency.setValueAtTime(mid, now)
  bp.frequency.exponentialRampToValueAtTime(mid * (0.4 + Math.random() * 0.2), now + crackDur)
  const cg = ctx.createGain()
  const crackPeak = (0.028 + Math.random() * 0.02) * scale
  cg.gain.setValueAtTime(0.0001, now)
  cg.gain.exponentialRampToValueAtTime(crackPeak, now + 0.006)
  cg.gain.exponentialRampToValueAtTime(0.0001, now + crackDur)
  crack.connect(bp).connect(cg).connect(master)

  fwVoices++
  const stopAt = now + boomDur + 0.04
  body.onended = () => {
    fwRelease()
    body.disconnect()
    lp.disconnect()
    bg.disconnect()
    sub.disconnect()
    sg.disconnect()
    crack.disconnect()
    bp.disconnect()
    cg.disconnect()
  }
  body.start(now)
  body.stop(stopAt)
  sub.start(now)
  sub.stop(stopAt)
  crack.start(now)
  crack.stop(now + crackDur + 0.02)
}

/** Exponential approach for bed params — avoids clicks when flying ↔ idle flips. */
const BED_TAU = 0.18

/** `cruise` is the same 0–1 intensity WindMotes uses (`windVis`). */
export function setFlightMix(flying: boolean, cruise: number) {
  if (!engineGain || !windGain || !ctx) return
  const c = Math.min(1, Math.max(0, cruise))
  const now = ctx.currentTime
  // Idle bed is quieter/lower; flying adds cruise lift. Ramp so accel/decel never snaps.
  engineGain.gain.setTargetAtTime(flying ? 0.1 + c * 0.04 : 0.046, now, BED_TAU)
  windGain.gain.setTargetAtTime(c * 0.045, now, BED_TAU)
  if (oscA) oscA.frequency.setTargetAtTime(70 + (flying ? 6 : 0) + c * 10, now, BED_TAU)
  if (oscC) oscC.frequency.setTargetAtTime(36 + c * 4, now, BED_TAU)
}
