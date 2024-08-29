import NextAuth, { NextAuthResult } from "next-auth"
import authConfig from "./auth/config"
import { NextRequest } from "next/server";

const nextauth = NextAuth(authConfig);
export const auth: NextAuthResult["auth"] = nextauth.auth;

export default auth((req) => {
    if (!req.auth) {
      const url = req.url.replace(req.nextUrl.pathname, `/login?callbackUrl=${encodeURIComponent(req.url)}`)
      return Response.redirect(url)
    }
  }) as (req: NextRequest) => Response;

export const config = {
  matcher: ["/account/:path*"],
}