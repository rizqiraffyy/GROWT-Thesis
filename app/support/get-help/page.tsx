"use client";

import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  BookOpenCheck,
  Settings2,
  LifeBuoy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function GetHelpPage() {
  const appName = "Growt";

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
            Use this page to quickly find answers about account access, profile
            setup, livestock & RFID, IoT weighing, dashboards, and Health Score.
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
                  Start here for common questions about the system flow, IoT setup,
                  Health Score, and data visibility.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <div className="text-xs text-muted-foreground">
                Recommended if you&apos;re not sure what&apos;s going wrong.
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/support/faq">Open FAQ</Link>
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
                  Learn how {appName} works end-to-end: signup, Settings, livestock
                  & RFID, IoT logs, dashboards, and global sharing.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <div className="text-xs text-muted-foreground">
                Best if you&apos;re new and want a step-by-step explanation.
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
                  If you&apos;re still stuck after reading the FAQ and guide, send us
                  a detailed message so we can help you.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                Include what you were trying to do (e.g. connect IoT, add livestock,
                view Health Score), any error messages, and screenshots if possible.
              </div>
              <Button asChild size="sm">
                <Link href="/support/contacts">Go to Contact page</Link>
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
                Quick checks you can do yourself before contacting support.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {/* Sign-in issues */}
            <div>
              <p className="font-medium text-foreground">Can&apos;t sign in?</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Make sure you&apos;re using the same email you used at sign up.</li>
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
                  If you signed up with Google, use the
                  {" "}“Continue with Google” button on the{" "}
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

            {/* Profile & livestock issues */}
            <div>
              <p className="font-medium text-foreground">
                Just signed up but can&apos;t add livestock?
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Go to <span className="font-medium">Settings</span> and complete:
                  Personal Information (phone, date of birth, gender) and Address
                  Details (province, regency, district, village, street, postcode,
                  full address).
                </li>
                <li>
                  After these forms are filled and saved, livestock creation and
                  management will be unlocked for your account.
                </li>
              </ul>
            </div>

            <Separator />

            {/* IoT & logs issues */}
            <div>
              <p className="font-medium text-foreground">
                IoT device is running but no weight logs appear?
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Check that each animal you&apos;re weighing has an RFID registered
                  in {appName} and that the RFID code matches the physical tag exactly.
                </li>
                <li>
                  Make sure your IoT device is online and configured to send data to
                  the correct project / API endpoint.
                </li>
                <li>
                  Confirm that you&apos;re looking at the right time range in the
                  dashboard or data logs page (e.g. this month vs all time).
                </li>
                <li>
                  If logs still don&apos;t show up, reach out via{" "}
                  <Link
                    href="/support/contacts"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Contacts
                  </Link>{" "}
                  and mention the approximate time you weighed the animals.
                </li>
              </ul>
            </div>

            <Separator />

            {/* Dashboard & Health Score issues */}
            <div>
              <p className="font-medium text-foreground">
                Dashboard numbers or Health Score look wrong?
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Remember that some metrics (like Health Score) are calculated
                  monthly, based on changes in total livestock, average weight, and
                  stuck/loss animals.
                </li>
                <li>
                  Check if there are missing logs or test data that might affect the
                  averages — especially extreme weights or deleted entries.
                </li>
                <li>
                  Try switching the chart range (e.g. last 3 months vs 1 year) to
                  confirm you&apos;re looking at the correct period.
                </li>
                <li>
                  If something still doesn&apos;t add up, send your screenshots and a
                  short description via the{" "}
                  <Link
                    href="/support/contacts"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Contact page
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/main/dashboard">Open dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/demo">Try simulation</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}