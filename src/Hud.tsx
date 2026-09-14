import { LAST_CHECKPOINT, SLIDES } from './slides'

export function Hud({
  index,
  muted,
  canTurnBack,
  upTarget,
  downTarget,
  onUp,
  onDown,
  onTurnLeft,
  onTurnRight,
  onSelect,
}: {
  index: number
  muted: boolean
  canTurnBack: boolean
  upTarget: number
  downTarget: number
  onUp: () => void
  onDown: () => void
  onTurnLeft: () => void
  onTurnRight: () => void
  onSelect: (i: number) => void
}) {
  const finale = index === LAST_CHECKPOINT
  return (
    <div className="hud">
      <header className="topbar chrome">
        <div className="brand">
          <span className="diamond" />
          HARNESS FLIGHT
        </div>
        <div className="clock">
          {muted ? 'MUTED · ' : ''}
          {finale ? 'FINALE' : `WAYPOINT ${index + 1}/${SLIDES.length}`}
        </div>
      </header>

      <div className="hud-bottom chrome">
        <FlightPad
          upDisabled={upTarget < 0 || upTarget > LAST_CHECKPOINT}
          downDisabled={downTarget < 0 || downTarget > LAST_CHECKPOINT}
          turnDisabled={!canTurnBack}
          onUp={onUp}
          onDown={onDown}
          onTurnLeft={onTurnLeft}
          onTurnRight={onTurnRight}
        />
        <div className="dots" role="navigation" aria-label="Waypoints">
          {SLIDES.map((sl, i) => {
            const last = i === LAST_CHECKPOINT
            const on = i === index
            return (
              <button
                key={sl.id}
                type="button"
                className={
                  last
                    ? on
                      ? 'dot sky on'
                      : 'dot sky'
                    : on
                      ? 'dot on'
                      : i < index
                        ? 'dot done'
                        : 'dot'
                }
                aria-label={last ? 'Sky finale' : `Fly to waypoint ${i + 1}`}
                aria-current={on ? 'step' : undefined}
                onClick={() => onSelect(i)}
              />
            )
          })}
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

function SpeakerIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path fill="currentColor" d="M1 6h3l4-3v10l-4-3H1V6z" />
      {off ? (
        <g fill="currentColor" transform="translate(12 8)">
          <rect x="-1" y="-5" width="2" height="10" transform="rotate(45)" />
          <rect x="-1" y="-5" width="2" height="10" transform="rotate(-45)" />
        </g>
      ) : (
        <path fill="currentColor" d="M10 7h1v2h-1zm2-2h1v6h-1zm2-2h1v10h-1z" />
      )}
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M7 1h2v1h2V1h1v2h2v1h1v2h-1v2h1v2h-1v1h-2v2H10v1H6v-1H4v-2H3v-1H1V9h1V7H1V5h2V4h1V2h2V1h1zm1 4a3 3 0 100 6 3 3 0 000-6z"
      />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M5 3h4l1 2h4a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V6a1 1 0 011-1h2l1-2zm3 4a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
      />
    </svg>
  )
}

export function CameraDock({
  name,
  onCycle,
}: {
  name: string
  onCycle: () => void
}) {
  return (
    <div className="camera-dock chrome" onPointerUp={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={`Camera view: ${name}. Switch camera`}
        title={`Camera: ${name}`}
        onClick={onCycle}
      >
        <CameraIcon />
      </button>
      {/* key remount restarts the flash animation on every switch */}
      <span key={name} className="camera-dock-label" aria-hidden>
        {name}
      </span>
    </div>
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
  const silent = muted || volume === 0
  return (
    <div className="sound-dock chrome" onPointerUp={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={silent ? 'muted' : undefined}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute' : 'Mute'}
        onClick={onMute}
      >
        <SpeakerIcon off={silent} />
      </button>
      <div className="sound-dock-pop">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          aria-label="Volume"
          aria-orientation="vertical"
          onChange={(e) => onVolume(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export function SettingsDock({
  motionBlur,
  onMotionBlur,
}: {
  motionBlur: boolean
  onMotionBlur: (on: boolean) => void
}) {
  return (
    <div className="settings-dock chrome" onPointerUp={(e) => e.stopPropagation()}>
      <button type="button" aria-haspopup="true" aria-label="Settings">
        <GearIcon />
      </button>
      <div className="settings-dock-hit" aria-hidden="true" />
      <div className="settings-dock-pop" role="menu" aria-label="Settings">
        <p className="settings-heading">Graphics</p>
        <button
          type="button"
          role="menuitemcheckbox"
          aria-checked={motionBlur}
          className={motionBlur ? 'on' : undefined}
          onClick={() => onMotionBlur(!motionBlur)}
        >
          Motion blur
          <span>{motionBlur ? 'ON' : 'OFF'}</span>
        </button>
      </div>
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
      <p className="shortcuts">N — speaker notes<br />S — hide/show slides<br />A — hide/show assist<br />M — mute</p>
    </div>
  )
}
