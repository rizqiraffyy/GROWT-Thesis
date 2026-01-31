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
    <div>
      <SectionCards />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
        <div className="flex flex-1 flex-col gap-8 md:flex">
          <DataTable data={devices} columns={columns} />
        </div>
      </div>
    </div>
  );
}