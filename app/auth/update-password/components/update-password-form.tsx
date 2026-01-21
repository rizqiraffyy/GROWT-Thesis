"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { Session } from "@supabase/supabase-js"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/dark-mode"

// catatan: samakan nama field dengan API route: password + confirmPassword
const schema = z
  .object({
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Tolong konfirmasi kata sandi"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  })

type FormData = z.infer<typeof schema>

// catatan: typed response dari /api/auth/update-password
interface UpdatePasswordResponse {
  success?: boolean
  error?: string
}

export function UpdatePasswordForm(props: React.ComponentProps<"div">) {
  const router = useRouter()

  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sessionOk, setSessionOk] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  // catatan: cek recovery session di client biar UX lebih jelas
  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowser()
      const {
        data,
        error,
      }: {
        data: { session: Session | null }
        error: Error | null
      } = await supabase.auth.getSession()

      if (error) {
        setSessionOk(false)
        return
      }
      setSessionOk(!!data.session)
    }

    run()
  }, [])

  const sessionMissing = sessionOk === false

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // catatan: update password via API route
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      let json: UpdatePasswordResponse | null = null
      try {
        json = (await res.json()) as UpdatePasswordResponse
      } catch {
        json = null
      }

      if (!res.ok || !json?.success) {
        throw new Error(
          json?.error || "Gagal memperbarui kata sandi. Coba lagi, ya.",
        )
      }

      reset()
      // catatan: setelah berhasil, arahkan ke halaman masuk
      router.push("/auth/signin")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kendala."
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Buat Kata Sandi Baru</CardTitle>
          <CardDescription>
            Masukkan kata sandi baru untuk mengamankan akun kamu.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {/* kalau session recovery tidak ada, tampilkan peringatan + disable input */}
              {sessionMissing && (
                <FieldDescription className="text-red-600">
                  Sesi pemulihan tidak ditemukan. Silakan minta tautan reset yang baru lewat{" "}
                  <a
                    href="/auth/forgot-password"
                    className="underline text-primary"
                  >
                    Lupa Kata Sandi
                  </a>
                  .
                </FieldDescription>
              )}

              {/* Password baru */}
              <Field>
                <FieldLabel htmlFor="password">Kata sandi baru</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Buat kata sandi yang kuat (min. 8 karakter)"
                    {...register("password")}
                    className={cn(
                      "pr-10",
                      errors.password && "border-red-500 focus-visible:ring-red-500",
                    )}
                    disabled={loading || sessionMissing}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
                    aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    disabled={loading || sessionMissing}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <FieldDescription className="text-red-600">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Konfirmasi password */}
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Konfirmasi kata sandi baru
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPw2 ? "text" : "password"}
                    placeholder="Ulangi kata sandi baru"
                    {...register("confirmPassword")}
                    className={cn(
                      "pr-10",
                      errors.confirmPassword &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    disabled={loading || sessionMissing}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
                    aria-label={
                      showPw2 ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"
                    }
                    disabled={loading || sessionMissing}
                  >
                    {showPw2 ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <FieldDescription className="text-red-600">
                    {errors.confirmPassword.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Error dari server */}
              {errorMessage && (
                <FieldDescription className="text-red-600">
                  {errorMessage}
                </FieldDescription>
              )}

              {/* Submit */}
              <Field className="flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || loading || sessionMissing}
                >
                  {loading ? "Sedang memperbarui..." : "Perbarui Kata Sandi"}
                </Button>

                <FieldDescription className="text-center">
                  Batal ganti kata sandi?{" "}
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
