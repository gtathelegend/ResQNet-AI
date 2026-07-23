import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next.js endpoints should be public
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json";

  // 1. Retrieve session from our local mock cookie
  const mockSessionCookie = request.cookies.get("resqnet-auth-session")?.value;
  let isAuthenticated = false;

  if (mockSessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(mockSessionCookie));
      if (session && session.user && session.expiresAt > Date.now()) {
        isAuthenticated = true;
      }
    } catch {
      // Cookie corrupted or expired
    }
  }

  // 2. Fallback to Supabase SSR client check if configured and not yet authenticated
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured =
    supabaseUrl &&
    supabaseUrl !== "https://your-supabase-project.supabase.co" &&
    supabaseAnonKey &&
    supabaseAnonKey !== "your-supabase-anon-key-here" &&
    supabaseAnonKey !== "your-supabase-anon-key";

  if (!isAuthenticated && isSupabaseConfigured) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        isAuthenticated = true;
      }
    } catch {
      // Auth check error
    }
  }

  // Routing Guard Rules
  if (!isAuthenticated) {
    if (!isPublicRoute) {
      // Redirect unauthenticated requests to login page
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } else {
    if (pathname === "/login") {
      // Prevent authenticated users from opening login screen
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
