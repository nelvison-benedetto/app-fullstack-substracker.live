"use client";

import { 
  createContext,  //crea context(contenitore) globale
  useContext, 
  useState, 
  useCallback  //memorizza funct (ottimizzazione)
} from "react";

import type { AuthUser } from "@/shared/types";
import { logoutAction } from "@/shared/actions/auth.actions";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);   //crea contenitore globale (inizialmente null)

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser: AuthUser | null;
};

export function AuthProvider({ children, initialUser }: AuthProviderProps) {

  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const logout = useCallback( async () => {
    await logoutAction();
    setUser(null);
  }, []);
  //funct memorizzata!

  return (
    <AuthContext.Provider  //usa AuthContext creato qua sopra
      value={{
        user,
        isAuthenticated: user !== null, //booleano semplice
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {  //hooks custom
  const ctx = useContext(AuthContext);  //legge il context
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");  //se ctx è null/undefined allora error
  return ctx;
}
