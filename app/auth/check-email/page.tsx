import { Suspense } from "react"
import CheckEmailClient from "./check-email-client"

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Memuat halaman verifikasi…
          </div>
        </div>
      }
    >
      <CheckEmailClient />
    </Suspense>
  )
}
