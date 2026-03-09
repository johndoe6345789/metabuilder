import { useState } from "react";
import { Alert, AlertTitle, Button, MaterialIcon } from "@metabuilder/components/fakemui";
import { AIErrorHelper } from "@/components/error/AIErrorHelper";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./ErrorFallback.module.scss";

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary?: (...args: unknown[]) => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const t = useTranslation();
  const err = error instanceof Error ? error : new Error(String(error));

  const [isStackOpen, setIsStackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorDetails = `Error: ${err.message}\n\nStack Trace:\n${err.stack || 'No stack trace available'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.root} data-testid="error-fallback">
      <div className={styles.inner}>
        <Alert severity="error" style={{ marginBottom: '1.5rem' }} data-testid="error-alert" role="alert">
          <MaterialIcon name="warning" aria-hidden="true" />
          <AlertTitle>{t.errorFallback.title}</AlertTitle>
          <div className={styles.alertBody}>
            <div className={styles.messageRow}>
              <code
                className={styles.errorCode}
                data-testid="error-message"
              >
                {err.message}
              </code>
              <Button
                size="sm"
                variant="outlined"
                onClick={handleCopy}
                data-testid="copy-error-btn"
                aria-label="Copy error details"
                aria-live="polite"
              >
                {copied ? (
                  <>
                    <MaterialIcon name="check" size={14} />
                    {t.errorFallback.copied}
                  </>
                ) : (
                  <>
                    <MaterialIcon name="content_copy" size={14} />
                    {t.errorFallback.copy}
                  </>
                )}
              </Button>
            </div>

            <div data-testid="stack-trace-collapsible">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStackOpen(!isStackOpen)}
                style={{ width: '100%', justifyContent: 'space-between' }}
                aria-expanded={isStackOpen}
                data-testid="stack-trace-trigger"
              >
                {isStackOpen ? (
                  <>
                    {t.errorFallback.hideStack} <MaterialIcon name="expand_less" size={16} style={{ marginLeft: '0.5rem' }} aria-hidden="true" />
                  </>
                ) : (
                  <>
                    {t.errorFallback.showStack} <MaterialIcon name="expand_more" size={16} style={{ marginLeft: '0.5rem' }} aria-hidden="true" />
                  </>
                )}
              </Button>
              {isStackOpen && (
                <div className={styles.stackContent} data-testid="stack-trace-content">
                  <pre className={styles.stackPre} data-testid="error-stack-trace">
                    {err.stack || t.errorFallback.noStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Alert>

        <AIErrorHelper error={err} />

        <Button
          onClick={() => (resetErrorBoundary ? resetErrorBoundary() : window.location.reload())}
          className={styles.reloadBtn}
          variant="outlined"
          data-testid="reload-btn"
          aria-label="Try reloading the page"
        >
          <MaterialIcon name="refresh" size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
          {t.errorFallback.reload}
        </Button>
      </div>
    </div>
  );
}
