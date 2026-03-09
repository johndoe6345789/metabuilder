'use client';

import { ErrorFallback } from '@/components/error/ErrorFallback';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
