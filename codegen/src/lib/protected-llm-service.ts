/// <reference path="../global.d.ts" />

import { aiRateLimiter, scanRateLimiter } from './rate-limiter'
import { toast } from 'sonner'

interface LLMCallOptions {
  model?: 'gpt-4o' | 'gpt-4o-mini'
  jsonMode?: boolean
  priority?: 'low' | 'medium' | 'high'
  category?: string
}

export class ProtectedLLMService {
  private static callCount = 0
  private static errorCount = 0
  private static readonly MAX_ERRORS_BEFORE_PAUSE = 5

  static async safeLLMCall(
    prompt: string,
    options: LLMCallOptions = {}
  ): Promise<string | null> {
    const {
      model = 'gpt-4o',
      jsonMode = false,
      priority = 'medium',
      category = 'general'
    } = options

    if (this.errorCount >= this.MAX_ERRORS_BEFORE_PAUSE) {
      console.warn('Too many LLM errors detected. Pausing further calls.')
      toast.error('AI service temporarily unavailable due to repeated errors')
      return null
    }

    try {
      const key = `llm-${category}`
      const result = await aiRateLimiter.throttle(
        key,
        async () => {
          this.callCount++
          return await window.spark.llm(prompt, model, jsonMode)
        },
        priority
      )

      if (result) {
        this.errorCount = Math.max(0, this.errorCount - 1)
      }

      return result
    } catch (error) {
      this.errorCount++
      console.error(`LLM call failed (${category}):`, error)
      
      if (error instanceof Error) {
        if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
          toast.error('Service temporarily unavailable - please wait a moment')
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          toast.error('Too many requests - please slow down')
        } else {
          toast.error('AI service error - please try again')
        }
      }
      
      return null
    }
  }

  static getStats() {
    return {
      totalCalls: this.callCount,
      errorCount: this.errorCount,
      isPaused: this.errorCount >= this.MAX_ERRORS_BEFORE_PAUSE
    }
  }

  static reset() {
    this.callCount = 0
    this.errorCount = 0
    aiRateLimiter.reset()
    scanRateLimiter.reset()
  }
}
