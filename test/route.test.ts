import { describe, expect, it } from 'vitest'
import { SLIDES } from '../src/slides'
import { PATH_LENGTH, pathAt, waypointPose } from '../src/scene/route'

describe('route smoke', () => {
  it('exposes a finite pose for every slide index', () => {
    for (let i = 0; i < SLIDES.length; i++) {
      const pose = waypointPose(i)
      expect(pose).toBeDefined()
      expect(Number.isFinite(pose.x)).toBe(true)
      expect(Number.isFinite(pose.y)).toBe(true)
      expect(Number.isFinite(pose.z)).toBe(true)
      expect(Number.isFinite(pose.yaw)).toBe(true)
      expect(Number.isFinite(pose.s)).toBe(true)
    }
  })

  it('keeps a positive path length and ordered checkpoint arc-lengths', () => {
    expect(PATH_LENGTH).toBeGreaterThan(0)
    expect(pathAt(0).s).toBe(0)
    expect(pathAt(PATH_LENGTH).s).toBe(PATH_LENGTH)
    expect(waypointPose(0).s).toBeLessThan(waypointPose(SLIDES.length - 1).s)
  })
})
