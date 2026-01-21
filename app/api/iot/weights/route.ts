// app/api/iot/weights/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const payloadSchema = z.object({
  rfid: z.string().min(1),
  weight: z.number().positive(),

  // IoT boleh kirim salah satu:
  device_id: z.string().uuid().optional(),
  device_serial: z.string().min(1).optional(),

  // optional: waktu penimbangan dari alat
  measured_at: z.string().datetime().optional(),
});

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IOT_API_KEY = process.env.IOT_API_KEY;

// Client khusus server → pakai service_role, tanpa cookies/auth user
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    // 1) Cek misconfig dulu
    if (!IOT_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: missing IOT_API_KEY" },
        { status: 500 },
      );
    }

    // 2) Cek API key dari IoT
    const headerKey = req.headers.get("x-growt-iot-key");
    if (headerKey !== IOT_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3) Ambil & validasi payload
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { rfid, weight, device_id, device_serial, measured_at } = parsed.data;

    // 4) Tentukan device_id final (dari device_id / serial_number)
    let finalDeviceId: string | null = null;

    if (device_id) {
      finalDeviceId = device_id;
    } else if (device_serial) {
      const { data: device, error: deviceErr } = await supabase
        .from("devices")
        .select("id, is_active, status")
        .eq("serial_number", device_serial)
        .maybeSingle();

      if (deviceErr) {
        console.error("[IoT] Device lookup error:", deviceErr);
        return NextResponse.json(
          { error: "Device lookup failed" },
          { status: 500 },
        );
      }

      if (!device || !device.is_active || device.status !== "active") {
        return NextResponse.json(
          { error: "Device not found or not active" },
          { status: 403 },
        );
      }

      finalDeviceId = device.id;
    }

    // 5) Tentukan created_at dari measured_at / now()
    const createdAt = measured_at ? new Date(measured_at) : new Date();
    if (Number.isNaN(createdAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid measured_at timestamp" },
        { status: 400 },
      );
    }

    // 6) Insert ke tabel weights
    const { data, error: insertErr } = await supabase
      .from("weights")
      .insert({
        rfid,
        weight,
        device_id: finalDeviceId,
        created_at: createdAt.toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[IoT] Insert weight error:", insertErr);
      return NextResponse.json(
        { error: "Failed to insert weight" },
        { status: 500 },
      );
    }

    // 7) Update last_seen_at device (optional, tapi bagus)
    if (finalDeviceId) {
      await supabase
        .from("devices")
        .update({ last_seen_at: createdAt.toISOString() })
        .eq("id", finalDeviceId);
    }

    // 8) Response OK
    return NextResponse.json(
      {
        success: true,
        weight_id: data.id,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[IoT] Unexpected error in weights endpoint:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
