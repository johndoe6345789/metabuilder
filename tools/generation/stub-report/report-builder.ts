import { buildPatternSection } from './pattern-section'
import { buildCompletenessSection } from './completeness-section'
import { buildGuidanceSections } from './guidance-sections'

export const generateStubReport = (): string => {
  let report = '# Stub Implementation Detection Report\n\n'
  report += '## Overview\n\n'
  report += 'This report identifies incomplete, placeholder, or stubbed implementations in the codebase.\n'
  report += 'Stubs should be replaced with real implementations before production use.\n\n'

  report += buildPatternSection()
  report += buildCompletenessSection()
  report += buildGuidanceSections()

  report += `---\n\n`
  report += `**Generated**: ${new Date().toISOString()}\n`
  return report
}
