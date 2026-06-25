/**
 * AchievementCard - Single achievement display card
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
} from '@metabuilder/m3';
import styles from '/atoms/mat-card.module.scss';
import AchievementCardHeader from './AchievementCardHeader';
import AchievementProgress from './AchievementProgress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
  category: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  formatDate: (dateString: string) => string;
}

export default function AchievementCard({
  achievement,
  formatDate,
}: AchievementCardProps) {
  return (
    <Card
      className={styles['mat-card']}
      sx={{ opacity: achievement.unlocked ? 1 : 0.7 }}
      data-testid={`achievement-${achievement.id}`}
    >
      <CardContent>
        <AchievementCardHeader
          icon={achievement.icon}
          title={achievement.title}
          points={achievement.points}
          unlocked={achievement.unlocked}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {achievement.description}
        </Typography>

        {!achievement.unlocked && (
          <AchievementProgress
            progress={achievement.progress}
            maxProgress={achievement.maxProgress}
          />
        )}

        {achievement.unlocked && achievement.unlockedAt && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Unlocked {formatDate(achievement.unlockedAt)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
