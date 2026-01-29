import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simpan kredensial demo di ENV (bukan di client)
const DEMO_EMAIL = process.env.DEMO_EMAIL!;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD!;

async function supabaseFromRoute() {
  const store = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        store.set({ name, value, ...(options ?? {}) });
      }
    },
  };

  return createServerClient(SUPABASE_URL, SUPABASE_ANON, { cookies: cookieMethods });
}

export async function POST(req: NextRequest) {
  const noStore = { "Cache-Control": "no-store" as const };

  // basic origin check (optional)
  const host = req.headers.get("host") ?? "";
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const o = new URL(origin);
      if (host && o.host !== host) {
        return NextResponse.json({ success: false, error: "Origin tidak valid." }, { status: 400, headers: noStore });
      }
    } catch {
      return NextResponse.json({ success: false, error: "Origin tidak valid." }, { status: 400, headers: noStore });
    }
  }

  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    return NextResponse.json(
      { success: false, error: "Kredensial demo belum dikonfigurasi." },
      { status: 500, headers: noStore },
    );
  }

  const supabase = await supabaseFromRoute();
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    return NextResponse.json({ success: false, error: "Gagal masuk akun demo." }, { status: 401, headers: noStore });
  }

  return NextResponse.json({ success: true, redirect: "/main/dashboard" }, { headers: noStore });
}
