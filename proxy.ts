import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (!user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Force a password change before anything else is accessible (seeded
  // Admin account and any user created by an Admin start in this state).
  if (user.mustChangePassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.nextUrl.origin));
  }
  if (!user.mustChangePassword && pathname === "/change-password") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Admin-only area: plain users are bounced back to their dashboard.
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/categories/:path*",
    "/transactions/:path*",
    "/admin/:path*",
    "/change-password",
  ],
};
