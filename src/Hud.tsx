import { SLIDES, type Slide } from './slides'
import { SlideArt } from './SlideArt'

export function SignCard({ slide: s }: { slide: Slide }) {
  return (
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
      </div>
    </div>
  )
}

export function Hud({
  index,
  flying,
  canTurnBack,
  onForward,
  onTurnLeft,
  onTurnRight,
}: {
  index: number
  flying: boolean
  canTurnBack: boolean
  onForward: () => void
  onTurnLeft: () => void
  onTurnRight: () => void
}) {
  const s = SLIDES[index]

  return (
    <div className="hud">
      <header className="topbar chrome">
        <div className="brand">
          <span className="diamond" />
          HARNESS FLIGHT
        </div>
        <div className="clock">
          WAYPOINT {index + 1}/{SLIDES.length}
        </div>
      </header>

      {!flying && (
        <div className="hud-card">
          <SignCard slide={s} />
        </div>
      )}

      <div className="hud-bottom chrome">
        <nav className="flight-pad" aria-label="Flight controls">
          <button
            type="button"
            className="pad-up primary"
            onClick={onForward}
            disabled={index === SLIDES.length - 1}
            aria-label="Fly to next slide"
          >
            ↑
          </button>
          <button
            type="button"
            className="pad-left"
            onClick={onTurnLeft}
            disabled={!canTurnBack}
            aria-label="Turn left and return to previous slide"
          >
            ←
          </button>
          <button
            type="button"
            className="pad-center"
            disabled
            aria-label="Flight control center"
          >
            ◆
          </button>
          <button
            type="button"
            className="pad-right"
            onClick={onTurnRight}
            disabled={!canTurnBack}
            aria-label="Turn right and return to previous slide"
          >
            →
          </button>
          <button
            type="button"
            className="pad-down"
            disabled
            aria-label="Reserved flight control"
            title="Reserved"
          >
            ↓
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
    </div>
  )
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-screen">
      <p className="kicker">A self-paced campaign</p>
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
      <p className="hint">↑ forward · ←/→ choose U-turn · ↓ reserved</p>
    </div>
  )
}
