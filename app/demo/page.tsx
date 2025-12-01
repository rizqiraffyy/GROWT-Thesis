"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// ⬇️ DEMO ACCOUNT (hard-coded, sesuai dengan yang kamu pakai di Supabase)
const DEMO_EMAIL = "simulation@growt.com";
const DEMO_PASSWORD = "password";

export default function DemoPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Cek dulu: kalau sudah login sebagai demo user → langsung ke dashboard
      const { data, error: userErr } = await supabase.auth.getUser();

      if (!cancelled && !userErr && data.user?.email === DEMO_EMAIL) {
        router.replace("/main/dashboard");
        return;
      }

      // 2) Kalau belum, login pakai akun demo
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (cancelled) return;

      if (error) {
        console.error("[/demo] demo login error:", error);
        router.replace(
          "/auth/signin?error=Demo%20login%20failed.%20Please%20contact%20admin.",
        );
      } else {
        router.replace("/main/dashboard");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entering demo mode…</CardTitle>
          <CardDescription>
            We&apos;re signing you in as a simulation user and preparing the
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Please wait a moment.
        </CardContent>
      </Card>
    </div>
  );
}
