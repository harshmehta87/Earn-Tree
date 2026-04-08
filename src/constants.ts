import { Package } from './types';

export const PACKAGES: Package[] = [
  { amount: 1100, bonus: 50 },
  { amount: 2100, bonus: 100 },
  { amount: 5100, bonus: 250 },
  { amount: 11000, bonus: 600 },
  { amount: 21000, bonus: 1100 },
  { amount: 51000, bonus: 2500 },
];

export const LEVELS = {
  silver: { minTeam: 10, dailySalary: 1100 },
  gold: { minTeam: 35, dailySalary: 3300 },
  diamond: { minTeam: 105, dailySalary: 11000 },
};

export const MILESTONES = [
  { teamSize: 15, bonus: 2100 },
  { teamSize: 30, bonus: 4100 },
];

export const MIN_WITHDRAWAL = 200;
export const ADMIN_EMAIL = "harshmehta12317@gmail.com";
