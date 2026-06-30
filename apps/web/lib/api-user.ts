import { apiClient } from './api-client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export interface WalletBalance {
  id: string;
  balance: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string | null;
  createdAt: string;
}

export interface LedgerResponse {
  entries: LedgerEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BonusClaimResponse {
  balance: string;
  bonusAmount: string;
  tier?: string;
  nextClaimAt?: string;
  expiresAt?: string;
}

export interface BonusStatus {
  tier: string;
  welcome: { enabled: boolean; claimed: boolean; amount: string };
  daily: { enabled: boolean; claimedToday: boolean; amount: string; nextClaimAt: string | null };
  cashback: { enabled: boolean; claimedThisWeek: boolean; rate: number; estimatedAmount: string; netLoss: string };
}

export const userApi = {
  getProfile: (token: string) => apiClient.get<UserProfile>('/users/me', token),
  getWallet: (token: string) => apiClient.get<WalletBalance>('/wallet', token),
  getLedger: (token: string, page = 1, pageSize = 20) =>
    apiClient.get<LedgerResponse>(`/wallet/ledger?page=${page}&pageSize=${pageSize}`, token),
  getBonusStatus: (token: string) =>
    apiClient.get<BonusStatus>('/bonus/status', token),
  claimWelcomeBonus: (token: string) =>
    apiClient.post<BonusClaimResponse>('/bonus/welcome', {}, { Authorization: `Bearer ${token}` }),
  claimDailyBonus: (token: string) =>
    apiClient.post<BonusClaimResponse>('/bonus/daily', {}, { Authorization: `Bearer ${token}` }),
  claimCashback: (token: string) =>
    apiClient.post<BonusClaimResponse>('/bonus/cashback', {}, { Authorization: `Bearer ${token}` }),
};
