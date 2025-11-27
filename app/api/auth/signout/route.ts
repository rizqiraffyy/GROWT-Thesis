import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr"

// note: get base URL for redirect (supports local dev & production)
function getBaseUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
}

// note: Supabase SSR setup — cookie handling must follow official pattern
async function getSupabaseFromRoute() {
  const cookieStore = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      // note: convert Next.js cookies to the format Supabase expects
      return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      // note: correct deletion requires path="/"
      for (const { name, value, options } of cookiesToSet) {
        if (options?.maxAge === 0) {
          // note: ensure cookie is fully cleared
          cookieStore.set({
            name,
            value: "",
            ...(options ?? {}),
            path: "/",
            maxAge: 0,
          })
        } else {
          cookieStore.set({ name, value, ...(options ?? {}) })
        }
      }
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  )
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseFromRoute()

    // note: this clears the Supabase session cookie
    const { error } = await supabase.auth.signOut()

    const base = getBaseUrl(req)
    const redirectUrl = new URL("/auth/signin", base)
    const accept = req.headers.get("accept") || ""

    if (error) {
      // note: ensure HTML requests always redirect
      if (accept.includes("text/html")) return NextResponse.redirect(redirectUrl, 303)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (accept.includes("text/html")) return NextResponse.redirect(redirectUrl, 303)
    return NextResponse.json({ success: true, redirect: "/auth/signin" })
  } catch (err) {
    // note: do not expose internal errors — return generic message
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // note: GET should sign the user out same as POST, then redirect
  try {
    const supabase = await getSupabaseFromRoute()
    await supabase.auth.signOut()
  } finally {
    const base = getBaseUrl(req)
    return NextResponse.redirect(new URL("/auth/signin", base), 303)
  }
}