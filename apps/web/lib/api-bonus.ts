import { apiClient } from './api-client';

export interface BonusClaimResponse {
  balance: string;
  nextClaimAt: string;
}

export const bonusApi = {
  claimDaily: (token: string) =>
    apiClient.post<BonusClaimResponse>('/bonus/daily', {}, { Authorization: `Bearer ${token}` }),
};
