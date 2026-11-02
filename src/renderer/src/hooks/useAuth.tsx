import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AuthAccount {
  username: string;
  name: string;
}

interface AuthContextValue {
  account: AuthAccount | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  account: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AuthAccount | null>(null);

  useEffect(() => {
    window.electronAuth.getAccount().then((acc) => {
      setAccount(acc);
    });
  }, []);

  const login = useCallback(async () => {
    await window.electronAuth.login();
    const acc = await window.electronAuth.getAccount();
    setAccount(acc);
  }, []);

  const logout = useCallback(async () => {
    await window.electronAuth.logout();
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider value={{ account, isAuthenticated: account !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
