export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from "@supabase/ssr"

// note: basic env guard (optional but nice to fail fast in misconfig)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "Supabase env not set: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

// note: resolve base URL (works in dev + production)
function baseUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
}

// note: sanitize redirect to avoid open redirect vulnerabilities
function resolveTarget(nextParam: string | null) {
  return nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/main/dashboard"
}

// note: Supabase SSR client, consistent with other auth routes
async function getSupabaseFromRoute() {
  const store = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
      for (const { name, value, options } of cookiesToSet) {
        if (options?.maxAge === 0) {
          // note: path="/" is important to fully clear session cookies
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

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const oauthErr =
    url.searchParams.get("error_description") || url.searchParams.get("error")
  const target = resolveTarget(url.searchParams.get("redirect"))
  const signinPath = "/auth/signin"

  // note: helper to always add no-store + 303
  const redirect = (pathname: string) => {
    const res = NextResponse.redirect(new URL(pathname, baseUrl(req)), 303)
    res.headers.set("Cache-Control", "no-store")
    return res
  }

  // note: handle Google/Supabase OAuth error first
  if (oauthErr) {
    return redirect(
      `${signinPath}?error=${encodeURIComponent(oauthErr)}`,
    )
  }

  // note: missing code → nothing to exchange
  if (!code) {
    return redirect(
      `${signinPath}?error=${encodeURIComponent(
        "Missing authorization code",
      )}`,
    )
  }

  try {
    const supabase = await getSupabaseFromRoute()

    // exchange `code` → session cookies
    const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeErr) {
      console.error("[auth/callback] Exchange error:", exchangeErr.message)
      return redirect(
        `${signinPath}?error=${encodeURIComponent(
          "OAuth exchange failed",
        )}`,
      )
    }

    // note: if everything is good, go to the intended target
    return redirect(target)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    console.error("[auth/callback] Fatal error:", e)
    return redirect(
      `${signinPath}?error=${encodeURIComponent(msg)}`,
    )
  }
}
