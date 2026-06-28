export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  type: 'access' | 'refresh';
}
