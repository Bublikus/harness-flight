import { useCallback, useEffect, useState } from 'react'
import { Hud, TitleScreen } from './Hud'
import { World } from './scene/World'
import { SLIDES } from './slides'
import './index.css'

export default function App() {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [flying, setFlying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [remaining, setRemaining] = useState(SLIDES[0].durationSec)

  const go = useCallback((next: number) => {
    if (next < 0 || next >= SLIDES.length) return
    setFlying(true)
    setIndex(next)
    setRemaining(SLIDES[next].durationSec)
  }, [])

  useEffect(() => {
    if (!started || flying || paused) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (index < SLIDES.length - 1) window.setTimeout(() => go(index + 1), 0)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [started, flying, paused, index, go])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (!started) setStarted(true)
        else if (!flying) go(index + 1)
      }
      if (e.code === 'KeyP') setPaused((p) => !p)
      if (e.code === 'ArrowRight' && !flying) go(index + 1)
      if (e.code === 'ArrowLeft' && !flying) go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, flying, index, go])

  return (
    <div className="app">
      <World
        index={index}
        flying={flying}
        onArrived={() => setFlying(false)}
      />
      {started ? (
        <Hud
          index={index}
          flying={flying}
          paused={paused}
          remaining={remaining}
          onNext={() => go(index + 1)}
          onPrev={() => go(index - 1)}
          onTogglePause={() => setPaused((p) => !p)}
        />
      ) : (
        <TitleScreen onStart={() => setStarted(true)} />
      )}
    </div>
  )
}
