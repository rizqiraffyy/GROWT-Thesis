import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { z } from "zod";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error("Supabase env not set");
}

const schema = z.object({
  email: z.string().min(1).email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6).max(64),
  // optional redirect in body
  redirect: z
    .string()
    .optional()
    .refine((v) => !v || (v.startsWith("/") && !v.startsWith("//")), {
      message: "Invalid redirect",
    }),
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

  // 1) Content-Type check (always enforced)
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { success: false, error: "Invalid content type" },
      { status: 415, headers: noStore },
    );
  }

  // 2) Basic CSRF check (always enforced)
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

  // 3) Parse JSON (always enforced)
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: noStore },
    );
  }

  // 4) Validate schema (always enforced)
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400, headers: noStore },
    );
  }

  const { email, password } = parsed.data;

  // Optional: force re-auth even if session exists
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  try {
    const supabase = await supabaseFromRoute();

    // 5) If already logged in and not forcing re-auth, return "alreadySignedIn"
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session && !force) {
      const user = sessionData.session.user;
      const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
      const role = appMeta["role"]?.toString();

      const explicitRedirect = getRedirectFromBody(rawBody) ?? getRedirectFromQuery(req);
      const fallbackRedirect = role === "admin" ? "/main/kontrol" : "/main/dashboard";
      const redirect = explicitRedirect ?? fallbackRedirect;

      return NextResponse.json(
        { success: true, alreadySignedIn: true, redirect },
        { headers: noStore },
      );
    }

    // 6) Do sign-in (this is the only path that checks password)
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401, headers: noStore },
      );
    }

    // 7) Fetch user role (fresh)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
    const role = appMeta["role"]?.toString();

    const explicitRedirect = getRedirectFromBody(rawBody) ?? getRedirectFromQuery(req);
    const fallbackRedirect = role === "admin" ? "/main/kontrol" : "/main/dashboard";
    const redirect = explicitRedirect ?? fallbackRedirect;

    return NextResponse.json(
      { success: true, alreadySignedIn: false, redirect },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[signin] Fatal error:", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: noStore },
    );
  }
}
