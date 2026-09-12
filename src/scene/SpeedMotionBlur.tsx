import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { BlendFunction, Effect } from 'postprocessing'
import * as THREE from 'three'
import { PLANE_LAYER } from './layers'
import { planePose } from './worldPoses'

/** Speed band → blur onset; cruise×far-hop peaks above BLUR_OUT. */
const BLUR_IN = 14
const BLUR_OUT = 90
/** Peak radial/camera streak — subtle cue only; FOV fisheye stays primary. */
const BLUR_MAX = 0.0098
const BLUR_EASE = 4.5
const VEL_SCALE = 0.0196

const fragment = /* glsl */ `
uniform float intensity;
uniform vec2 velocity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float amount = intensity;
  if (amount < 0.0005) {
    outputColor = inputColor;
    return;
  }
  vec2 radial = (uv - 0.5) * amount;
  vec2 dir = velocity + radial;
  vec4 color = inputColor;
  color += texture2D(inputBuffer, uv - dir * 0.25);
  color += texture2D(inputBuffer, uv - dir * 0.5);
  color += texture2D(inputBuffer, uv - dir * 0.75);
  color += texture2D(inputBuffer, uv - dir);
  outputColor = color * 0.2;
}
`

class MotionBlurEffect extends Effect {
  constructor() {
    super('MotionBlur', fragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ['intensity', new THREE.Uniform(0)],
        ['velocity', new THREE.Uniform(new THREE.Vector2())],
      ]),
    })
  }
}

const delta = new THREE.Vector3()
const invQ = new THREE.Quaternion()

function restoreView(camera: THREE.Camera) {
  camera.layers.enable(0)
  camera.layers.enable(PLANE_LAYER)
}

/** Desktop-only EffectComposer path; intensity tracks planePose.speed. */
export function SpeedMotionBlur() {
  const effect = useMemo(() => new MotionBlurEffect(), [])
  const warmup = useMemo(() => new THREE.WebGLRenderTarget(1, 1), [])
  const feel = useRef(0)
  const streak = useRef(false)
  const prevCam = useRef(new THREE.Vector3())
  const hasPrev = useRef(false)
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)

  useEffect(
    () => () => {
      gl.shadowMap.autoUpdate = true
      restoreView(camera)
    },
    [gl, camera],
  )

  useFrame(({ camera, gl, scene }, dt) => {
    const d = Math.min(dt, 0.05)
    const target = THREE.MathUtils.smoothstep(planePose.speed, BLUR_IN, BLUR_OUT)
    feel.current += (target - feel.current) * (1 - Math.exp(-d * BLUR_EASE))
    const f = feel.current
    const amount = f * BLUR_MAX
    effect.uniforms.get('intensity')!.value = amount
    streak.current = amount >= 0.0005

    const vel = effect.uniforms.get('velocity')!.value as THREE.Vector2
    if (!hasPrev.current) {
      prevCam.current.copy(camera.position)
      hasPrev.current = true
      vel.set(0, 0)
    } else {
      delta.copy(camera.position).sub(prevCam.current)
      prevCam.current.copy(camera.position)
      invQ.copy(camera.quaternion).invert()
      delta.applyQuaternion(invQ)
      const cam = camera as THREE.PerspectiveCamera
      const s =
        (VEL_SCALE * f) / Math.max(1e-4, Math.tan((cam.fov * Math.PI) / 360))
      vel.set(delta.x * s, delta.y * s)
    }

    if (!streak.current) {
      restoreView(camera)
      gl.shadowMap.autoUpdate = true
      return
    }

    // Shadow maps test the main camera's layers — bake them with the plane in,
    // then hide it so the composer input is world-only.
    restoreView(camera)
    gl.shadowMap.autoUpdate = true
    gl.shadowMap.needsUpdate = true
    const prev = gl.getRenderTarget()
    gl.setRenderTarget(warmup)
    gl.render(scene, camera)
    gl.setRenderTarget(prev)
    gl.shadowMap.autoUpdate = false
    camera.layers.disable(PLANE_LAYER)
  })

  useFrame(({ gl, scene, camera }) => {
    if (!streak.current) return
    // Color backgrounds forceClear even when autoClear is false — that
    // wipes the composer output to cream and leaves only the plane.
    const prevClear = gl.autoClear
    const prevBg = scene.background
    scene.background = null
    camera.layers.set(PLANE_LAYER)
    gl.autoClear = false
    gl.clearDepth()
    gl.render(scene, camera)
    gl.autoClear = prevClear
    scene.background = prevBg
    restoreView(camera)
    gl.shadowMap.autoUpdate = true
  }, 2)

  return (
    <EffectComposer multisampling={0} renderPriority={1}>
      <primitive object={effect} />
    </EffectComposer>
  )
}
