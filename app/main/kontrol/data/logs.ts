"use server";

import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { deviceSchema, type Device } from "./schema";

/**
 * Skema data mentah langsung dari tabel `devices`
 * (hasil select Supabase sebelum di-map ke schema final)
 */
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

/**
 * Kolom yang diambil dari Supabase
 * (lebih aman & hemat daripada select("*"))
 */
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

/**
 * Ambil semua device untuk halaman Admin
 *
 * Catatan:
 * - Akses "semua device" sebaiknya tetap dijaga oleh RLS (mis. policy is_admin()).
 * - noStore(): biar data admin tidak ke-cache.
 */
export async function getDevices(): Promise<Device[]> {
  noStore();

  const supabase = await getSupabaseServerReadOnly();

  const { data, error } = await supabase
    .from("devices")
    .select(DEVICE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data device:", error);
    return [];
  }

  const parsed = rawDeviceSchema.array().safeParse(data ?? []);
  if (!parsed.success) {
    console.error("Format data device tidak sesuai schema:", parsed.error);
    return [];
  }

  // Map data mentah → schema final Device
  // owner_name sementara null (belum disimpan di DB)
  return parsed.data.map((d) =>
    deviceSchema.parse({
      ...d,
      owner_name: null,
    }),
  );
}

/**
 * Statistik untuk kartu (cards) di dashboard Admin Device
 *
 * Output:
 * {
 *   totalDevices: number
 *   activeDevices: number
 *   pendingDevices: number
 *   totalLogs: number
 * }
 */
export async function getDeviceStats() {
  noStore();

  const supabase = await getSupabaseServerReadOnly();

  // 1) Total device
  const { count: totalDevices, error: totalErr } = await supabase
    .from("devices")
    .select("id", { count: "exact", head: true });

  if (totalErr) console.error("Gagal menghitung total device:", totalErr);

  // 2) Total device aktif (is_active = true)
  const { count: activeDevices, error: activeErr } = await supabase
    .from("devices")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (activeErr) console.error("Gagal menghitung device aktif:", activeErr);

  // 3) Total device menunggu persetujuan (status = 'pending')
  const { count: pendingDevices, error: pendingErr } = await supabase
    .from("devices")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (pendingErr)
    console.error("Gagal menghitung device menunggu persetujuan:", pendingErr);

  // 4) Total log penimbangan (tabel weights)
  const { count: totalLogs, error: logsErr } = await supabase
    .from("weights")
    .select("id", { count: "exact", head: true });

  if (logsErr) console.error("Gagal menghitung total log penimbangan:", logsErr);

  return {
    totalDevices: totalDevices ?? 0,
    activeDevices: activeDevices ?? 0,
    pendingDevices: pendingDevices ?? 0,
    totalLogs: totalLogs ?? 0,
  };
}
