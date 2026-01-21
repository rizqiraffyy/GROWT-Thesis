"use server";

import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { taskSchema, type Task } from "./schema";

/**
 * Bentuk data mentah dari Supabase:
 * weights + nested livestocks (milik user login) + devices
 */
const rawLogSchema = z.object({
  id: z.coerce.number(),
  rfid: z.string(),
  weight: z.coerce.number().nullable(),
  created_at: z.string(), // timestamptz → string ISO

  device_id: z.string().uuid().nullable().optional(),
  devices: z
    .object({
      serial_number: z.string().nullable(),
    })
    .nullable()
    .optional(),

  livestocks: z
    .object({
      name: z.string().nullable(),
      breed: z.string().nullable(),

      // format "YYYY-MM-DD"
      dob: z.string().nullable(),

      sex: z.string().nullable(),
      species: z.string().nullable(),
      photo_url: z.string().nullable(),

      // karena pakai livestocks!inner + filter eq user_id, harusnya selalu ada
      user_id: z.string().uuid(),
    })
    .nullable(),
});

export type RawLog = z.infer<typeof rawLogSchema>;

export type AgeParts = { years: number; months: number; days: number };
export type LifeStage = "baby" | "young" | "adult";
export type StatusType = "good" | "neutral" | "bad";

/**
 * Parse DOB "YYYY-MM-DD" ke Date lokal (menghindari isu timezone)
 */
function parseDob(dob: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  if (!y || !mo || !d) return null;
  return new Date(y, mo - 1, d);
}

function hitungUmur(dob: string | null, refDate = new Date()): AgeParts | null {
  if (!dob) return null;

  const start = parseDob(dob);
  if (!start || Number.isNaN(start.getTime())) return null;

  const end = refDate;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function getLifeStage(age: AgeParts | null): LifeStage | null {
  if (!age) return null;

  const totalMonths = age.years * 12 + age.months;

  if (totalMonths <= 6) return "baby";
  if (totalMonths <= 18) return "young";
  return "adult";
}

/**
 * Tambahkan status (naik/turun) dan umur ternak berdasarkan log sebelumnya per RFID
 */
function attachStatusAndAge(rawLogs: RawLog[]): Task[] {
  // Urutkan per RFID lalu per waktu naik (biar hitung delta benar)
  const sorted = [...rawLogs].sort((a, b) => {
    if (a.rfid === b.rfid) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return a.rfid.localeCompare(b.rfid);
  });

  const lastWeightByRfid = new Map<string, number | null>();
  const now = new Date();

  const tasks: Task[] = [];

  for (const log of sorted) {
    const prevWeight = lastWeightByRfid.get(log.rfid) ?? null;
    const currWeight = log.weight ?? null;

    let status: StatusType = "neutral";
    let delta: number | null = null;

    if (prevWeight !== null && currWeight !== null) {
      delta = currWeight - prevWeight;
      if (currWeight > prevWeight) status = "good";
      else if (currWeight < prevWeight) status = "bad";
      else status = "neutral";
    }

    const age = hitungUmur(log.livestocks?.dob ?? null, now);
    const lifeStage = getLifeStage(age);

    const base = {
      id: log.id,
      rfid: log.rfid,
      weight: currWeight,
      weight_created_at: log.created_at,

      // taskSchema butuh string
      device: log.devices?.serial_number ?? "Tidak diketahui",

      name: log.livestocks?.name ?? null,
      breed: log.livestocks?.breed ?? null,
      dob: log.livestocks?.dob ?? null,
      sex: log.livestocks?.sex ?? null,
      species: log.livestocks?.species ?? null,
      photo_url: log.livestocks?.photo_url ?? null,

      status,
      age: age ?? { years: 0, months: 0, days: 0 },
      lifeStage,
      delta,
    };

    tasks.push(taskSchema.parse(base));
    lastWeightByRfid.set(log.rfid, currWeight);
  }

  // Biasanya UI mau yang terbaru dulu, jadi balikkan lagi (opsional)
  // Kalau kamu sudah mengurutkan DESC di query dan tidak mau balik, hapus blok ini.
  return tasks.sort(
    (a, b) =>
      new Date(b.weight_created_at).getTime() - new Date(a.weight_created_at).getTime(),
  );
}

/**
 * Ambil semua log penimbangan milik user login
 */
export async function getTasks(): Promise<Task[]> {
  noStore();

  const supabase = await getSupabaseServerReadOnly();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("getUser error:", userError);
    return [];
  }
  if (!user) return [];

  const { data, error } = await supabase
    .from("weights")
    .select(
      `
      id,
      rfid,
      weight,
      created_at,
      device_id,
      devices (
        serial_number
      ),
      livestocks!inner (
        name,
        breed,
        dob,
        sex,
        species,
        photo_url,
        user_id
      )
    `,
    )
    .eq("livestocks.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weights logs:", error);
    return [];
  }

  const rawParsed = rawLogSchema.array().safeParse(data ?? []);
  if (!rawParsed.success) {
    console.error("Invalid logs payload:", rawParsed.error);
    return [];
  }

  return attachStatusAndAge(rawParsed.data);
}

/**
 * Statistik sederhana untuk kartu ringkasan di halaman log
 */
export async function getDataLogStats() {
  noStore();

  const logs = await getTasks();

  const totalLogs = logs.length;

  const validWeights = logs
    .map((l) => l.weight)
    .filter((w): w is number => w !== null && !Number.isNaN(w));

  const highestWeight = validWeights.length > 0 ? Math.max(...validWeights) : null;

  const stuckLossCount = logs.filter(
    (l) => l.status === "neutral" || l.status === "bad",
  ).length;

  const now = new Date();
  const logsThisMonth = logs.filter((l) => {
    const d = new Date(l.weight_created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return {
    totalLogs,
    highestWeight,
    stuckLossCount,
    logsThisMonth,
  };
}
