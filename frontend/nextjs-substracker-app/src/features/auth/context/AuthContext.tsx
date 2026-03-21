"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { AuthUser } from "@/shared/types";
import { logoutAction } from "@/shared/actions/auth.actions";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser: AuthUser | null;
};

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

//TEST GIT
