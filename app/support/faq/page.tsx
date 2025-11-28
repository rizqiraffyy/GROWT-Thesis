"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FAQPage() {
  const appName = "Growt";

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="text-xs">
            Help Center • FAQ
          </Badge>
          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Find quick answers to common questions about {appName} — from
            account access and IoT weighing to dashboards, Health Score, and
            data privacy.
          </p>
        </section>

        {/* FAQ Card */}
        <Card>
          <CardHeader>
            <CardTitle>General questions</CardTitle>
            <CardDescription>
              A collection of answers to the most common questions from users.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {/* Q1 */}
              <AccordionItem value="what-is-growt">
                <AccordionTrigger>
                  What is {appName} and who is it for?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {appName} is a web-based dashboard for farmers, cooperatives,
                  and research projects to monitor livestock growth. It collects
                  weight data from RFID-based IoT weighing devices, stores it in
                  a cloud database, and visualizes trends so you can quickly see
                  which animals are growing well, stuck, or losing weight.
                </AccordionContent>
              </AccordionItem>

              {/* Q2 */}
              <AccordionItem value="how-to-start">
                <AccordionTrigger>
                  How do I get started with {appName}?
                </AccordionTrigger>
                <AccordionContent className="space-y-1.5 text-sm text-muted-foreground">
                  <p>To get started:</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>
                      Create an account on the{" "}
                      <Link
                        href="/auth/signup"
                        className="text-primary underline"
                      >
                        Sign up
                      </Link>{" "}
                      page (or use Google on{" "}
                      <Link
                        href="/auth/signin"
                        className="text-primary underline"
                      >
                        Sign in
                      </Link>
                      ).
                    </li>
                    <li>
                      After logging in, open the{" "}
                      <span className="font-medium">Settings</span> page and
                      complete your personal info and full address.
                    </li>
                    <li>
                      Add your livestock with name, breed, sex, age, photo, and
                      RFID tag.
                    </li>
                    <li>
                      Connect your IoT weighing device so each weighing session
                      can be sent to {appName} automatically.
                    </li>
                    <li>
                      Use the dashboard, data logs, and global pages to monitor
                      performance and Health Score over time.
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* Q3 */}
              <AccordionItem value="need-profile-before-livestock">
                <AccordionTrigger>
                  Why do I need to complete my profile before adding livestock?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Your profile (personal information and address) is used to tie
                  livestock and weighing logs to a specific farmer and location.
                  {` `}
                  {appName} requires this data first so every RFID tag, animal,
                  and log is clearly associated with the right account in the
                  database.
                </AccordionContent>
              </AccordionItem>

              {/* Q4 */}
              <AccordionItem value="is-it-free">
                <AccordionTrigger>
                  Is {appName} free to use?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {appName} is currently used as an experimental and research
                  project. You can use it without a public pricing model. If you
                  decide to run it in production or at a larger scale in the
                  future, you can introduce your own pricing or cost-sharing
                  structure later.
                </AccordionContent>
              </AccordionItem>

              {/* Q5 */}
              <AccordionItem value="demo-account">
                <AccordionTrigger>
                  Can I try {appName} without adding my own data?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Yes. You can use the{" "}
                  <Link href="/demo" className="text-primary underline">
                    simulation (demo)
                  </Link>{" "}
                  mode to explore a pre-filled account with example livestock,
                  logs, and Health Score. This is useful for testing the
                  interface or showing it to others without using real data.
                </AccordionContent>
              </AccordionItem>

              {/* Q6 */}
              <AccordionItem value="iot-rfid-work">
                <AccordionTrigger>
                  How does the IoT weighing device and RFID integration work?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Each animal has an RFID tag that is registered in {appName}.
                  When the animal steps on the IoT scale, the device reads the
                  RFID, measures the weight, and sends both values (plus a
                  timestamp) to the cloud. If the RFID is already linked to a
                  livestock record, the log is stored and attached to that
                  animal automatically. If no matching RFID exists, the device
                  cannot create a valid log.
                </AccordionContent>
              </AccordionItem>

              {/* Q7 */}
              <AccordionItem value="what-is-health-score">
                <AccordionTrigger>
                  What is the Health Score shown on the dashboard?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  The Health Score is a monthly 1–100 score that summarizes your
                  herd&apos;s condition. It combines:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Changes in total livestock compared to last month.</li>
                    <li>Changes in average weight of all animals.</li>
                    <li>
                      The percentage of animals that are stuck or losing weight.
                    </li>
                  </ul>
                  {appName} converts these into risk values and computes a
                  single score: higher means healthier and more consistent
                  growth, while a lower score is a signal to investigate.
                </AccordionContent>
              </AccordionItem>

              {/* Q8 */}
              <AccordionItem value="public-sharing">
                <AccordionTrigger>
                  What happens if I turn on &quot;Shared&quot; for a livestock?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  On the main dashboard, each livestock row has a{" "}
                  <span className="font-medium">Shared</span> switch. When you
                  enable it:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                      That animal becomes part of the <span className="font-medium">Global</span>{" "}
                      page statistics (total shared livestock, global average
                      weight, highest public record, etc.).
                    </li>
                    <li>
                      Other users can see its public profile and trends in a
                      read-only view.
                    </li>
                  </ul>
                  Your private settings and non-shared animals remain visible
                  only to you.
                </AccordionContent>
              </AccordionItem>

              {/* Q9 */}
              <AccordionItem value="wrong-data">
                <AccordionTrigger>
                  What if I enter or receive the wrong weight data?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  If you notice incorrect data (for example, a typo when
                  entering manual values or a test log from the device), you can
                  edit or remove logs via the relevant livestock detail or data
                  logs view. Keeping accurate logs will improve the quality of
                  charts, Health Score, and any analysis you perform.
                </AccordionContent>
              </AccordionItem>

              {/* Q10 */}
              <AccordionItem value="who-can-see-data">
                <AccordionTrigger>
                  Who can see my farm, livestock, and log data?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  By default, only you (the authenticated account owner) can see
                  your full livestock list and detailed logs. Public visibility
                  happens only when you explicitly turn on the{" "}
                  <span className="font-medium">Shared</span> switch for a
                  livestock. Aggregated statistics on the Global page do not
                  expose your personal identity or full account details.
                </AccordionContent>
              </AccordionItem>

              {/* Q11 */}
              <AccordionItem value="reset-password">
                <AccordionTrigger>
                  I forgot my password. How can I reset it?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  You can reset your password from the{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary underline"
                  >
                    Forgot password
                  </Link>{" "}
                  page. Enter your registered email, and you&apos;ll receive a
                  password reset link. After opening the link, you can safely
                  set a new password.
                </AccordionContent>
              </AccordionItem>

              {/* Q12 */}
              <AccordionItem value="google-login">
                <AccordionTrigger>
                  Can I log in with my Google account?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Yes. On the{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary underline"
                  >
                    Sign in
                  </Link>{" "}
                  page, you can choose to continue with Google. This uses secure
                  OAuth authentication; your Google password is never shared
                  with {appName}.
                </AccordionContent>
              </AccordionItem>

              {/* Q13 */}
              <AccordionItem value="data-privacy">
                <AccordionTrigger>
                  How is my data stored and protected?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Your data is stored in a managed cloud database (Supabase)
                  with authentication and row-level security (RLS), so each user
                  can only access their own records. For more details, please
                  read our{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-primary underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/terms"
                    className="text-primary underline"
                  >
                    Terms of Service
                  </Link>
                  .
                </AccordionContent>
              </AccordionItem>

              {/* Q14 */}
              <AccordionItem value="need-more-help">
                <AccordionTrigger>
                  I still have questions. Where can I get help?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  If your question isn&apos;t covered here, you can:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
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
                      Read step-by-step articles in{" "}
                      <Link
                        href="/support/guides"
                        className="text-primary underline"
                      >
                        Guides
                      </Link>
                      .
                    </li>
                    <li>
                      Reach out directly via{" "}
                      <Link
                        href="/support/contacts"
                        className="text-primary underline"
                      >
                        Contacts
                      </Link>{" "}
                      and describe your issue or feedback.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/main/dashboard">Open dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/guide">Read full guide</Link>
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
