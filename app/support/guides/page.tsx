// app/guide/page.tsx
"use client";

import Link from "next/link";
import {
  CheckCircle2,
  LineChart,
  ListChecks,
  Users,
  Globe2,
  Settings,
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

export default function GuidePage() {
  const appName = "Growt";

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
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
            This guide walks you through how {appName} works — from creating an
            account, completing your farmer profile and address, adding livestock and RFID
            tags, to tracking weight trends and Health Score over time.
          </p>
        </section>

        {/* 1. Flow: from signup to first weighing */}
        <Card>
          <CardHeader>
            <CardTitle>1. From signup to your first weighing</CardTitle>
            <CardDescription>
              A step-by-step overview of how data flows in {appName} — from your
              account to the IoT weighing device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">A. Create your account</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Go to{" "}
                  <Link href="/auth/signup" className="text-primary underline">
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
              <p className="font-medium text-foreground">
                B. Complete your farmer profile & address
              </p>
              <p>
                After logging in, open the <span className="font-medium">Settings</span>{" "}
                page. Here you can:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Update your profile photo and see when your account was created.</li>
                <li>Fill in personal information such as phone, date of birth, gender.</li>
                <li>
                  Add your full address: province, regency, district, village, street,
                  postcode, and full address.
                </li>
              </ul>
              <p className="mt-1">
                Completing these sections unlocks the ability to register livestock
                under your account.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">C. Add livestock & RFID</p>
              <p>
                Next, go to the livestock section in your dashboard and register each
                animal:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Name, breed, species, sex, and age or date of birth.</li>
                <li>Photo of the animal for easier identification.</li>
                <li>
                  RFID tag that will be used by the IoT weighing device to match logs
                  with this animal.
                </li>
              </ul>
              <p className="mt-1">
                Make sure the RFID codes stored in {appName} match the ones used on
                your physical tags.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">
                D. Start sending logs from the IoT weighing device
              </p>
              <p>
                Once livestock and their RFID tags are registered, the IoT weighing
                device can send data to {appName}:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  When an animal steps on the scale, its RFID is read and attached to
                  the weighing record.
                </li>
                <li>
                  The device sends weight, timestamp, and RFID to the cloud database.
                </li>
                <li>
                  {appName} stores the log and links it to the matching livestock
                  profile automatically.
                </li>
              </ul>
              <p className="mt-1">
                If an RFID is not registered in the database, the device will not be
                able to create a valid log for that animal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Pages & features */}
        <Card>
          <CardHeader>
            <CardTitle>2. Pages you&apos;ll use in {appName}</CardTitle>
            <CardDescription>
              A quick overview of the main pages and what you can do on each of them.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Main dashboard</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  See 4 key cards: total livestock, average weight, stuck &amp; loss
                  count, and a 1–100 Health Score.
                </li>
                <li>
                  View charts for weight and Health Score over time (3 months up to 2
                  years).
                </li>
                <li>
                  Access a livestock table with photo, RFID, species, sex, age,
                  weight, delta, status, and a switch to share an animal publicly.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Livestock detail</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  See a detailed profile card for a single animal, including photo and
                  identification data.
                </li>
                <li>View a weight trend chart only for that animal.</li>
                <li>
                  Explore all weighing logs linked to its RFID in a dedicated table.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Data logs</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  See every weighing log ever recorded under your account in a single
                  table.
                </li>
                <li>
                  Summary cards show total logs, highest recorded weight, stuck &amp;
                  loss weight, and logs this month.
                </li>
                <li>
                  Useful for audits, research, or exporting raw data for analysis.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Global page</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Explore livestock that other farmers choose to share publicly.
                </li>
                <li>
                  See stats like total shared livestock, global average weight, highest
                  public record weight, and total public logs.
                </li>
                <li>
                  Livestock details here are read-only — they can&apos;t be edited.
                </li>
              </ul>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Settings & account</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Update profile photo and see when your account was created (Account
                  Overview).
                </li>
                <li>
                  Maintain personal details and full address (Personal Information and
                  Address Details).
                </li>
                <li>
                  Delete your account if needed — this also removes livestock, logs,
                  and the link between your account and RFID tags.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 3. Health Score */}
        <Card>
          <CardHeader>
            <CardTitle>3. Understanding Health Score</CardTitle>
            <CardDescription>
              How {appName} turns raw weight and headcount data into a single 1–100
              score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Every month, {appName} looks at three components of your herd&apos;s
              performance:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">Change in total livestock</span> compared
                to the previous month.
              </li>
              <li>
                <span className="font-medium">Change in average weight</span> of all
                animals.
              </li>
              <li>
                <span className="font-medium">Percentage of animals that are stuck or losing weight</span> in
                the current month.
              </li>
            </ul>
            <p>
              These values are normalized into risk scores between 0 and 1, weighted,
              and combined into a monthly Health Score between 0 and 100 — higher
              scores indicate healthier and more consistent growth.
            </p>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                In the charts, you can also view{" "}
                <span className="font-medium">changes in Health Score</span> from month
                to month, making it easier to catch sudden improvements or declines.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Help & support */}
        <Card>
          <CardHeader>
            <CardTitle>4. Help, documentation & legal</CardTitle>
            <CardDescription>
              You can access these pages at any time — with or without being logged
              in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Support & documentation</p>
              <p>
                If you have questions or want to explore more details:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Visit{" "}
                  <Link
                    href="/support/get-help"
                    className="text-primary underline"
                  >
                    Get Help
                  </Link>{" "}
                  for general assistance.
                </li>
                <li>
                  Read{" "}
                  <Link href="/support/faq" className="text-primary underline">
                    FAQ
                  </Link>{" "}
                  for common questions and quick answers.
                </li>
                <li>
                  Follow step-by-step guides in{" "}
                  <Link href="/support/guides" className="text-primary underline">
                    Guides
                  </Link>
                  .
                </li>
                <li>
                  Reach out via{" "}
                  <Link
                    href="/support/contacts"
                    className="text-primary underline"
                  >
                    Contacts
                  </Link>{" "}
                  if you need more direct support.
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-1">
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
                . These pages explain how your livestock and farm information are
                stored and protected.
              </p>
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