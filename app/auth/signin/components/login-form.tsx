"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GoogleLoginButton } from "@/components/auth/google-login-button"

// Skema form — email di-trim + lowercase biar konsisten
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Masukkan email yang valid")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(64, "Kata sandi terlalu panjang"),
})

type LoginData = z.infer<typeof loginSchema>

interface LoginResponse {
  success?: boolean
  redirect?: string
  error?: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // kalau ada query redirect (?redirect=/something), kirim ke body
      const redirect = searchParams.get("redirect")
      const payload = redirect ? { ...data, redirect } : data

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      let result: LoginResponse | null = null
      try {
        result = (await res.json()) as LoginResponse
      } catch {
        result = null
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.error || "Email atau kata sandi salah. Coba lagi, ya.",
        )
      }

      // server yang tentuin redirect; fallback ke dashboard
      router.push(result.redirect ?? "/main/dashboard")
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kendala. Silakan coba lagi beberapa saat."
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* toggle tema di kanan atas */}
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Selamat Datang Kembali</CardTitle>
          <CardDescription>
            Masuk pakai Google atau gunakan email dan kata sandi Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {/* error umum (API / network / Google auth) */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Tombol Google */}
              <Field>
                <GoogleLoginButton
                  redirect="/main/dashboard"
                  label="Lanjut dengan Google"
                  onError={(msg) => setErrorMessage(msg)}
                />
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Atau masuk dengan email
              </FieldSeparator>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email terdaftar (contoh: nama@mail.com)"
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

              {/* Password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                  <a
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Lupa kata sandi?
                  </a>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    {...register("password")}
                    className={cn(
                      errors.password &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
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

              {/* Submit */}
              <Field className="flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || loading}
                >
                  {loading ? "Sedang masuk..." : "Masuk"}
                </Button>

                <FieldDescription className="text-center">
                  Belum punya akun?{" "}
                  <a href="/auth/signup" className="text-primary">
                    Daftar
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
