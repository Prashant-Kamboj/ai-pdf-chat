import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/files", "/upload", "/chat"];
const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api).*)"],
};
