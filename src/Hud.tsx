import { SLIDES } from './slides'

export function Hud({
  index,
  muted,
  canTurnBack,
  upTarget,
  downTarget,
  canAboutFace,
  onUp,
  onDown,
  onTurnLeft,
  onTurnRight,
}: {
  index: number
  muted: boolean
  canTurnBack: boolean
  upTarget: number
  downTarget: number
  canAboutFace: boolean
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
          {muted ? 'MUTED · ' : ''}WAYPOINT {index + 1}/{SLIDES.length}
        </div>
      </header>

      <div className="hud-bottom chrome">
        <FlightPad
          upDisabled={
            (upTarget < 0 || upTarget >= SLIDES.length) && !canAboutFace
          }
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

export function SoundDock({
  muted,
  volume,
  onMute,
  onVolume,
}: {
  muted: boolean
  volume: number
  onMute: () => void
  onVolume: (volume: number) => void
}) {
  return (
    <div className="sound-dock chrome" onPointerUp={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={muted ? 'muted' : undefined}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute' : 'Mute'}
        onClick={onMute}
      >
        {muted ? 'MUTED' : 'MUTE'}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        aria-label="Volume"
        onChange={(e) => onVolume(Number(e.target.value))}
      />
    </div>
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
      <p className="shortcuts">N — speaker notes<br />H — hide/show slide<br />M — mute</p>
    </div>
  )
}
