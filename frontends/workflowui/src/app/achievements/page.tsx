/**
 * Achievements Page - Gamification and user achievements
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/mat-card.module.scss';

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
  category: 'workflow' | 'social' | 'milestone' | 'special';
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Workflow',
    description: 'Create your first workflow',
    icon: '🚀',
    points: 100,
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: '2024-02-01T10:30:00Z',
    category: 'workflow',
  },
  {
    id: '2',
    title: 'Speed Demon',
    description: 'Execute 100 workflows',
    icon: '⚡',
    points: 250,
    unlocked: true,
    progress: 100,
    maxProgress: 100,
    unlockedAt: '2024-02-03T14:20:00Z',
    category: 'workflow',
  },
  {
    id: '3',
    title: 'Early Adopter',
    description: 'Join in beta',
    icon: '🎖️',
    points: 500,
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: '2024-01-15T08:00:00Z',
    category: 'special',
  },
  {
    id: '4',
    title: 'Team Player',
    description: 'Share 5 workflows',
    icon: '🤝',
    points: 200,
    unlocked: true,
    progress: 5,
    maxProgress: 5,
    unlockedAt: '2024-02-02T16:45:00Z',
    category: 'social',
  },
  {
    id: '5',
    title: 'Bug Hunter',
    description: 'Report a bug',
    icon: '🐛',
    points: 150,
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: '2024-01-28T11:15:00Z',
    category: 'special',
  },
  {
    id: '6',
    title: 'Workflow Master',
    description: 'Create 50 workflows',
    icon: '🏆',
    points: 500,
    unlocked: false,
    progress: 23,
    maxProgress: 50,
    category: 'workflow',
  },
  {
    id: '7',
    title: 'Collaborator',
    description: 'Work on a shared workflow',
    icon: '👥',
    points: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'social',
  },
  {
    id: '8',
    title: 'Marathon Runner',
    description: 'Run a workflow for 24 hours',
    icon: '🏃',
    points: 300,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'workflow',
  },
  {
    id: '9',
    title: 'Community Champion',
    description: 'Share 25 workflows',
    icon: '🌟',
    points: 750,
    unlocked: false,
    progress: 5,
    maxProgress: 25,
    category: 'social',
  },
  {
    id: '10',
    title: 'Automation Expert',
    description: 'Create workflows in all categories',
    icon: '💎',
    points: 1000,
    unlocked: false,
    progress: 3,
    maxProgress: 10,
    category: 'milestone',
  },
  {
    id: '11',
    title: 'Perfect Week',
    description: 'Use the platform daily for 7 days',
    icon: '📅',
    points: 200,
    unlocked: false,
    progress: 4,
    maxProgress: 7,
    category: 'milestone',
  },
  {
    id: '12',
    title: 'Code Reviewer',
    description: 'Review 10 workflow templates',
    icon: '👓',
    points: 250,
    unlocked: false,
    progress: 2,
    maxProgress: 10,
    category: 'social',
  },
];

export default function AchievementsPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  const totalPoints = mockAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const totalPossiblePoints = mockAchievements.reduce((sum, a) => sum + a.points, 0);

  const level = Math.floor(totalPoints / 500) + 1;
  const pointsToNextLevel = (level * 500) - totalPoints;

  const filteredAchievements = mockAchievements.filter((achievement) => {
    if (selectedTab === 'unlocked') return achievement.unlocked;
    if (selectedTab === 'locked') return !achievement.unlocked;
    return true;
  });

  const recentUnlocked = mockAchievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }} data-testid="achievements-page">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }} data-testid="achievements-title">
          Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your progress and unlock achievements as you master workflow automation
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card className={styles['mat-card']} data-testid="level-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, fontSize: '2rem' }}>
                  {level}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Level
                  </Typography>
                  <Typography variant="h5">Level {level}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pointsToNextLevel} pts to next level
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className={styles['mat-card']} data-testid="points-card">
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Points
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {totalPoints.toLocaleString()}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(totalPoints / totalPossiblePoints) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {totalPossiblePoints.toLocaleString()} total available
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className={styles['mat-card']} data-testid="unlocked-card">
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Achievements Unlocked
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {mockAchievements.filter((a) => a.unlocked).length} / {mockAchievements.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(mockAchievements.filter((a) => a.unlocked).length / mockAchievements.length) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Achievements */}
      {recentUnlocked.length > 0 && (
        <Card className={styles['mat-card']} sx={{ mb: 3 }} data-testid="recent-achievements">
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
                      secondary={`${achievement.points} points • ${formatDate(achievement.unlockedAt!)}`}
                    />
                    <Chip label={achievement.category} size="small" />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          data-testid="achievement-tabs"
        >
          <Tab label="All" value="all" />
          <Tab label="Unlocked" value="unlocked" />
          <Tab label="Locked" value="locked" />
        </Tabs>
      </Box>

      {/* Achievement Grid */}
      <Grid container spacing={3}>
        {filteredAchievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <Card
              className={styles['mat-card']}
              sx={{
                opacity: achievement.unlocked ? 1 : 0.7,
                position: 'relative',
              }}
              data-testid={`achievement-${achievement.id}`}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: '2rem',
                      bgcolor: achievement.unlocked ? 'primary.main' : 'action.disabledBackground',
                    }}
                  >
                    {achievement.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      {achievement.title}
                    </Typography>
                    <Chip
                      label={`${achievement.points} pts`}
                      size="small"
                      color={achievement.unlocked ? 'primary' : 'default'}
                    />
                  </Box>
                  {achievement.unlocked && (
                    <Chip label="✓" color="success" size="small" />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {achievement.description}
                </Typography>

                {!achievement.unlocked && achievement.maxProgress > 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {achievement.progress} / {achievement.maxProgress}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Unlocked {formatDate(achievement.unlockedAt)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAchievements.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
          data-testid="empty-state"
        >
          <Typography variant="h6" color="text.secondary">
            No achievements in this category
          </Typography>
        </Box>
      )}
    </Box>
  );
}
