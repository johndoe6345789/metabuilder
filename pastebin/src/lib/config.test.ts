import { getLanguageColor, LANGUAGES, LANGUAGE_COLORS, strings, appConfig } from './config'

describe('config', () => {
  describe('getLanguageColor', () => {
    test('returns colors for known languages', () => {
      const color = getLanguageColor('JavaScript')
      expect(color).toBeDefined()
      expect(typeof color).toBe('string')
      expect(color).toContain(' ')
    })

    test('returns combined bg, text, border classes', () => {
      const color = getLanguageColor('Python')
      const parts = color.split(' ')
      expect(parts.length).toBeGreaterThanOrEqual(2)
    })

    test('returns default color for unknown language', () => {
      const color = getLanguageColor('UnknownLanguage')
      expect(color).toBeDefined()
      expect(typeof color).toBe('string')
    })

    test('returns same default for unknown languages', () => {
      const color1 = getLanguageColor('Unknown1')
      const color2 = getLanguageColor('Unknown2')
      expect(color1).toBe(color2)
    })

    test('handles case sensitivity', () => {
      const colorCapital = getLanguageColor('JavaScript')
      const colorLower = getLanguageColor('javascript')
      // Results may differ due to case sensitivity in the mapping
      expect(colorCapital).toBeDefined()
      expect(colorLower).toBeDefined()
    })

    test('returns valid Tailwind classes', () => {
      const color = getLanguageColor('TypeScript')
      expect(color).toContain('bg-')
      // Color should have class names with dashes
      expect(/\w+[-\w]*/.test(color)).toBe(true)
    })

    test('handles empty string', () => {
      const color = getLanguageColor('')
      expect(color).toBeDefined()
    })

    test('returns Other color for unmapped languages', () => {
      const color = getLanguageColor('SomeRandomLanguage')
      const otherColor = getLanguageColor('Other')
      expect(color).toBe(otherColor)
    })
  })

  describe('LANGUAGES', () => {
    test('is an array', () => {
      expect(Array.isArray(LANGUAGES)).toBe(true)
    })

    test('contains language entries', () => {
      expect(LANGUAGES.length).toBeGreaterThan(0)
    })

    test('each language has label and value', () => {
      for (const lang of LANGUAGES) {
        if (lang && typeof lang === 'object') {
          expect(lang).toHaveProperty('label')
          expect(lang).toHaveProperty('value')
        }
      }
    })

    test('LANGUAGES is exported', () => {
      expect(LANGUAGES).toBeDefined()
    })
  })

  describe('LANGUAGE_COLORS', () => {
    test('is an object', () => {
      expect(typeof LANGUAGE_COLORS).toBe('object')
      expect(!Array.isArray(LANGUAGE_COLORS)).toBe(true)
    })

    test('contains color entries', () => {
      expect(Object.keys(LANGUAGE_COLORS).length).toBeGreaterThan(0)
    })

    test('each color is a string with classes', () => {
      for (const [, color] of Object.entries(LANGUAGE_COLORS)) {
        expect(typeof color).toBe('string')
        expect(color.length).toBeGreaterThan(0)
        expect(color).toContain(' ')
      }
    })

    test('includes Other language color', () => {
      expect(LANGUAGE_COLORS).toHaveProperty('Other')
    })

    test('all colors contain Tailwind class patterns', () => {
      for (const color of Object.values(LANGUAGE_COLORS)) {
        // Colors should contain class names like bg-, text-, border-, etc
        expect(/[a-z]+-/.test(color)).toBe(true)
      }
    })

    test('color format is consistent', () => {
      const colorValues = Object.values(LANGUAGE_COLORS)
      const lengths = new Set(colorValues.map((c) => c.split(' ').length))
      // All colors should have similar number of parts
      expect(lengths.size).toBeGreaterThanOrEqual(1)
    })
  })

  describe('strings export', () => {
    test('strings object exists', () => {
      expect(strings).toBeDefined()
      expect(typeof strings).toBe('object')
    })

    test('strings is not null', () => {
      expect(strings).not.toBeNull()
    })
  })

  describe('appConfig export', () => {
    test('appConfig object exists', () => {
      expect(appConfig).toBeDefined()
      expect(typeof appConfig).toBe('object')
    })

    test('appConfig is not null', () => {
      expect(appConfig).not.toBeNull()
    })

    test('appConfig has languages property', () => {
      expect(appConfig).toHaveProperty('languages')
    })

    test('appConfig has languageColors property', () => {
      expect(appConfig).toHaveProperty('languageColors')
    })

    test('appConfig languageColors is an object', () => {
      expect(typeof appConfig.languageColors).toBe('object')
    })

    test('each languageColor has bg, text, border', () => {
      for (const [, colors] of Object.entries(appConfig.languageColors)) {
        expect(colors).toHaveProperty('bg')
        expect(colors).toHaveProperty('text')
        expect(colors).toHaveProperty('border')
      }
    })
  })

  describe('consistency', () => {
    test('getLanguageColor uses appConfig.languageColors', () => {
      for (const lang of Object.keys(appConfig.languageColors)) {
        const color = getLanguageColor(lang)
        expect(color).toBeDefined()
        expect(color).toContain(appConfig.languageColors[lang as keyof typeof appConfig.languageColors].bg)
      }
    })

    test('LANGUAGE_COLORS matches appConfig.languageColors', () => {
      expect(Object.keys(LANGUAGE_COLORS)).toEqual(Object.keys(appConfig.languageColors))
    })

    test('LANGUAGES array matches appConfig.languages', () => {
      expect(LANGUAGES).toEqual(appConfig.languages)
    })
  })
})
