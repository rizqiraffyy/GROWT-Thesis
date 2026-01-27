import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr"
import { z } from "zod"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "Env Supabase belum diset: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(100, "Nama terlalu panjang."),
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid.")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter.")
    .max(64, "Password terlalu panjang."),
})

type SignUpBody = z.infer<typeof schema>

function baseUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
}

async function supabaseFromRoute() {
  const store = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(list: { name: string; value: string; options?: CookieOptions }[]) {
      for (const { name, value, options } of list) {
        if (options?.maxAge === 0) {
          store.set({ name, value: "", ...(options ?? {}), path: "/", maxAge: 0 })
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

  const ct = req.headers.get("content-type") ?? ""
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { success: false, error: "Content-Type harus application/json." },
      { status: 415, headers: noStore },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON tidak valid." },
      { status: 400, headers: noStore },
    )
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validasi gagal.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400, headers: noStore },
    )
  }

  const { name, email, password } = parsed.data as SignUpBody

  try {
    const supabase = await supabaseFromRoute()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${baseUrl(req)}/api/auth/callback?redirect=/main/dashboard`,
      },
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400, headers: noStore },
      )
    }

    // Confirm email OFF, Supabase bisa langsung mengembalikan session (auto-login).
    // Cegah auto-login dengan signOut agar cookie session tidak tersimpan.
    if (data.session) {
      await supabase.auth.signOut()
    }

    return NextResponse.json(
      {
        success: true,
        user: data.user,
        // Supabase: true kalau email confirmation dibutuhkan
        pendingEmailConfirmation: !data.session,
        // - confirm ON  -> user diarahkan cek email
        // - confirm OFF -> user tetap login manual 
        redirect: !data.session ? "/auth/check-email" : "/auth/signin",
      },
      { headers: noStore },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan."
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: noStore },
    )
  }
}
