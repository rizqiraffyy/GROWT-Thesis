"use client"

import Link from "next/link"
import { HelpCircle, MessageCircle, BookOpenCheck, Settings2, LifeBuoy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function GetHelpPage() {
  const appName = "Growt"

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="inline-flex items-center gap-1 text-xs">
            <LifeBuoy className="h-3 w-3" />
            Help Center
          </Badge>
          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Need help with {appName}?
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Choose one of the options below to quickly find answers, read the guide, or
            contact us directly if you&apos;re stuck.
          </p>
        </section>

        {/* Main grid */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* FAQ card */}
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Find quick answers (FAQ)</CardTitle>
                <CardDescription>
                  Check the most common questions about accounts, livestock tracking, and
                  data privacy.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <div className="text-xs text-muted-foreground">
                Recommended if you&apos;re not sure where to start.
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/faq">Open FAQ</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Guide card */}
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <BookOpenCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Read the full guide</CardTitle>
                <CardDescription>
                  Learn how to use {appName} step-by-step: from setup to daily workflow.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <div className="text-xs text-muted-foreground">
                Best if you&apos;re new and want structure.
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/guide">Open guide</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contact card */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Contact us directly</CardTitle>
                <CardDescription>
                  If you can&apos;t find the answer you need, send us a detailed message
                  so we can help you.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                Tell us about your farm, the issue you&apos;re facing, and anything
                you&apos;ve already tried.
              </div>
              <Button asChild size="sm">
                <Link href="/contacts">Go to Contact page</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Technical help */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle>Technical help & common issues</CardTitle>
              <CardDescription>
                A few quick tips if you&apos;re having trouble signing in or seeing your
                data.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Can&apos;t sign in?</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Make sure you&apos;re using the same email you used during sign up.</li>
                <li>
                  If you forgot your password, use the{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password
                  </Link>{" "}
                  page to reset it.
                </li>
                <li>
                  If you signed up with Google, use the &quot;Continue with Google&quot;
                  button on the sign in page.
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Just signed up but can&apos;t log in?</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Check your email inbox (and spam folder) for a verification link if
                  email confirmation is enabled.
                </li>
                <li>
                  After confirming your email, try signing in again from the{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  page.
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Data not updating or dashboard looks wrong?</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Try refreshing the page or signing out and back in.</li>
                <li>Check that you&apos;ve actually saved the latest weight entries.</li>
                <li>
                  If the issue persists, describe the problem on the{" "}
                  <Link
                    href="/contacts"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Contact page
                  </Link>{" "}
                  and include screenshots if possible.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/main/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
