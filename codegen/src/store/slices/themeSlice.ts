import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { syncToFlask } from '@/store/middleware/flaskSync'

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  updatedAt: number
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  destructive: string
  border: string
}

export interface ThemeTypography {
  fontFamily: string
  headingFamily: string
  fontSize: Record<string, string>
  fontWeight: Record<string, number>
}

export interface ThemeSpacing {
  unit: number
  scale: number[]
}

interface ThemeState {
  currentTheme: Theme | null
  themes: Theme[]
  loading: boolean
  error: string | null
}

const initialState: ThemeState = {
  currentTheme: null,
  themes: [],
  loading: false,
  error: null,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setCurrentTheme: (state, action: PayloadAction<Theme>) => {
      state.currentTheme = action.payload
      syncToFlask('theme', 'current', action.payload).catch(console.error)
    },
    updateThemeColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      if (state.currentTheme) {
        state.currentTheme.colors = {
          ...state.currentTheme.colors,
          ...action.payload,
        }
        state.currentTheme.updatedAt = Date.now()
        syncToFlask('theme', 'current', state.currentTheme).catch(console.error)
      }
    },
    updateThemeTypography: (state, action: PayloadAction<Partial<ThemeTypography>>) => {
      if (state.currentTheme) {
        state.currentTheme.typography = {
          ...state.currentTheme.typography,
          ...action.payload,
        }
        state.currentTheme.updatedAt = Date.now()
        syncToFlask('theme', 'current', state.currentTheme).catch(console.error)
      }
    },
    addTheme: (state, action: PayloadAction<Theme>) => {
      state.themes.push(action.payload)
      syncToFlask('theme', action.payload.id, action.payload).catch(console.error)
    },
    deleteTheme: (state, action: PayloadAction<string>) => {
      state.themes = state.themes.filter(t => t.id !== action.payload)
      if (state.currentTheme?.id === action.payload) {
        state.currentTheme = null
      }
      syncToFlask('theme', action.payload, null, 'delete').catch(console.error)
    },
    setThemes: (state, action: PayloadAction<Theme[]>) => {
      state.themes = action.payload
    },
  },
})

export const { 
  setCurrentTheme, 
  updateThemeColors, 
  updateThemeTypography, 
  addTheme, 
  deleteTheme,
  setThemes 
} = themeSlice.actions

export default themeSlice.reducer
