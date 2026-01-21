import { Suspense } from "react"
import { Icon } from "lucide-react"
import { barn } from '@lucide/lab';

import { LoginForm } from "./components/login-form"

import { redirect } from "next/navigation";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const supabase = await getSupabaseServerReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // sudah login → tendang ke main
    redirect("/main/dashboard");
  }

  return {
    title: "Sign In - GROWT",
    description: "Sign in to your GROWT account.",
  };
}

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Icon iconNode={barn} className="size-4" />
          </div>
          GROWT.
        </a>

        <Suspense fallback={<div>Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
