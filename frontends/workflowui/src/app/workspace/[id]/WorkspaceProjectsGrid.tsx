/**
 * WorkspaceProjectsGrid - Grid of project cards
 */

'use client';

import React from 'react';
import { ProjectCard } from '@metabuilder/components/cards';
import styles from '@scss/atoms/workspace.module.scss';

interface Project {
  id: string;
  [key: string]: unknown;
}

interface WorkspaceProjectsGridProps {
  projects: Project[];
}

export default function WorkspaceProjectsGrid({
  projects,
}: WorkspaceProjectsGridProps) {
  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project as any}
        />
      ))}
    </div>
  );
}
