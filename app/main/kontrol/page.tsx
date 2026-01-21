// app/main/control/page.tsx
import { redirect } from "next/navigation";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getDevices } from "./data/logs";
import { SectionCards } from "./section-cards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ControlPage() {
  const supabase = await getSupabaseServerReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const role = appMeta["role"]?.toString();

  if (role !== "admin") {
    // bukan admin → tendang
    redirect("/main/dashboard");
  }

  const devices = await getDevices();

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-semibold tracking-tight">Control Panel</h1>
        <p className="text-sm text-muted-foreground">
          Only admin accounts can access this page.
        </p>
      </div>

      <div className="px-4 pt-2">
        <SectionCards />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
        <div className="flex flex-1 flex-col gap-8 md:flex">
          <DataTable data={devices} columns={columns} />
        </div>
      </div>
    </div>
  );
}