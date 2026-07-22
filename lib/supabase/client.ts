import { createBrowserClient } from "@supabase/ssr";
import { mockSupabaseClient } from "./mock-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are set to non-default values
const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-supabase-project.supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key-here" &&
  supabaseAnonKey !== "your-supabase-anon-key";

// Export the active Supabase client. Fall back to mock client if not configured.
export const supabase = isConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockSupabaseClient as any);

export default supabase;
