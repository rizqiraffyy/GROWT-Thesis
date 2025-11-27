"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function FAQPage() {
  const appName = "Growt" // ganti kalau nama aplikasinya beda

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
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
            Find quick answers to common questions about {appName}, from account access
            to livestock tracking and data privacy.
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
                  {appName} is a web-based tool to help farmers and livestock owners track
                  their animals&apos; growth and condition over time. You can record
                  weights, monitor trends, and quickly see which animals need extra
                  attention.
                </AccordionContent>
              </AccordionItem>

              {/* Q2 */}
              <AccordionItem value="how-to-start">
                <AccordionTrigger>
                  How do I get started with {appName}?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
                  <p>
                    Getting started is simple:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Create an account on the{" "}
                      <Link href="/auth/signup" className="text-primary underline">
                        Sign up
                      </Link>{" "}
                      page.
                    </li>
                    <li>
                      Log in via the{" "}
                      <Link href="/auth/signin" className="text-primary underline">
                        Sign in
                      </Link>{" "}
                      page.
                    </li>
                    <li>
                      Add your livestock data and start recording weight updates.
                    </li>
                    <li>Use the dashboard to monitor growth and performance.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* Q3 */}
              <AccordionItem value="is-it-free">
                <AccordionTrigger>
                  Is {appName} free to use?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  At this stage, {appName} is intended as a learning and research tool. If
                  you plan to use it in production or at larger scale, you can adjust the
                  pricing model later. For now, you can treat it as an internal project
                  without public billing.
                </AccordionContent>
              </AccordionItem>

              {/* Q4 */}
              <AccordionItem value="reset-password">
                <AccordionTrigger>
                  I forgot my password. How can I reset it?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  You can reset your password from the{" "}
                  <Link href="/auth/forgot-password" className="text-primary underline">
                    Forgot password
                  </Link>{" "}
                  page. Enter your registered email, and we&apos;ll send you a password
                  reset link. After clicking the link in your email, you can set a new
                  password securely.
                </AccordionContent>
              </AccordionItem>

              {/* Q5 */}
              <AccordionItem value="google-login">
                <AccordionTrigger>
                  Can I log in with my Google account?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Yes. On the{" "}
                  <Link href="/auth/signin" className="text-primary underline">
                    Sign in
                  </Link>{" "}
                  page, you can choose to continue with Google. This uses secure OAuth
                  authentication and does not expose your Google password to {appName}.
                </AccordionContent>
              </AccordionItem>

              {/* Q6 */}
              <AccordionItem value="data-privacy">
                <AccordionTrigger>
                  How is my data stored and protected?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Your data is stored in a managed database via Supabase. We use secure
                  authentication, row-level security, and access control so that each user
                  can only see their own records. For more details, please read our{" "}
                  <Link href="/legal/privacy" className="text-primary underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/terms" className="text-primary underline">
                    Terms of Service
                  </Link>
                  .
                </AccordionContent>
              </AccordionItem>

              {/* Q7 */}
              <AccordionItem value="livestock-tracking">
                <AccordionTrigger>
                  What kind of livestock information can I track?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  You can record basic details such as species, ID or tag number, sex, and
                  notes. The system focuses on weight tracking and growth trends over time
                  so you can monitor whether each animal is gaining, stable, or losing
                  weight.
                </AccordionContent>
              </AccordionItem>

              {/* Q8 */}
              <AccordionItem value="wrong-data">
                <AccordionTrigger>
                  What if I enter the wrong weight or data?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  You can update existing records or correct mistakes through the
                  livestock and weight history interfaces. Keeping accurate data will
                  improve the quality of the dashboard insights.
                </AccordionContent>
              </AccordionItem>

              {/* Q9 */}
              <AccordionItem value="who-can-see-data">
                <AccordionTrigger>
                  Who can see my farm and livestock data?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  By default, only you (the authenticated account owner) can access your
                  data. If in the future you add multi-user or team features, you can
                  define which users have access to specific farms or livestock.
                </AccordionContent>
              </AccordionItem>

              {/* Q10 */}
              <AccordionItem value="need-more-help">
                <AccordionTrigger>
                  I still have questions. How can I contact you?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  If your question isn&apos;t covered here, you can reach out via the{" "}
                  <Link href="/contacts" className="text-primary underline">
                    Contact page
                  </Link>
                  . Share your issue or request, and we&apos;ll respond as soon as
                  possible.
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
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
