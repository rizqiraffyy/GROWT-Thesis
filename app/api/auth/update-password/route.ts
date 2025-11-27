// app/api/auth/update-password/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr"
import { z } from "zod"

// note: same schema style as signup
const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

async function supabaseFromRoute() {
  const store = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(items: { name: string; value: string; options?: CookieOptions }[]) {
      for (const { name, value, options } of items) {
        if (options?.maxAge === 0) {
          // note: ensure cookie deletion works in all browsers
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

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods },
  )
}

export async function POST(req: Request) {
  const noStore = { "Cache-Control": "no-store" as const }

  try {
    // basic content-type guard
    const ct = req.headers.get("content-type") ?? ""
    if (!ct.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 415, headers: noStore },
      )
    }

    // safe JSON parsing + Zod validation
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
      const msg =
        parsed.error.issues[0]?.message ?? "Invalid input"
      return NextResponse.json(
        { error: msg },
        { status: 400, headers: noStore },
      )
    }

    const supabase = await supabaseFromRoute()

    // ensure valid recovery session exists
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession()

    if (sessionErr) {
      return NextResponse.json(
        { error: sessionErr.message },
        { status: 500, headers: noStore },
      )
    }

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Recovery session not found. Please use the latest reset link sent to your email.",
        },
        { status: 401, headers: noStore },
      )
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
        { status: 400, headers: noStore },
      )
    }

    return NextResponse.json(
      { success: true },
      { headers: noStore },
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}