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
  FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GoogleLoginButton } from "@/components/auth/google-login-button"

// note: keep schema in sync with API signup route (email trimmed + lowercased)
const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name is too short")
      .max(100, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(64, "Password too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // note: shared error area for API + Google

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange", // note: live validation + disable submit until valid
  })

  const onSubmit = async (data: SignupData) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // note: we send all fields; backend will ignore confirmPassword
        body: JSON.stringify(data),
      })

      let result: SignupResponse | null = null
      try {
        result = (await res.json()) as SignupResponse
      } catch {
        // note: if JSON parsing fails, treat as generic failure
        result = null
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.error || "Failed to create account. Please try again.",
        )
      }

      // note: let the server decide destination (dashboard / signin?checkEmail=1)
      router.push(result.redirect ?? "/auth/check-email")
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again later."
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* note: theme toggle pinned top-right, same as login form */}
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Join us and track your livestock growth effectively!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* note: proper form submit (same pattern as login form) */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* Global error (API / network / Google auth) */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Google signup — same component & pattern as signin */}
              <Field>
                <GoogleLoginButton
                  redirect="/main/dashboard"
                  label="Continue with Google"
                  // note: surface Google auth error into the same error area
                  onError={(msg) => setErrorMessage(msg)}
                />
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with email
              </FieldSeparator>

              {/* Full name */}
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
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
                  placeholder="Use a valid email (e.g., example@mail.com)"
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

              {/* Password + Confirm Password (responsive grid) */}
              <Field className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Password */}
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
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

                {/* Confirm Password */}
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
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
                Password must be at least 6 characters long.
              </FieldDescription>

              {/* Submit button */}
              <Field>
                <Button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/auth/signin" className="text-primary">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
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
