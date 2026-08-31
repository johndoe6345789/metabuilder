interface ActionConfig {
  handler?: string
}

interface ResolveResult {
  config?: ActionConfig
  invalidConfigError?: string
}

/** Parses a package's stored config and looks up one registered action
 *  by "{entity}.{action}" -- config is untrusted JSON on the package
 *  record, so a parse failure is a real, reportable outcome. */
export function resolveActionConfig(
  pkg: unknown,
  entity: string,
  action: string
): ResolveResult {
  let parsed: { actions?: Record<string, ActionConfig> }
  try {
    parsed = JSON.parse((pkg as { config?: string }).config ?? '{}') as {
      actions?: Record<string, ActionConfig>
    }
  } catch (error) {
    return {
      invalidConfigError:
        error instanceof Error ? error.message : 'Invalid package config',
    }
  }

  return { config: parsed.actions?.[`${entity}.${action}`] }
}
