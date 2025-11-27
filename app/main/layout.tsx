// app/main/layout.tsx

import { redirect } from "next/navigation";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import type React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UIUser = { name: string; email: string; avatar: string };

function getInitials(name?: string | null, email?: string | null) {
  const n = (name ?? "").trim();
  if (n) {
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "NA";
  }
  const local = (email ?? "").split("@")[0] || "NA";
  return local.slice(0, 2).toUpperCase();
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const name =
    (user.user_metadata as Record<string, unknown> | null)?.["full_name"]?.toString() ??
    (user.user_metadata as Record<string, unknown> | null)?.["name"]?.toString() ??
    (user.email ?? "").split("@")[0];

  const email = user.email ?? "";

  const avatarFromMeta =
    (user.user_metadata as Record<string, unknown> | null)?.["avatar_url"]?.toString() ??
    (user.user_metadata as Record<string, unknown> | null)?.["picture"]?.toString() ??
    "";

  const provider = (user.app_metadata as Record<string, unknown> | null)?.["provider"]?.toString();

  const avatarFallback =
    !avatarFromMeta && provider === "email"
      ? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
          getInitials(name, email)
        )}`
      : "";

  const uiUser: UIUser = {
    name,
    email,
    avatar: avatarFromMeta || avatarFallback,
  };

  return (
    <SidebarProvider>
      {/*Kirim user ke AppSidebar */}
      <AppSidebar user={uiUser} />

      <SidebarInset>
        <SiteHeader user={uiUser} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
