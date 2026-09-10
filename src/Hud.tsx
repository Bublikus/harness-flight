import { SLIDES, TOTAL_SEC } from './slides'
import { SlideArt } from './SlideArt'

export function Hud({
  index,
  flying,
  paused,
  remaining,
  onNext,
  onPrev,
  onTogglePause,
}: {
  index: number
  flying: boolean
  paused: boolean
  remaining: number
  onNext: () => void
  onPrev: () => void
  onTogglePause: () => void
}) {
  const s = SLIDES[index]
  const done = SLIDES.slice(0, index).reduce((a, x) => a + x.durationSec, 0)
  const talkLeft = TOTAL_SEC - done - (s.durationSec - remaining)
  const mins = Math.max(0, Math.floor(talkLeft / 60))
  const secs = Math.max(0, Math.floor(talkLeft % 60))

  return (
    <div className={`hud ${flying ? 'hud-dim' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <span className="diamond" />
          HARNESS FLIGHT
        </div>
        <div className="clock">
          T−{mins}:{String(secs).padStart(2, '0')} · {index + 1}/{SLIDES.length}
        </div>
      </header>

      <div className="sign">
        <SlideArt key={s.id} id={s.id} />
        <div className="copy">
          <p className="era">{s.era}</p>
          <h1>{s.title}</h1>
          <p className="lead">{s.lead}</p>
          <ul>
            {s.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="meter">
            <div
              className="meter-fill"
              style={{ width: `${(remaining / s.durationSec) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="controls">
        <button type="button" onClick={onPrev} disabled={index === 0 || flying}>
          ◀ Prev
        </button>
        <button type="button" onClick={onTogglePause} disabled={flying}>
          {paused ? '▶ Autopilot' : '❚❚ Hold'}
        </button>
        <button
          type="button"
          className="primary"
          onClick={onNext}
          disabled={flying || index === SLIDES.length - 1}
        >
          {flying ? 'In flight…' : 'Next waypoint ▶'}
        </button>
      </nav>

      <div className="dots">
        {SLIDES.map((sl, i) => (
          <span
            key={sl.id}
            className={i === index ? 'dot on' : i < index ? 'dot done' : 'dot'}
          />
        ))}
      </div>
    </div>
  )
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-screen">
      <p className="kicker">A 20-minute campaign</p>
      <h1>
        FLY THE
        <br />
        HARNESS
      </h1>
      <p className="sub">
        Minecraft skies. Twelve waypoints. One operating system for the agent.
      </p>
      <button type="button" className="primary big" onClick={onStart}>
        Take off
      </button>
      <p className="hint">Space = next waypoint · P = pause autopilot</p>
    </div>
  )
}
