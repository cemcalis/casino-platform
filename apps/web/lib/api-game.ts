import { apiClient } from './api-client';

export interface SpinResponse {
  grid: string[][];
  bet: number;
  isFreeSpın: boolean;
  paylineWins: Array<{
    paylineIndex: number;
    symbolId: string;
    matchCount: number;
    multiplier: number;
    payout: number;
  }>;
  scatterWin: {
    symbolId: string;
    count: number;
    multiplier: number;
    payout: number;
    freeSpinsAwarded: number;
  } | null;
  totalPaylinesPayout: number;
  totalPayout: number;
  netResult: number;
  freeSpinsAwarded: number;
  multiplier: number;
  rngSeed: string;
  nonce: number;
}

export interface GameHistoryItem {
  id: string;
  gameType: string;
  betAmount: string;
  winAmount: string;
  serverSeed: string;
  nonce: number;
  createdAt: string;
}

export interface GameHistoryResponse {
  sessions: GameHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const gameApi = {
  spin: (token: string, bet: number) =>
    apiClient.post<SpinResponse>('/games/spin', { bet }, { Authorization: `Bearer ${token}` }),

  getHistory: (token: string, page = 1, pageSize = 10) =>
    apiClient.get<GameHistoryResponse>(
      `/games/history?page=${page}&pageSize=${pageSize}`,
      token,
    ),
};
