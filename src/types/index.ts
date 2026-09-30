export interface User {
  id: string;
  username: string;
  email: string;
  microsoftId: string;
  switchFriendCode?: string;
  switchUsername?: string;
  avatar?: string;
}

export interface Server {
  id: string;
  name: string;
  description: string;
  host: string;
  port: number;
  version: string;
  players: User[];
  maxPlayers: number;
  requiresMicrosoftAuth: boolean;
  createdAt: Date;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

export type AuthProvider = 'microsoft';
