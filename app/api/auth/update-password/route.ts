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
    "Environment Supabase belum disetel (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  )
}

// Password policy (lebih jelas untuk testing + UI)
const schema = z
  .object({
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(64, "Kata sandi maksimal 64 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  })

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  })
}

// Proteksi dasar: kalau request dari browser, pastikan origin sama host (Postman biasanya tidak kirim Origin)
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin")
  if (!origin) return true

  try {
    const originUrl = new URL(origin)
    const reqUrl = new URL(req.url)
    return originUrl.host === reqUrl.host
  } catch {
    return false
  }
}

async function supabaseFromRoute() {
  const store = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(items: { name: string; value: string; options?: CookieOptions }[]) {
      for (const { name, value, options } of items) {
        // Pastikan cookie benar-benar terhapus (path="/")
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

  return createServerClient(SUPABASE_URL, SUPABASE_ANON, { cookies: cookieMethods })
}

export async function POST(req: Request) {
  // 1) Content-Type guard
  const ct = req.headers.get("content-type") ?? ""
  if (!ct.includes("application/json")) {
    return jsonNoStore(
      { success: false, error: "Content-Type tidak valid" },
      { status: 415 },
    )
  }

  // 2) Origin check (basic CSRF protection)
  if (!isSameOrigin(req)) {
    return jsonNoStore(
      { success: false, error: "Origin tidak valid" },
      { status: 400 },
    )
  }

  // 3) Parse JSON aman
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonNoStore(
      { success: false, error: "Body JSON tidak valid" },
      { status: 400 },
    )
  }

  // 4) Validasi input
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

  try {
    const supabase = await supabaseFromRoute()

    // 5) Pastikan ada session recovery (hasil klik link reset di email)
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession()

    if (sessionErr) {
      // jangan bocorkan detail internal berlebihan
      return jsonNoStore(
        { success: false, error: "Gagal memeriksa sesi. Silakan coba lagi." },
        { status: 500 },
      )
    }

    if (!session) {
      return jsonNoStore(
        {
          success: false,
          error:
            "Sesi pemulihan tidak ditemukan. Silakan gunakan tautan reset terbaru dari email.",
        },
        { status: 401 },
      )
    }

    // (Opsional) Pastikan ini benar-benar sesi recovery
    // Banyak kasus session.user ada, tapi tipe recovery ada di exchange token flow.
    // Karena kita tidak mengandalkan type di sini, minimal: session harus ada.

    // 6) Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (updateErr) {
      const msg = updateErr.message.toLowerCase()

      // Rate limit / terlalu sering
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        return jsonNoStore(
          {
            success: false,
            error: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
          },
          { status: 429 },
        )
      }

      return jsonNoStore(
        { success: false, error: "Gagal memperbarui kata sandi. Coba lagi." },
        { status: 400 },
      )
    }

    // 7) (Opsional tapi bagus) Logout setelah ganti password agar session lama tidak dipakai
    await supabase.auth.signOut()

    return jsonNoStore(
      { success: true, message: "Kata sandi berhasil diperbarui." },
      { status: 200 },
    )
  } catch (err) {
    console.error("[update-password] Fatal error:", err)
    return jsonNoStore(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 },
    )
  }
}
