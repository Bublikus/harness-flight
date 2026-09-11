import { useCallback, useEffect, useState } from 'react'
import { AssistOverlay } from './AssistOverlay'
import { Hud, TitleScreen } from './Hud'
import { World } from './scene/World'
import type { TurnDirection } from './scene/Flight'
import { SLIDES } from './slides'
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
  const [slideHidden, setSlideHidden] = useState(false)
  const upTarget = index + facing
  const downTarget = index - facing

  useEffect(() => {
    setSlideHidden(false)
  }, [index])

  const go = useCallback((next: number, turn: TurnDirection = 0) => {
    if (next < 0 || next >= SLIDES.length) return
    setFlying(true)
    setApproaching(false)
    setTurnDirection(turn)
    if ((next - index) * facing < 0)
      setFacing(facing === 1 ? -1 : 1)
    setBackIndex(index)
    setIndex(next)
  }, [facing, index])

  usePresentationSync(index, (next) => {
    setStarted(true)
    if (next !== index) go(next)
  })

  const turnBack = useCallback((turn: TurnDirection) => {
    if (backIndex === null) return
    go(backIndex, turn)
  }, [backIndex, go])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        !!e.target.closest('input, textarea, select, [contenteditable="true"]')
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (!started) setStarted(true)
        else go(upTarget)
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
        setSlideHidden((hidden) => !hidden)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, upTarget, downTarget, go, turnBack])

  return (
    <div className="app">
      <World
        index={index}
        started={started}
        flying={flying}
        approaching={approaching}
        facing={facing}
        slideHidden={slideHidden}
        turnDirection={turnDirection}
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
            canTurnBack={backIndex !== null}
            upTarget={upTarget}
            downTarget={downTarget}
            onUp={() => go(upTarget)}
            onDown={() => go(downTarget)}
            onTurnLeft={() => turnBack(1)}
            onTurnRight={() => turnBack(-1)}
          />
          <AssistOverlay index={index} />
        </>
      ) : (
        <TitleScreen onStart={() => setStarted(true)} />
      )}
    </div>
  )
}
