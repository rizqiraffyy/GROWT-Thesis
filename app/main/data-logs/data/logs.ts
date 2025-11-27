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
  // sort dulu per rfid lalu per tanggal
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
 * Fungsi utama buat TaskPage:
 * - fetch data dari Supabase
 * - validasi raw
 * - tambahkan status, age, lifeStage
 * - return Task[] siap dipakai DataTable
 */
export async function getTasks(): Promise<Task[]> {
  const supabase = await getSupabaseServerReadOnly();

  // 1) Ambil user yang lagi login
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("getUser error:", userError);
    return [];
  }

  if (!user) {
    // tidak login → tidak ada data
    return [];
  }

  // 2) Ambil weights HANYA untuk ternak milik user ini
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
        user_id
      )
    `
    )
    .eq("livestocks.user_id", user.id) // ⬅️ kunci: cuma ternak milik user
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weights logs:", error);
    return [];
  }

  const rawParsed = rawLogSchema.array().parse(data ?? []);
  return attachStatusAndAge(rawParsed);
}

/**
 * Summary untuk card di Data Logs page
 *
 * Output:
 * {
 *   totalLogs: number
 *   highestWeight: number | null
 *   stuckLossCount: number
 *   logsThisMonth: number
 * }
 */
export async function getDataLogStats() {
  const logs = await getTasks();

  // 1) Total logs
  const totalLogs = logs.length;

  // 2) Highest recorded weight
  const highestWeight =
    logs.length > 0
      ? Math.max(
          ...logs
            .map((l) => l.weight ?? null)
            .filter((w): w is number => w !== null && !Number.isNaN(w))
        )
      : null;

  // 3) Stuck & loss weight count
  const stuckLossCount = logs.filter(
    (l) => l.status === "neutral" || l.status === "bad"
  ).length;

  // 4) Logs this month
  const now = new Date();
  const logsThisMonth = logs.filter((l) => {
    const d = new Date(l.weight_created_at);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  return {
    totalLogs,
    highestWeight: highestWeight ?? null,
    stuckLossCount,
    logsThisMonth,
  };
}
