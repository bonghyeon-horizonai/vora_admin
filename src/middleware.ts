import { NextRequest, NextResponse } from "next/server";

import { decrypt } from "@/lib/auth";

// 1. Specify protected and public routes
const protectedRoutes = [
  "/home",
  "/admins",
  "/members",
  "/products",
  "/cs",
  "/events",
  "/invites",
  "/notices",
  "/settings",
  "/settlements",
  "/single-menu",
];
const publicRoutes = ["/auth/sign-in", "/auth/sign-up"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // 4. Redirect to /auth/sign-in if the user is not authenticated
  if (isProtectedRoute && !session?.adminId) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  }

  // 5. Redirect to /home if the user is authenticated but trying to access public routes
  if (isPublicRoute && session?.adminId) {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
