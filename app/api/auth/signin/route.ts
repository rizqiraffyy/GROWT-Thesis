import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { z } from "zod";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "Env Supabase belum diset: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

// mode:
// - "signin"  : selalu verifikasi email+password (cocok untuk Postman testing)
// - "session" : kalau sudah login, balikin 200 + redirect (cocok untuk UI cek session)
const schema = z.object({
  email: z.string().min(1).email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6).max(64),
  redirect: z.string().optional(),
  mode: z.enum(["signin", "session"]).optional(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRedirectFromQuery(req: NextRequest): string | null {
  const url = new URL(req.url);
  const target = url.searchParams.get("redirect");
  if (!target) return null;
  return target.startsWith("/") && !target.startsWith("//") ? target : null;
}

function getRedirectFromBody(raw: unknown): string | null {
  if (!isRecord(raw)) return null;
  const r = raw["redirect"];
  return typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : null;
}

async function supabaseFromRoute() {
  const store = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        if (options?.maxAge === 0) {
          store.set({ name, value: "", ...(options ?? {}), path: "/", maxAge: 0 });
        } else {
          store.set({ name, value, ...(options ?? {}) });
        }
      }
    },
  };

  return createServerClient(SUPABASE_URL, SUPABASE_ANON, { cookies: cookieMethods });
}

export async function POST(req: NextRequest) {
  const noStore = { "Cache-Control": "no-store" as const };

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { success: false, error: "Content-Type harus application/json." },
      { status: 415, headers: noStore },
    );
  }

  // CSRF-ish check: origin/referer harus host yang sama (kalau ada)
  const host = req.headers.get("host") ?? "";
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    try {
      const o = new URL(origin);
      if (host && o.host !== host) {
        return NextResponse.json(
          { success: false, error: "Origin tidak valid." },
          { status: 400, headers: noStore },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Origin tidak valid." },
        { status: 400, headers: noStore },
      );
    }
  }

  if (referer) {
    try {
      const r = new URL(referer);
      if (host && r.host !== host) {
        return NextResponse.json(
          { success: false, error: "Referer tidak valid." },
          { status: 400, headers: noStore },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Referer tidak valid." },
        { status: 400, headers: noStore },
      );
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON tidak valid." },
      { status: 400, headers: noStore },
    );
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validasi gagal.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400, headers: noStore },
    );
  }

  const { email, password, mode } = parsed.data;

  try {
    const supabase = await supabaseFromRoute();

    // Tentukan redirect
    const explicitRedirect = getRedirectFromBody(rawBody) ?? getRedirectFromQuery(req);

    // Kalau mode = "session", barulah boleh shortcut cek session.
    // Defaultnya "signin" → selalu verifikasi password (biar testing konsisten).
    if (mode === "session") {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const user = sessionData.session.user;
        const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
        const role = appMeta["role"]?.toString();
        const fallbackRedirect = role === "admin" ? "/main/kontrol" : "/main/dashboard";
        return NextResponse.json(
          { success: true, redirect: explicitRedirect ?? fallbackRedirect },
          { headers: noStore },
        );
      }
    } else {
      // mode signin: kalau sudah login, kita return 409 supaya jelas (bukan 200).
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        return NextResponse.json(
          {
            success: false,
            error: "Anda sudah login. Silakan logout terlebih dahulu.",
          },
          { status: 409, headers: noStore },
        );
      }
    }

    // LOGIN: selalu verifikasi email+password
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah." },
        { status: 401, headers: noStore },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
    const role = appMeta["role"]?.toString();

    const fallbackRedirect = role === "admin" ? "/main/kontrol" : "/main/dashboard";
    const redirect = explicitRedirect ?? fallbackRedirect;

    return NextResponse.json({ success: true, redirect }, { headers: noStore });
  } catch (e) {
    console.error("[signin] Fatal error:", e);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server." },
      { status: 500, headers: noStore },
    );
  }
}
