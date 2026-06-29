import { apiClient } from './api-client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalWon: string;
  totalSpins: number;
}

export const leaderboardApi = {
  getTopPlayers: (gameType?: string, limit = 20) => {
    const params = new URLSearchParams();
    if (gameType) params.set('gameType', gameType);
    params.set('limit', String(limit));
    return apiClient.get<LeaderboardEntry[]>(`/leaderboard?${params.toString()}`);
  },
};
