import { useCallback, useEffect, useState } from 'react'
import { Hud, TitleScreen } from './Hud'
import { World } from './scene/World'
import type { TurnDirection } from './scene/Flight'
import { SLIDES } from './slides'
import './index.css'

export default function App() {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [flying, setFlying] = useState(false)
  const [turnDirection, setTurnDirection] = useState<TurnDirection>(0)

  const go = useCallback((next: number, turn: TurnDirection = 0) => {
    if (next < 0 || next >= SLIDES.length) return
    setFlying(true)
    setTurnDirection(turn)
    setIndex(next)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (!started) setStarted(true)
        else go(index + 1)
      }
      if (e.code === 'ArrowLeft') go(index - 1, 1)
      if (e.code === 'ArrowRight') go(index - 1, -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, index, go])

  return (
    <div className="app">
      <World
        index={index}
        flying={flying}
        turnDirection={turnDirection}
        onArrived={() => setFlying(false)}
      />
      {started ? (
        <Hud
          index={index}
          flying={flying}
          onForward={() => go(index + 1)}
          onTurnLeft={() => go(index - 1, 1)}
          onTurnRight={() => go(index - 1, -1)}
        />
      ) : (
        <TitleScreen onStart={() => setStarted(true)} />
      )}
    </div>
  )
}
