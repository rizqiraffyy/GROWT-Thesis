"use server";

import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerReadOnly } from "@/lib/supabase/server";
import { taskSchema, type Task } from "./schema";

/**
 * Bentuk data mentah dari Supabase:
 * weights + nested devices + nested livestocks (publik)
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
      dob: z.string().nullable(), // "YYYY-MM-DD"
      sex: z.string().nullable(),
      species: z.string().nullable(),
      photo_url: z.string().nullable(),

      // ✅ tambah vaccines (default dari DB bisa null / kosong)
      vaccines: z.array(z.string()).nullable().optional(),

      is_public: z.boolean().optional(),
    })
    .nullable(),
});

export type RawLog = z.infer<typeof rawLogSchema>;

export type AgeParts = { years: number; months: number; days: number };
export type LifeStage = "baby" | "young" | "adult";
export type StatusType = "good" | "neutral" | "bad";

function parseDob(dob: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function calculateAgeParts(dob: string | null, refDate = new Date()): AgeParts | null {
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
 * Tambahkan status/delta & umur per RFID, lalu flatten ke Task
 */
function attachStatusAndAge(rawLogs: RawLog[]): Task[] {
  // urut per RFID lalu per waktu naik (biar delta benar)
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
      status = currWeight > prevWeight ? "good" : currWeight < prevWeight ? "bad" : "neutral";
    }

    const age = calculateAgeParts(log.livestocks?.dob ?? null, now);
    const lifeStage = getLifeStage(age);

    tasks.push(
      taskSchema.parse({
        id: log.id,
        rfid: log.rfid,
        weight: currWeight,
        weight_created_at: log.created_at,

        // taskSchema butuh string (jangan null)
        device: log.devices?.serial_number ?? "Tidak diketahui",

        name: log.livestocks?.name ?? null,
        breed: log.livestocks?.breed ?? null,
        dob: log.livestocks?.dob ?? null,
        sex: log.livestocks?.sex ?? null,
        species: log.livestocks?.species ?? null,
        photo_url: log.livestocks?.photo_url ?? null,

        // ✅ inject vaccines ke Task (jika Task schema sudah ditambah field ini)
        vaccines: log.livestocks?.vaccines ?? [],

        status,
        age: age ?? { years: 0, months: 0, days: 0 },
        lifeStage,
        delta,
      }),
    );

    lastWeightByRfid.set(log.rfid, currWeight);
  }

  // halaman detail biasanya ingin terbaru dulu
  return tasks.sort(
    (a, b) => new Date(b.weight_created_at).getTime() - new Date(a.weight_created_at).getTime(),
  );
}

/**
 * Detail log ternak publik:
 * - hanya RFID tertentu
 * - hanya ternak yang sudah di-share (is_public = true)
 */
export async function getTasks(rfid: string): Promise<Task[]> {
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
      device_id,
      devices!inner (
        serial_number
      ),
      livestocks!inner (
        name,
        breed,
        dob,
        sex,
        species,
        photo_url,
        vaccines,
        is_public
      )
    `,
    )
    .eq("rfid", rfid)
    .eq("livestocks.is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public livestock detail logs:", error);
    return [];
  }

  const parsed = rawLogSchema.array().safeParse(data ?? []);
  if (!parsed.success) {
    console.error("Invalid public livestock detail logs payload:", parsed.error);
    return [];
  }

  return attachStatusAndAge(parsed.data);
}
