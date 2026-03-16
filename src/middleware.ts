import { NextResponse } from "next/server";

// Auth is handled in layouts (dashboard + auth) - NOT in middleware.
// NextAuth auth() fails in Edge middleware on Vercel (returns null for valid sessions).
// Layouts run on Node.js server where auth() works correctly.
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
