"use server";

import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { taskSchema, type Task } from "./schema";

/**
 * Bentuk data mentah dari Supabase:
 * weights + nested livestocks (yang sudah di-share / publik)
 */
const rawLogSchema = z.object({
  id: z.coerce.number(),
  rfid: z.string(),
  weight: z.coerce.number().nullable(),
  created_at: z.string(), // timestamptz → string ISO

  livestocks: z
    .object({
      name: z.string().nullable(),
      breed: z.string().nullable(),
      dob: z.string().nullable(), // "YYYY-MM-DD"
      sex: z.string().nullable(),
      species: z.string().nullable(),
      photo_url: z.string().nullable(),

      owner_email: z.string().nullable().optional(),
      is_public: z.boolean().optional(),
    })
    .nullable(),
});

export type RawLog = z.infer<typeof rawLogSchema>;

export type AgeParts = { years: number; months: number; days: number };
export type LifeStage = "baby" | "young" | "adult";
export type StatusType = "good" | "neutral" | "bad";

/**
 * Parse DOB "YYYY-MM-DD" jadi Date lokal
 * (lebih aman daripada new Date(dob) karena bisa kena efek timezone)
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

/**
 * Hitung umur dari dob → sekarang dalam bentuk:
 * { years, months, days }
 */
function calculateAgeParts(dob: string | null, refDate = new Date()): AgeParts | null {
  if (!dob) return null;

  const start = parseDob(dob);
  if (!start || Number.isNaN(start.getTime())) return null;

  const end = refDate;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // kalau hari negatif → pinjam 1 bulan
  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }

  // kalau bulan negatif → pinjam 1 tahun
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
 * Tambahkan:
 * - status: good / neutral / bad (dibandingkan berat sebelumnya per RFID)
 * - age & lifeStage (dari dob)
 *
 * sekaligus flatten nested livestocks → bentuk Task (schema final utk DataTable)
 */
function attachStatusAndAge(rawLogs: RawLog[]): Task[] {
  // sort dulu per rfid lalu per tanggal (ascending) agar delta benar
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

    const age = calculateAgeParts(log.livestocks?.dob ?? null, now);
    const lifeStage = getLifeStage(age);

    const base = {
      id: log.id,
      rfid: log.rfid,
      weight: currWeight,
      weight_created_at: log.created_at,

      name: log.livestocks?.name ?? null,
      breed: log.livestocks?.breed ?? null,
      dob: log.livestocks?.dob ?? null,
      sex: log.livestocks?.sex ?? null,
      species: log.livestocks?.species ?? null,
      photo_url: log.livestocks?.photo_url ?? null,

      owner_email: log.livestocks?.owner_email ?? null,
      is_public: log.livestocks?.is_public,

      status,
      age: age ?? { years: 0, months: 0, days: 0 },
      lifeStage,
      delta,
    };

    tasks.push(taskSchema.parse(base));
    lastWeightByRfid.set(log.rfid, currWeight);
  }

  // biasanya UI global mau terbaru dulu
  return tasks.sort(
    (a, b) =>
      new Date(b.weight_created_at).getTime() - new Date(a.weight_created_at).getTime(),
  );
}

/**
 * FULL LOGS (Halaman Global):
 * - hanya log penimbangan dari ternak yang di-share (is_public = true)
 */
export async function getTasks(): Promise<Task[]> {
  noStore();

  const supabase = await getSupabaseServerReadOnly();

  const { data, error } = await supabase
    .from("weights")
    .select(
      `
      id,
      rfid,
      weight,
      created_at,
      livestocks!inner (
        name,
        breed,
        dob,
        sex,
        species,
        photo_url,
        is_public,
        owner_email
      )
    `,
    )
    .eq("livestocks.is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching global weights logs:", error);
    return [];
  }

  const rawParsed = rawLogSchema.array().safeParse(data ?? []);
  if (!rawParsed.success) {
    console.error("Invalid global logs payload:", rawParsed.error);
    return [];
  }

  return attachStatusAndAge(rawParsed.data);
}

/**
 * LATEST PER RFID (List ternak publik):
 * - 1 baris per RFID
 * - ambil log TERBARU per ternak
 */
export async function getLatestLivestock(): Promise<Task[]> {
  noStore();

  const allTasks = await getTasks();

  const latestByRfid = new Map<string, Task>();

  for (const task of allTasks) {
    const existing = latestByRfid.get(task.rfid);

    if (!existing) {
      latestByRfid.set(task.rfid, task);
      continue;
    }

    const existingDate = new Date(existing.weight_created_at);
    const currentDate = new Date(task.weight_created_at);

    if (currentDate > existingDate) {
      latestByRfid.set(task.rfid, task);
    }
  }

  const result = Array.from(latestByRfid.values());

  // Optional: sort by name (fallback ke RFID)
  result.sort((a, b) => {
    const nameA = a.name ?? a.rfid;
    const nameB = b.name ?? b.rfid;
    return nameA.localeCompare(nameB);
  });

  return result;
}

/**
 * GLOBAL DASHBOARD METRICS
 * - digunakan untuk cards global
 * - berdasarkan semua ternak publik (is_public = true)
 */
export async function getGlobalStats() {
  noStore();

  const logs = await getTasks();
  const latest = await getLatestLivestock();

  const totalSharedLivestock = latest.length;

  const validWeights = logs
    .map((l) => l.weight)
    .filter((w): w is number => w !== null && !Number.isNaN(w));

  const globalAvgWeight =
    validWeights.length > 0
      ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length
      : null;

  const highestRecordedWeight =
    validWeights.length > 0 ? Math.max(...validWeights) : null;

  const totalLogs = logs.length;

  return {
    totalSharedLivestock,
    globalAvgWeight,
    highestRecordedWeight,
    totalLogs,
  };
}
