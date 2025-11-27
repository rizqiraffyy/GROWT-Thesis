// lib/supabase/server.ts
import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from "@supabase/ssr";

/** Untuk Server Components (READ-ONLY): aman di layout/page */
export async function getSupabaseServerReadOnly() {
  const store = await cookies();

  // HANYA getAll — tidak ada setAll, jadi tidak menulis cookie saat render
  const cookieMethods: Pick<CookieMethodsServer, "getAll"> = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }));
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods as CookieMethodsServer }
  );
}

/** Untuk Route Handlers / Server Actions: boleh set cookie */
export async function getSupabaseFromRoute() {
  const store = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return store.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
      for (const { name, value, options } of cookiesToSet) {
        if (options?.maxAge === 0) {
          store.set({ name, value: "", ...(options ?? {}), maxAge: 0 });
        } else {
          store.set({ name, value, ...(options ?? {}) });
        }
      }
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
}