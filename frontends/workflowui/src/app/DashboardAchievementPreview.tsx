/**
 * DashboardAchievementPreview - Unlocked badges + link in the stats banner
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  NodeIcon,
  TrophyIcon,
  StarIcon,
} from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';

const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'First Steps',
    icon: <TrophyIcon />,
    unlocked: true,
  },
  {
    id: '2',
    title: 'Node Master',
    icon: <NodeIcon />,
    unlocked: true,
  },
  {
    id: '3',
    title: 'Speed Runner',
    icon: <StarIcon />,
    unlocked: false,
    progress: 7,
    max: 10,
  },
];

export default function DashboardAchievementPreview() {
  return (
    <div className={styles.achievementPreview}>
      {ACHIEVEMENTS.filter((a) => a.unlocked)
        .slice(0, 2)
        .map((a) => (
          <div
            key={a.id}
            className={styles.achievementBadge}
            title={a.title}
          >
            {a.icon}
          </div>
        ))}
      <Link
        href="/achievements"
        className={styles.achievementMore}
      >
        +4 more
      </Link>
    </div>
  );
}
