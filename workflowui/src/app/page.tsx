/**
 * Dashboard / Home Page
 * Workspace selector and recent workflows
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardLogic } from '../hooks';
import { Breadcrumbs } from '../components/Navigation/Breadcrumbs';
import styles from './page.module.scss';

export default function Dashboard() {
  const {
    isLoading,
    showCreateForm,
    newWorkspaceName,
    workspaces,
    setShowCreateForm,
    setNewWorkspaceName,
    handleCreateWorkspace,
    handleWorkspaceClick,
    resetWorkspaceForm
  } = useDashboardLogic();

  return (
    <div className={styles.dashboard}>
      <Breadcrumbs items={[{ label: '🏠 Workspaces', href: '/' }]} />

      <div className={styles.header}>
        <div>
          <h1>Workspaces</h1>
          <p>Organize your projects and workflows</p>
        </div>
        <button
          className={`${styles.createButton} btn btn-primary`}
          onClick={() => setShowCreateForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
          </svg>
          New Workspace
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading workspaces...</p>
          </div>
        ) : (
          <>
            {/* Create Workspace Form */}
            {showCreateForm && (
              <div className={styles.createFormContainer}>
                <form onSubmit={handleCreateWorkspace} className={styles.createForm}>
                  <h3>Create New Workspace</h3>
                  <input
                    type="text"
                    placeholder="Workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    autoFocus
                    className={styles.formInput}
                  />
                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!newWorkspaceName.trim()}
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetWorkspaceForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Workspaces Grid */}
            {workspaces.length === 0 && !showCreateForm ? (
              <EmptyState onCreateWorkspace={() => setShowCreateForm(true)} />
            ) : (
              <div className={styles.workspacesGrid}>
                {workspaces.map(workspace => (
                  <div
                    key={workspace.id}
                    className={styles.workspaceCard}
                    onClick={() => handleWorkspaceClick(workspace.id)}
                  >
                    <div
                      className={styles.workspaceIcon}
                      style={{ backgroundColor: workspace.color || '#1976d2' }}
                    >
                      {workspace.icon || '📁'}
                    </div>
                    <div className={styles.workspaceContent}>
                      <h3>{workspace.name}</h3>
                      <p>{workspace.description || 'No description'}</p>
                      <span className={styles.timestamp}>
                        Created {new Date(workspace.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onCreateWorkspace: () => void;
}

function EmptyState({ onCreateWorkspace }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth="2" />
        </svg>
      </div>
      <h2>No workspaces yet</h2>
      <p>Create your first workspace to organize your projects</p>
      <button className="btn btn-primary btn-lg" onClick={onCreateWorkspace}>
        Create Your First Workspace
      </button>
    </div>
  );
}

interface WorkflowGridProps {
  workflows: any[];
}

function WorkflowGrid({ workflows }: WorkflowGridProps) {
  return (
    <div className={styles.grid}>
      {workflows.map((workflow) => (
        <div key={workflow.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>{workflow.name}</h3>
            <span className="badge badge-info">{workflow.nodes?.length || 0} nodes</span>
          </div>
          <p className={styles.cardDescription}>{workflow.description || 'No description'}</p>
          <div className={styles.cardFooter}>
            <span className={styles.updated}>
              Updated {new Date(workflow.updatedAt).toLocaleDateString()}
            </span>
            <Link href={`/editor/${workflow.id}` as any} className="btn btn-primary btn-sm">
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
