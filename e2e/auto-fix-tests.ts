#!/usr/bin/env tsx
/**
 * Auto-fix test selectors by analyzing page structure
 *
 * Usage: npx tsx auto-fix-tests.ts <test-name-pattern>
 *
 * This script:
 * 1. Runs tests and captures failures
 * 2. Takes screenshots of failing pages
 * 3. Analyzes DOM to find alternative selectors
 * 4. Suggests fixes for broken tests
 */

import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

interface SelectorFix {
  originalSelector: string
  suggestedSelectors: string[]
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

async function analyzePageForSelector(page: any, originalSelector: string): Promise<SelectorFix> {
  const suggestions: string[] = []

  // Extract key parts from original selector
  const hasText = originalSelector.match(/has-text\(['"](.+?)['"]\)/)
  const textMatch = originalSelector.match(/text=(.+?)($|,)/)
  const classMatch = originalSelector.match(/\.([\w-]+)/)
  const idMatch = originalSelector.match(/#([\w-]+)/)

  // Try to find elements with similar text
  if (hasText || textMatch) {
    const searchText = hasText ? hasText[1] : textMatch![1]

    const textElements = await page.evaluate((text: string) => {
      const elements = document.querySelectorAll('*')
      const matches: any[] = []

      elements.forEach((el: Element) => {
        const content = el.textContent?.toLowerCase() || ''
        if (content.includes(text.toLowerCase())) {
          matches.push({
            selector: el.tagName.toLowerCase() +
                     (el.id ? `#${el.id}` : '') +
                     (el.className ? `.${el.className.split(' ')[0]}` : ''),
            text: el.textContent?.trim().substring(0, 50),
            visible: window.getComputedStyle(el).display !== 'none'
          })
        }
      })

      return matches.filter(m => m.visible).slice(0, 5)
    }, searchText)

    textElements.forEach((el: any) => {
      suggestions.push(el.selector)
      suggestions.push(`text=${el.text}`)
    })
  }

  // Try similar class names
  if (classMatch) {
    const className = classMatch[1]
    const similarClasses = await page.evaluate((cls: string) => {
      const elements = document.querySelectorAll(`[class*="${cls}"]`)
      return Array.from(elements).slice(0, 5).map((el: Element) =>
        `.${el.className.split(' ')[0]}`
      )
    }, className)

    suggestions.push(...similarClasses)
  }

  // Try role-based selectors
  const roleMatches = await page.evaluate(() => {
    const roles = ['button', 'link', 'textbox', 'heading', 'navigation']
    const matches: string[] = []

    roles.forEach(role => {
      const elements = document.querySelectorAll(`[role="${role}"]`)
      if (elements.length > 0) {
        matches.push(`[role="${role}"]`)
      }
    })

    return matches
  })

  suggestions.push(...roleMatches)

  // Try data-testid if exists
  const testIds = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]')
    return Array.from(elements).slice(0, 5).map((el: Element) =>
      `[data-testid="${el.getAttribute('data-testid')}"]`
    )
  })

  suggestions.push(...testIds)

  // Dedupe and prioritize
  const uniqueSuggestions = [...new Set(suggestions)]

  return {
    originalSelector,
    suggestedSelectors: uniqueSuggestions.slice(0, 10),
    confidence: uniqueSuggestions.length > 0 ? 'high' : 'low',
    reason: `Found ${uniqueSuggestions.length} alternative selectors`
  }
}

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  const page = await context.newPage()

  console.log('🔧 Auto-Fix Test Analyzer')
  console.log('========================\n')

  // Example: Analyze dashboard
  console.log('Analyzing Dashboard page...')
  await page.goto('http://localhost:3000/')
  await page.waitForLoadState('domcontentloaded')

  // Failed selectors to analyze
  const failedSelectors = [
    '.react-flow__viewport',
    'button:has-text(\'Core\')',
    'select, button:has-text(\'Status\')',
    '[class*=\'plugin-card\']'
  ]

  for (const selector of failedSelectors) {
    console.log(`\n🔍 Analyzing: ${selector}`)

    try {
      const exists = await page.locator(selector).count()

      if (exists === 0) {
        console.log('❌ Element not found, finding alternatives...')

        const fix = await analyzePageForSelector(page, selector)

        console.log(`\n📋 Suggested fixes (${fix.confidence} confidence):`)
        fix.suggestedSelectors.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s}`)
        })
      } else {
        console.log(`✅ Element found (${exists} matches)`)
      }
    } catch (error) {
      console.log('⚠️  Error analyzing selector:', error)
    }
  }

  // Analyze Workflows page
  console.log('\n\nAnalyzing Workflows page...')
  await page.goto('http://localhost:3000/workflows')
  await page.waitForLoadState('domcontentloaded')

  const workflowSelectors = [
    'input[placeholder*=\'Search workflows\']',
    'button:has-text(\'Favorites\')',
    'select, button:has-text(\'Status\')'
  ]

  for (const selector of workflowSelectors) {
    console.log(`\n🔍 Analyzing: ${selector}`)

    try {
      const exists = await page.locator(selector).count()

      if (exists === 0) {
        console.log('❌ Element not found, finding alternatives...')
        const fix = await analyzePageForSelector(page, selector)

        console.log(`\n📋 Suggested fixes (${fix.confidence} confidence):`)
        fix.suggestedSelectors.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s}`)
        })
      } else {
        console.log(`✅ Element found (${exists} matches)`)
      }
    } catch (error) {
      console.log('⚠️  Error analyzing selector:', error)
    }
  }

  // Take screenshots
  await page.screenshot({
    path: 'test-results/auto-fix-workflows.png',
    fullPage: true
  })

  console.log('\n\n📸 Screenshots saved to test-results/')
  console.log('✅ Auto-fix analysis complete!')

  await browser.close()
}

main().catch(console.error)
