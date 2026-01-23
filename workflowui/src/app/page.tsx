/**
 * Dashboard / Home Page
 * Main entry point showing workflow list and recent activity
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkflow, useUI } from '@hooks';
import styles from './page.module.scss';

export default function Dashboard() {
  const { create, load } = useWorkflow();
  const { success, error, openModal } = useUI();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      // TODO: Fetch workflows from API via workflowService
      setWorkflows([]);
    } catch (err) {
      error('Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const name = prompt('Enter workflow name:');
      if (name) {
        await create(name);
        success('Workflow created successfully');
        loadWorkflows();
      }
    } catch (err) {
      error('Failed to create workflow');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1>Workflows</h1>
          <p>Create and manage your visual workflows</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateWorkflow}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
          </svg>
          New Workflow
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <EmptyState onCreateWorkflow={handleCreateWorkflow} />
        ) : (
          <WorkflowGrid workflows={workflows} />
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onCreateWorkflow: () => void;
}

function EmptyState({ onCreateWorkflow }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="M21 15l-5-5L5 21" strokeWidth="2" />
        </svg>
      </div>
      <h2>No workflows yet</h2>
      <p>Create your first workflow to get started</p>
      <button className="btn btn-primary btn-lg" onClick={onCreateWorkflow}>
        Create Your First Workflow
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
            <Link href={`/editor/${workflow.id}`} className="btn btn-primary btn-sm">
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
