import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr"
import { z } from "zod"

// note: basic schema for signup — trim + lowercase email to keep it consistent
const schema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(6, "Password must be at least 6 chars")
    .max(64, "Password too long"),
})

type SignUpBody = z.infer<typeof schema>

// note: resolve base URL for redirects (works in dev and production)
function baseUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
}

// note: Supabase SSR setup — cookie handling must follow official pattern
async function supabaseFromRoute() {
  const store = await cookies() // Next 15: must await

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      // note: convert Next.js cookies to the format Supabase expects
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(list: { name: string; value: string; options?: CookieOptions }[]) {
      for (const { name, value, options } of list) {
        if (options?.maxAge === 0) {
          // note: ensure cookie is actually cleared (path="/" is important)
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
  // note: accept JSON only
  const ct = req.headers.get("content-type") ?? ""
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 415 },
    )
  }

  // note: parse body safely so malformed JSON won't crash the route
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }

  // note: validate with Zod and return field-level errors for the UI
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return NextResponse.json(
      { error: "Validation failed", fields: fieldErrors },
      { status: 400 },
    )
  }

  const { name, email, password } = parsed.data as SignUpBody

  try {
    const supabase = await supabaseFromRoute()

    // note: sign up user; if email confirmation is ON, session will usually be null
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        // note: after confirming email, Supabase will redirect here
        emailRedirectTo: `${baseUrl(req)}/api/auth/callback?redirect=/main/dashboard`,
      },
    })

    if (error) {
      // note: return Supabase error message so UI can show specific reason
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      // note: true when email confirmation is required (no active session yet)
      pendingEmailConfirmation: !data.session,
      // note: if session exists, go straight to dashboard; else ask user to check email
      redirect: data.session
        ? "/main/dashboard"
        : "/auth/check-email",
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    // note: generic 500 handler — you can log `e` separately if needed
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    )
  }
}
