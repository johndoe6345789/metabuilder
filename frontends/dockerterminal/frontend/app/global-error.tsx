'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex items-center justify-center bg-bg text-fg px-4">
          <div className="max-w-sm text-center">
            <h1 className="text-2xl font-semibold mb-2">Application error</h1>
            <p className="text-fg-secondary">{error.message}</p>
          </div>
        </main>
      </body>
    </html>
  );
}
