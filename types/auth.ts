export type UserRole = "citizen" | "volunteer" | "authority";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  createdAt: string;
}

export interface UserSession {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  };
  expiresAt: number; // timestamp in ms
}
