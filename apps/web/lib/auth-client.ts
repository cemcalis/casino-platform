import { apiClient } from './api-client';

export interface AuthTokens {
  accessToken: string;
}

export const authClient = {
  register: (data: { email: string; username: string; password: string }) =>
    apiClient.post<AuthTokens>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthTokens>('/auth/login', data),
  refresh: () => apiClient.post<AuthTokens>('/auth/refresh', {}),
  logout: () => apiClient.post<void>('/auth/logout', {}),
};
