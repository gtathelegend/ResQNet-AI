"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { UserRole, UserSession } from "@/types/auth";

interface AuthContextType {
  user: UserSession["user"] | null;
  session: UserSession | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [user, setUser] = useState<UserSession["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Initial session fetch
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const activeSession = data.session as unknown as UserSession;
          setSession(activeSession);
          setUser(activeSession.user);
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // 2. Subscribe to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, currentSession: unknown) => {
        const activeSession = currentSession as UserSession | null;
        if (activeSession) {
          setSession(activeSession);
          setUser(activeSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password = "password") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        const activeSession = data.session as unknown as UserSession;
        setSession(activeSession);
        setUser(activeSession.user);
        toast.success(`Welcome back, ${activeSession.user.fullName}!`, {
          description: `Logged in successfully as ${activeSession.user.role.toUpperCase()}.`,
        });

        // Redirect to dashboard/home page
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      const err = error as Error;
      toast.error("Authentication Failed", {
        description:
          err.message || "Failed to sign in. Please verify credentials.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      toast.info("Logged Out", {
        description: "You have signed out of the command center.",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Logout Failed", {
        description: err.message || "Error clearing auth session.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    role: user?.role || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
