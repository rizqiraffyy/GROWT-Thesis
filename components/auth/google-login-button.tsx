"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type GoogleLoginButtonProps = {
  redirect?: string
  label?: string
  className?: string
  onError?: (message: string) => void
}

export function GoogleLoginButton({
  redirect = "/main/dashboard",
  label = "Continue with Google",
  className,
  onError,
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGoogle = useCallback(async () => {
    setLoading(true)

    try {
      const supabase = getSupabaseBrowser()
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      // note: sanitize redirect to avoid open redirect vulnerabilities
      const safeRedirect =
        redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/main/dashboard"

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/api/auth/callback?redirect=${encodeURIComponent(
            safeRedirect,
          )}`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      })

      if (error) {
        throw new Error("Unable to sign in with Google.")
      }

      // note: browser will redirect automatically; no need to unset loading
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message || "Unable to sign in with Google."
          : "Unable to sign in with Google."

      onError?.(message)
      setLoading(false)
    }
  }, [redirect, onError])

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      aria-busy={loading}
      aria-live="polite"
      className={cn(
        "w-full transition-all",
        loading && "cursor-wait opacity-90",
        className,
      )}
      rel="noopener noreferrer"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in with Google...
        </>
      ) : (
        <>
          {/* Google Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>

          {label}
        </>
      )}
    </Button>
  )
}