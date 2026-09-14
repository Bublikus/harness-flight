import { useCallback, useEffect, useState } from 'react'
import { AssistOverlay, hideAssistOverlay } from './AssistOverlay'
import { CameraDock, Hud, SettingsDock, SoundDock, TitleScreen } from './Hud'
import { activeCameraView, CAMERA_VIEWS, cycleCameraView } from './scene/cameraViews'
import { World } from './scene/World'
import type { TurnDirection } from './scene/Flight'
import {
  audioEnabled,
  playHopWhoosh,
  readMuted,
  readVolume,
  setVolume,
  toggleMuted,
  unlockAudio,
} from './scene/FlightAudio'
import { readMotionBlur, writeMotionBlur } from './scene/graphicsPrefs'
import { LAST_CHECKPOINT } from './slides'
import { usePresentationSync } from './presentationSync'
import './index.css'

function openSpeakerNotes() {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'notes')
  url.hash = ''
  window.open(url, 'harness-flight-notes', 'noopener,noreferrer')
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [backIndex, setBackIndex] = useState<number | null>(null)
  const [flying, setFlying] = useState(false)
  const [approaching, setApproaching] = useState(false)
  const [turnDirection, setTurnDirection] = useState<TurnDirection>(0)
  const [facing, setFacing] = useState<1 | -1>(1)
  /** Session toggle: boards stay sunk across hops until H again. */
  const [slidesHidden, setSlidesHidden] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [volume, setVol] = useState(readVolume)
  const [motionBlur, setMotionBlur] = useState(readMotionBlur)
  const [camView, setCamView] = useState(activeCameraView.index)
  const atLast = index === LAST_CHECKPOINT
  /** Fireworks + look-up: parked at waypoint 12, not merely hopping toward it. */
  const finale = atLast && !flying
  const upTarget = atLast ? LAST_CHECKPOINT + 1 : index + facing
  const downTarget = atLast ? LAST_CHECKPOINT - 1 : index - facing

  const go = useCallback((next: number, turn: TurnDirection = 0) => {
    if (next < 0 || next > LAST_CHECKPOINT) return
    if (next === index) return
    hideAssistOverlay()
    unlockAudio()
    setFlying(true)
    setApproaching(false)
    setTurnDirection(turn)
    if ((next - index) * facing < 0)
      setFacing(facing === 1 ? -1 : 1)
    setBackIndex(index)
    setIndex(next)
  }, [facing, index])

  const flyForward = useCallback(() => {
    if (atLast) return
    go(upTarget)
  }, [atLast, go, upTarget])

  const startTalk = useCallback(() => {
    unlockAudio()
    playHopWhoosh()
    setStarted(true)
  }, [])

  usePresentationSync(index, (next) => {
    setStarted(true)
    if (next !== index) go(next)
  })

  const turnBack = useCallback((turn: TurnDirection) => {
    if (backIndex === null) return
    go(backIndex, turn)
  }, [backIndex, go])

  const flipMute = useCallback(() => {
    if (started) unlockAudio()
    setMuted(toggleMuted())
  }, [started])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        !!e.target.closest('input, textarea, select, [contenteditable="true"]')
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (!started) startTalk()
        else flyForward()
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        if (started) go(downTarget)
      }
      if (e.code === 'ArrowLeft') turnBack(1)
      if (e.code === 'ArrowRight') turnBack(-1)
      if (e.code === 'KeyN') {
        e.preventDefault()
        openSpeakerNotes()
      }
      if (e.code === 'KeyH') {
        if (typing || !started) return
        e.preventDefault()
        setSlidesHidden((hidden) => !hidden)
      }
      if (e.code === 'KeyM') {
        if (typing) return
        e.preventDefault()
        flipMute()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, downTarget, flyForward, go, turnBack, startTalk, flipMute])

  return (
    <div className="app">
      <World
        index={index}
        started={started}
        flying={flying}
        approaching={approaching}
        facing={facing}
        finale={finale}
        slideHidden={slidesHidden || atLast}
        turnDirection={turnDirection}
        motionBlur={motionBlur}
        onApproach={() => setApproaching(true)}
        onArrived={() => {
          setFlying(false)
          setApproaching(false)
        }}
      />
      {started ? (
        <>
          <Hud
            index={index}
            muted={muted}
            canTurnBack={backIndex !== null}
            upTarget={upTarget}
            downTarget={downTarget}
            onUp={flyForward}
            onDown={() => go(downTarget)}
            onTurnLeft={() => turnBack(1)}
            onTurnRight={() => turnBack(-1)}
            onSelect={go}
          />
          {!atLast && <AssistOverlay index={index} />}
        </>
      ) : (
        <TitleScreen onStart={startTalk} />
      )}
      {audioEnabled() && (
        <div className="corner-docks">
          <CameraDock
            name={CAMERA_VIEWS[camView].name}
            onCycle={() => setCamView(cycleCameraView())}
          />
          <SoundDock
            muted={muted}
            volume={volume}
            onMute={flipMute}
            onVolume={(next) => {
              if (started) unlockAudio()
              setVolume(next)
              setVol(next)
            }}
          />
          <SettingsDock
            motionBlur={motionBlur}
            onMotionBlur={(next) => {
              writeMotionBlur(next)
              setMotionBlur(next)
            }}
          />
        </div>
      )}
    </div>
  )
}
