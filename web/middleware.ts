import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {

    const session = await getToken({ req });
    const path = req.nextUrl.pathname;

    if (!session && !path.startsWith("/login")) {
        return NextResponse.redirect(new URL("/login", req.url));
      } else if (session && path == "/login") {
        return NextResponse.redirect(new URL("/", req.url));
      }
}