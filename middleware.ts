import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/clerk(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId } = await auth();

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Handle organization-specific redirects
  // If user is in an organization context, ensure they stay in organization routes
  if (userId && orgId) {
    const pathname = req.nextUrl.pathname;
    
    // If accessing dashboard without org context, redirect to org dashboard
    if (pathname === "/dashboard" && !pathname.includes("/organization")) {
      const orgDashboard = new URL(`/organization/${orgId}`, req.url);
      return NextResponse.redirect(orgDashboard);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
