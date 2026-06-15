import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/forgot-password");
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/w/") ||
    request.nextUrl.pathname.startsWith("/channels") ||
    request.nextUrl.pathname.startsWith("/search") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/dms") ||
    request.nextUrl.pathname.startsWith("/activity") ||
    request.nextUrl.pathname.startsWith("/files") ||
    request.nextUrl.pathname.startsWith("/threads") ||
    request.nextUrl.pathname.startsWith("/api/stripe/checkout") ||
    request.nextUrl.pathname.startsWith("/api/channels") ||
    request.nextUrl.pathname.startsWith("/api/messages") ||
    request.nextUrl.pathname.startsWith("/api/dms") ||
    request.nextUrl.pathname.startsWith("/api/users") ||
    request.nextUrl.pathname.startsWith("/api/channel-sections") ||
    request.nextUrl.pathname.startsWith("/api/workspaces") ||
    request.nextUrl.pathname.startsWith("/api/profile");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/channels";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
