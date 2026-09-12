/** Procedural talk SFX via Web Audio — no sample files. Unlock on a user gesture. */

const MUTE_KEY = 'harness-flight-mute'
const VOLUME_KEY = 'harness-flight-volume'
const MASTER = 0.18

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

/** `cruise` is the same 0–1 intensity WindMotes uses (`windVis`). */
export function setFlightMix(flying: boolean, cruise: number) {
  if (!engineGain || !windGain) return
  const c = Math.min(1, Math.max(0, cruise))
  engineGain.gain.value = flying ? 0.1 + c * 0.04 : 0.046
  windGain.gain.value = c * 0.045
  if (oscA) oscA.frequency.value = 70 + (flying ? 6 : 0) + c * 10
  if (oscC) oscC.frequency.value = 36 + c * 4
}
