// app/main/tasks/data/logs.ts
//"use server";

import { z } from "zod";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { taskSchema, Task } from "./schema";

/**
 * Bentuk data mentah dari Supabase:
 * weights + nested livestocks
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
    })
    .nullable(),
});

export type RawLog = z.infer<typeof rawLogSchema>;

export type AgeParts = {
  years: number;
  months: number;
  days: number;
};

export type LifeStage = "baby" | "young" | "adult";
export type StatusType = "good" | "neutral" | "bad";

/**
 * Hitung umur dari dob → sekarang dalam bentuk:
 * { years, months, days }
 */
function calculateAgeParts(
  dob: string | null,
  refDate = new Date()
): AgeParts | null {
  if (!dob) return null;

  const start = new Date(dob);
  const end = refDate;

  if (Number.isNaN(start.getTime())) return null;

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
 * - age: { years, months, days } dari dob
 * - lifeStage: bayi / remaja / dewasa (dari age)
 *
 * dan flatten nested livestocks → bentuk Task (schema final utk DataTable)
 */
function attachStatusAndAge(rawLogs: RawLog[]): Task[] {
  // sort dulu per rfid lalu per tanggal (ascending)
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

      status,
      age: age ?? { years: 0, months: 0, days: 0 },
      lifeStage,
      delta,
    };

    const parsed = taskSchema.parse(base);
    tasks.push(parsed);

    lastWeightByRfid.set(log.rfid, currWeight);
  }

  return tasks;
}

/**
 * FULL LOGS (Data Logs page):
 * - semua penimbangan
 */
export async function getTasks(): Promise<Task[]> {
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
        is_public
      )
    `
    )
    .eq("livestocks.is_public", true) // ⬅️ hanya ternak yang sudah di-share
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weights logs:", error);
    return [];
  }

  const rawParsed = rawLogSchema.array().parse(data ?? []);
  return attachStatusAndAge(rawParsed);
}

/**
 * LATEST PER RFID (Livestock List):
 * - 1 baris per RFID
 * - pakai log TERBARU per ternak
 * - delta tetap = berat_terakhir - berat_sebelumnya
 */
export async function getLatestLivestock(): Promise<Task[]> {
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
 * - digunakan untuk Section Cards Global
 * - berdasarkan semua ternak publik (is_public = true)
 */
export async function getGlobalStats() {
  // 1) Semua logs publik
  const logs = await getTasks();

  // 2) Semua ternak publik (RFID unik)
  const latest = await getLatestLivestock();

  // --- 1. Total Shared Livestock ---
  const totalSharedLivestock = latest.length;

  // --- 2. Global Average Weight ---
  const validWeights = logs
    .map((l) => l.weight)
    .filter((w): w is number => w !== null && !Number.isNaN(w));

  const globalAvgWeight =
    validWeights.length > 0
      ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length
      : null;

  // --- 3. Highest Recorded Weight ---
  const highestRecordedWeight =
    validWeights.length > 0 ? Math.max(...validWeights) : null;

  // --- 4. Total Logs Submitted ---
  const totalLogs = logs.length;

  return {
    totalSharedLivestock,
    globalAvgWeight,
    highestRecordedWeight,
    totalLogs,
  };
}