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
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone?: string,
    skills?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const COOKIE_NAME = "resqnet-auth-session";

// Client-side cookie helpers
function getSessionCookie(): UserSession | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + COOKIE_NAME + "=([^;]*)")
  );
  if (match && match[2]) {
    try {
      return JSON.parse(decodeURIComponent(match[2])) as UserSession;
    } catch {
      return null;
    }
  }
  return null;
}

function setSessionCookie(session: UserSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    const expires = new Date(session.expiresAt).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; path=/; expires=${expires}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

// Helper to map real Supabase session user to UserSession user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseUser(sbUser: any): UserSession["user"] {
  return {
    id: sbUser.id,
    email: sbUser.email || "",
    role: (sbUser.user_metadata?.role || "citizen") as UserRole,
    fullName:
      sbUser.user_metadata?.fullName ||
      sbUser.user_metadata?.full_name ||
      sbUser.email?.split("@")[0] ||
      "User",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseSession(sbSession: any): UserSession {
  return {
    accessToken: sbSession.access_token,
    user: mapSupabaseUser(sbSession.user),
    expiresAt: sbSession.expires_at
      ? sbSession.expires_at * 1000
      : Date.now() + 1000 * 60 * 60 * 24, // fallback 24h
  };
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
        // Try to load local mock session cookie first
        const mockSession = getSessionCookie();
        if (
          mockSession &&
          mockSession.user &&
          mockSession.expiresAt > Date.now()
        ) {
          setSession(mockSession);
          setUser(mockSession.user);
          setIsLoading(false);
          return;
        }

        // Fallback to real Supabase session if configured
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const activeSession = mapSupabaseSession(data.session);
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
      (_event: string, currentSession: any) => {
        // If we have an active mock session, do not let real Supabase empty event sign us out
        const mockSession = getSessionCookie();
        if (
          mockSession &&
          mockSession.user &&
          mockSession.expiresAt > Date.now()
        ) {
          setSession(mockSession);
          setUser(mockSession.user);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          const activeSession = mapSupabaseSession(currentSession);
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
      const lowerEmail = email.toLowerCase();

      // Intercept mock users for quick login even when real Supabase is configured
      const isMockEmail = [
        "citizen@resqnet.ai",
        "volunteer@resqnet.ai",
        "authority@resqnet.ai",
      ].includes(lowerEmail);

      if (isMockEmail && password === "password") {
        const mockUsersList = {
          "citizen@resqnet.ai": {
            id: "mock-citizen-id-123",
            email: "citizen@resqnet.ai",
            role: "citizen" as UserRole,
            fullName: "Jane Doe",
          },
          "volunteer@resqnet.ai": {
            id: "mock-volunteer-id-456",
            email: "volunteer@resqnet.ai",
            role: "volunteer" as UserRole,
            fullName: "John Smith",
          },
          "authority@resqnet.ai": {
            id: "mock-authority-id-789",
            email: "authority@resqnet.ai",
            role: "authority" as UserRole,
            fullName: "Commander Alert",
          },
        };

        const userEntry =
          mockUsersList[lowerEmail as keyof typeof mockUsersList];
        const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours expiry
        const mockSessionData: UserSession = {
          accessToken: `mock-jwt-token-for-${userEntry.role}`,
          user: userEntry,
          expiresAt,
        };

        setSession(mockSessionData);
        setUser(mockSessionData.user);
        setSessionCookie(mockSessionData);

        toast.success(`Welcome back, ${userEntry.fullName}!`, {
          description: `Logged in successfully as ${userEntry.role.toUpperCase()} (Mock Mode).`,
        });

        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Fallback to real Supabase authentication for other accounts
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        const activeSession = mapSupabaseSession(data.session);
        setSession(activeSession);
        setUser(activeSession.user);
        toast.success(`Welcome back, ${activeSession.user.fullName}!`, {
          description: `Logged in successfully as ${activeSession.user.role.toUpperCase()}.`,
        });

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

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone?: string,
    skills?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            fullName,
            role,
          },
        },
      });

      if (error) throw error;

      // If user registers as a volunteer, automatically insert record into volunteers table
      if (role === "volunteer" && data?.user) {
        const skillsArray = skills
          ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const { error: volErr } = await supabase.from("volunteers").insert({
          id: data.user.id, // Align profile UUID with auth user UUID
          name: fullName,
          email: email.toLowerCase(),
          phone: phone || null,
          skills: skillsArray,
          status: "off-duty",
          latitude: 40.7306, // Default coordinate centered in NY Sector B
          longitude: -73.9352,
          locationName: "Registered Address Depot",
        });

        if (volErr) {
          console.error("Failed to create volunteer profile record:", volErr.message);
        }
      }

      toast.success("Account Created Successfully", {
        description: "Check your email for confirmation link to verify your account.",
      });
    } catch (error) {
      const err = error as Error;
      toast.error("Registration Failed", {
        description: err.message || "Failed to create an account.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear mock session cookie
      setSessionCookie(null);

      // Attempt to sign out of real Supabase Auth
      try {
        await supabase.auth.signOut();
      } catch {
        // Fail silently if not connected or session not found in Supabase
      }

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
    signUp,
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
