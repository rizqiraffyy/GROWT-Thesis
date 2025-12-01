"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  LineChart,
  RadioTower,
  Settings as SettingsIcon,
  UserPlus,
  PawPrint,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/dark-mode";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle redirect after Google OAuth (/?code=...&next=...)
  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowser();

      // Check if Supabase already has a logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const nextParam = searchParams.get("next") || "/main/dashboard";

      if (user) {
        // User is authenticated → go to intended page
        router.replace(
          nextParam.startsWith("/") ? nextParam : "/main/dashboard",
        );
      } else {
        // No user (or something failed) → back to Sign In
        router.replace("/auth/signin");
      }
    };

    const hasCode = searchParams.has("code");
    const hasNext = searchParams.has("next");

    // Only run this logic when coming back from OAuth / login flow
    if (hasCode || hasNext) {
      run();
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-primary/5 md:h-10 md:w-10">
              <Image
                src="/favicon.svg"
                alt="Growt Logo"
                fill
                priority
                className="object-contain p-1.5"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight md:text-base">
                Growt
              </span>
              <span className="text-[11px] text-muted-foreground md:text-xs line-clamp-1">
                Growth Recording of Weight Tracking
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <ModeToggle />

            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 min-w-[120px] md:flex-none"
            >
              <Link href="/demo">Try Simulation</Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex-1 min-w-[100px] md:flex-none"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>

            <Button
              size="sm"
              asChild
              className="flex-1 min-w-[100px] md:flex-none"
            >
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero / Get started */}
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:items-center md:justify-between md:py-16 lg:px-6">
        {/* Left copy */}
        <div className="max-w-xl space-y-6">
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/5 text-[11px] font-medium uppercase tracking-wide text-emerald-600"
          >
            Powered by IoT, RFID &amp; Cloud Database
          </Badge>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Keep your livestock growth
              <span className="block text-primary">
                measured &amp; under control.
              </span>
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Growt is a web dashboard that connects your RFID-based weighing
              devices to a structured cloud database. Every weighing session is
              stored, visualized, and translated into a simple Health Score so
              you always know how your herd is doing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* BUTTON GET STARTED → route redirect */}
            <Button size="lg" asChild>
              <Link href="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">Try Simulation (demo data)</Link>
            </Button>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground sm:text-sm">
            <p>✔ Designed for farmers, cooperatives, and research projects.</p>
            <p>
              ✔ No more manual notebooks — every log is stored safely in
              Supabase.
            </p>
            <p>
              ✔ One dashboard for livestock, logs, analytics, and global
              sharing.
            </p>
          </div>
        </div>

        {/* Right feature card */}
        <div className="w-full max-w-md">
          <Card className="border-primary/10 bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                What you can do with Growt
              </CardTitle>
              <CardDescription className="text-xs">
                A quick preview of your dashboard once you sign in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="mt-1">
                  <RadioTower className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Capture data from RFID devices</p>
                  <p className="text-xs text-muted-foreground">
                    Each weighing record is linked to an RFID tag, complete with
                    timestamp and livestock ID, and pushed directly to the
                    cloud.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="mt-1">
                  <LineChart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Track growth, risk &amp; Health Score
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dashboards combine total livestock, average weight,
                    stuck/loss animals, and a 1–100 Health Score that summarizes
                    overall herd condition each month.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="mt-1">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Centralize farmers &amp; livestock data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Manage farmers, individual animals, and their complete
                    weighing history in one structured database — ready for
                    analysis or research.
                  </p>
                </div>
              </div>

              <Separator />

              <p className="text-[11px] text-muted-foreground">
                Once you sign up, you&apos;ll be guided to complete your farmer
                profile, add livestock data, connect RFID tags, and start
                logging weights in just a few steps.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works / Step by step */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 lg:px-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[11px]">
              HOW IT WORKS
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              From account creation to IoT-powered weighing.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Growt is built around a clear flow so your data never gets lost:
              you register, complete your farmer profile, add livestock, and let
              the IoT scale send every new weighing log to the right animal.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">
                  1. Create &amp; log in
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Sign up with email or Google, then log in to access your
                  dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <SettingsIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">
                  2. Complete settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Fill in your personal info and full address in the Settings
                  page. This step unlocks livestock management.
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <PawPrint className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">
                  3. Add livestock &amp; RFID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Register each animal with its name, breed, sex, age, photo,
                  and RFID tag that the IoT scale will use.
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <RadioTower className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">
                  4. Start logging via IoT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Once RFID is connected, the IoT weighing device can push every
                  new weight directly into Growt as a data log.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboards & Health Score */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr] lg:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-[11px]">
                DASHBOARDS &amp; ANALYTICS
              </Badge>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Main dashboard, data logs, and global view.
              </h2>
              <p className="text-sm text-muted-foreground">
                Growt splits your data into three main pages so you can move
                from individual animals to global performance in one click.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Main Dashboard (per farmer)</p>
                <p className="text-xs text-muted-foreground">
                  See 4 key cards — total livestock, average weight, stuck/loss
                  animals, and a monthly Health Score. Below that, a livestock
                  table lets you toggle public sharing and open detailed views.
                </p>
              </div>

              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Data Logs</p>
                <p className="text-xs text-muted-foreground">
                  A flat list of all weighing entries you&apos;ve ever recorded,
                  with filters and summary cards showing total logs, highest
                  recorded weight, stuck &amp; loss events, and logs this month.
                </p>
              </div>

              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Global Page</p>
                <p className="text-xs text-muted-foreground">
                  Explore publicly shared livestock data from all farmers: total
                  shared livestock, global average weight, highest public
                  record, and total public logs. Livestock details are
                  read-only.
                </p>
              </div>
            </div>
          </div>

          <Card className="self-start border-primary/20 bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Health Score, in simple words.
              </CardTitle>
              <CardDescription className="text-xs">
                A single number (1–100) that summarizes your herd condition.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Each month, Growt looks at three things:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  How your{" "}
                  <span className="font-medium">total livestock</span> changes.
                </li>
                <li>
                  How your{" "}
                  <span className="font-medium">average weight</span> changes.
                </li>
                <li>
                  What percentage of animals are{" "}
                  <span className="font-medium">stuck or losing weight</span>.
                </li>
              </ul>
              <p>
                These are normalized into risk scores and combined into a single
                Health Score between 0 and 100 — higher means healthier growth,
                lower means you may need to take action.
              </p>
              <p>
                In the charts, you can also see the{" "}
                <span className="font-medium">change in Health Score</span> from
                month to month, so sudden improvements or drops are easy to
                spot.
              </p>

              <Separator />

              <p className="text-[11px]">
                Want to see real data? Use{" "}
                <span className="font-semibold">Try Simulation</span> to log in
                with a demo account that already has livestock, logs, and Health
                Score history.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support & Legal */}
      <section className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between lg:px-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <p className="flex flex-wrap items-center gap-1">
              Need help? Visit
              <Link
                href="/support/get-help"
                className="font-medium text-foreground hover:underline"
              >
                Get Help
              </Link>
              ,
              <Link
                href="/support/faq"
                className="font-medium text-foreground hover:underline"
              >
                FAQ
              </Link>
              ,
              <Link
                href="/support/guides"
                className="font-medium text-foreground hover:underline"
              >
                Guides
              </Link>
              , or
              <Link
                href="/support/contacts"
                className="font-medium text-foreground hover:underline"
              >
                Contacts
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/legal/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/legal/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}