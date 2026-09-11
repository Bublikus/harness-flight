import { useEffect } from 'react'
import { useNotesSync, type SyncStatus } from './presentationSync'
import { SLIDES } from './slides'
import './speaker-notes.css'

const STATUS_LABEL: Record<SyncStatus, string> = {
  waiting: 'Waiting for presentation',
  snapshot: 'Saved snapshot',
  live: 'Live sync',
  offline: 'Presentation unavailable',
}

export default function NotesApp() {
  const { index, navigate, status, lastSyncAt } = useNotesSync()
  const slide = SLIDES[index]
  const next = SLIDES[index + 1]

  useEffect(() => {
    document.title = `${index + 1}/${SLIDES.length} · ${slide.title} · Speaker Notes`
  }, [index, slide.title])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('button, a, input, textarea, select, [contenteditable="true"]')) return

      let nextIndex: number | undefined
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') nextIndex = index - 1
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') nextIndex = index + 1
      if (event.key === 'Home') nextIndex = 0
      if (event.key === 'End') nextIndex = SLIDES.length - 1
      if (nextIndex === undefined || nextIndex < 0 || nextIndex >= SLIDES.length) return

      event.preventDefault()
      navigate(nextIndex)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, navigate])

  return (
    <main className="notes-view">
      <header className="notes-topbar">
        <div className="brand">
          <span className="diamond" />
          HARNESS FLIGHT
        </div>
        <div className="sync-status" data-status={status} role="status" aria-live="polite">
          <span className="sync-light" />
          <span>
            {STATUS_LABEL[status]}
            {lastSyncAt > 0 && (
              <time dateTime={new Date(lastSyncAt).toISOString()}>
                {' · '}{new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            )}
          </span>
        </div>
      </header>

      <div className="notes-layout">
        <article className="notes-card" aria-labelledby="current-slide-title">
          <p className="notes-eyebrow">Current waypoint · {index + 1} of {SLIDES.length}</p>
          <p className="notes-era">{slide.era}</p>
          <h1 id="current-slide-title">{slide.title}</h1>
          <p className="notes-context">{slide.lead}</p>

          <h2>Speaker notes</h2>
          <ul className="speaker-copy">
            {slide.speakerNotes.map((note) => <li key={note}>{note}</li>)}
          </ul>

          <nav className="notes-controls" aria-label="Presentation slides">
            <button
              type="button"
              onClick={() => navigate(index - 1)}
              disabled={index === 0}
              aria-label="Go to previous slide"
            >
              ← Previous
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => navigate(index + 1)}
              disabled={index === SLIDES.length - 1}
              aria-label="Go to next slide"
            >
              Next →
            </button>
          </nav>
        </article>

        <aside className="notes-sidebar" aria-label="Presenter information">
          <section className="preview-card">
            <p className="notes-eyebrow">Up next</p>
            {next ? (
              <>
                <p className="preview-waypoint">Waypoint {index + 2}</p>
                <h2>{next.title}</h2>
                <p>{next.lead}</p>
              </>
            ) : (
              <>
                <h2>End of route</h2>
                <p>Close with the call to action, then leave space for questions.</p>
              </>
            )}
          </section>

          <section className="keyboard-card">
            <h2>Keyboard</h2>
            <dl>
              <div><dt><kbd>←</kbd> <kbd>PgUp</kbd></dt><dd>Previous</dd></div>
              <div><dt><kbd>→</kbd> <kbd>PgDn</kbd></dt><dd>Next</dd></div>
              <div><dt><kbd>Space</kbd></dt><dd>Next</dd></div>
              <div><dt><kbd>Home</kbd> <kbd>End</kbd></dt><dd>First / last</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  )
}
