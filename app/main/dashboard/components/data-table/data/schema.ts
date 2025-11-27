import { z } from "zod"

// 1 baris = 1 log berat ternak
// data utama dari tabel `weights` + kolom ternak dari `livestocks` (tanpa created_at)
export const taskSchema = z.object({
  // dari tabel weights
  id: z.number(),                           // weights.id (identity bigint)
  rfid: z.string(),                         // FK ke livestocks.rfid
  weight: z.coerce.number().nullable(),     // numeric → number, boleh null
  weight_created_at: z.string(),            // alias dari weights.created_at (ISO string)

  // dari tabel livestocks (tanpa created_at)
  name: z.string().nullable(),
  breed: z.string().nullable(),
  dob: z.string().nullable(),               // date → string "YYYY-MM-DD"
  sex: z.string().nullable(),               // USER-DEFINED → string
  species: z.string().nullable(),           // USER-DEFINED → string
  photo_url: z.string().nullable(),
  is_public: z.boolean().default(false),

    status: z.enum(["good", "neutral", "bad"]).nullable(),
  age: z.object({
    years: z.number(),
    months: z.number(),
    days: z.number(),
  }),
  lifeStage: z.enum(["baby", "young", "adult"]).nullable(),
  delta: z.number().nullable(),  // selisih berat dari penimbangan sebelumnya
})

export type Task = z.infer<typeof taskSchema>
