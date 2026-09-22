import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This only checks "is there a valid session". The REAL role check happens
// server-side per-route via requireRole()/requireSchoolAccess() in
// src/lib/permissions.ts, which reads the role fresh from the database.
// This middleware is the first line of defense (redirect to /login), not
// the authorization boundary itself.
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/school/:path*",
    "/admin/:path*",
  ],
};
