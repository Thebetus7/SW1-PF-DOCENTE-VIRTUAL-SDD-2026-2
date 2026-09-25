export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type SubscriptionStatus = 'NONE' | 'TRIAL_CREDITS' | 'ACTIVE_SUBSCRIPTION' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  creditsBalance: number;
  subscriptionStatus: SubscriptionStatus;
  preferredAvatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
