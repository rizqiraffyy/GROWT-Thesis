import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr"
import { z } from "zod"

// note: basic env guard — this route should not run without these
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error("Supabase env not set: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// note: simple schema for email — trim & lowercase for consistency
const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .transform((v) => v.trim().toLowerCase()),
})

// note: common helper for base URL (supports dev + production)
function baseUrl(req: Request) {
  return SITE_URL || new URL(req.url).origin
}

// note: Supabase SSR client — uses cookies() so signOut actually clears session cookies
async function supabaseFromRoute() {
  const store = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        if (options?.maxAge === 0) {
          // note: path="/" ensures cookie is fully cleared
          store.set({
            name,
            value: "",
            ...(options ?? {}),
            path: "/",
            maxAge: 0,
          })
        } else {
          store.set({ name, value, ...(options ?? {}) })
        }
      }
    },
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON, { cookies: cookieMethods })
}

export async function POST(req: Request) {
  const noStore = { "Cache-Control": "no-store" as const }

  try {
    const contentType = req.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 415, headers: noStore },
      )
    }

    // note: parse body safely then validate with Zod
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: noStore },
      )
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400, headers: noStore },
      )
    }

    const { email } = parsed.data

    // note: basic CSRF-ish origin check (same host only)
    const origin = req.headers.get("origin")
    if (origin) {
      try {
        const originUrl = new URL(origin)
        const expectedHost = new URL(baseUrl(req)).host

        if (originUrl.host !== expectedHost) {
          return NextResponse.json(
            { error: "Invalid origin" },
            { status: 400, headers: noStore },
          )
        }
      } catch {
        // ignore malformed origin, treat as bad request
        return NextResponse.json(
          { error: "Invalid origin" },
          { status: 400, headers: noStore },
        )
      }
    }

    const supabase = await supabaseFromRoute()

    // note: sign out current session on this device (if any)
    await supabase.auth.signOut()

    // note: after user clicks the link in email, Supabase will redirect here
    const redirectTo = `${baseUrl(req)}/api/auth/callback?redirect=/auth/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      console.error("[forgot-password] Reset password error:", error.message)
      // note: don't leak details to user
      return NextResponse.json(
        { error: "Failed to send reset email." },
        { status: 400, headers: noStore },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "If your email exists in our system, a reset link has been sent.",
      },
      { headers: noStore },
    )
  } catch (err: unknown) {
    console.error("[forgot-password] Fatal error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
