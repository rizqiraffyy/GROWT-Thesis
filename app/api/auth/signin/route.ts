import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr";
import { z } from "zod";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// note: basic env check so the route doesn’t run without required keys
if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error("Supabase env not set");
}

// note: input validation — keep it strict & clean
const schema = z.object({
  email: z.string().min(1).email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6).max(64),
});

// note: safe check for incoming JSON body shapes
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// note: make sure redirect only goes to internal routes
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

// note: Supabase SSR setup — cookie handling must use the official pattern
async function supabaseFromRoute() {
  const store = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      // note: delete cookie correctly by forcing path="/"
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
      { success: false, error: "Invalid content type" },
      { status: 415, headers: noStore },
    );
  }

  // note: simple origin/referer check — basic CSRF protection for auth routes
  const host = req.headers.get("host") ?? "";
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    try {
      const o = new URL(origin);
      if (host && o.host !== host) {
        return NextResponse.json(
          { success: false, error: "Invalid origin" },
          { status: 400, headers: noStore },
        );
      }
    } catch {}
  }

  if (referer) {
    try {
      const r = new URL(referer);
      if (host && r.host !== host) {
        return NextResponse.json(
          { success: false, error: "Invalid referer" },
          { status: 400, headers: noStore },
        );
      }
    } catch {}
  }

  // note: wrap JSON parsing so malformed bodies don’t crash the route
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: noStore },
    );
  }

  // note: Zod validation gives clean fieldErrors for the frontend
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400, headers: noStore },
    );
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await supabaseFromRoute();

    // note: if already logged in, don’t sign in again
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      const user = sessionData.session.user;
      const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
      const role = appMeta["role"]?.toString();

      const explicitRedirect =
        getRedirectFromBody(rawBody) ?? getRedirectFromQuery(req);

      // ⬇️ default redirect based on role
      const fallbackRedirect = role === "admin" ? "/main/kontrol" : "/main/dashboard";
      const redirect = explicitRedirect ?? fallbackRedirect;

      return NextResponse.json(
        { success: true, redirect },
        { headers: noStore },
      );
    }

    // note: do the login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[signin] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401, headers: noStore },
      );
    }

    // ⬇️ ambil user setelah sign-in biar dapat app_metadata.role terbaru
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
    const role = appMeta["role"]?.toString();

    const explicitRedirect =
      getRedirectFromBody(rawBody) ?? getRedirectFromQuery(req);

    const fallbackRedirect = role === "admin" ? "/main/kontrol" : "/main/dashboard";
    const redirect = explicitRedirect ?? fallbackRedirect;

    return NextResponse.json(
      { success: true, redirect },
      { headers: noStore },
    );
  } catch (e) {
    // note: don’t expose internal errors to client — log only
    console.error("[signin] Fatal error:", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: noStore },
    );
  }
}
