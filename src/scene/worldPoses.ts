import * as THREE from 'three'

/** Module poses updated each frame — birds read without React coupling. */
export const planePose = {
  pos: new THREE.Vector3(),
  /** World units/s; desktop motion blur scales from this. */
  speed: 0,
  /** Heading, same convention as waypoint yaw (atan2(x, z)). */
  yaw: 0,
  valid: false,
}

/**
 * Chase-cam pose for Web Audio `AudioListener` (Flight publishes each frame).
 * Falls back to plane yaw+pos inside FlightAudio when not yet valid.
 */
export const audioListenerPose = {
  pos: new THREE.Vector3(),
  forward: new THREE.Vector3(0, 0, 1),
  up: new THREE.Vector3(0, 1, 0),
  valid: false,
}

export const slidePose = {
  pos: new THREE.Vector3(),
  /** Active waypoint index; −1 until a board publishes. Session key for flybys. */
  index: -1,
  /** Board local +Z in world (audience / plane-facing). */
  normal: new THREE.Vector3(0, 0, 1),
  /** Board local +X in world. */
  right: new THREE.Vector3(1, 0, 0),
  /** Board local +Y in world. */
  up: new THREE.Vector3(0, 1, 0),
  /** Half-extents of the risen board collision volume (world units). half.z is inflated so one dt cannot tunnel the thin canvas. */
  half: new THREE.Vector3(8.25, 4, 0.85),
  /** 0 sunk … 1 fully risen (audience-facing board). */
  rise: 0,
  valid: false,
}
