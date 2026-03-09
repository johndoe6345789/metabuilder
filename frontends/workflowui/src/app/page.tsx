/**
 * Dashboard / Home Page
 * Workspace selector, stats, and achievements
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, CircularProgress, TextField } from '@metabuilder/fakemui';
import { useDashboardLogic } from '../hooks';
import { NodeIcon, PlayIcon, ErrorIcon, TimerIcon, TrophyIcon, StarIcon, FolderIcon, AddIcon } from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';

const WORKSPACE_COLORS = [
  '#6750A4', // Primary purple
  '#625B71', // Secondary
  '#7D5260', // Tertiary
  '#BA1A1A', // Error red
  '#006E1C', // Green
  '#00639B', // Blue
  '#A8541D', // Orange
  '#5C5C5C', // Gray
];

// Mock stats and achievements (would come from API in production)
const todayStats = {
  nodesCreated: 23,
  workflowsRun: 5,
  failedRuns: 1,
  timeSaved: '1.2h',
};

const achievements = [
  { id: '1', title: 'First Steps', icon: <TrophyIcon />, unlocked: true },
  { id: '2', title: 'Node Master', icon: <NodeIcon />, unlocked: true },
  { id: '3', title: 'Speed Runner', icon: <StarIcon />, unlocked: false, progress: 7, max: 10 },
];

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
      {/* Daily Stats Banner */}
      <div className={styles.statsBanner}>
        <div className={styles.statItem}>
          <div className={styles.statIconWrap}><NodeIcon /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{todayStats.nodesCreated}</span>
            <span className={styles.statLabel}>nodes today</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIconWrap} style={{ color: 'var(--mat-sys-tertiary)' }}><PlayIcon /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{todayStats.workflowsRun}</span>
            <span className={styles.statLabel}>runs today</span>
          </div>
        </div>
        {todayStats.failedRuns > 0 && (
          <div className={`${styles.statItem} ${styles.statItemWarning}`}>
            <div className={styles.statIconWrap} style={{ color: 'var(--mat-sys-error)' }}><ErrorIcon /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{todayStats.failedRuns}</span>
              <span className={styles.statLabel}>failed</span>
            </div>
          </div>
        )}
        <div className={styles.statItem}>
          <div className={styles.statIconWrap} style={{ color: 'var(--mat-sys-secondary)' }}><TimerIcon /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{todayStats.timeSaved}</span>
            <span className={styles.statLabel}>saved today</span>
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.achievementPreview}>
          {achievements.filter(a => a.unlocked).slice(0, 2).map(a => (
            <div key={a.id} className={styles.achievementBadge} title={a.title}>{a.icon}</div>
          ))}
          <Link href="/achievements" className={styles.achievementMore}>+4 more</Link>
        </div>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Workspaces</h1>
          <p className={styles.pageSubtitle}>Organize your projects and workflows</p>
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon size={20} />}
          onClick={() => setShowCreateForm(true)}
        >
          New Workspace
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <CircularProgress />
          <p>Loading workspaces...</p>
        </div>
      ) : (
        <>
          {showCreateForm && (
            <CreateWorkspaceForm
              name={newWorkspaceName}
              onNameChange={setNewWorkspaceName}
              onSubmit={handleCreateWorkspace}
              onCancel={resetWorkspaceForm}
            />
          )}

          {workspaces.length === 0 && !showCreateForm ? (
            <EmptyState onCreateWorkspace={() => setShowCreateForm(true)} />
          ) : (
            <div className={styles.grid}>
              {workspaces.map(workspace => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={() => handleWorkspaceClick(workspace.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    createdAt: string;
  };
  onClick: () => void;
}

function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps) {
  const initials = workspace.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <article
      className={styles.card}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="button"
      aria-label={`Open ${workspace.name} workspace`}
    >
      <div
        className={styles.cardMedia}
        style={{ backgroundColor: workspace.color || 'var(--mat-sys-primary)' }}
      >
        <span className={styles.cardInitials}>{initials}</span>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{workspace.name}</h3>
        <p className={styles.cardDescription}>
          {workspace.description || 'No description'}
        </p>
        <span className={styles.cardMeta}>
          Created {new Date(workspace.createdAt).toLocaleDateString()}
        </span>
      </div>
    </article>
  );
}

interface EmptyStateProps {
  onCreateWorkspace: () => void;
}

function EmptyState({ onCreateWorkspace }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <FolderIcon size={64} />
      </div>
      <h2 className={styles.emptyTitle}>No workspaces yet</h2>
      <p className={styles.emptyText}>
        Create your first workspace to organize your projects
      </p>
      <Button variant="contained" size="large" startIcon={<AddIcon size={22} />} onClick={onCreateWorkspace}>
        Create Your First Workspace
      </Button>
    </div>
  );
}

interface CreateWorkspaceFormProps {
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function CreateWorkspaceForm({ name, onNameChange, onSubmit, onCancel }: CreateWorkspaceFormProps) {
  const [color, setColor] = useState(WORKSPACE_COLORS[0]);
  const [description, setDescription] = useState('');

  const initials = name.trim()
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'WS';

  return (
    <div className={styles.createForm}>
      <div className={styles.formPreview}>
        <div className={styles.formPreviewCard}>
          <div className={styles.formPreviewMedia} style={{ backgroundColor: color }}>
            <span className={styles.formPreviewInitials}>{initials}</span>
          </div>
          <div className={styles.formPreviewContent}>
            <p className={styles.formPreviewTitle}>{name || 'Workspace Name'}</p>
            <p className={styles.formPreviewDesc}>{description || 'No description'}</p>
          </div>
        </div>
        <div className={styles.formColorPicker}>
          {WORKSPACE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.formColorSwatch} ${c === color ? styles.active : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <form className={styles.formFields} onSubmit={onSubmit}>
        <h2 className={styles.formTitle}>
          <span className={styles.formTitleIcon}><AddIcon size={20} /></span>
          Create New Workspace
        </h2>

        <TextField
          label="Workspace Name"
          placeholder="e.g., Marketing Automation"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
        />

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description (Optional)</label>
          <textarea
            className={styles.formTextarea}
            placeholder="What will this workspace be used for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.formActions}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!name.trim()}
          >
            Create Workspace
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
