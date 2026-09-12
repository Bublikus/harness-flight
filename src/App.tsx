import { useCallback, useEffect, useState } from 'react'
import { AssistOverlay } from './AssistOverlay'
import { Hud, SoundDock, TitleScreen } from './Hud'
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
import { FINALE_PAGE, LAST_CHECKPOINT, waypointIndex } from './slides'
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
  const [pendingFinale, setPendingFinale] = useState(false)
  /** Session toggle: boards stay sunk across hops until H again. */
  const [slidesHidden, setSlidesHidden] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [volume, setVol] = useState(readVolume)
  const finale = index === FINALE_PAGE
  const waypoint = waypointIndex(index)
  const upTarget = finale ? FINALE_PAGE + 1 : index + facing
  const rawDown = finale ? LAST_CHECKPOINT : index - facing
  const downTarget = !finale && rawDown === FINALE_PAGE ? -1 : rawDown

  const go = useCallback((next: number, turn: TurnDirection = 0) => {
    if (next < 0 || next > FINALE_PAGE) return
    if (next === index) {
      setPendingFinale(false)
      return
    }
    const fromWp = waypointIndex(index)
    const toWp = waypointIndex(next)
    if (fromWp === toWp) {
      if (flying && next === FINALE_PAGE) {
        setPendingFinale(true)
        return
      }
      if (flying) return
      setPendingFinale(false)
      setBackIndex(index)
      setIndex(next)
      return
    }
    unlockAudio()
    setFlying(true)
    setApproaching(false)
    setTurnDirection(turn)
    setPendingFinale(next === FINALE_PAGE)
    if ((toWp - fromWp) * facing < 0)
      setFacing(facing === 1 ? -1 : 1)
    setBackIndex(fromWp)
    setIndex(toWp)
  }, [facing, flying, index])

  const flyForward = useCallback(() => {
    if (index === FINALE_PAGE) return
    go(upTarget)
  }, [go, index, upTarget])

  const startTalk = useCallback(() => {
    unlockAudio()
    playHopWhoosh()
    setStarted(true)
  }, [])

  usePresentationSync(waypoint, (next) => {
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
        index={waypoint}
        started={started}
        flying={flying}
        approaching={approaching}
        facing={facing}
        finale={finale}
        slideHidden={slidesHidden || finale || pendingFinale}
        turnDirection={turnDirection}
        onApproach={() => setApproaching(true)}
        onArrived={() => {
          setFlying(false)
          setApproaching(false)
          if (pendingFinale) {
            setPendingFinale(false)
            setIndex(FINALE_PAGE)
          }
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
          <AssistOverlay index={waypoint} />
        </>
      ) : (
        <TitleScreen onStart={startTalk} />
      )}
      {audioEnabled() && (
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
      )}
    </div>
  )
}
