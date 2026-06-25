/**
 * AIService — LLM-backed code, model, theme, and app generation.
 * Split into: ai-service-generate.ts | ai-service-analyze.ts
 */
import { AIServiceGenerate } from './ai-service-generate'
import { AIServiceAnalyze } from './ai-service-analyze'

/**
 * Combined AIService merging generate + analyze static methods.
 * Callers can import AIService from this module as before.
 */
export class AIService {
  static generateComponent =
    AIServiceGenerate.generateComponent
  static generateDbModel =
    AIServiceGenerate.generateDbModel
  static generateCodeFromDescription =
    AIServiceGenerate.generateCodeFromDescription
  static improveCode =
    AIServiceGenerate.improveCode
  static generateThemeFromDescription =
    AIServiceAnalyze.generateThemeFromDescription
  static suggestFieldsForModel =
    AIServiceAnalyze.suggestFieldsForModel
  static explainCode =
    AIServiceAnalyze.explainCode
  static generateCompleteApp =
    AIServiceAnalyze.generateCompleteApp
}
