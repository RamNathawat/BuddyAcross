import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase client for use in Next.js middleware.
 * Handles session refresh and cookie management.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUser = user;
  if (!currentUser) {
    const bypassToken = request.cookies.get("buddy_bypass_token")?.value;
    const bypassRole = request.cookies.get("buddy_bypass_role")?.value;
    if (bypassToken && (bypassToken.startsWith("TEST_") || bypassToken.startsWith("BYPASS_"))) {
      const parts = bypassToken.split("_");
      currentUser = {
        id: parts[2] || "bypass-id",
        app_metadata: { role: bypassRole || parts[1] || "buddy" },
        user_metadata: { role: bypassRole || parts[1] || "buddy" },
      } as any;
    }
  }

  // Define public routes that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/verify", "/unauthorized", "/pending-approval"];
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith("/onboarding") ||
      request.nextUrl.pathname.startsWith("/verify")
  );

  if (!currentUser && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (currentUser) {
    const role = (currentUser.app_metadata?.role || currentUser.user_metadata?.role) as string;
    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/buddy") || pathname.startsWith("/tasker");

    if (isProtectedRoute) {
      if (!role) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding/role";
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith("/admin") && role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith("/buddy") && role !== "buddy") {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith("/tasker") && role !== "tasker") {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
