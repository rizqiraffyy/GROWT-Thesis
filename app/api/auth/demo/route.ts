import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DEMO_EMAIL = process.env.DEMO_EMAIL!;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD!;

function jsonRes(payload: unknown, status: number, headers?: Record<string, string>) {
  return new NextResponse(JSON.stringify(payload), {
    status,
    headers: { ...(headers ?? {}), "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const noStore = { "Cache-Control": "no-store" as const };

  // Response yang akan selalu kita return (supaya cookie bisa ditempel)
  let res = jsonRes({ success: true, redirect: "/main/dashboard" }, 200, noStore);

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
    res = jsonRes(
      { success: false, error: "Kredensial demo belum dikonfigurasi." },
      500,
      noStore,
    );
    return res;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    res = jsonRes({ success: false, error: "Gagal masuk akun demo." }, 401, noStore);
    return res;
  }

  return res;
}
