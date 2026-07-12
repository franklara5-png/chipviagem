import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";
import {
  ACQUISITION_COOKIE,
  ACQUISITION_MAX_AGE,
  buildAcquisitionFromRequest,
  parseAcquisitionCookie,
  signAcquisitionCookie,
} from "@/lib/acquisition";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

function shouldCaptureAcquisition(pathname: string): boolean {
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return false;
  }
  return true;
}

async function attachAcquisitionCookie(request: NextRequest, response: NextResponse) {
  if (!shouldCaptureAcquisition(request.nextUrl.pathname)) return;

  const existing = request.cookies.get(ACQUISITION_COOKIE)?.value;
  if (existing && (await parseAcquisitionCookie(existing))) {
    // First-touch: visitas subsequentes com novas UTMs não sobrescrevem —
    // mede o que originou a descoberta do site, não a última sessão.
    return;
  }

  const data = buildAcquisitionFromRequest(request);
  const token = await signAcquisitionCookie(data);

  response.cookies.set(ACQUISITION_COOKIE, token, {
    maxAge: ACQUISITION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Painel do cliente (Better Auth) — otimista, só cookie ────────────
  if (pathname === "/painel" || pathname.startsWith("/painel/")) {
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;
    if (!sessionToken) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, getSecret());
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  const response = NextResponse.next();
  await attachAcquisitionCookie(request, response);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
