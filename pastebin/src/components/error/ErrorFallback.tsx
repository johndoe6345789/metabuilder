import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AIErrorHelper } from "@/components/error/AIErrorHelper";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangleIcon, RefreshCwIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon, CheckIcon } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  // Only throw in development environment (not in tests)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    throw error;
  }

  const [isStackOpen, setIsStackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorDetails = `Error: ${error.message}\n\nStack Trace:\n${error.stack || 'No stack trace available'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="error-fallback">
      <div className="w-full max-w-3xl">
        <Alert variant="destructive" className="mb-6" data-testid="error-alert" role="alert">
          <AlertTriangleIcon aria-hidden="true" />
          <AlertTitle>This spark has encountered a runtime error</AlertTitle>
          <AlertDescription className="mt-3 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <code
                className="text-sm bg-destructive/20 px-2 py-1 rounded flex-1 break-all"
                data-testid="error-message"
              >
                {error.message}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
                data-testid="copy-error-btn"
                aria-label="Copy error details"
                aria-live="polite"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <Collapsible open={isStackOpen} onOpenChange={setIsStackOpen} data-testid="stack-trace-collapsible">
              <CollapsibleTrigger className="w-full justify-between" aria-expanded={isStackOpen} data-testid="stack-trace-trigger">
                {isStackOpen ? (
                  <>
                    Hide Stack Trace <ChevronUpIcon className="h-4 w-4 ml-2" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Show Stack Trace <ChevronDownIcon className="h-4 w-4 ml-2" aria-hidden="true" />
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent data-testid="stack-trace-content">
                <div className="mt-4">
                  <pre className="text-xs bg-destructive/10 p-3 rounded overflow-auto max-h-60" data-testid="error-stack-trace">
                    {error.stack || 'No stack trace available'}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </AlertDescription>
        </Alert>

        <AIErrorHelper error={error} />

        <Button
          onClick={() => window.location.reload()}
          className="w-full mt-6"
          variant="outline"
          data-testid="reload-btn"
          aria-label="Try reloading the page"
        >
          <RefreshCwIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          Try Reloading
        </Button>
      </div>
    </div>
  );
}
