/**
 * Template Detail Page
 * View template details and create project from template
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Breadcrumbs } from '../../../components/Navigation/Breadcrumbs';
import { templateService } from '../../../services/templateService';
import styles from './template-detail.module.scss';

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params?.id as string;
  const template = templateService.getTemplate(templateId);
  const relatedTemplates = templateService.getRelatedTemplates(templateId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState(template?.name || '');

  if (!template) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Template not found</h1>
          <p>The template you're looking for doesn't exist.</p>
          <Link href={"/templates" as any} className="btn btn-primary">
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating project:', projectName);
    setShowCreateForm(false);
  };

  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
          { label: template.name, href: `/templates/${template.id}` },
        ]}
      />

      <div className={styles.content}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div
              className={styles.largeIcon}
              style={{ backgroundColor: template.color }}
            >
              {template.icon}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div>
              <h1>{template.name}</h1>
              <p className={styles.description}>{template.description}</p>

              {template.longDescription && (
                <p className={styles.longDescription}>{template.longDescription}</p>
              )}
            </div>

            <div className={styles.headerMeta}>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Difficulty</span>
                <div className={styles.metaValue}>
                  {template.difficulty === 'beginner' && '🟢'}
                  {template.difficulty === 'intermediate' && '🟡'}
                  {template.difficulty === 'advanced' && '🔴'}
                  {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                </div>
              </div>

              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Rating</span>
                <div className={styles.metaValue}>
                  {'⭐'.repeat(Math.round(template.metadata.rating || 0))}
                  <span className={styles.rating}>
                    {template.metadata.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>

              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Downloads</span>
                <div className={styles.metaValue}>
                  {template.metadata.downloads?.toLocaleString() || 0}
                </div>
              </div>

              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>By</span>
                <div className={styles.metaValue}>{template.metadata.author}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                data-testid="template-create-project"
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreateForm(true)}
              >
                Create Project from Template
              </button>
              <button className="btn btn-secondary btn-lg">
                Preview
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className={styles.tabs} role="tablist">
          <button className={styles.tab} role="tab" aria-selected="true">
            Workflows
          </button>
          <button className={styles.tab} role="tab" aria-selected="false">
            Details
          </button>
          <button className={styles.tab} role="tab" aria-selected="false">
            Reviews
          </button>
        </nav>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Workflows Section */}
          <section className={styles.section}>
            <h2>Included Workflows ({template.workflows.length})</h2>
            <div className={styles.workflowsList}>
              {template.workflows.map((workflow, idx) => (
                <div
                  key={idx}
                  data-testid={`template-workflow-${idx}`}
                  className={styles.workflowCard}
                >
                  <h3>{workflow.name}</h3>
                  <p>{workflow.description}</p>

                  <div className={styles.workflowDiagram}>
                    <svg width="100%" height="100" viewBox="0 0 400 100">
                      {/* Simple workflow visualization */}
                      {workflow.nodes.slice(0, 5).map((node, nodeIdx) => (
                        <g key={nodeIdx}>
                          <circle
                            cx={80 + nodeIdx * 70}
                            cy="50"
                            r="20"
                            fill={template.color}
                            opacity="0.7"
                          />
                          <text
                            x={80 + nodeIdx * 70}
                            y="55"
                            textAnchor="middle"
                            fontSize="10"
                            fill="white"
                          >
                            {nodeIdx + 1}
                          </text>

                          {nodeIdx < workflow.nodes.length - 1 && (
                            <path
                              d={`M ${100 + nodeIdx * 70} 50 L ${60 + (nodeIdx + 1) * 70} 50`}
                              stroke={template.color}
                              strokeWidth="2"
                              fill="none"
                              markerEnd="url(#arrowhead)"
                            />
                          )}
                        </g>
                      ))}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill={template.color} />
                        </marker>
                      </defs>
                    </svg>
                    {workflow.nodes.length > 5 && (
                      <p className={styles.moreNodes}>
                        +{workflow.nodes.length - 5} more nodes
                      </p>
                    )}
                  </div>

                  <div className={styles.workflowStats}>
                    <span>{workflow.nodes.length} nodes</span>
                    <span>
                      {workflow.connections?.length || 0} connections
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tags Section */}
          <section className={styles.section}>
            <h3>Tags</h3>
            <div className={styles.tags}>
              {template.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/templates?search=${encodeURIComponent(tag)}` as any}
                  className={styles.tag}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>

          {/* Related Templates */}
          {relatedTemplates.length > 0 && (
            <section className={styles.section}>
              <h3>Related Templates</h3>
              <div className={styles.relatedGrid}>
                {relatedTemplates.map((related) => (
                  <Link
                    key={related.id}
                    href={`/templates/${related.id}` as any}
                    className={styles.relatedCard}
                  >
                    <div
                      className={styles.relatedIcon}
                      style={{ backgroundColor: related.color }}
                    >
                      {related.icon}
                    </div>
                    <h4>{related.name}</h4>
                    <p>{related.description}</p>
                    <div className={styles.relatedMeta}>
                      <span>⭐ {related.metadata.rating?.toFixed(1) || 'N/A'}</span>
                      <span>⬇️ {related.metadata.downloads?.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Create Project Modal */}
        {showCreateForm && (
          <div
            className={styles.modal}
            data-testid="template-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
          >
            <div className={styles.modalContent}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCreateForm(false)}
                aria-label="Close"
              >
                ✕
              </button>

              <h2 id="create-modal-title">Create Project from Template</h2>

              <form onSubmit={handleCreateProject} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="project-name">Project Name</label>
                  <input
                    id="project-name"
                    data-testid="template-project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My new project"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="workspace">Workspace</label>
                  <select
                    id="workspace"
                    data-testid="template-workspace-select"
                  >
                    <option>Select a workspace...</option>
                    <option>Default Workspace</option>
                    <option>My Projects</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      data-testid="template-customize-workflows"
                      defaultChecked
                    />
                    Customize workflows before creating
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className="btn btn-primary btn-lg">
                    Create Project
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
