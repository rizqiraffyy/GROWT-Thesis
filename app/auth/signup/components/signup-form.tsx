"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
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

// catatan: samakan skema dengan API signup (email di-trim + lowercase)
const signupSchema = z
  .object({
    name: z.string().min(2, "Nama terlalu pendek").max(100, "Nama terlalu panjang"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Masukkan email yang valid")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter")
      .max(64, "Kata sandi terlalu panjang"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi dulu, ya"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  })

type SignupData = z.infer<typeof signupSchema>

interface SignupResponse {
  success?: boolean
  redirect?: string
  error?: string
  pendingEmailConfirmation?: boolean
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: SignupData) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // catatan: kirim semua field; backend akan mengabaikan confirmPassword
        body: JSON.stringify(data),
      })

      let result: SignupResponse | null = null
      try {
        result = (await res.json()) as SignupResponse
      } catch {
        result = null
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.error || "Gagal membuat akun. Coba lagi, ya.",
        )
      }

      // server yang menentukan tujuan (dashboard / signin?checkEmail=1, dll)
      router.push(result.redirect ?? "/auth/check-email")
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
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
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Daftar sekarang agar pencatatan pertumbuhan ternak Anda terkontrol.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
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

              {/* Google signup */}
              <Field>
                <GoogleLoginButton
                  redirect="/main/dashboard"
                  label="Lanjut dengan Google"
                  onError={(msg) => setErrorMessage(msg)}
                />
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Atau daftar dengan email
              </FieldSeparator>

              {/* Nama lengkap */}
              <Field>
                <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  {...register("name")}
                  className={cn(
                    errors.name && "border-red-500 focus-visible:ring-red-500",
                  )}
                  disabled={loading}
                  autoComplete="name"
                />
                {errors.name && (
                  <FieldDescription className="text-red-600">
                    {errors.name.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Gunakan email aktif (contoh: contoh@mail.com)"
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

              {/* Password + Konfirmasi (grid responsif) */}
              <Field className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Password */}
                <Field>
                  <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Buat kata sandi"
                      {...register("password")}
                      className={cn(
                        errors.password &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label={
                        showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                      }
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

                {/* Konfirmasi Password */}
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Konfirmasi kata sandi
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi kata sandi"
                      {...register("confirmPassword")}
                      className={cn(
                        errors.confirmPassword &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label={
                        showConfirm
                          ? "Sembunyikan konfirmasi kata sandi"
                          : "Tampilkan konfirmasi kata sandi"
                      }
                    >
                      {showConfirm ? (
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
              </Field>

              <FieldDescription>
                Kata sandi minimal 6 karakter.
              </FieldDescription>

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full"
                >
                  {loading ? "Sedang membuat akun..." : "Daftar"}
                </Button>

                <FieldDescription className="text-center">
                  Sudah punya akun?{" "}
                  <a href="/auth/signin" className="text-primary">
                    Masuk
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
