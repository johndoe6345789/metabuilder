/**
 * RecentUnlocked - Recently unlocked achievements list
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@metabuilder/m3';
import styles from '@scss/atoms/mat-card.module.scss';

interface Achievement {
  id: string;
  title: string;
  icon: string;
  points: number;
  category: string;
  unlockedAt?: number;
}

interface RecentUnlockedProps {
  recentUnlocked: Achievement[];
  formatDate: (ts: number) => string;
}

export default function RecentUnlocked({
  recentUnlocked,
  formatDate,
}: RecentUnlockedProps) {
  if (recentUnlocked.length === 0) return null;

  return (
    <Card
      className={styles['mat-card']}
      sx={{ mb: 3 }}
      data-testid="recent-achievements"
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recently Unlocked
        </Typography>
        <List>
          {recentUnlocked.map((achievement, index) => (
            <React.Fragment key={achievement.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {achievement.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={achievement.title}
                  secondary={
                    `${achievement.points} points • ` +
                    `${formatDate(achievement.unlockedAt!)}`
                  }
                />
                <Chip
                  label={achievement.category}
                  size="small"
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
