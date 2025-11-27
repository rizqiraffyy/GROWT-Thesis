"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"
import { ModeToggle } from "@/components/dark-mode"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We’ve sent a verification link to your email.  
            Please check your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => location.reload()} className="w-full">
            Refresh
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already verified?{" "}
            <a className="underline text-primary" href="/auth/signin">
              Sign in here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
