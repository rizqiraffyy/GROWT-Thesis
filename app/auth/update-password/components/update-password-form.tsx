// app/auth/update-password/components/update-password-form.tsx
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/dark-mode"

// note: align field names with API route: password + confirmPassword
const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

type FormData = z.infer<typeof schema>

// note: typed response from /api/auth/update-password
interface UpdatePasswordResponse {
  success?: boolean
  error?: string
}

export function UpdatePasswordForm(
  props: React.ComponentProps<"div">,
) {
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

  // note: check recovery session client-side for better UX
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
      // note: delegate password update to the API route
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
          json?.error ||
            "Failed to update password. Please try again.",
        )
      }

      reset()
      // note: after updating, send user back to signin
      router.push("/auth/signin")
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unexpected error"
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
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <CardDescription>
            Enter your new password below to secure your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FieldGroup>
              {/* note: if session is missing, show warning + disable inputs */}
              {sessionMissing && (
                <FieldDescription className="text-red-600">
                  Recovery session not found. Please request a new
                  reset link from{" "}
                  <a
                    href="/auth/forgot-password"
                    className="underline text-primary"
                  >
                    Forgot Password
                  </a>
                </FieldDescription>
              )}

              {/* New password */}
              <Field>
                <FieldLabel htmlFor="password">
                  New Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Create a strong password (min. 8 characters)"
                    {...register("password")}
                    className={cn(
                      "pr-10",
                      errors.password &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    disabled={loading || sessionMissing}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
                    aria-label={
                      showPw ? "Hide password" : "Show password"
                    }
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

              {/* Confirm password */}
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm New Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPw2 ? "text" : "password"}
                    placeholder="Re-enter your new password"
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
                      showPw2 ? "Hide password" : "Show password"
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

              {/* Server error */}
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
                  disabled={
                    !isValid || loading || sessionMissing
                  }
                >
                  {loading
                    ? "Updating password..."
                    : "Update Password"}
                </Button>
                <FieldDescription className="text-center">
                  Changed your mind?{" "}
                  <a
                    href="/auth/signin"
                    className="text-primary"
                  >
                    Back to Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {/* note: legal / policy footer copy */}
        By continuing, you agree to our{" "}
        <a href="/legal/terms" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/legal/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}