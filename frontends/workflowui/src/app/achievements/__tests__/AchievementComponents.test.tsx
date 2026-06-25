/**
 * Tests for achievement page components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';

import AchievementCardHeader from '../AchievementCardHeader';
import AchievementProgress from '../AchievementProgress';
import AchievementLevelCard from '../AchievementLevelCard';
import AchievementPointsCard from '../AchievementPointsCard';
import AchievementUnlockedCard from '../AchievementUnlockedCard';
import AchievementTabs from '../AchievementTabs';
import RecentUnlocked from '../RecentUnlocked';
import AchievementStatsCards from '../AchievementStatsCards';
import AchievementCard from '../AchievementCard';
import { useAchievements } from '../hooks/useAchievements';

// ── AchievementCardHeader ────────────────────────────────────────────────────
describe('AchievementCardHeader', () => {
  it('renders the title', () => {
    render(<AchievementCardHeader icon="🏆" title="First Steps" points={100} unlocked={false} />);
    expect(screen.getByText('First Steps')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<AchievementCardHeader icon="🏆" title="Test" points={50} unlocked={false} />);
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('renders points label', () => {
    render(<AchievementCardHeader icon="⭐" title="Star" points={200} unlocked={true} />);
    expect(screen.getByText('200 pts')).toBeInTheDocument();
  });

  it('renders unlock checkmark when unlocked', () => {
    render(<AchievementCardHeader icon="⭐" title="Star" points={200} unlocked={true} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('does not render checkmark when locked', () => {
    render(<AchievementCardHeader icon="⭐" title="Star" points={200} unlocked={false} />);
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });
});

// ── AchievementProgress ──────────────────────────────────────────────────────
describe('AchievementProgress', () => {
  it('renders progress text', () => {
    render(<AchievementProgress progress={3} maxProgress={10} />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders "Progress" label', () => {
    render(<AchievementProgress progress={3} maxProgress={10} />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('renders nothing when maxProgress is 1', () => {
    const { container } = render(<AchievementProgress progress={1} maxProgress={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when maxProgress is 0', () => {
    const { container } = render(<AchievementProgress progress={0} maxProgress={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});

// ── AchievementLevelCard ─────────────────────────────────────────────────────
describe('AchievementLevelCard', () => {
  it('renders level number', () => {
    render(<AchievementLevelCard level={3} pointsToNextLevel={250} />);
    expect(screen.getByText('Level 3')).toBeInTheDocument();
  });

  it('renders points to next level', () => {
    render(<AchievementLevelCard level={3} pointsToNextLevel={250} />);
    expect(screen.getByText('250 pts to next level')).toBeInTheDocument();
  });

  it('renders "Current Level" label', () => {
    render(<AchievementLevelCard level={1} pointsToNextLevel={500} />);
    expect(screen.getByText('Current Level')).toBeInTheDocument();
  });

  it('has data-testid="level-card"', () => {
    render(<AchievementLevelCard level={1} pointsToNextLevel={500} />);
    expect(screen.getByTestId('level-card')).toBeInTheDocument();
  });
});

// ── AchievementPointsCard ────────────────────────────────────────────────────
describe('AchievementPointsCard', () => {
  it('renders total points', () => {
    render(<AchievementPointsCard totalPoints={1500} totalPossiblePoints={5000} />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('renders total possible points', () => {
    render(<AchievementPointsCard totalPoints={1500} totalPossiblePoints={5000} />);
    expect(screen.getByText('5,000 total available')).toBeInTheDocument();
  });

  it('renders "Total Points" label', () => {
    render(<AchievementPointsCard totalPoints={100} totalPossiblePoints={1000} />);
    expect(screen.getByText('Total Points')).toBeInTheDocument();
  });

  it('has data-testid="points-card"', () => {
    render(<AchievementPointsCard totalPoints={0} totalPossiblePoints={1000} />);
    expect(screen.getByTestId('points-card')).toBeInTheDocument();
  });
});

// ── AchievementUnlockedCard ──────────────────────────────────────────────────
describe('AchievementUnlockedCard', () => {
  it('renders unlocked / total count', () => {
    render(<AchievementUnlockedCard unlockedCount={4} totalCount={10} />);
    expect(screen.getByText('4 / 10')).toBeInTheDocument();
  });

  it('renders "Achievements Unlocked" label', () => {
    render(<AchievementUnlockedCard unlockedCount={0} totalCount={5} />);
    expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument();
  });

  it('has data-testid="unlocked-card"', () => {
    render(<AchievementUnlockedCard unlockedCount={2} totalCount={8} />);
    expect(screen.getByTestId('unlocked-card')).toBeInTheDocument();
  });
});

// ── AchievementTabs ──────────────────────────────────────────────────────────
describe('AchievementTabs', () => {
  it('renders achievement tabs', () => {
    render(<AchievementTabs selectedTab="all" onTabChange={jest.fn()} />);
    expect(screen.getByTestId('achievement-tabs')).toBeInTheDocument();
  });

  it('renders All, Unlocked, Locked tabs', () => {
    render(<AchievementTabs selectedTab="all" onTabChange={jest.fn()} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Unlocked')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });
});

// ── AchievementStatsCards ────────────────────────────────────────────────────
describe('AchievementStatsCards', () => {
  const props = {
    level: 2,
    pointsToNextLevel: 300,
    totalPoints: 700,
    totalPossiblePoints: 5000,
    unlockedCount: 5,
    totalCount: 20,
  };

  it('renders level card', () => {
    render(<AchievementStatsCards {...props} />);
    expect(screen.getByTestId('level-card')).toBeInTheDocument();
  });

  it('renders points card', () => {
    render(<AchievementStatsCards {...props} />);
    expect(screen.getByTestId('points-card')).toBeInTheDocument();
  });

  it('renders unlocked card', () => {
    render(<AchievementStatsCards {...props} />);
    expect(screen.getByTestId('unlocked-card')).toBeInTheDocument();
  });
});

// ── RecentUnlocked ───────────────────────────────────────────────────────────
describe('RecentUnlocked', () => {
  const achievements = [
    { id: 'a1', title: 'First Steps', icon: '🏆', points: 100, category: 'General', unlockedAt: 1700000000 },
    { id: 'a2', title: 'Speedster', icon: '⚡', points: 200, category: 'Speed', unlockedAt: 1700100000 },
  ];

  it('renders nothing when recentUnlocked is empty', () => {
    const { container } = render(<RecentUnlocked recentUnlocked={[]} formatDate={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Recently Unlocked" heading', () => {
    render(<RecentUnlocked recentUnlocked={achievements} formatDate={() => 'Today'} />);
    expect(screen.getByText('Recently Unlocked')).toBeInTheDocument();
  });

  it('renders achievement titles', () => {
    render(<RecentUnlocked recentUnlocked={achievements} formatDate={() => 'Today'} />);
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Speedster')).toBeInTheDocument();
  });

  it('renders category chips', () => {
    render(<RecentUnlocked recentUnlocked={achievements} formatDate={() => 'Today'} />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
  });

  it('has data-testid="recent-achievements"', () => {
    render(<RecentUnlocked recentUnlocked={achievements} formatDate={() => 'Today'} />);
    expect(screen.getByTestId('recent-achievements')).toBeInTheDocument();
  });
});

// ── AchievementCard ──────────────────────────────────────────────────────────
describe('AchievementCard', () => {
  const lockedAchievement = {
    id: 'ac1',
    title: 'Explorer',
    description: 'Explore 10 workflows',
    icon: '🗺',
    points: 150,
    unlocked: false,
    progress: 3,
    maxProgress: 10,
    category: 'exploration',
  };

  const unlockedAchievement = {
    ...lockedAchievement,
    id: 'ac2',
    unlocked: true,
    unlockedAt: '2024-01-01',
  };

  it('renders achievement data-testid', () => {
    render(<AchievementCard achievement={lockedAchievement} formatDate={jest.fn()} />);
    expect(screen.getByTestId('achievement-ac1')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<AchievementCard achievement={lockedAchievement} formatDate={jest.fn()} />);
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<AchievementCard achievement={lockedAchievement} formatDate={jest.fn()} />);
    expect(screen.getByText('Explore 10 workflows')).toBeInTheDocument();
  });

  it('renders progress for locked achievement', () => {
    render(<AchievementCard achievement={lockedAchievement} formatDate={jest.fn()} />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('calls formatDate and shows unlockedAt for unlocked achievements', () => {
    const formatDate = jest.fn(() => 'Jan 1, 2024');
    render(<AchievementCard achievement={unlockedAchievement} formatDate={formatDate} />);
    expect(formatDate).toHaveBeenCalledWith('2024-01-01');
    expect(screen.getByText(/Unlocked Jan 1, 2024/)).toBeInTheDocument();
  });
});

// ── useAchievements ──────────────────────────────────────────────────────────
describe('useAchievements', () => {
  it('returns selectedTab as "all" by default', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.selectedTab).toBe('all');
  });

  it('setSelectedTab changes the tab', () => {
    const { result } = renderHook(() => useAchievements());
    act(() => {
      result.current.setSelectedTab('unlocked');
    });
    expect(result.current.selectedTab).toBe('unlocked');
  });

  it('filteredAchievements includes all when tab is "all"', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.filteredAchievements.length).toBe(result.current.totalCount);
  });

  it('filteredAchievements filters to unlocked when tab is "unlocked"', () => {
    const { result } = renderHook(() => useAchievements());
    act(() => {
      result.current.setSelectedTab('unlocked');
    });
    expect(result.current.filteredAchievements.every((a: any) => a.unlocked)).toBe(true);
  });

  it('filteredAchievements filters to locked when tab is "locked"', () => {
    const { result } = renderHook(() => useAchievements());
    act(() => {
      result.current.setSelectedTab('locked');
    });
    expect(result.current.filteredAchievements.every((a: any) => !a.unlocked)).toBe(true);
  });

  it('returns totalPoints as non-negative number', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.totalPoints).toBeGreaterThanOrEqual(0);
  });

  it('returns level of at least 1', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.level).toBeGreaterThanOrEqual(1);
  });

  it('formatDate returns "Today" for today', () => {
    const { result } = renderHook(() => useAchievements());
    const today = new Date().toISOString();
    expect(result.current.formatDate(today)).toBe('Today');
  });

  it('formatDate returns "Yesterday" for yesterday', () => {
    const { result } = renderHook(() => useAchievements());
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(result.current.formatDate(yesterday)).toBe('Yesterday');
  });

  it('formatDate returns days ago for recent dates', () => {
    const { result } = renderHook(() => useAchievements());
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(result.current.formatDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('formatDate returns locale date for old dates', () => {
    const { result } = renderHook(() => useAchievements());
    const oldDate = new Date('2020-01-01').toISOString();
    const formatted = result.current.formatDate(oldDate);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
