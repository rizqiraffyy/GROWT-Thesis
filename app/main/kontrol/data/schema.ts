import { z } from "zod";

// 1 row = 1 device dari tabel `devices`
export const deviceSchema = z.object({
  id: z.string().uuid(),
  serial_number: z.string(),
  name: z.string(),

  owner_user_id: z.string().uuid(),
  owner_name: z.string().nullable(),
  owner_email: z.string().nullable(),

  status: z.enum(["pending", "active", "inactive", "revoked"]),
  is_active: z.boolean(),

  approved_at: z.string().nullable(),
  approved_by: z.string().uuid().nullable(),
  approved_by_email: z.string().nullable(),

  last_seen_at: z.string().nullable(),

  created_at: z.string(),
  updated_at: z.string(),
});

export type Device = z.infer<typeof deviceSchema>;
