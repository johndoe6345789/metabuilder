import { classDetector } from './detectors/class-detector'
import { functionDetector } from './detectors/function-detector'

export type DetectorContext = {
  filePath: string
  source: string
}

export type DetectionFinding = {
  detectorId: string
  name: string
  message: string
  location?: {
    line: number
    column: number
  }
}

export interface Detector {
  id: string
  description: string
  detect: (context: DetectorContext) => DetectionFinding[]
}

export class DetectorRegistry {
  private readonly detectors: Detector[] = []

  register(detector: Detector): void {
    this.detectors.push(detector)
  }

  list(): Detector[] {
    return [...this.detectors]
  }

  run(context: DetectorContext): DetectionFinding[] {
    return this.detectors.flatMap((detector) => detector.detect(context))
  }
}

export const registry = new DetectorRegistry()

const builtInDetectors: Detector[] = [functionDetector, classDetector]

builtInDetectors.forEach((detector) => registry.register(detector))
