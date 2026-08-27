import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';

export interface AuthContextType {
  idToken: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  logout: () => void;
  completeLogin: (idToken: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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
          setUserName(decoded.name ?? null);
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

  const completeLogin = (newIdToken: string) => {
    setIdToken(newIdToken);
    sessionStorage.setItem('idToken', newIdToken);

    const expiry = getTokenExpiry(newIdToken);
    if (expiry) {
      sessionStorage.setItem('tokenExpiry', expiry.toString());
    }

    try {
      const decoded = decodeIdToken(newIdToken);
      setUserId(decoded.sub);
      setUserName(decoded.name ?? null);
    } catch (e) {
      // token is malformed - leave userId/userName unset, isAuthenticated
      // still flips true since idToken is set, but downstream commissioner/
      // team checks that depend on userId will simply not match anything
    }
  };

  const logout = () => {
    setIdToken(null);
    setUserId(null);
    setUserName(null);
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('tokenExpiry');
    googleLogout();
  };

  return (
    <AuthContext.Provider
      value={{ idToken, isAuthenticated: !!idToken, userId, userName, logout, completeLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Wraps AuthProvider with the Google Identity Services SDK context - the
 * GoogleLogin button (rendered in Login.tsx) needs this ancestor to work.
 */
export const GoogleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>{children}</AuthProvider>
  </GoogleOAuthProvider>
);

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
