import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isConfigured, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const PUBLIC_PATHS = ["/login", "/setup", "/auth", "/welcome", "/privacy", "/terms"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isConfigured) {
    return pathname === "/setup" ? NextResponse.next() : NextResponse.redirect(new URL("/setup", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let signedIn = false;
  try {
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    // Supabase unreachable: treat as signed out.
  }

  const redirectTo = (path: string) => {
    const r = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  // Signed-out visitors to the home page see the public landing page instead of the diary.
  if (!signedIn && pathname === "/") {
    const r = NextResponse.rewrite(new URL("/welcome", request.url));
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }
  // Remember where they were going (e.g. a friend's invite link) for after sign-in.
  if (!signedIn && !isPublic) return redirectTo(`/login?next=${encodeURIComponent(pathname)}`);
  if (signedIn && (pathname === "/login" || pathname === "/welcome")) return redirectTo("/");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image|icons/|zxing/|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)"],
};
