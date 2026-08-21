import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { config, getAuthorizationUrl } from "../config/config";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "../services/pkce";
import {
  exchangeCodeForToken,
  getRolesPermissionsByUserId,
  getUserClaims,
  importAccessToken,
  isAuthenticatedUser,
  logout as logoutService,
  savePkceState,
  consumePkceState,
  type IdTokenClaims,
} from "../services/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IdTokenClaims | null;
  roles: unknown;
  login: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<IdTokenClaims | null>;
  importToken: (accessToken: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(isAuthenticatedUser());
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<IdTokenClaims | null>(() => (isAuthenticatedUser() ? getUserClaims() : null));
  const [roles, setRoles] = useState<unknown>(null);

  const login = useCallback(async () => {
    const codeVerifier = generateCodeVerifier(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    savePkceState(codeVerifier, state);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: config.responseType,
      scope: config.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      // Forces the login screen even if the identity server has an existing
      // SSO session — without it, a stale/wrong-account session there would
      // silently complete the redirect without giving the user a chance to
      // switch accounts.
      prompt: "login",
    });
    window.location.href = `${getAuthorizationUrl}?${params.toString()}`;
  }, []);

  const handleCallback = useCallback(async (code: string, state: string): Promise<IdTokenClaims | null> => {
    setIsLoading(true);
    try {
      const { codeVerifier, state: savedState } = consumePkceState();
      if (!codeVerifier || !state || state !== savedState) {
        return null;
      }

      await exchangeCodeForToken(code, codeVerifier);
      const claims = getUserClaims();
      setUser(claims);
      setIsAuthenticated(true);

      if (claims?.sub) {
        try {
          setRoles(await getRolesPermissionsByUserId(claims.sub));
        } catch {
          setRoles(null);
        }
      }

      return claims;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importToken = useCallback((accessToken: string): boolean => {
    const imported = importAccessToken(accessToken);
    if (imported) {
      setUser(getUserClaims());
      setIsAuthenticated(true);
    }
    return imported;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setRoles(null);
    logoutService();
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, user, roles, login, handleCallback, importToken, logout }),
    [isAuthenticated, isLoading, user, roles, login, handleCallback, importToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContextProvider");
  }
  return context;
};
