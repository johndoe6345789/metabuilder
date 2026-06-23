export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg text-fg px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-4xl font-semibold mb-2">404</h1>
        <p className="text-fg-secondary mb-6">Page not found</p>
        <a className="text-primary hover:underline" href="/terminal/">
          Return to Container Shell
        </a>
      </div>
    </main>
  );
}
