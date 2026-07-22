import { UserRole, UserSession } from "@/types/auth";

// Predefined mock users for local development
export const MOCK_USERS = {
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

const COOKIE_NAME = "resqnet-auth-session";

// Helper utilities for managing session cookie in browser
function setSessionCookie(session: UserSession | null) {
  if (typeof window === "undefined") return;

  if (session) {
    const expires = new Date(session.expiresAt).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; path=/; expires=${expires}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

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

type AuthListener = (event: string, session: UserSession | null) => void;

class MockAuthClient {
  private listeners: Set<AuthListener> = new Set();
  private currentSession: UserSession | null = getSessionCookie();

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password?: string;
  }) {
    // Simulate minor network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const userEntry = Object.values(MOCK_USERS).find(
      (u) => u.email === email.toLowerCase()
    );

    if (!userEntry || password !== "password") {
      throw new Error(
        "Invalid login credentials. Use citizen@resqnet.ai, volunteer@resqnet.ai, or authority@resqnet.ai with 'password'."
      );
    }

    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours expiry
    const newSession: UserSession = {
      accessToken: `mock-jwt-token-for-${userEntry.role}`,
      user: userEntry,
      expiresAt,
    };

    this.currentSession = newSession;
    setSessionCookie(newSession);
    this.notify("SIGNED_IN", newSession);

    return { data: { session: newSession, user: userEntry }, error: null };
  }

  async signOut() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.currentSession = null;
    setSessionCookie(null);
    this.notify("SIGNED_OUT", null);

    return { error: null };
  }

  async getSession() {
    // Return cached session
    return { data: { session: this.currentSession }, error: null };
  }

  async getUser() {
    return { data: { user: this.currentSession?.user || null }, error: null };
  }

  onAuthStateChange(callback: AuthListener) {
    this.listeners.add(callback);
    // Instantly notify listener of current state on subscribe
    callback("INITIAL_SESSION", this.currentSession);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }

  private notify(event: string, session: UserSession | null) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, session);
      } catch (err) {
        console.error("Error in auth listener:", err);
      }
    });
  }
}

export const mockSupabaseClient = {
  auth: new MockAuthClient(),
};
export default mockSupabaseClient;
