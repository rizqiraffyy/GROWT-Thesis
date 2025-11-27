export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr"

export async function GET() {
  const noStore = { "Cache-Control": "no-store" as const }

  try {
    // Next 15 requires cookies() to be awaited
    const store = await cookies()

    const cookieMethods: CookieMethodsServer = {
      getAll() {
        return store.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          if (options?.maxAge === 0) {
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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieMethods },
    )

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("[check-connection] Session error:", error.message)
      return NextResponse.json(
        {
          connected: false,
          reason: "Supabase auth error",
          message: error.message,
        },
        { status: 500, headers: noStore },
      )
    }

    return NextResponse.json(
      {
        connected: true,
        message: "Supabase auth connection successful",
        hasSession: !!session,
        // ⚠️ don't expose full session publicly for security
      },
      { headers: noStore },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("[check-connection] Fatal error:", msg)

    return NextResponse.json(
      {
        connected: false,
        reason: "Server error",
        message: msg,
      },
      { status: 500, headers: noStore },
    )
  }
}