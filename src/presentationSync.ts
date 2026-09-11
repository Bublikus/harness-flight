import { useCallback, useEffect, useRef, useState } from 'react'
import { SLIDES } from './slides'

const CHANNEL = 'harness-flight-speaker-notes-v1'
const STATE_KEY = `${CHANNEL}:state`
const COMMAND_KEY = `${CHANNEL}:command`
const HEARTBEAT_MS = 2_000

type SlideState = {
  type: 'state'
  index: number
  updatedAt: number
}

type NavigateCommand = {
  type: 'navigate'
  id: string
  index: number
}

type SyncMessage = SlideState | NavigateCommand | { type: 'hello' }

export type SyncStatus = 'waiting' | 'snapshot' | 'live' | 'offline'

const validIndex = (index: unknown): index is number =>
  Number.isInteger(index) && Number(index) >= 0 && Number(index) < SLIDES.length

function read<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : null
  } catch {
    return null
  }
}

function write(key: string, value: SyncMessage) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // BroadcastChannel remains the primary transport when storage is unavailable.
  }
}

function openChannel() {
  try {
    return 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null
  } catch {
    return null
  }
}

function isState(message: unknown): message is SlideState {
  const state = message as Partial<SlideState> | null
  return state?.type === 'state' && validIndex(state.index) && typeof state.updatedAt === 'number'
}

function isCommand(message: unknown): message is NavigateCommand {
  const command = message as Partial<NavigateCommand> | null
  return command?.type === 'navigate' && typeof command.id === 'string' && validIndex(command.index)
}

export function usePresentationSync(index: number, onNavigate: (index: number) => void) {
  const indexRef = useRef(index)
  const navigateRef = useRef(onNavigate)
  const publishRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    indexRef.current = index
    navigateRef.current = onNavigate
  }, [index, onNavigate])

  useEffect(() => {
    const channel = openChannel()
    let lastCommand = ''

    const publish = () => {
      const state: SlideState = { type: 'state', index: indexRef.current, updatedAt: Date.now() }
      write(STATE_KEY, state)
      channel?.postMessage(state)
    }
    const navigate = (message: unknown) => {
      if (!isCommand(message) || message.id === lastCommand) return
      lastCommand = message.id
      navigateRef.current(message.index)
    }
    const onMessage = ({ data }: MessageEvent<SyncMessage>) => {
      if (data.type === 'hello') publish()
      else navigate(data)
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === COMMAND_KEY && event.newValue) navigate(read<NavigateCommand>(COMMAND_KEY))
    }

    publishRef.current = publish
    channel?.addEventListener('message', onMessage)
    window.addEventListener('storage', onStorage)
    const heartbeat = window.setInterval(publish, HEARTBEAT_MS)
    publish()

    return () => {
      publishRef.current = () => undefined
      window.clearInterval(heartbeat)
      window.removeEventListener('storage', onStorage)
      channel?.close()
    }
  }, [])

  useEffect(() => publishRef.current(), [index])
}

export function useNotesSync() {
  const [sync, setSync] = useState(() => {
    const snapshot = read<SlideState>(STATE_KEY)
    return isState(snapshot)
      ? { index: snapshot.index, status: 'snapshot' as SyncStatus, lastSyncAt: snapshot.updatedAt }
      : { index: 0, status: 'waiting' as SyncStatus, lastSyncAt: 0 }
  })
  const channelRef = useRef<BroadcastChannel | null>(null)
  const lastLiveAt = useRef(0)

  useEffect(() => {
    const channel = openChannel()
    channelRef.current = channel

    const receive = (message: unknown) => {
      if (!isState(message)) return
      lastLiveAt.current = Date.now()
      setSync({ index: message.index, status: 'live', lastSyncAt: message.updatedAt })
    }
    const onMessage = ({ data }: MessageEvent<SyncMessage>) => receive(data)
    const onStorage = (event: StorageEvent) => {
      if (event.key === STATE_KEY && event.newValue) receive(read<SlideState>(STATE_KEY))
    }

    channel?.addEventListener('message', onMessage)
    window.addEventListener('storage', onStorage)
    channel?.postMessage({ type: 'hello' } satisfies SyncMessage)
    const staleCheck = window.setInterval(() => {
      if (lastLiveAt.current && Date.now() - lastLiveAt.current > HEARTBEAT_MS * 2.5) {
        setSync((current) => ({ ...current, status: 'offline' }))
      }
    }, 1_000)

    return () => {
      window.clearInterval(staleCheck)
      window.removeEventListener('storage', onStorage)
      channel?.close()
      channelRef.current = null
    }
  }, [])

  const navigate = useCallback((next: number) => {
    if (!validIndex(next)) return
    const command: NavigateCommand = {
      type: 'navigate',
      id: `${Date.now()}-${Math.random()}`,
      index: next,
    }
    setSync((current) => ({ ...current, index: next }))
    write(COMMAND_KEY, command)
    channelRef.current?.postMessage(command)
  }, [])

  return { ...sync, navigate }
}
