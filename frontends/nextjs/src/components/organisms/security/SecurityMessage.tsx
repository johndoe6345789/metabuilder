import { Alert, AlertDescription } from '@/components/ui'
import { Badge } from '@/components/ui'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import { ShieldWarning, Warning, Info, CheckCircle } from '@phosphor-icons/react'
import type { SecurityIssue, SecurityScanResult } from '@/lib/security/scanner/security-scanner'
import { getSeverityColor, getSeverityIcon } from '@/lib/security/scanner/security-scanner'

interface SecurityMessageProps {
  scanResult: SecurityScanResult
  codeType?: string
}

const severityOrder = ['critical', 'high', 'medium', 'low'] as const

const getSeverityBadgeVariant = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return <ShieldWarning className="w-12 h-12 text-red-600" weight="fill" />
    case 'medium':
      return <Warning className="w-12 h-12 text-yellow-600" weight="fill" />
    case 'low':
      return <Info className="w-12 h-12 text-blue-600" weight="fill" />
    default:
      return <CheckCircle className="w-12 h-12 text-green-600" weight="fill" />
  }
}

const getTitle = (severity: string, safe: boolean) => {
  if (safe) return 'Code Security Check Passed'

  switch (severity) {
    case 'critical':
      return 'CRITICAL SECURITY THREAT DETECTED'
    case 'high':
      return 'High-Risk Security Issues Detected'
    case 'medium':
      return 'Security Warnings Detected'
    case 'low':
      return 'Minor Security Concerns'
    default:
      return 'Security Scan Complete'
  }
}

const getDescription = (scanResult: SecurityScanResult, codeType: string) => {
  if (scanResult.safe) {
    return `Your ${codeType} has been scanned and appears to be safe.`
  }

  const { issues } = scanResult
  return `Your ${codeType} contains ${issues.length} security ${issues.length === 1 ? 'issue' : 'issues'} that require attention.`
}

export function SecurityMessage({ scanResult, codeType = 'code' }: SecurityMessageProps) {
  const groupedIssues = scanResult.issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) {
      acc[issue.severity] = []
    }
    acc[issue.severity].push(issue)
    return acc
  }, {} as Record<string, SecurityIssue[]>)

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4 mb-2">
          {getIcon(scanResult.severity)}
          <div className="flex-1">
            <DialogTitle className="text-2xl">{getTitle(scanResult.severity, scanResult.safe)}</DialogTitle>
            <DialogDescription className="text-base mt-1">
              {getDescription(scanResult, codeType)}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[50vh] pr-4">
        {scanResult.safe ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" weight="fill" />
            <AlertDescription className="text-green-800">
              No security issues detected. Your code follows security best practices.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {severityOrder.map(severity => {
              const issues = groupedIssues[severity]
              if (!issues || issues.length === 0) return null

              return (
                <div key={severity} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(severity)} className="uppercase">
                      {getSeverityIcon(severity)} {severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {issues.map((issue, idx) => (
                      <Alert key={idx} className={getSeverityColor(issue.severity)}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold">{issue.message}</p>
                              {issue.line && (
                                <p className="text-sm opacity-75 mt-1">
                                  Line {issue.line}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                              {issue.pattern}
                            </Badge>
                          </div>
                          {issue.recommendation && (
                            <>
                              <Separator className="my-2" />
                              <div className="text-sm">
                                <p className="font-medium mb-1">Recommendation:</p>
                                <p className="opacity-90">{issue.recommendation}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </Alert>
                    ))}
                  </div>
                </div>
              )
            })}

            {(scanResult.severity === 'critical' || scanResult.severity === 'high') && (
              <Alert className="border-red-300 bg-red-50 mt-4">
                <ShieldWarning className="h-5 w-5 text-red-600" weight="fill" />
                <AlertDescription className="text-red-800">
                  <p className="font-semibold mb-2">Security Alert</p>
                  <p>
                    {scanResult.severity === 'critical'
                      ? 'This code contains CRITICAL security vulnerabilities that could compromise system security, steal data, or execute malicious actions. It is strongly recommended NOT to proceed.'
                      : 'This code contains HIGH-RISK security issues that could lead to vulnerabilities or unexpected behavior. Carefully review and fix these issues before proceeding.'}
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </ScrollArea>
    </>
  )
}
