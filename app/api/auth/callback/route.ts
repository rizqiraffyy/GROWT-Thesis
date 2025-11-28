export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from "@supabase/ssr";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

async function getSupabaseFromRoute() {
  const store = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(
      cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
    ) {
      for (const { name, value, options } of cookiesToSet) {
        if (options?.maxAge === 0) {
          store.set({
            name,
            value: "",
            ...(options ?? {}),
            path: "/",
            maxAge: 0,
          });
        } else {
          store.set({ name, value, ...(options ?? {}) });
        }
      }
    },
  };

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookieMethods,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirectParam =
    url.searchParams.get("redirect") ?? "/main/dashboard";
  const origin = url.origin;

  try {
    if (code) {
      const supabase = await getSupabaseFromRoute();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[auth/callback] exchange error:", error.message);
        // kalau exchange gagal, balikin ke signin dengan pesan singkat
        return NextResponse.redirect(
          new URL(`/auth/signin?error=oauth_exchange_failed`, origin),
          303,
        );
      }
    }

    // kalau gak ada code, ya sudah redirect ke target aja
    const safeTarget =
      redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : "/main/dashboard";

    const res = NextResponse.redirect(new URL(safeTarget, origin), 303);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    console.error("[auth/callback] fatal:", e);
    return NextResponse.redirect(
      new URL(`/auth/signin?error=callback_crash`, origin),
      303,
    );
  }
}
