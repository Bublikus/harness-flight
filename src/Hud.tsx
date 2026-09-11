import { SLIDES } from './slides'
import './speaker-notes.css'

function openSpeakerNotes() {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'notes')
  url.hash = ''
  window.open(url, 'harness-flight-notes', 'noopener,noreferrer')
}

export function Hud({
  index,
  canTurnBack,
  upTarget,
  downTarget,
  onUp,
  onDown,
  onTurnLeft,
  onTurnRight,
}: {
  index: number
  canTurnBack: boolean
  upTarget: number
  downTarget: number
  onUp: () => void
  onDown: () => void
  onTurnLeft: () => void
  onTurnRight: () => void
}) {
  return (
    <div className="hud">
      <header className="topbar chrome">
        <div className="brand">
          <span className="diamond" />
          HARNESS FLIGHT
        </div>
        <div className="presenter-tools">
          <button type="button" className="notes-opener" onClick={openSpeakerNotes}>
            Speaker notes
          </button>
          <div className="clock">
            WAYPOINT {index + 1}/{SLIDES.length}
          </div>
        </div>
      </header>

      <div className="hud-bottom chrome">
        <nav className="flight-pad" aria-label="Flight controls">
          <button
            type="button"
            className="pad-up primary"
            onClick={onUp}
            disabled={upTarget < 0 || upTarget >= SLIDES.length}
            aria-label={`Fly to ${upTarget > index ? 'next' : 'previous'} slide`}
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
            onClick={onDown}
            disabled={downTarget < 0 || downTarget >= SLIDES.length}
            aria-label={`Fly to ${downTarget > index ? 'next' : 'previous'} slide`}
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
      <p className="hint">↑/↓ paginate · ←/→ U-turn and reverse</p>
    </div>
  )
}
