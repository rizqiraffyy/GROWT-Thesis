"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/dark-mode"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// catatan: samakan skema dengan API → trim + lowercase
const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Masukkan email yang valid")
    .transform((v) => v.trim().toLowerCase()),
})

type ForgotData = z.infer<typeof forgotSchema>

// catatan: typed response
interface ForgotPasswordApiResponse {
  error?: string
  success?: boolean
  message?: string
}

export function ForgotPasswordForm(props: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
    mode: "onChange",
  })

  const onSubmit = async ({ email }: ForgotData) => {
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      let json: ForgotPasswordApiResponse | null = null
      try {
        json = (await res.json()) as ForgotPasswordApiResponse
      } catch {
        json = null
      }

      if (!res.ok) {
        throw new Error(json?.error || "Gagal mengirim email reset kata sandi.")
      }

      // catatan: sesuai API — tetap sukses meski email tidak terdaftar
      setSuccessMessage(
        "Kalau email kamu terdaftar, kami sudah mengirim tautan reset kata sandi ke inbox kamu.",
      )

      reset()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kendala."
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      {/* toggle tema di kanan atas */}
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Lupa kata sandi?</CardTitle>
          <CardDescription>
            Masukkan email yang terdaftar, nanti kami kirim tautan untuk reset kata sandi.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@mail.com"
                  {...register("email")}
                  className={cn(
                    errors.email && "border-red-500 focus-visible:ring-red-500",
                  )}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <FieldDescription className="text-red-600">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Error */}
              {errorMessage && (
                <FieldDescription className="text-red-600">
                  {errorMessage}
                </FieldDescription>
              )}

              {/* Sukses */}
              {successMessage && (
                <FieldDescription className="text-green-600">
                  {successMessage}
                </FieldDescription>
              )}

              {/* Submit */}
              <Field className="flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || loading}
                >
                  {loading ? "Sedang mengirim tautan..." : "Kirim tautan reset"}
                </Button>

                <FieldDescription className="text-center">
                  Sudah ingat kata sandi?{" "}
                  <a href="/auth/signin" className="text-primary">
                    Kembali ke halaman masuk
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        Dengan melanjutkan, Anda menyetujui{" "}
        <a href="/legal/syarat" className="underline">
          Syarat Layanan
        </a>{" "}
        serta{" "}
        <a href="/legal/privasi" className="underline">
          Kebijakan Privasi
        </a>
        .
      </FieldDescription>
    </div>
  )
}
