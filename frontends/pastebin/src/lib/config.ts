import stringsData from '@/config/strings.json'
import appConfigData from '@/config/app-config.json'

export const strings = stringsData
export const appConfig = appConfigData

export function getLanguageColor(language: string): string {
  const colors = appConfig.languageColors[language as keyof typeof appConfig.languageColors]
  if (colors) {
    return `${colors.bg} ${colors.text} ${colors.border}`
  }
  const defaultColors = appConfig.languageColors.Other
  return `${defaultColors.bg} ${defaultColors.text} ${defaultColors.border}`
}

export const LANGUAGES = appConfig.languages

export const LANGUAGE_COLORS: Record<string, string> = Object.entries(appConfig.languageColors).reduce(
  (acc, [key, value]) => {
    acc[key] = `${value.bg} ${value.text} ${value.border}`
    return acc
  },
  {} as Record<string, string>
)
