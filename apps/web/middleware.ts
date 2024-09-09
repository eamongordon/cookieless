import NextAuth, { NextAuthResult } from "next-auth"
import authConfig from "./lib/auth/config"
import { NextRequest } from "next/server";

const nextauth = NextAuth(authConfig);
export const auth: NextAuthResult["auth"] = nextauth.auth;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  if (req.auth) {
    if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && !searchParams.has('redirect')) {
      const redirectUrl = req.url.replace(pathname, '/settings');
      return Response.redirect(redirectUrl);
    }
  } else {
    if (!pathname.startsWith('/login')) {
      const redirectUrl = req.url.replace(pathname, `/login?redirect=${encodeURIComponent(req.url)}`);
      return Response.redirect(redirectUrl);
    }
  }
}) as (req: NextRequest) => Response;

export const config = {
  matcher: ["/account", "/login", "/signup"]
}