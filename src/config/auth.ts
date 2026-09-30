export const MICROSOFT_AUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || '00000000402b5328',
  clientSecret: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_SECRET || '',
  redirectUri: process.env.EXPO_PUBLIC_REDIRECT_URI || 'http://localhost:19006/auth',
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.opentogether.com';
