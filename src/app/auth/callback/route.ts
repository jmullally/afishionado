import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Landing page for email links (sign-up confirmation, password reset). */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // A reset link opened in a different browser can't be exchanged here; ask for a fresh one.
    if (error && next) return NextResponse.redirect(new URL("/login?error=link", request.url));
  }
  // Only follow same-site paths, never "//other.host".
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(new URL(destination, request.url));
}
