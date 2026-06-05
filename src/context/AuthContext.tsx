import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store non funziona sul web: usa localStorage come fallback
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

type User = {
  id: number;
  username: string;
  ruolo: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AUTH_KEY = 'robocop_user';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.get(AUTH_KEY).then((stored) => {
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // dati corrotti, ignora
        }
      }
      setIsLoading(false);
    });
  }, []);

  async function login(userData: User) {
    await storage.set(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  async function logout() {
    await storage.remove(AUTH_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
