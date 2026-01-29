import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

/* ================= Schema ================= */

const payloadSchema = z
  .object({
    rfid: z
      .string()
      .min(1, "RFID wajib diisi")
      .transform((v) => v.trim())
      .refine((v) => v.length > 0, "RFID wajib diisi"), // biar "   " ketolak

    // Pakai coerce biar "123.4" (string) dari ESP tetap lolos jadi number
    weight: z.coerce.number().positive("Berat harus lebih dari 0"),

    device_id: z.string().uuid().optional(),

    device_serial: z
      .string()
      .optional()
      .transform((v) => v?.trim())
      .refine((v) => !v || v.length > 0, "device_serial tidak boleh kosong"),

    measured_at: z
      .string()
      .datetime({ message: "Invalid measured_at timestamp" })
      .optional(),
  })
  .refine((v) => !!(v.device_id || v.device_serial), {
    message: "Harus menyertakan device_id atau device_serial",
    path: ["_errors"],
  });


/* ================= Env ================= */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IOT_API_KEY = process.env.IOT_API_KEY!;

/* ================= Client ================= */
// Service role → bypass RLS (validasi manual)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/* ================= Helpers ================= */

function unauthorized(msg = "Tidak diizinkan") {
  return NextResponse.json({ error: msg }, { status: 401 });
}
function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}
function serverError(msg = "Terjadi kesalahan server") {
  return NextResponse.json({ error: msg }, { status: 500 });
}

/* ================= Handler ================= */

export async function POST(req: Request) {
  try {
    /* 0) Cek environment */
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !IOT_API_KEY) {
      return serverError("Konfigurasi server tidak lengkap");
    }

    /* 1) Validasi API key IoT */
    const headerKey = req.headers.get("x-growt-iot-key");
    if (!headerKey || headerKey !== IOT_API_KEY) {
      return unauthorized("API Key IoT tidak valid");
    }

    /* 2) Parse JSON */
    const json = await req.json().catch(() => null);
    if (!json) return badRequest("Body JSON tidak valid");

    /* 3) Validasi payload */
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return badRequest("Payload tidak valid", parsed.error.issues);
    }

    const { rfid, weight, device_id, device_serial, measured_at } = parsed.data;

    /* 4) Normalisasi waktu */
    const createdAt = measured_at ? new Date(measured_at) : new Date();
    if (Number.isNaN(createdAt.getTime())) {
      return badRequest("Format waktu penimbangan tidak valid");
    }

    /* 5) Cari device (wajib valid & aktif) */
    const deviceLookup = device_id
      ? supabase
          .from("devices")
          .select("id, owner_user_id, is_active, status")
          .eq("id", device_id)
          .maybeSingle()
      : supabase
          .from("devices")
          .select("id, owner_user_id, is_active, status")
          .eq("serial_number", device_serial!)
          .maybeSingle();

    const { data: device, error: deviceErr } = await deviceLookup;

    if (deviceErr) {
      console.error("[IoT] Device lookup error:", deviceErr);
      return serverError("Gagal memeriksa perangkat");
    }

    if (!device || !device.is_active || device.status !== "active") {
      return badRequest("Perangkat tidak ditemukan atau belum aktif");
    }

    /* 6) Cari RFID & cek kepemilikan (rfid harus milik owner device) */
    const { data: livestock, error: liveErr } = await supabase
      .from("livestocks")
      .select("rfid, user_id")
      .eq("rfid", rfid)
      .maybeSingle();

    if (liveErr) {
      console.error("[IoT] Livestock lookup error:", liveErr);
      return serverError("Gagal memeriksa RFID ternak");
    }

    if (!livestock) {
      return badRequest("RFID ternak tidak ditemukan");
    }

    if (!livestock.user_id || livestock.user_id !== device.owner_user_id) {
      return badRequest("RFID bukan milik pemilik perangkat");
    }

    /* 7) Simpan data berat */
    const { data: inserted, error: insertErr } = await supabase
      .from("weights")
      .insert({
        rfid,
        weight,
        device_id: device.id,
        created_at: createdAt.toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[IoT] Insert weight error:", insertErr);
      return serverError("Gagal menyimpan data berat");
    }

    /* 8) Update last_seen_at (opsional, gagal tidak menggagalkan request) */
    const { error: seenErr } = await supabase
      .from("devices")
      .update({ last_seen_at: createdAt.toISOString() })
      .eq("id", device.id);

    if (seenErr) {
      console.warn("[IoT] Gagal update last_seen_at:", seenErr);
    }

    /* 9) Sukses */
    return NextResponse.json(
      {
        sukses: true,
        id_berat: inserted.id,
        pesan: "Data berat berhasil disimpan",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[IoT] Unexpected error:", err);
    return serverError("Kesalahan server tidak terduga");
  }
}
