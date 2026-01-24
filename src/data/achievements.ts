import type { Achievement } from '../types';

/**
 * All available achievements in Memory Gym.
 * Achievements are organized by category for easier management.
 */

// Streak achievements - consistent daily practice
const streakAchievements: Achievement[] = [
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    category: 'streak',
    xpReward: 100,
  },
  {
    id: 'streak-14',
    name: 'Fortnight Focus',
    description: 'Maintain a 14-day streak',
    icon: 'flame',
    category: 'streak',
    xpReward: 250,
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'flame',
    category: 'streak',
    xpReward: 500,
  },
  {
    id: 'streak-60',
    name: 'Two Month Titan',
    description: 'Maintain a 60-day streak',
    icon: 'flame',
    category: 'streak',
    xpReward: 1000,
  },
  {
    id: 'streak-100',
    name: 'Century Champion',
    description: 'Maintain a 100-day streak',
    icon: 'flame',
    category: 'streak',
    xpReward: 2000,
  },
];

// Volume achievements - total sessions completed
const volumeAchievements: Achievement[] = [
  {
    id: 'sessions-10',
    name: 'Getting Started',
    description: 'Complete 10 training sessions',
    icon: 'target',
    category: 'volume',
    xpReward: 50,
  },
  {
    id: 'sessions-50',
    name: 'Regular Trainer',
    description: 'Complete 50 training sessions',
    icon: 'target',
    category: 'volume',
    xpReward: 150,
  },
  {
    id: 'sessions-100',
    name: 'Century Sessions',
    description: 'Complete 100 training sessions',
    icon: 'target',
    category: 'volume',
    xpReward: 300,
  },
  {
    id: 'sessions-500',
    name: 'Dedicated Practitioner',
    description: 'Complete 500 training sessions',
    icon: 'target',
    category: 'volume',
    xpReward: 750,
  },
];

// Accuracy achievements - performance milestones
const accuracyAchievements: Achievement[] = [
  {
    id: 'first-90',
    name: 'Sharp Mind',
    description: 'Score 90% or higher in any session',
    icon: 'star',
    category: 'accuracy',
    xpReward: 50,
  },
  {
    id: 'first-perfect',
    name: 'Perfectionist',
    description: 'Achieve a perfect 100% score',
    icon: 'star',
    category: 'accuracy',
    xpReward: 200,
  },
  {
    id: 'average-80',
    name: 'Consistent Performer',
    description: 'Maintain 80%+ average accuracy across all modules',
    icon: 'star',
    category: 'accuracy',
    xpReward: 300,
  },
];

// Milestone achievements - level and progress
const milestoneAchievements: Achievement[] = [
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first training session',
    icon: 'zap',
    category: 'milestone',
    xpReward: 25,
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: 'zap',
    category: 'milestone',
    xpReward: 100,
  },
  {
    id: 'level-10',
    name: 'Brain Builder',
    description: 'Reach Level 10',
    icon: 'zap',
    category: 'milestone',
    xpReward: 250,
  },
  {
    id: 'level-15',
    name: 'Mind Master',
    description: 'Reach Level 15',
    icon: 'zap',
    category: 'milestone',
    xpReward: 500,
  },
  {
    id: 'level-20',
    name: 'Elite Trainer',
    description: 'Reach Level 20',
    icon: 'zap',
    category: 'milestone',
    xpReward: 1000,
  },
];

// Special achievements - module-specific
const specialAchievements: Achievement[] = [
  {
    id: 'dnb-n3',
    name: 'Triple Threat',
    description: 'Reach N=3 in Dual N-Back',
    icon: 'grid',
    category: 'special',
    xpReward: 150,
  },
  {
    id: 'dnb-n5',
    name: 'Quintuple Mind',
    description: 'Reach N=5 in Dual N-Back',
    icon: 'grid',
    category: 'special',
    xpReward: 500,
  },
  {
    id: 'dnb-n7',
    name: 'Memory Maestro',
    description: 'Reach N=7 in Dual N-Back',
    icon: 'grid',
    category: 'special',
    xpReward: 1000,
  },
  {
    id: 'all-modules',
    name: 'Well Rounded',
    description: 'Complete at least one session in each module',
    icon: 'brain',
    category: 'special',
    xpReward: 100,
  },
  {
    id: 'detail-master',
    name: 'Eagle Eye',
    description: 'Score 95%+ in Detail Hunter',
    icon: 'eye',
    category: 'special',
    xpReward: 200,
  },
];

// Export all achievements
export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...streakAchievements,
  ...volumeAchievements,
  ...accuracyAchievements,
  ...milestoneAchievements,
  ...specialAchievements,
];

// Helper to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
}
