import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("[v0] Middleware processing:", request.nextUrl.pathname)

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const isVinti4Callback = request.nextUrl.pathname.startsWith("/api/payments/vinti4/callback")
  const isVinti4Payment = request.nextUrl.pathname.includes("/checkout/vinti4")

  if (isVinti4Callback) {
    // Set specific headers for Vinti4 callbacks
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    console.log("[v0] Vinti4 callback processed")
    return response
  }

  // Authentication is now handled entirely on the client side with localStorage
  console.log("[v0] User authenticated: delegated to client")

  if (isVinti4Payment) {
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  }

  console.log("[v0] Middleware completed for:", request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
