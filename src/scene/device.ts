/** Touch / coarse pointer — same gate as HUD + audio (desktop stays rich). */
export function isMobileWorld() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}
