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
}

export interface BonusStatus {
  welcomeClaimed: boolean;
  dailyClaimedToday: boolean;
}

export const userApi = {
  getProfile: (token: string) => apiClient.get<UserProfile>('/users/me', token),
  getWallet: (token: string) => apiClient.get<WalletBalance>('/wallet', token),
  getLedger: (token: string, page = 1, pageSize = 20) =>
    apiClient.get<LedgerResponse>(`/wallet/ledger?page=${page}&pageSize=${pageSize}`, token),
  getBonusStatus: (token: string) =>
    apiClient.get<BonusStatus>('/wallet/bonus-status', token),
  claimDailyBonus: (token: string) =>
    apiClient.post<BonusClaimResponse>('/wallet/daily-bonus', {}, { Authorization: `Bearer ${token}` }),
  claimWelcomeBonus: (token: string) =>
    apiClient.post<BonusClaimResponse>('/wallet/welcome-bonus', {}, { Authorization: `Bearer ${token}` }),
};
