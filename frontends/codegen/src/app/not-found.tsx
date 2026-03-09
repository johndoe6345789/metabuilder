'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-fg">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-fg-secondary mb-4">Page not found</p>
        <a href="/codegen/" className="text-primary hover:underline">
          Go to CodeForge
        </a>
      </div>
    </div>
  );
}
