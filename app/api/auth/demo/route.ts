import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DEMO_EMAIL = process.env.DEMO_EMAIL!;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD!;

export async function POST(req: NextRequest) {
  const noStore = { "Cache-Control": "no-store" as const };

  // siapkan response lebih dulu supaya cookie bisa ditempel
  const res = NextResponse.json({ success: true, redirect: "/main/dashboard" }, { headers: noStore });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    return NextResponse.json(
      { success: false, error: "Kredensial demo belum dikonfigurasi." },
      { status: 500, headers: noStore },
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: "Gagal masuk akun demo." },
      { status: 401, headers: noStore },
    );
  }

  return res;
}
