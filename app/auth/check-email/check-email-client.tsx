"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ModeToggle } from "@/components/dark-mode"

type Status = "checking" | "waiting" | "verified" | "no-session" | "error"

export default function CheckEmailClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = useMemo(
    () => searchParams.get("redirect") ?? "/auth/signin?verified=1",
    [searchParams],
  )

  const [status, setStatus] = useState<Status>("checking")
  const [message, setMessage] = useState<string>("Sedang mengecek status verifikasi…")
  const [loading, setLoading] = useState(false)

  const checkVerifiedOnce = useCallback(async () => {
    const supabase = getSupabaseBrowser()

    const { data, error } = await supabase.auth.getUser()
    if (error) {
      setStatus("error")
      setMessage("Terjadi kendala saat mengecek akun. Coba lagi, ya.")
      return false
    }

    const user = data.user
    if (!user) {
      setStatus("no-session")
      setMessage(
        "Sesi tidak ditemukan. Silakan buka tautan verifikasi di perangkat yang sama, atau masuk ulang.",
      )
      return false
    }

    const verified = !!user.email_confirmed_at
    if (verified) {
      setStatus("verified")
      setMessage("Email Anda sudah terverifikasi. Mengarahkan…")
      return true
    }

    setStatus("waiting")
    setMessage(
      "Belum terverifikasi. Setelah klik tautan di email, halaman ini akan otomatis lanjut.",
    )
    return false
  }, [])

  useEffect(() => {
    let alive = true
    let interval: number | undefined

    const start = async () => {
      const ok = await checkVerifiedOnce()
      if (!alive) return

      if (ok) {
        router.replace(redirectTo)
        return
      }

      interval = window.setInterval(async () => {
        const ok2 = await checkVerifiedOnce()
        if (!alive) return
        if (ok2) {
          window.clearInterval(interval)
          router.replace(redirectTo)
        }
      }, 3000)
    }

    start()

    return () => {
      alive = false
      if (interval) window.clearInterval(interval)
    }
  }, [router, redirectTo, checkVerifiedOnce])

  const manualCheck = async () => {
    setLoading(true)
    try {
      const ok = await checkVerifiedOnce()
      if (ok) router.replace(redirectTo)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verifikasi Email</CardTitle>
          <CardDescription>
            Kami sudah mengirim tautan verifikasi ke email Anda.
            <br />
            Cek inbox (atau Spam/Promosi), lalu klik tautannya.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            className={[
              "rounded-md border px-3 py-2 text-sm",
              status === "verified" ? "border-green-200 bg-green-50 text-green-700" : "",
              status === "error" ? "border-red-200 bg-red-50 text-red-700" : "",
              status === "no-session" ? "border-amber-200 bg-amber-50 text-amber-700" : "",
              status === "checking" || status === "waiting"
                ? "border-border bg-muted/40 text-foreground"
                : "",
            ].join(" ")}
          >
            {message}
          </div>

          <Button onClick={manualCheck} className="w-full" disabled={loading}>
            {loading ? "Mengecek..." : "Cek lagi"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Sudah verifikasi?{" "}
            <a className="text-primary underline" href="/auth/signin">
              Masuk di sini
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
