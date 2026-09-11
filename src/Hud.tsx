import { SLIDES } from './slides'

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
        <div className="clock">
          WAYPOINT {index + 1}/{SLIDES.length}
        </div>
      </header>

      <div className="hud-bottom chrome">
        <FlightPad
          upDisabled={upTarget < 0 || upTarget >= SLIDES.length}
          downDisabled={downTarget < 0 || downTarget >= SLIDES.length}
          turnDisabled={!canTurnBack}
          onUp={onUp}
          onDown={onDown}
          onTurnLeft={onTurnLeft}
          onTurnRight={onTurnRight}
        />
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

function FlightPad({
  upDisabled,
  downDisabled,
  turnDisabled,
  onUp,
  onDown,
  onTurnLeft,
  onTurnRight,
}: {
  upDisabled?: boolean
  downDisabled?: boolean
  turnDisabled?: boolean
  onUp?: () => void
  onDown?: () => void
  onTurnLeft?: () => void
  onTurnRight?: () => void
}) {
  return (
    <nav className="flight-pad" aria-label="Flight controls">
      <button
        type="button"
        className="pad-up primary"
        disabled={upDisabled}
        onClick={onUp}
        aria-label="Fly forward"
      >
        ↑
      </button>
      <button
        type="button"
        className="pad-left"
        disabled={turnDisabled}
        onClick={onTurnLeft}
        aria-label="Turn left"
      >
        ←
      </button>
      <button
        type="button"
        className="pad-right"
        disabled={turnDisabled}
        onClick={onTurnRight}
        aria-label="Turn right"
      >
        →
      </button>
      <button
        type="button"
        className="pad-down"
        disabled={downDisabled}
        onClick={onDown}
        aria-label="Fly back"
      >
        ↓
      </button>
    </nav>
  )
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-screen" onPointerUp={(e) => e.button === 0 && onStart()}>
      <p className="kicker">A self-paced campaign</p>
      <h1>
        FLY THE
        <br />
        HARNESS
      </h1>
      <p className="sub">
        Minecraft skies. Twelve waypoints. One operating system for the agent.
      </p>
      <FlightPad upDisabled downDisabled turnDisabled />
      <p className="hint">Tap / Space / ↑ start · ↑/↓ paginate · ←/→ U-turn and reverse</p>
    </div>
  )
}
