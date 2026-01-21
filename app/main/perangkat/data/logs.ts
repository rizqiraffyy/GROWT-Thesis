"use server";

import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { deviceSchema, type Device } from "./schema";

const rawDeviceSchema = z.object({
  id: z.string().uuid(),
  serial_number: z.string(),
  name: z.string(),
  owner_user_id: z.string().uuid(),

  status: z.enum(["pending", "active", "inactive", "revoked"]),
  is_active: z.boolean(),

  approved_at: z.string().nullable(),
  approved_by: z.string().uuid().nullable(),
  approved_by_email: z.string().nullable(),

  owner_email: z.string().nullable(),

  last_seen_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RawDevice = z.infer<typeof rawDeviceSchema>;

function isAdminFromUser(user: User | null): boolean {
  if (!user) return false;
  const appMeta = user.app_metadata as { role?: string };
  return appMeta.role === "admin";
}

const DEVICE_SELECT = `
  id,
  serial_number,
  name,
  owner_user_id,
  status,
  is_active,
  approved_at,
  approved_by,
  approved_by_email,
  owner_email,
  last_seen_at,
  created_at,
  updated_at
`;

export async function getDevices(): Promise<Device[]> {
  noStore();

  const supabase = await getSupabaseServerReadOnly();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();

  if (userErr) console.error("[getDevices] Gagal mengambil user:", userErr);
  if (!user) return [];

  // RLS akan otomatis membatasi:
  // - user biasa: hanya miliknya
  // - admin: semua
  const { data, error } = await supabase
    .from("devices")
    .select(DEVICE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getDevices] Gagal mengambil data device:", error);
    return [];
  }

  const parsed = rawDeviceSchema.array().safeParse(data ?? []);
  if (!parsed.success) {
    console.error("[getDevices] Data device tidak valid:", parsed.error);
    return [];
  }

  return parsed.data.map((d) =>
    deviceSchema.parse({
      ...d,
      owner_name: null,
    }),
  );
}

export async function getDeviceStats() {
  noStore();

  const supabase = await getSupabaseServerReadOnly();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();

  if (userErr) console.error("[getDeviceStats] Gagal mengambil user:", userErr);

  if (!user) {
    return { totalDevices: 0, activeDevices: 0, pendingDevices: 0, totalLogs: 0 };
  }

  const isAdmin = isAdminFromUser(user);

  // Statistik device dihitung pakai COUNT agar efisien
  const [
    { count: totalDevices, error: totalErr },
    { count: activeDevices, error: activeErr },
    { count: pendingDevices, error: pendingErr },
  ] = await Promise.all([
    supabase.from("devices").select("id", { count: "exact", head: true }),
    supabase.from("devices").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("devices").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  if (totalErr) console.error("[Stats] Error total devices:", totalErr);
  if (activeErr) console.error("[Stats] Error active devices:", activeErr);
  if (pendingErr) console.error("[Stats] Error pending devices:", pendingErr);

  // Statistik logs
  let totalLogs = 0;

  if (isAdmin) {
    // Admin: hitung semua log
    const { count, error } = await supabase
      .from("weights")
      .select("id", { count: "exact", head: true });

    if (error) console.error("[Stats] Error menghitung log (admin):", error);
    totalLogs = count ?? 0;
  } else {
    /**
     * User: hanya hitung log yang benar-benar milik user
     * - Livestock milik user
     * - Device juga milik user
     *
     * Kenapa pakai inner join?
     * Agar yang dihitung hanya weights yang punya relasi valid ke device & livestock.
     */
    const { count, error } = await supabase
      .from("weights")
      .select(
        `
        id,
        devices!inner ( owner_user_id ),
        livestocks!inner ( user_id )
        `,
        { count: "exact", head: true },
      )
      .eq("devices.owner_user_id", user.id)
      .eq("livestocks.user_id", user.id);

    if (error) console.error("[Stats] Error menghitung log (user owned-only):", error);
    totalLogs = count ?? 0;
  }

  return {
    totalDevices: totalDevices ?? 0,
    activeDevices: activeDevices ?? 0,
    pendingDevices: pendingDevices ?? 0,
    totalLogs,
  };
}
