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

export const userApi = {
  getProfile: (token: string) => apiClient.get<UserProfile>('/users/me', token),
  getWallet: (token: string) => apiClient.get<WalletBalance>('/wallet', token),
};
