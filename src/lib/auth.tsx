import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, getGetMeQueryKey } from "@/api-client";
import { useGetMe, setAuthTokenGetter } from "@/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("rozgarplus_token"));
  const [user, setUser] = useState<User | null>(null);
  
  // Set custom fetch token getter
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("rozgarplus_token"));
  }, []);

  const { data: meData, isLoading: meLoading } = useGetMe({ 
    query: { 
      enabled: !!token, 
      retry: false,
      refetchOnWindowFocus: false,
      queryKey: getGetMeQueryKey(),
    } 
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    } else if (!meLoading && token) {
      // Token might be invalid
      localStorage.removeItem("rozgarplus_token");
      setToken(null);
      setUser(null);
    }
  }, [meData, meLoading, token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("rozgarplus_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("rozgarplus_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: !!token && meLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
