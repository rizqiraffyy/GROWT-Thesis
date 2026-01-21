// app/main/tasks/data/logs.ts
"use server";

import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { taskSchema, type Task } from "./schema";

/* =========================
   Schema mentah Supabase
========================= */

const rawLogSchema = z.object({
  id: z.coerce.number(),
  rfid: z.string(),
  weight: z.coerce.number().nullable(),
  created_at: z.string(),
  livestocks: z
    .object({
      user_id: z.string().nullable(),
      name: z.string().nullable(),
      breed: z.string().nullable(),
      dob: z.string().nullable(),
      sex: z.string().nullable(),
      species: z.string().nullable(),
      photo_url: z.string().nullable(),
      is_public: z.boolean().nullable(),
    })
    .nullable(),
});

const rawLivestockSchema = z.object({
  rfid: z.string(),
  user_id: z.string().nullable(),
  name: z.string().nullable(),
  breed: z.string().nullable(),
  dob: z.string().nullable(),
  sex: z.string().nullable(),
  species: z.string().nullable(),
  photo_url: z.string().nullable(),
  is_public: z.boolean().nullable(),
  created_at: z.string(),
});

type RawLog = z.infer<typeof rawLogSchema>;
type RawLivestock = z.infer<typeof rawLivestockSchema>;

export type AgeParts = { years: number; months: number; days: number };
export type LifeStage = "baby" | "young" | "adult";
export type StatusType = "good" | "neutral" | "bad";

/* =========================
   Helper tanggal & umur
========================= */

function toDate(ts: string): Date {
  return new Date(ts.includes(" ") ? ts.replace(" ", "T") : ts);
}

function parseDobLocal(dob: string): Date | null {
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function calculateAgeParts(dob: string | null, refDate = new Date()): AgeParts | null {
  if (!dob) return null;

  const start = parseDobLocal(dob);
  if (!start) return null;

  const end = refDate;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
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

function monthKeyFromISO(iso: string): string {
  const d = toDate(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthKeyToDate(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function dateToMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthRange(minKey: string, maxKey: string): string[] {
  const start = monthKeyToDate(minKey);
  const end = monthKeyToDate(maxKey);
  const keys: string[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    keys.push(dateToMonthKey(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return keys;
}

/* =========================
   Attach status/delta/age
========================= */

function attachStatusAndAge(rawLogs: RawLog[]): Task[] {
  // delta perlu urut naik per rfid
  const sorted = [...rawLogs].sort((a, b) => {
    if (a.rfid === b.rfid) return toDate(a.created_at).getTime() - toDate(b.created_at).getTime();
    return a.rfid.localeCompare(b.rfid);
  });

  const lastWeightByRfid = new Map<string, number | null>();
  const now = new Date();

  const out: Task[] = [];

  for (const log of sorted) {
    const prev = lastWeightByRfid.get(log.rfid) ?? null;
    const curr = log.weight ?? null;

    let status: StatusType = "neutral";
    let delta: number | null = null;

    if (prev !== null && curr !== null) {
      delta = curr - prev;
      status = curr > prev ? "good" : curr < prev ? "bad" : "neutral";
    }

    const age = calculateAgeParts(log.livestocks?.dob ?? null, now);
    const lifeStage = getLifeStage(age);

    out.push(
      taskSchema.parse({
        id: log.id,
        rfid: log.rfid,
        weight: curr,
        weight_created_at: log.created_at,

        name: log.livestocks?.name ?? null,
        breed: log.livestocks?.breed ?? null,
        dob: log.livestocks?.dob ?? null,
        sex: log.livestocks?.sex ?? null,
        species: log.livestocks?.species ?? null,
        photo_url: log.livestocks?.photo_url ?? null,
        is_public: log.livestocks?.is_public ?? false,

        status,
        age: age ?? { years: 0, months: 0, days: 0 },
        lifeStage,
        delta,
      }),
    );

    lastWeightByRfid.set(log.rfid, curr);
  }

  // untuk UI log biasanya terbaru dulu
  return out.sort((a, b) => toDate(b.weight_created_at).getTime() - toDate(a.weight_created_at).getTime());
}

/* =========================
   Query data dasar (sekali)
========================= */

async function getUserOrEmpty() {
  const supabase = await getSupabaseServerReadOnly();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) console.error("getUser error:", error);
  return { supabase, user };
}

/* =========================
   1) FULL LOGS (Data Logs)
========================= */

export async function getTasks(): Promise<Task[]> {
  noStore();

  const { supabase, user } = await getUserOrEmpty();
  if (!user) return [];

  const { data, error } = await supabase
    .from("weights")
    .select(
      `
      id,
      rfid,
      weight,
      created_at,
      livestocks!inner (
        user_id,
        name,
        breed,
        dob,
        sex,
        species,
        photo_url,
        is_public
      )
    `,
    )
    .eq("livestocks.user_id", user.id)
    .order("created_at", { ascending: true }); // penting untuk delta

  if (error) {
    console.error("Error fetching weights logs:", error);
    return [];
  }

  const parsed = rawLogSchema.array().safeParse(data ?? []);
  if (!parsed.success) {
    console.error("Invalid weights payload:", parsed.error);
    return [];
  }

  return attachStatusAndAge(parsed.data);
}

/* =========================
   2) LATEST PER RFID (List)
========================= */

export async function getLatestLivestock(): Promise<Task[]> {
  noStore();

  const { supabase, user } = await getUserOrEmpty();
  if (!user) return [];

  const { data: livestockData, error: livestockErr } = await supabase
    .from("livestocks")
    .select(
      `
      rfid,
      user_id,
      name,
      breed,
      dob,
      sex,
      species,
      photo_url,
      is_public,
      created_at
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (livestockErr) {
    console.error("Fetch livestocks error:", livestockErr);
    return [];
  }

  const lvParsed = rawLivestockSchema.array().safeParse(livestockData ?? []);
  if (!lvParsed.success) {
    console.error("Invalid livestocks payload:", lvParsed.error);
    return [];
  }

  const livestocks: RawLivestock[] = lvParsed.data;

  // ambil logs (sudah ada delta/status)
  const logs = await getTasks();
  const latestByRfid = new Map<string, Task>();

  for (const t of logs) {
    const existing = latestByRfid.get(t.rfid);
    if (!existing) latestByRfid.set(t.rfid, t);
    else if (toDate(t.weight_created_at) > toDate(existing.weight_created_at)) latestByRfid.set(t.rfid, t);
  }

  // merge: semua ternak harus tampil walau belum ada log
  const now = new Date();
  let syntheticId = -1;

  const result: Task[] = livestocks.map((lv) => {
    const existing = latestByRfid.get(lv.rfid);
    if (existing) return existing;

    const age = calculateAgeParts(lv.dob, now);
    const lifeStage = getLifeStage(age);

    return taskSchema.parse({
      id: syntheticId--,
      rfid: lv.rfid,
      weight: null,
      weight_created_at: lv.created_at,

      name: lv.name ?? null,
      breed: lv.breed ?? null,
      dob: lv.dob ?? null,
      sex: lv.sex ?? null,
      species: lv.species ?? null,
      photo_url: lv.photo_url ?? null,
      is_public: lv.is_public ?? false,

      status: "neutral" as StatusType,
      age: age ?? { years: 0, months: 0, days: 0 },
      lifeStage,
      delta: null,
    });
  });

  // sort by name
  result.sort((a, b) => (a.name ?? a.rfid).localeCompare(b.name ?? b.rfid));
  return result;
}

/* =========================
   3) DASHBOARD MONTHLY SERIES
========================= */

export type DashboardMonthlyPoint = {
  monthKey: string; // "2024-06"
  label: string;    // "Jun 2024"
  totalLivestock: number;
  avgWeight: number | null;
  stuckLossCount: number;

  totalLivestockPct: number;
  avgWeightPct: number;
  stuckLossPct: number;

  healthScore: number;
  healthScoreDelta: number;
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export async function getDashboardMonthlySeries(maxMonths: number | "all" = 12): Promise<DashboardMonthlyPoint[]> {
  noStore();

  const { supabase, user } = await getUserOrEmpty();
  if (!user) return [];

  // A) ambil semua ternak (buat herd size)
  const { data: livestockData, error: livestockErr } = await supabase
    .from("livestocks")
    .select(`rfid, created_at`)
    .eq("user_id", user.id);

  if (livestockErr) {
    console.error("Fetch livestocks error (series):", livestockErr);
    return [];
  }

  const lvMiniSchema = z.object({ rfid: z.string(), created_at: z.string() });
  const lvMiniParsed = lvMiniSchema.array().safeParse(livestockData ?? []);
  if (!lvMiniParsed.success) {
    console.error("Invalid livestocks series payload:", lvMiniParsed.error);
    return [];
  }

  const lvMini = lvMiniParsed.data;
  if (lvMini.length === 0) return [];

  const livestockMonthKeys = lvMini.map((lv) => monthKeyFromISO(lv.created_at));
  const firstKey = [...livestockMonthKeys].sort()[0];

  // B) ambil semua log weights (sekali) untuk series
  const { data: weightData, error: weightErr } = await supabase
    .from("weights")
    .select(
      `
      id,
      rfid,
      weight,
      created_at,
      livestocks!inner ( user_id )
    `,
    )
    .eq("livestocks.user_id", user.id)
    .order("created_at", { ascending: true }); // penting untuk delta

  if (weightErr) {
    console.error("Fetch weights error (series):", weightErr);
    return [];
  }

  const weightsMiniSchema = z.object({
    id: z.coerce.number(),
    rfid: z.string(),
    weight: z.coerce.number().nullable(),
    created_at: z.string(),
    livestocks: z.object({ user_id: z.string().nullable() }).nullable(),
  });

  const wParsed = weightsMiniSchema.array().safeParse(weightData ?? []);
  if (!wParsed.success) {
    console.error("Invalid weights series payload:", wParsed.error);
    return [];
  }

  const rawWeights = wParsed.data;
  if (rawWeights.length === 0) return [];

  // C) hitung status/delta per rfid untuk kebutuhan stuckLossCount bulanan
  const lastWeight = new Map<string, number | null>();

  // Map monthKey -> Map rfid -> latest status+weight within that month
  const latestByMonth = new Map<string, Map<string, { weight: number | null; status: StatusType; created_at: string }>>();
  const hasLogsByMonth = new Set<string>();
  let lastLogKey = firstKey;

  for (const row of rawWeights) {
    const monthKey = monthKeyFromISO(row.created_at);
    hasLogsByMonth.add(monthKey);
    lastLogKey = monthKey;

    const prev = lastWeight.get(row.rfid) ?? null;
    const curr = row.weight ?? null;

    let status: StatusType = "neutral";
    if (prev !== null && curr !== null) {
      status = curr > prev ? "good" : curr < prev ? "bad" : "neutral";
    }

    lastWeight.set(row.rfid, curr);

    let rfidMap = latestByMonth.get(monthKey);
    if (!rfidMap) {
      rfidMap = new Map();
      latestByMonth.set(monthKey, rfidMap);
    }

    const existing = rfidMap.get(row.rfid);
    if (!existing || toDate(row.created_at) > toDate(existing.created_at)) {
      rfidMap.set(row.rfid, { weight: curr, status, created_at: row.created_at });
    }
  }

  // D) bangun range bulan kontinyu
  const fullRange = buildMonthRange(firstKey, lastLogKey);
  const monthKeys =
    maxMonths === "all" ? fullRange : fullRange.slice(Math.max(0, fullRange.length - maxMonths));

  // E) build point per bulan
  const points: DashboardMonthlyPoint[] = monthKeys.map((monthKey) => {
    const herdSize = livestockMonthKeys.filter((k) => k <= monthKey).length;

    const rfidMap = latestByMonth.get(monthKey);
    const list = rfidMap ? Array.from(rfidMap.values()) : [];

    const weights = list.map((x) => x.weight).filter((w): w is number => typeof w === "number" && !Number.isNaN(w));
    const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : null;

    const stuckLossCount = list.filter((x) => x.status === "neutral" || x.status === "bad").length;
    const stuckLossPct = herdSize > 0 ? (stuckLossCount / herdSize) * 100 : 0;

    const label = monthKeyToDate(monthKey).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });

    return {
      monthKey,
      label,
      totalLivestock: herdSize,
      avgWeight,
      stuckLossCount,
      totalLivestockPct: 0,
      avgWeightPct: 0,
      stuckLossPct,
      healthScore: 0,
      healthScoreDelta: 0,
    };
  });

  // F) carry-forward avgWeight untuk bulan tanpa log
  let lastNonNullAvg: number | null = null;
  for (const p of points) {
    if (hasLogsByMonth.has(p.monthKey) && p.avgWeight != null) {
      lastNonNullAvg = p.avgWeight;
    } else if (!hasLogsByMonth.has(p.monthKey) && lastNonNullAvg != null) {
      p.avgWeight = lastNonNullAvg;
    }
  }

  // G) hitung MoM + healthScore
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = i > 0 ? points[i - 1] : null;
    const hasLogs = hasLogsByMonth.has(curr.monthKey);

    // totalLivestock MoM
    curr.totalLivestockPct =
      prev && prev.totalLivestock > 0
        ? ((curr.totalLivestock - prev.totalLivestock) / prev.totalLivestock) * 100
        : 0;

    // avgWeight MoM: hanya kalau bulan ini ada log beneran
    curr.avgWeightPct =
      hasLogs && prev && curr.avgWeight != null && prev.avgWeight != null && prev.avgWeight !== 0
        ? ((curr.avgWeight - prev.avgWeight) / prev.avgWeight) * 100
        : 0;

    // health score (0-100)
    const growthDown = curr.totalLivestockPct < 0 ? -curr.totalLivestockPct : 0;
    const weightDown = curr.avgWeightPct < 0 ? -curr.avgWeightPct : 0;

    const riskGrowth = clamp01(growthDown / 20);
    const riskWeight = clamp01(weightDown / 10);
    const riskStuck = clamp01(curr.stuckLossPct / 40);

    const risk = 0.4 * riskGrowth + 0.3 * riskWeight + 0.3 * riskStuck;
    curr.healthScore = Math.max(0, 100 * (1 - risk));
    curr.healthScoreDelta = prev ? curr.healthScore - prev.healthScore : 0;
  }

  return points;
}

/* =========================
   4) DASHBOARD CARDS (ringkas)
========================= */

export type DashboardStats = {
  totalLivestock: number;
  totalLivestockDiff: number;
  totalLivestockPct: number | null;

  avgWeight: number | null;
  avgWeightDiff: number | null;
  avgWeightPct: number | null;

  stuckLossCount: number;
  stuckLossDiff: number;
  stuckLossPct: number | null;

  healthScoreCurrent: number | null;
  healthScorePrev: number | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  noStore();

  const series = await getDashboardMonthlySeries(3);

  const empty: DashboardStats = {
    totalLivestock: 0,
    totalLivestockDiff: 0,
    totalLivestockPct: null,

    avgWeight: null,
    avgWeightDiff: null,
    avgWeightPct: null,

    stuckLossCount: 0,
    stuckLossDiff: 0,
    stuckLossPct: null,

    healthScoreCurrent: null,
    healthScorePrev: null,
  };

  if (series.length === 0) return empty;

  const current = series[series.length - 1];
  const prev = series.length >= 2 ? series[series.length - 2] : null;

  const totalLivestock = current.totalLivestock;
  const totalLivestockDiff = prev ? totalLivestock - prev.totalLivestock : 0;
  const totalLivestockPct = prev ? current.totalLivestockPct : null;

  const avgWeight = current.avgWeight ?? null;
  const avgWeightDiff =
    prev && avgWeight != null && prev.avgWeight != null ? avgWeight - prev.avgWeight : null;
  const avgWeightPct = prev ? current.avgWeightPct : null;

  const stuckLossCount = current.stuckLossCount;
  const stuckLossDiff = prev ? stuckLossCount - prev.stuckLossCount : 0;
  const stuckLossPct = totalLivestock > 0 ? current.stuckLossPct : null;

  const healthScoreCurrent = current.healthScore ?? null;
  const healthScorePrev = prev ? prev.healthScore : null;

  return {
    totalLivestock,
    totalLivestockDiff,
    totalLivestockPct,

    avgWeight,
    avgWeightDiff,
    avgWeightPct,

    stuckLossCount,
    stuckLossDiff,
    stuckLossPct,

    healthScoreCurrent,
    healthScorePrev,
  };
}
