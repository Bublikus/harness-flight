import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const notesMode = new URLSearchParams(window.location.search).get('view') === 'notes'
const app = notesMode ? import('./NotesApp.tsx') : import('./App.tsx')

app.then(({ default: App }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
