/**
 * Scoring result types for Quality Validation tool
 */

import type { Configuration } from './config-types.js'
import type { Finding, Recommendation } from './core-types.js'

// ============================================================================
// SCORING RESULTS
// ============================================================================

export interface ScoringResult {
  overall: OverallScore
  componentScores: ComponentScores
  findings: Finding[]
  recommendations: Recommendation[]
  trend?: TrendData
  metadata: ResultMetadata
}

export interface OverallScore {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  status: 'pass' | 'fail'
  summary: string
  passesThresholds: boolean
}

export interface ComponentScores {
  codeQuality: {
    score: number
    weight: number
    weightedScore: number
  }
  testCoverage: {
    score: number
    weight: number
    weightedScore: number
  }
  architecture: {
    score: number
    weight: number
    weightedScore: number
  }
  security: {
    score: number
    weight: number
    weightedScore: number
  }
}

export interface TrendData {
  currentScore: number
  previousScore?: number
  changePercent?: number
  direction?: 'improving' | 'stable' | 'degrading'
  lastFiveScores?: number[]
  componentTrends?: {
    codeQuality: TrendDirection
    testCoverage: TrendDirection
    architecture: TrendDirection
    security: TrendDirection
  }
}

export interface TrendDirection {
  current: number
  previous?: number
  change?: number
  direction?: 'up' | 'down' | 'stable'
}

export interface ResultMetadata {
  timestamp: string
  toolVersion: string
  analysisTime: number
  projectPath: string
  nodeVersion: string
  configUsed: Configuration
}

// ============================================================================
// HISTORY
// ============================================================================

export interface HistoricalRun {
  timestamp: string
  score: number
  grade: string
  componentScores: ComponentScores
}
