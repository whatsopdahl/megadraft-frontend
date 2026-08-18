import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface AuthContextType {
  idToken: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  login: () => void;
  logout: () => void;
  completeLogin: (idToken: string, refreshToken?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('idToken');
    const storedExpiry = sessionStorage.getItem('tokenExpiry');

    if (storedToken && storedExpiry) {
      const now = Date.now();
      if (now < parseInt(storedExpiry, 10)) {
        setIdToken(storedToken);
        try {
          const decoded = decodeIdToken(storedToken);
          setUserId(decoded.sub);
        } catch (e) {
          sessionStorage.removeItem('idToken');
          sessionStorage.removeItem('tokenExpiry');
        }
      } else {
        sessionStorage.removeItem('idToken');
        sessionStorage.removeItem('tokenExpiry');
      }
    }
  }, []);

  const login = () => {
    const domain = import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    const loginUrl = `https://${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = loginUrl;
  };

  const completeLogin = (newIdToken: string, refreshToken?: string) => {
    setIdToken(newIdToken);
    sessionStorage.setItem('idToken', newIdToken);
    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
    }

    const expiry = getTokenExpiry(newIdToken);
    if (expiry) {
      sessionStorage.setItem('tokenExpiry', expiry.toString());
    }

    try {
      setUserId(decodeIdToken(newIdToken).sub);
    } catch (e) {
      // token is malformed - leave userId unset, isAuthenticated still flips
      // true since idToken is set, but downstream commissioner/team checks
      // that depend on userId will simply not match anything
    }
  };

  const logout = () => {
    setIdToken(null);
    setUserId(null);
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('refreshToken');

    const domain = import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const logoutUrl = `https://${domain}/logout?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = logoutUrl;
  };

  return (
    <AuthContext.Provider value={{ idToken, isAuthenticated: !!idToken, userId, login, logout, completeLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function decodeIdToken(token: string): { sub: string; [key: string]: any } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }
  const decoded = JSON.parse(atob(parts[1]));
  return decoded;
}

export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = decodeIdToken(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
