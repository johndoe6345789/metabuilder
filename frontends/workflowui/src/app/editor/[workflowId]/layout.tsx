/**
 * Editor Route Layout
 * Minimal layout for workflow editor - no header, no sidebar, no padding
 * The editor has its own toolbar
 */

interface EditorLayoutProps {
  children: React.ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  // Return children directly without any wrapper
  // This bypasses the main layout's padding
  return <>{children}</>;
}
