import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs"; 

const payloadSchema = z
  .object({
    rfid: z.string().min(1),
    weight: z.number().positive(),

    // IoT boleh kirim salah satu
    device_id: z.string().uuid().optional(),
    device_serial: z.string().min(1).optional(),

    measured_at: z.string().datetime().optional(),
  })
  .refine((v) => v.device_id || v.device_serial, {
    message: "Provide device_id or device_serial",
    path: ["device_id"],
  });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IOT_API_KEY = process.env.IOT_API_KEY!;

// Client server pakai service_role (bypass RLS) → proteksi endpoint
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function unauthorized(msg = "Unauthorized") {
  return NextResponse.json({ error: msg }, { status: 401 });
}
function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}
function forbidden(msg: string) {
  return NextResponse.json({ error: msg }, { status: 403 });
}
function serverError(msg: string) {
  return NextResponse.json({ error: msg }, { status: 500 });
}

export async function POST(req: Request) {
  try {
    // 0) Misconfig check
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !IOT_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: missing env" },
        { status: 500 },
      );
    }

    // 1) API key check 
    const headerKey = req.headers.get("x-growt-iot-key");
    if (!headerKey || headerKey !== IOT_API_KEY) return unauthorized();

    // 2) Parse JSON body
    const json = await req.json().catch(() => null);
    if (!json) return badRequest("Invalid JSON body");

    // 3) Validate payload
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return badRequest("Invalid payload", parsed.error.issues);
    }

    const { rfid, weight, device_id, device_serial, measured_at } = parsed.data;

    // 4) Normalize timestamp
    const createdAt = measured_at ? new Date(measured_at) : new Date();
    if (Number.isNaN(createdAt.getTime())) {
      return badRequest("Invalid measured_at timestamp");
    }

    // 5) Lookup device (WAJIB, device_id atau serial)
    const deviceLookup = device_id
      ? supabase
          .from("devices")
          .select("id, is_active, status")
          .eq("id", device_id)
          .maybeSingle()
      : supabase
          .from("devices")
          .select("id, is_active, status")
          .eq("serial_number", device_serial!)
          .maybeSingle();

    const { data: device, error: deviceErr } = await deviceLookup;

    if (deviceErr) {
      console.error("[IoT] Device lookup error:", deviceErr);
      return serverError("Device lookup failed");
    }

    // Pastikan device benar & aktif
    if (!device || !device.is_active || device.status !== "active") {
      return forbidden("Device not found or not active");
    }

    // 6) Pastikan RFID exist 
    const { data: livestock, error: liveErr } = await supabase
      .from("livestocks")
      .select("rfid")
      .eq("rfid", rfid)
      .maybeSingle();

    if (liveErr) {
      console.error("[IoT] Livestock lookup error:", liveErr);
      return serverError("Livestock lookup failed");
    }
    if (!livestock) {
      return badRequest("RFID not found");
    }

    // 7) Insert weight
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
      return serverError("Failed to insert weight");
    }

    // 8) Update last_seen_at 
    const { error: seenErr } = await supabase
      .from("devices")
      .update({ last_seen_at: createdAt.toISOString() })
      .eq("id", device.id);

    if (seenErr) {
      console.warn("[IoT] last_seen_at update failed (ignored):", seenErr);
    }

    // 9) OK
    return NextResponse.json(
      {
        success: true,
        weight_id: inserted.id,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[IoT] Unexpected error:", err);
    return serverError("Unexpected server error");
  }
}
