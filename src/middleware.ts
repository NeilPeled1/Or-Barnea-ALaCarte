import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
  if (!isAuthPage && !isLoggedIn && req.nextUrl.pathname !== "/") {
    return Response.redirect(new URL("/login", req.url));
  }
  return undefined;
});

export const config = {
  // Exclude API, static assets, and files with extensions (e.g. /logo.png)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
