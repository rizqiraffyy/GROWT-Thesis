// app/guide/page.tsx
"use client"

import Link from "next/link"
import { CheckCircle2, LineChart, ListChecks, ShieldCheck, Users } from "lucide-react"

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

export default function GuidePage() {
  const appName = "Growt"

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="text-xs">
            Getting started • {appName}
          </Badge>
          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Guide to using {appName}
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            This guide helps you get started with {appName} — from creating an account,
            setting up your farm, adding livestock, to tracking growth and health over time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="sm">
              <Link href="/auth/signup">Create an account</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/main/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </section>

        {/* Step by step */}
        <Card>
          <CardHeader>
            <CardTitle>1. Getting started</CardTitle>
            <CardDescription>
              Start by creating an account, then set up your farmer profile and farm data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">A. Create your account</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Go to <Link href="/auth/signup" className="text-primary underline">
                    Sign up
                  </Link>{" "}
                  and create an account using your email and password.
                </li>
                <li>
                  You can also sign in with your Google account on the{" "}
                  <Link href="/auth/signin" className="text-primary underline">
                    Sign in
                  </Link>{" "}
                  page.
                </li>
                <li>
                  If email verification is enabled, check your inbox and confirm your
                  email before logging in.
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">B. Complete your profile</p>
              <p>
                After logging in, go to your profile/settings page to review your name,
                email, and other details. Keeping your profile up to date helps us
                associate your livestock and farm records correctly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core features */}
        <Card>
          <CardHeader>
            <CardTitle>2. Main features</CardTitle>
            <CardDescription>
              Overview of the core features you&apos;ll use every day in {appName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Farmer & livestock management</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Create and manage farmer information.</li>
                <li>Add livestock with details such as species, ID/tag, sex, and notes.</li>
                <li>View all livestock in a structured table.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Weight tracking & statistics</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Record weight updates for each animal over time.</li>
                <li>
                  Dashboard cards show total livestock, average weight, and growth
                  performance.
                </li>
                <li>
                  See trends (up, stable, or down) to quickly detect abnormal conditions.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Task & activity planning</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Create routine tasks related to feeding, weighing, or health checks.</li>
                <li>Use filters and search to quickly find specific tasks.</li>
                <li>Keep your daily farm activities organized in one place.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Secure authentication</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Sign in with email and password or Google OAuth.</li>
                <li>Password reset flow via email if you forget your credentials.</li>
                <li>
                  Email verification (if enabled) ensures only valid accounts can access
                  your data.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Daily workflow */}
        <Card>
          <CardHeader>
            <CardTitle>3. Suggested daily workflow</CardTitle>
            <CardDescription>
              A simple routine you can follow to make the most out of {appName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Morning check</p>
                <p>
                  Review today&apos;s tasks and check the dashboard for any livestock with
                  stagnant or declining weight trends.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Record new data</p>
                <p>
                  Enter new weight measurements and important notes after feeding or
                  health checks. The more consistent your data, the better the insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Review performance</p>
                <p>
                  At the end of the week or month, use the dashboard metrics to evaluate
                  growth performance and identify animals that may need extra attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & legal */}
        <Card>
          <CardHeader>
            <CardTitle>4. Help & support</CardTitle>
            <CardDescription>
              Where to go if you have questions, feedback, or need more assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Contact us</p>
              <p>
                If you need help or want to share feedback, you can send us a message via
                the{" "}
                <Link href="/contacts" className="text-primary underline">
                  Contact page
                </Link>
                . We usually respond within 1–2 business days.
              </p>
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Your data & privacy</p>
              <p>
                For information about how we handle your data, please read our{" "}
                <Link href="/legal/privacy" className="text-primary underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/legal/terms" className="text-primary underline">
                  Terms of Service
                </Link>
                . We aim to keep your farm and livestock data safe and secure.
              </p>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/main/dashboard">Open dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
