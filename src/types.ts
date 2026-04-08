export type UserRole = 'user' | 'admin';
export type UserLevel = 'none' | 'silver' | 'gold' | 'diamond';
export type TransactionType = 'referral_bonus' | 'daily_bonus' | 'monthly_bonus' | 'level_salary' | 'withdrawal';
export type TransactionStatus = 'completed' | 'pending' | 'rejected';
export type WithdrawalMethod = 'bank';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  referralCode: string;
  referredBy: string;
  packageAmount: number;
  packageActive: boolean;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  teamSize: number;
  directReferrals: number;
  level: UserLevel;
  dailyRecruitCount: number;
  dailyRecruitDate: string;
  joinedAt: string;
  isBlocked: boolean;
  withdrawalMethod?: {
    bank?: {
      accountNumber: string;
      ifsc: string;
      holderName: string;
    };
  };
  milestonesReached: number[];
  role: UserRole;
}

export interface Transaction {
  txnId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  requestId: string;
  userId: string;
  userName: string;
  amount: number;
  method: WithdrawalMethod;
  accountDetails: any;
  status: TransactionStatus;
  requestedAt: string;
  processedAt?: string;
}

export interface AdminSettings {
  totalUsers: number;
  totalMoneyDistributed: number;
  appVersion: string;
  maintenanceMode: boolean;
  announcement: string;
}

export interface Package {
  amount: number;
  bonus: number;
}
