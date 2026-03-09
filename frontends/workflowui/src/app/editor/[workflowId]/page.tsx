'use client';
/**
 * Visual Workflow Editor Page
 * Lazy-loads the full editor client to avoid bundling canvas/drag-drop
 * components in the initial page load.
 */

import dynamic from 'next/dynamic';

const WorkflowEditorClient = dynamic(
  () => import('./WorkflowEditorClient'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--mat-sys-on-surface-variant)',
      }}>
        Loading workflow editor...
      </div>
    ),
  }
);

export default function WorkflowEditorPage() {
  return <WorkflowEditorClient />;
}
