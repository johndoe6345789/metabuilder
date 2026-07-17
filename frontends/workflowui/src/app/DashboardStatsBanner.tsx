/**
 * DashboardStatsBanner - Daily stats and achievement preview banner
 */

'use client';

import React from 'react';
import {
  NodeIcon,
  PlayIcon,
  ErrorIcon,
  TimerIcon,
} from '@icons/react';
import styles from '@scss/atoms/dashboard.module.scss';
import DashboardAchievementPreview from './DashboardAchievementPreview';

const TODAY_STATS = {
  nodesCreated: 23,
  workflowsRun: 5,
  failedRuns: 1,
  timeSaved: '1.2h',
};

export default function DashboardStatsBanner() {
  return (
    <div className={styles.statsBanner}>
      <div className={styles.statItem}>
        <div className={styles.statIconWrap}>
          <NodeIcon />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>
            {TODAY_STATS.nodesCreated}
          </span>
          <span className={styles.statLabel}>nodes today</span>
        </div>
      </div>
      <div className={styles.statItem}>
        <div
          className={styles.statIconWrap}
          style={{ color: 'var(--mat-sys-tertiary)' }}
        >
          <PlayIcon />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>
            {TODAY_STATS.workflowsRun}
          </span>
          <span className={styles.statLabel}>runs today</span>
        </div>
      </div>
      {TODAY_STATS.failedRuns > 0 && (
        <div
          className={
            `${styles.statItem} ${styles.statItemWarning}`
          }
        >
          <div
            className={styles.statIconWrap}
            style={{ color: 'var(--mat-sys-error)' }}
          >
            <ErrorIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {TODAY_STATS.failedRuns}
            </span>
            <span className={styles.statLabel}>failed</span>
          </div>
        </div>
      )}
      <div className={styles.statItem}>
        <div
          className={styles.statIconWrap}
          style={{ color: 'var(--mat-sys-secondary)' }}
        >
          <TimerIcon />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>
            {TODAY_STATS.timeSaved}
          </span>
          <span className={styles.statLabel}>saved today</span>
        </div>
      </div>
      <div className={styles.statDivider} />
      <DashboardAchievementPreview />
    </div>
  );
}
