// middleware.ts
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  DEFAULT_ADMIN_LOGIN_REDIRECT,
  DEFAULT_USER_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  adminRoutes,
} from "./routes";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route));

  // Allow API auth routes through
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Allow public routes through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect logged in users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    const redirectUrl = isAdmin ? DEFAULT_ADMIN_LOGIN_REDIRECT : DEFAULT_USER_LOGIN_REDIRECT;
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Redirect unauthenticated users from private routes
  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Redirect non-admins away from admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL(DEFAULT_USER_LOGIN_REDIRECT, req.url));
  }

  return NextResponse.next();
});

// Ensure these routes are matched by the middleware
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
