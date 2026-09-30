import { AuthFlow, MSAAuth } from 'prismarine-auth';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { MICROSOFT_AUTH_CONFIG } from '../config/auth';
import { User, Session } from '../types';

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEYS = {
  USER: 'opentogether_user',
  SESSION: 'opentogether_session',
  MICROSOFT_TOKENS: 'opentogether_ms_tokens',
  XBL_TOKENS: 'opentogether_xbl_tokens',
  MC_TOKENS: 'opentogether_mc_tokens',
};

// Minecraft client ID for Bedrock/PlayFab authentication
const MINECRAFT_CLIENT_ID = '00000000402b5328';

export interface MinecraftTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  username?: string;
  uuid?: string;
}

export interface XboxTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userHash?: string;
  xstsToken?: string;
}

export interface MicrosoftTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  account: {
    username: string;
    email: string;
  };
}

export class MinecraftAuthService {
  private static instance: MinecraftAuthService;
  private authFlow: AuthFlow | null = null;
  private microsoftTokens: MicrosoftTokens | null = null;
  private xboxTokens: XboxTokens | null = null;
  private minecraftTokens: MinecraftTokens | null = null;

  private constructor() {}

  public static getInstance(): MinecraftAuthService {
    if (!MinecraftAuthService.instance) {
      MinecraftAuthService.instance = new MinecraftAuthService();
    }
    return MinecraftAuthService.instance;
  }

  private async loadStoredTokens(): Promise<void> {
    try {
      const storedMs = await SecureStore.getItemAsync(STORAGE_KEYS.MICROSOFT_TOKENS);
      const storedXbl = await SecureStore.getItemAsync(STORAGE_KEYS.XBL_TOKENS);
      const storedMc = await SecureStore.getItemAsync(STORAGE_KEYS.MC_TOKENS);

      if (storedMs) this.microsoftTokens = JSON.parse(storedMs);
      if (storedXbl) this.xboxTokens = JSON.parse(storedXbl);
      if (storedMc) this.minecraftTokens = JSON.parse(storedMc);
    } catch (err) {
      console.error('Failed to load stored tokens:', err);
    }
  }

  private async saveTokens(): Promise<void> {
    try {
      if (this.microsoftTokens) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.MICROSOFT_TOKENS,
          JSON.stringify(this.microsoftTokens)
        );
      }
      if (this.xboxTokens) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.XBL_TOKENS,
          JSON.stringify(this.xboxTokens)
        );
      }
      if (this.minecraftTokens) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.MC_TOKENS,
          JSON.stringify(this.minecraftTokens)
        );
      }
    } catch (err) {
      console.error('Failed to save tokens:', err);
    }
  }

  public async clearTokens(): Promise<void> {
    this.microsoftTokens = null;
    this.xboxTokens = null;
    this.minecraftTokens = null;
    
    await SecureStore.deleteItemAsync(STORAGE_KEYS.MICROSOFT_TOKENS);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.XBL_TOKENS);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.MC_TOKENS);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION);
  }

  public async initialize(): Promise<void> {
    await this.loadStoredTokens();
    
    // Initialize auth flow with prismarine-auth
    this.authFlow = new AuthFlow(
      MINECRAFT_CLIENT_ID,
      MICROSOFT_AUTH_CONFIG.redirectUri,
      {
        clientSecret: MICROSOFT_AUTH_CONFIG.clientSecret,
      }
    );

    // Check if we have valid tokens
    if (this.microsoftTokens && this.microsoftTokens.expiresAt > Date.now()) {
      this.authFlow.setMicrosoftTokens(this.microsoftTokens);
    }
    if (this.xboxTokens && this.xboxTokens.expiresAt > Date.now()) {
      this.authFlow.setXboxTokens(this.xboxTokens);
    }
    if (this.minecraftTokens && this.minecraftTokens.expiresAt > Date.now()) {
      this.authFlow.setMinecraftTokens(this.minecraftTokens);
    }
  }

  public async signInWithMicrosoft(): Promise<{ user: User; session: Session } | null> {
    try {
      if (!this.authFlow) {
        await this.initialize();
      }

      // Generate auth URL for Microsoft
      const authUrl = this.authFlow!.getMicrosoftAuthUrl();
      
      // Open in browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        MICROSOFT_AUTH_CONFIG.redirectUri,
        { preferEphemeralSession: false }
      );

      if (result.type === 'success' && result.url) {
        // Extract code from redirect URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // Exchange code for tokens
          const microsoftTokens = await this.authFlow!.getMicrosoftTokens(code);
          this.microsoftTokens = {
            accessToken: microsoftTokens.access_token,
            refreshToken: microsoftTokens.refresh_token,
            expiresAt: Date.now() + (microsoftTokens.expires_in * 1000),
            account: {
              username: microsoftTokens.account.username,
              email: microsoftTokens.account.email,
            },
          };

          // Get Xbox Live tokens
          const xboxTokens = await this.authFlow!.getXboxTokens();
          this.xboxTokens = {
            accessToken: xboxTokens.access_token,
            refreshToken: xboxTokens.refresh_token,
            expiresAt: Date.now() + (xboxTokens.expires_in * 1000),
            userHash: xboxTokens.userHash,
            xstsToken: xboxTokens.xstsToken,
          };

          // Get Minecraft tokens
          const minecraftTokens = await this.authFlow!.getMinecraftTokens();
          this.minecraftTokens = {
            accessToken: minecraftTokens.access_token,
            refreshToken: minecraftTokens.refresh_token,
            expiresAt: Date.now() + (minecraftTokens.expires_in * 1000),
            username: minecraftTokens.username,
            uuid: minecraftTokens.uuid,
          };

          await this.saveTokens();

          // Create user and session
          const user: User = {
            id: this.minecraftTokens.uuid || crypto.randomUUID(),
            username: this.minecraftTokens.username || this.microsoftTokens.account.username,
            email: this.microsoftTokens.account.email,
            microsoftId: this.microsoftTokens.account.username,
            switchFriendCode: undefined,
            switchUsername: undefined,
          };

          const session: Session = {
            user,
            token: this.minecraftTokens.accessToken,
            expiresAt: new Date(this.minecraftTokens.expiresAt),
          };

          // Save user and session to storage
          await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
          await SecureStore.setItemAsync(STORAGE_KEYS.SESSION, JSON.stringify(session));

          return { user, session };
        }
      }

      return null;
    } catch (err) {
      console.error('Microsoft sign in error:', err);
      throw err;
    }
  }

  public async signOut(): Promise<void> {
    await this.clearTokens();
  }

  public getMinecraftToken(): string | null {
    if (!this.minecraftTokens || this.minecraftTokens.expiresAt < Date.now()) {
      return null;
    }
    return this.minecraftTokens.accessToken;
  }

  public getXboxToken(): string | null {
    if (!this.xboxTokens || this.xboxTokens.expiresAt < Date.now()) {
      return null;
    }
    return this.xboxTokens.accessToken;
  }

  public getMicrosoftToken(): string | null {
    if (!this.microsoftTokens || this.microsoftTokens.expiresAt < Date.now()) {
      return null;
    }
    return this.microsoftTokens.accessToken;
  }

  public async refreshTokens(): Promise<boolean> {
    try {
      if (!this.authFlow) {
        await this.initialize();
      }

      if (this.microsoftTokens && this.microsoftTokens.refreshToken) {
        const newMicrosoftTokens = await this.authFlow!.refreshMicrosoftToken(
          this.microsoftTokens.refreshToken
        );
        this.microsoftTokens = {
          accessToken: newMicrosoftTokens.access_token,
          refreshToken: newMicrosoftTokens.refresh_token,
          expiresAt: Date.now() + (newMicrosoftTokens.expires_in * 1000),
          account: this.microsoftTokens.account,
        };

        // Refresh Xbox tokens
        const newXboxTokens = await this.authFlow!.getXboxTokens();
        this.xboxTokens = {
          accessToken: newXboxTokens.access_token,
          refreshToken: newXboxTokens.refresh_token,
          expiresAt: Date.now() + (newXboxTokens.expires_in * 1000),
          userHash: newXboxTokens.userHash,
          xstsToken: newXboxTokens.xstsToken,
        };

        // Refresh Minecraft tokens
        const newMinecraftTokens = await this.authFlow!.getMinecraftTokens();
        this.minecraftTokens = {
          accessToken: newMinecraftTokens.access_token,
          refreshToken: newMinecraftTokens.refresh_token,
          expiresAt: Date.now() + (newMinecraftTokens.expires_in * 1000),
          username: newMinecraftTokens.username,
          uuid: newMinecraftTokens.uuid,
        };

        await this.saveTokens();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to refresh tokens:', err);
      return false;
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  public async getCurrentSession(): Promise<Session | null> {
    try {
      const storedSession = await SecureStore.getItemAsync(STORAGE_KEYS.SESSION);
      if (storedSession) {
        const session: Session = JSON.parse(storedSession);
        // Check if session is still valid
        if (new Date(session.expiresAt) > new Date()) {
          return session;
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  }
}

// Singleton instance
export const minecraftAuth = MinecraftAuthService.getInstance();

export default minecraftAuth;
