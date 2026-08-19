import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/env";

const PUBLIC_PATHS = ["/connexion", "/inscription"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  try {
    const token = request.cookies.get("veloura_session")?.value;

    let role: string | null = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getAuthSecret());
        role = typeof payload.role === "string" ? payload.role : null;
      } catch {
        role = null;
      }
    }

    if (!token || !role) {
      if (isPublic) return NextResponse.next();
      const login = new URL("/connexion", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    if (isPublic) {
      const invite = request.nextUrl.searchParams.get("invite");
      if (invite && role !== "ADMIN") {
        return NextResponse.redirect(new URL(`/rejoindre?invite=${invite}`, request.url));
      }
      const home = role === "ADMIN" ? "/admin" : "/";
      return NextResponse.redirect(new URL(home, request.url));
    }

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!pathname.startsWith("/admin") && role === "ADMIN" && pathname !== "/connexion") {
      if (
        pathname === "/" ||
        pathname.startsWith("/wishes") ||
        pathname.startsWith("/occasions") ||
        pathname.startsWith("/preferences") ||
        pathname.startsWith("/history") ||
        pathname.startsWith("/inviter")
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Fail closed : une erreur inattendue dans le proxy ne doit jamais
    // laisser passer une requête vers une page protégée.
    console.error("proxy", error);
    if (isPublic) return NextResponse.next();
    const login = new URL("/connexion", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/((?!_next/|icon.svg|uploads/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
