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
      user_id: z.string().nullable(),
      name: z.string().nullable(),
      breed: z.string().nullable(),
      dob: z.string().nullable(), // "YYYY-MM-DD"
      sex: z.string().nullable(),
      species: z.string().nullable(),
      photo_url: z.string().nullable(),
      is_public: z.boolean().nullable(),
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
      is_public: log.livestocks?.is_public ?? false,

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
    // tidak login → tidak ada log
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
        user_id,
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
    .eq("livestocks.user_id", user.id) // ⬅️ filter cuma ternak milik user
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

// Batas Section cards (dashboard)

// helper: konversi tanggal → key bulan "YYYY-MM"
function getMonthKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${m.toString().padStart(2, "0")}`;
}

export type DashboardStats = {
  totalLivestock: number;
  totalLivestockDiff: number;
  totalLivestockPct: number | null;

  avgWeight: number | null;
  avgWeightDiff: number | null;
  avgWeightPct: number | null;

  stuckLossCount: number;
  stuckLossDiff: number;
  stuckLossPct: number | null; // share-of-herd bulan ini

  // Health Score (bukan growth overview lagi)
  healthScoreCurrent: number | null; // bulan ini
  healthScorePrev: number | null;    // bulan lalu
};

export async function getDashboardStats(): Promise<DashboardStats> {
  // Pakai timeseries bulanan sebagai sumber kebenaran
  // Ambil maksimal 3 bulan terakhir (buat hitung Diff & perbandingan)
  const series = await getDashboardMonthlySeries(3);

  if (series.length === 0) {
    return {
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
  }

  const current = series[series.length - 1];
  const prev = series.length >= 2 ? series[series.length - 2] : null;

  // --- Total livestock ---
  const totalLivestock = current.totalLivestock;
  const totalLivestockDiff = prev
    ? totalLivestock - prev.totalLivestock
    : 0;

  const totalLivestockPct = prev ? current.totalLivestockPct : null;

  // --- Average weight (kg) ---
  const avgWeight = current.avgWeight ?? null;

  const avgWeightDiff =
    avgWeight != null && prev?.avgWeight != null
      ? avgWeight - prev.avgWeight
      : null;

  const avgWeightPct =
    prev &&
    current.avgWeight != null &&
    prev?.avgWeight != null &&
    prev.avgWeight !== 0
      ? current.avgWeightPct
      : null;

  // --- Stuck / loss (jumlah & share) ---
  const stuckLossCount = current.stuckLossCount;
  const stuckLossDiff = prev
    ? stuckLossCount - prev.stuckLossCount
    : 0;

  const stuckLossPct =
    current.totalLivestock > 0 ? current.stuckLossPct : null;

  // --- Health Score ---
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

// Batas Chart area interactive (dashboard)

export type DashboardMonthlyPoint = {
  monthKey: string;      // "2024-06"
  label: string;         // "Jun 2024"
  totalLivestock: number;
  avgWeight: number | null;
  stuckLossCount: number;

  totalLivestockPct: number; // MoM % jumlah ternak
  avgWeightPct: number;      // MoM % rata-rata berat
  stuckLossPct: number;      // % ternak stuck/loss dari total ternak bulan tsb

  healthScore: number;       // nilai kesehatan 0–100 (absolute)
  healthScoreDelta: number;  // Δ healthScore vs bulan sebelumnya
};

/**
 * Timeseries bulanan untuk KPI dashboard:
 * - totalLivestockPct  → MoM jumlah ternak
 * - avgWeightPct       → MoM rata-rata berat
 * - stuckLossPct       → % stuck/loss dari total ternak bulan tsb
 * - healthScore        → indeks 0..100 berbasis:
 *      - share ternak dengan status "good"
 *      - share ternak stuck/loss
 *      - pertumbuhan rata-rata berat (avgWeightPct)
 *
 * maxMonths: berapa bulan terakhir yang diambil (default 12).
 */
function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export async function getDashboardMonthlySeries(
  maxMonths: number | "all" = 12
): Promise<DashboardMonthlyPoint[]> {
  const allTasks = await getTasks(); // sudah ada status, delta, dll

  // 1) Group per month -> per RFID -> latest Task
  const latestByMonthAndRfid = new Map<string, Map<string, Task>>();

  for (const task of allTasks) {
    const monthKey = getMonthKey(task.weight_created_at);

    let rfidMap = latestByMonthAndRfid.get(monthKey);
    if (!rfidMap) {
      rfidMap = new Map<string, Task>();
      latestByMonthAndRfid.set(monthKey, rfidMap);
    }

    const existing = rfidMap.get(task.rfid);
    if (!existing) {
      rfidMap.set(task.rfid, task);
      continue;
    }

    const existingDate = new Date(existing.weight_created_at);
    const currentDate = new Date(task.weight_created_at);

    if (currentDate > existingDate) {
      rfidMap.set(task.rfid, task);
    }
  }

  // 2) Hitung level per bulan (belum % & healthScore)
  const monthKeys = Array.from(latestByMonthAndRfid.keys()).sort();

  const monthly: DashboardMonthlyPoint[] = monthKeys.map((monthKey) => {
    const rfidMap = latestByMonthAndRfid.get(monthKey)!;
    const list = Array.from(rfidMap.values());

    const totalLivestock = rfidMap.size;

    const weights = list
      .map((t) => t.weight)
      .filter(
        (w): w is number =>
          typeof w === "number" && !Number.isNaN(w)
      );

    const avgWeight =
      weights.length > 0
        ? weights.reduce((acc, w) => acc + w, 0) / weights.length
        : null;

    const stuckLossCount = list.filter(
      (t) =>
        t.delta != null &&
        (t.status === "neutral" || t.status === "bad")
    ).length;

    const [year, month] = monthKey.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "en-US",
      { month: "short", year: "numeric" }
    );

    return {
      monthKey,
      label,
      totalLivestock,
      avgWeight,
      stuckLossCount,
      totalLivestockPct: 0,
      avgWeightPct: 0,
      stuckLossPct: 0,
      healthScore: 0,
      healthScoreDelta: 0,
    };
  });

  if (monthly.length === 0) return [];

  // 3) Hitung % MoM & healthScore per bulan
  for (let i = 0; i < monthly.length; i++) {
    const curr = monthly[i];
    const prev = i > 0 ? monthly[i - 1] : null;

    // --- Total livestock MoM (% perubahan headcount) ---
    if (prev && prev.totalLivestock > 0) {
      const totalDiff = curr.totalLivestock - prev.totalLivestock;
      curr.totalLivestockPct = (totalDiff / prev.totalLivestock) * 100;
    } else {
      curr.totalLivestockPct = 0;
    }

    // --- Avg weight MoM (% perubahan rata-rata berat) ---
    if (
      prev &&
      curr.avgWeight != null &&
      prev.avgWeight != null &&
      prev.avgWeight !== 0
    ) {
      curr.avgWeightPct =
        ((curr.avgWeight - prev.avgWeight) / prev.avgWeight) * 100;
    } else {
      curr.avgWeightPct = 0;
    }

    // --- Stuck & loss share (% dari total ternak bulan tsb) ---
    if (curr.totalLivestock > 0) {
      curr.stuckLossPct =
        (curr.stuckLossCount / curr.totalLivestock) * 100;
    } else {
      curr.stuckLossPct = 0;
    }

    // --- Health score absolute (0–100) ---
    // Penalize: penurunan headcount, penurunan avg weight, dan share stuck/loss
    const growthDown = curr.totalLivestockPct < 0 ? -curr.totalLivestockPct : 0; // hanya kalau turun
    const weightDown = curr.avgWeightPct < 0 ? -curr.avgWeightPct : 0;          // hanya kalau turun

    const riskGrowth = clamp01(growthDown / 20);    // -20% headcount = risk 1.0
    const riskWeight = clamp01(weightDown / 10);    // -10% avg weight = risk 1.0
    const riskStuck  = clamp01(curr.stuckLossPct / 40); // 40% stuck/loss = risk 1.0

    const risk =
      0.4 * riskGrowth +
      0.3 * riskWeight +
      0.3 * riskStuck;

    curr.healthScore = Math.max(0, 100 * (1 - risk));

    // --- Health score delta (yg kamu mau tampil di chart) ---
    if (prev) {
      curr.healthScoreDelta = curr.healthScore - prev.healthScore;
    } else {
      curr.healthScoreDelta = 0;
    }
  }

  // 4) Potong ke maxMonths terakhir
  if (maxMonths === "all") {
    return monthly;
  }


  const sliced =
    monthly.length > maxMonths
      ? monthly.slice(monthly.length - maxMonths)
      : monthly;

  return sliced;
}