import { useCallback, useEffect, useState } from 'react'
import { Hud, TitleScreen } from './Hud'
import { World } from './scene/World'
import type { TurnDirection } from './scene/Flight'
import { SLIDES } from './slides'
import './index.css'

export default function App() {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [backIndex, setBackIndex] = useState<number | null>(null)
  const [flying, setFlying] = useState(false)
  const [approaching, setApproaching] = useState(false)
  const [turnDirection, setTurnDirection] = useState<TurnDirection>(0)

  const go = useCallback((next: number, turn: TurnDirection = 0) => {
    if (next < 0 || next >= SLIDES.length) return
    setFlying(true)
    setApproaching(false)
    setTurnDirection(turn)
    setBackIndex(index)
    setIndex(next)
  }, [index])

  const turnBack = useCallback((turn: TurnDirection) => {
    if (backIndex === null) return
    setFlying(true)
    setApproaching(false)
    setTurnDirection(turn)
    setBackIndex(index)
    setIndex(backIndex)
  }, [backIndex, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (!started) setStarted(true)
        else go(index + 1)
      }
      if (e.code === 'ArrowLeft') turnBack(1)
      if (e.code === 'ArrowRight') turnBack(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, index, go, turnBack])

  return (
    <div className="app">
      <World
        index={index}
        flying={flying}
        turnDirection={turnDirection}
        onApproach={() => setApproaching(true)}
        onArrived={() => {
          setFlying(false)
          setApproaching(false)
        }}
      />
      {started ? (
        <Hud
          index={index}
          flying={flying}
          approaching={approaching}
          canTurnBack={backIndex !== null}
          onForward={() => go(index + 1)}
          onTurnLeft={() => turnBack(1)}
          onTurnRight={() => turnBack(-1)}
        />
      ) : (
        <TitleScreen onStart={() => setStarted(true)} />
      )}
    </div>
  )
}
