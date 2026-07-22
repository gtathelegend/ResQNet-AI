import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are set to non-default values
const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-supabase-project.supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key-here" &&
  supabaseAnonKey !== "your-supabase-anon-key";

// Async factory to create server-side client
export async function createClient() {
  const cookieStore = await cookies();

  if (!isConfigured) {
    // Return mock server client that reads our simulated auth session cookie
    return {
      auth: {
        getSession: async () => {
          const cookieVal = cookieStore.get("resqnet-auth-session")?.value;
          if (cookieVal) {
            try {
              const session = JSON.parse(decodeURIComponent(cookieVal));
              return { data: { session }, error: null };
            } catch {
              return { data: { session: null }, error: null };
            }
          }
          return { data: { session: null }, error: null };
        },
        getUser: async () => {
          const cookieVal = cookieStore.get("resqnet-auth-session")?.value;
          if (cookieVal) {
            try {
              const session = JSON.parse(decodeURIComponent(cookieVal));
              return { data: { user: session?.user || null }, error: null };
            } catch {
              return { data: { user: null }, error: null };
            }
          }
          return { data: { user: null }, error: null };
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Handled in middleware/routers
        }
      },
    },
  });
}
export default createClient;
