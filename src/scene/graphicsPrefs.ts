const MOTION_BLUR_KEY = 'harness-flight-motion-blur'

export function readMotionBlur(): boolean {
  try {
    const raw = localStorage.getItem(MOTION_BLUR_KEY)
    if (raw == null) return true
    return raw === '1'
  } catch {
    return true
  }
}

export function writeMotionBlur(on: boolean) {
  try {
    localStorage.setItem(MOTION_BLUR_KEY, on ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}
