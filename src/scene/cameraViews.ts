/** Cyclable chase-camera rigs — every numeric knob the Flight cam reads per frame. */
export type CameraView = {
  id: string
  name: string
  /** Pull-back along the (smoothed) camera azimuth; negative places the cam ahead. */
  dist: number
  /** Height above the plane. */
  height: number
  /** Sideways offset, + = plane's right. */
  lateral: number
  /** Look target distance ahead of the plane along its smoothed heading. */
  lookAhead: number
  /** Look target lift above the plane. */
  lookUp: number
  fov: number
  /** Extra FOV under thrust (fisheye kick). */
  accelFov: number
  /** Extra pull-back distance under thrust (plane surges ahead). */
  accelPull: number
  /** Position catch-up rate at cruise (higher = stiffer). */
  follow: number
  /** Catch-up rate at full thrust (lower = plane pulls away). */
  followAccel: number
  /** Pointer-peek strength, 0 disables the mouse orbit. */
  orbit: number
  /** Camera roll coupling to the plane's bank, 0..1. */
  bankRoll: number
  /** Continuous azimuth spin around the plane (rad/s) — drone orbit. */
  spin: number
  /** Finale glance/dip participation (skyBlend scale), 0..1. */
  finale: number
}

/** View 0 must reproduce the pre-refactor chase cam exactly. */
export const CAMERA_VIEWS: CameraView[] = [
  {
    id: 'chase',
    name: 'Classic chase',
    dist: 12,
    height: 4.8,
    lateral: 0,
    lookAhead: 6,
    lookUp: 1.15,
    fov: 58,
    accelFov: 8.5,
    accelPull: 4.2,
    follow: 4.2,
    followAccel: 1.55,
    orbit: 1,
    bankRoll: 0,
    spin: 0,
    finale: 1,
  },
  {
    id: 'action',
    name: 'Action tail cam',
    dist: 5.6,
    height: 2.1,
    lateral: 0.9,
    lookAhead: 11,
    lookUp: 0.8,
    fov: 72,
    accelFov: 14,
    accelPull: 2.2,
    follow: 9,
    followAccel: 5.5,
    orbit: 0.5,
    bankRoll: 0.4,
    spin: 0,
    finale: 1,
  },
  {
    id: 'dolly',
    name: 'Side dolly',
    dist: 1.5,
    height: 2.2,
    lateral: 11,
    lookAhead: 2,
    lookUp: 0.7,
    fov: 48,
    accelFov: 4,
    accelPull: 1.5,
    follow: 3,
    followAccel: 2.2,
    orbit: 0,
    bankRoll: 0.25,
    spin: 0,
    finale: 0.6,
  },
  {
    id: 'hero',
    name: 'Low hero cam',
    dist: 8.5,
    height: -2.6,
    lateral: 1.6,
    lookAhead: 4,
    lookUp: 2.2,
    fov: 62,
    accelFov: 10,
    accelPull: 3,
    follow: 5,
    followAccel: 2.4,
    orbit: 0.4,
    bankRoll: 0.15,
    spin: 0,
    finale: 0.8,
  },
  {
    id: 'pov',
    name: 'Wing POV',
    dist: 1.3,
    height: 1.05,
    lateral: 0.6,
    lookAhead: 26,
    lookUp: 0.4,
    fov: 78,
    accelFov: 12,
    accelPull: 0.4,
    follow: 14,
    followAccel: 11,
    orbit: 0.3,
    bankRoll: 0.85,
    spin: 0,
    finale: 0.4,
  },
  {
    id: 'crane',
    name: 'Epic crane',
    dist: -15,
    height: 15,
    lateral: 4,
    lookAhead: 5,
    lookUp: 0.5,
    fov: 44,
    accelFov: 3,
    accelPull: 0,
    follow: 1.7,
    followAccel: 1.3,
    orbit: 0,
    bankRoll: 0,
    spin: 0,
    finale: 0.3,
  },
  {
    id: 'drone',
    name: 'Drone orbit',
    dist: 10.5,
    height: 3.6,
    lateral: 0,
    lookAhead: 0,
    lookUp: 1,
    fov: 68,
    accelFov: 5,
    accelPull: 1.5,
    follow: 2.6,
    followAccel: 2.1,
    orbit: 0,
    bankRoll: 0,
    spin: 0.28,
    finale: 0.5,
  },
]

/** Numeric knobs the Flight cam eases between views each frame. */
export const VIEW_NUMS = [
  'dist',
  'height',
  'lateral',
  'lookAhead',
  'lookUp',
  'fov',
  'accelFov',
  'accelPull',
  'follow',
  'followAccel',
  'orbit',
  'bankRoll',
  'spin',
  'finale',
] as const

const VIEW_KEY = 'harness-flight-camera-view'

function readView(): number {
  try {
    const n = Number(localStorage.getItem(VIEW_KEY))
    return Number.isInteger(n) && n >= 0 && n < CAMERA_VIEWS.length ? n : 0
  } catch {
    return 0
  }
}

/** Module store — Flight's useFrame reads it without React coupling. */
export const activeCameraView = { index: readView() }

export function cycleCameraView(): number {
  const next = (activeCameraView.index + 1) % CAMERA_VIEWS.length
  activeCameraView.index = next
  try {
    localStorage.setItem(VIEW_KEY, String(next))
  } catch {
    /* ignore quota / private mode */
  }
  return next
}
