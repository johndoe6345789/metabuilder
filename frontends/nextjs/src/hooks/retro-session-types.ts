export type RetroSystem =
  | 'nes'
  | 'snes'
  | 'n64'
  | 'gb'
  | 'gbc'
  | 'gba'
  | 'genesis'
  | 'ps1'
  | 'arcade'
  | 'dos'

export interface RetroSession {
  id: string
  system: RetroSystem
  romPath: string
  streamUrl: string
  startedAt: string
}

export interface RetroSessionState {
  session: RetroSession | null
  loading: boolean
  error: string | null
}
