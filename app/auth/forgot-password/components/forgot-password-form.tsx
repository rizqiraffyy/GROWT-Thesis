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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// note: keep schema consistent with API → trim + lowercase
const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
})

type ForgotData = z.infer<typeof forgotSchema>

// note: typed response instead of `any`
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
    mode: "onChange", // note: live validation + button disabled until valid
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
        throw new Error(json?.error || "Failed to send reset email.")
      }

      // note: match API response: success even if email doesn't exist
      setSuccessMessage(
        "If your email is registered, we’ve sent a password reset link to your inbox.",
      )

      reset()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error"
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      {/* note: match signin/signup styling */}
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your registered email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@mail.com"
                  {...register("email")}
                  className={cn(
                    errors.email &&
                      "border-red-500 focus-visible:ring-red-500",
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

              {/* Error (top-level, API error) */}
              {errorMessage && (
                <FieldDescription className="text-red-600">
                  {errorMessage}
                </FieldDescription>
              )}

              {/* Success message */}
              {successMessage && (
                <FieldDescription className="text-green-600">
                  {successMessage}
                </FieldDescription>
              )}

              {/* Submit Button */}
              <Field className="flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || loading}
                >
                  {loading ? "Sending reset link..." : "Send reset link"}
                </Button>

                <FieldDescription className="text-center">
                  Remembered your password?{" "}
                  <a href="/auth/signin" className="text-primary">
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