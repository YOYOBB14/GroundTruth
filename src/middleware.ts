import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session")?.value
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    try {
      const parsed = JSON.parse(session)
      if (!parsed.authenticated || parsed.expires_at < Date.now()) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url))
        response.cookies.delete("admin_session")
        return response
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
