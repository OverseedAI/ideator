import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import * as authService from "@/services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = authService.getStoredToken();
    const storedUser = authService.getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    authService.setAuthToken(response.token);
    authService.setUser(response.user);
    setToken(response.token);
    setUser(response.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await authService.signup({ email, password, name });
    authService.setAuthToken(response.token);
    authService.setUser(response.user);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    authService.clearAuth();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const updatedUser = await authService.getMe();
      authService.setUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
