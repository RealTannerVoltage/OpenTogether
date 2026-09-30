export const MICROSOFT_AUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
  authority: 'https://login.microsoftonline.com/consumers',
  redirectUri: process.env.EXPO_PUBLIC_REDIRECT_URI || 'opentogether://auth',
  scopes: [
    'openid',
    'profile',
    'email',
    'User.Read',
  ],
};

export const MSAL_CONFIG = {
  auth: {
    clientId: MICROSOFT_AUTH_CONFIG.clientId,
    authority: MICROSOFT_AUTH_CONFIG.authority,
    redirectUri: MICROSOFT_AUTH_CONFIG.redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.opentogether.com';
