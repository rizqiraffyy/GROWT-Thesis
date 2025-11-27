import { z } from "zod";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { taskSchema, Task } from "./schema";

const rawLogSchema = z.object({
  id: z.coerce.number(),
  rfid: z.string(),
  weight: z.coerce.number().nullable(),
  created_at: z.string(),
  livestocks: z
    .object({
      name: z.string().nullable(),
      breed: z.string().nullable(),
      dob: z.string().nullable(),
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

function attachStatusAndAge(rawLogs: RawLog[]): Task[] {
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
 * Hanya ambil logs:
 * - untuk RFID tertentu
 * - dan hanya kalau ternaknya sudah is_public = true
 */
export async function getTasks(rfid: string): Promise<Task[]> {
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
        photo_url
      )
    `
    )
    .eq("rfid", rfid)
    .eq("livestocks.is_public", true) // ⬅️ cuma ternak yang sudah public
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weights logs:", error);
    return [];
  }

  const rawParsed = rawLogSchema.array().parse(data ?? []);
  return attachStatusAndAge(rawParsed);
}
