import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr"
import { z } from "zod"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "Environment Supabase belum disetel (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  )
}

// =======================
// Schema validasi input
// =======================
const schema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .transform((v) => v.trim().toLowerCase()),
})

// =======================
// Helper
// =======================
function baseUrl(req: Request) {
  return SITE_URL || new URL(req.url).origin
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  })
}

async function supabaseFromRoute() {
  const store = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        // Pastikan cookie benar-benar terhapus
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

function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin")
  if (!origin) return true // Postman / non-browser client biasanya tidak kirim origin

  try {
    const originUrl = new URL(origin)
    const expectedHost = new URL(baseUrl(req)).host
    return originUrl.host === expectedHost
  } catch {
    return false
  }
}

// =======================
// Handler POST
// =======================
export async function POST(req: Request) {
  // 1. Validasi Content-Type
  const contentType = req.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return jsonNoStore(
      { success: false, error: "Content-Type tidak valid" },
      { status: 415 },
    )
  }

  // 2. Validasi origin (proteksi dasar CSRF)
  if (!isSameOrigin(req)) {
    return jsonNoStore(
      { success: false, error: "Origin tidak valid" },
      { status: 400 },
    )
  }

  // 3. Parse JSON dengan aman
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonNoStore(
      { success: false, error: "Body JSON tidak valid" },
      { status: 400 },
    )
  }

  // 4. Validasi input
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore(
      {
        success: false,
        error: "Validasi gagal",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const { email } = parsed.data

  try {
    const supabase = await supabaseFromRoute()

    // Optional: logout session aktif (jaga konsistensi flow)
    await supabase.auth.signOut()

    // Redirect setelah user klik link email
    const redirectTo = `${baseUrl(req)}/api/auth/callback?redirect=/auth/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    /**
     * PENTING (KEAMANAN):
     * Jangan pernah membocorkan apakah email terdaftar atau tidak.
     * Pesan harus selalu generik.
     */
    if (error) {
      const msg = error.message.toLowerCase()

      // Rate limit → 429 (jelas untuk testing)
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        return jsonNoStore(
          {
            success: false,
            error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
          },
          { status: 429 },
        )
      }

      // Error lain → tetap 200, pesan generik
      return jsonNoStore({
        success: true,
        message:
          "Jika email terdaftar di sistem kami, tautan reset kata sandi telah dikirim.",
      })
    }

    // Sukses normal
    return jsonNoStore({
      success: true,
      message:
        "Jika email terdaftar di sistem kami, tautan reset kata sandi telah dikirim.",
    })
  } catch (err) {
    console.error("[forgot-password] Fatal error:", err)
    return jsonNoStore(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 },
    )
  }
}
