import React, { createContext, useContext, useEffect, useState } from "react";
import type { UserRead } from "../client/types.gen";
import {
  getUserUsersUserIdGet,
  loginAuthLoginPost,
  logoutAuthLogoutPost,
  meAuthMeGet,
} from "../client/sdk.gen";

type AuthContextType = {
  user: UserRead | null;
  loading: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);

  // load session on startup
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    try {
      // get identity
      const me = await meAuthMeGet();

      const userId = (me.data as any)?.id;
      console.log(userId);

      if (!userId || typeof userId !== "string") {
        setUser(null);
        return;
      }

      // fetch full user
      const fullUser = await getUserUsersUserIdGet({
        path: {
          user_id: userId,
        },
        throwOnError: true,
      });

      const userData = (fullUser as any)?.data ?? fullUser;
      console.log(userData);

      if (userData?.id) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      await loginAuthLoginPost({
        body: { username, password },
        throwOnError: true,
      });

      await refresh();
    } catch (err) {
      throw new Error("Invalid username or password");
    }
  };

  const logout = async () => {
    await logoutAuthLogoutPost();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
