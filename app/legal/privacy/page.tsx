// app/legal/privacy/page.tsx

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  const appName = "Growt";
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="text-xs">
            Legal • Privacy Policy
          </Badge>
          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Privacy Policy
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Learn how {appName} collects, uses, and protects your personal, farm,
            and livestock data across dashboards, IoT weighing, and global sharing.
          </p>
        </section>

        {/* Main card */}
        <Card>
          <CardHeader>
            <CardTitle>How we handle your data</CardTitle>
            <CardDescription>
              This policy applies when you use {appName} for livestock monitoring,
              RFID &amp; IoT logging, and Health Score analytics.
            </CardDescription>
          </CardHeader>

          {/* halaman yang scroll, bukan card-nya */}
          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* 1. Introduction */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Introduction</h2>
              <p>
                This Privacy Policy explains how {appName} (&quot;we&quot;, &quot;us&quot;,
                or &quot;our&quot;) collects, uses, and protects your personal
                information when you access or use our livestock monitoring and
                analytics service (the &quot;Service&quot;).
              </p>
              <p>
                {appName} is designed to help farmers, cooperatives, and research
                projects manage livestock data, including RFID tags, IoT-based
                weighings, dashboards, and Health Score analytics.
              </p>
              <p>
                By using the Service, you agree to the terms outlined in this Privacy
                Policy. If you do not agree, please stop using the Service.
              </p>
            </section>

            <Separator />

            {/* 2. Information We Collect */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                2. Information We Collect
              </h2>

              <h3 className="mt-2 font-medium text-foreground">
                a. Account & Authentication Information
              </h3>
              <p>When you create an account or sign in, we may collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Name</li>
                <li>Email address</li>
                <li>Password (stored securely using hashing)</li>
                <li>
                  Authentication details from third-party providers (e.g. Google OAuth
                  identifiers)
                </li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                b. Profile & Contact Information
              </h3>
              <p>When you complete your profile and Settings, we may collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Phone number</li>
                <li>Date of birth</li>
                <li>Gender</li>
                <li>
                  Address details (province, regency, district, village, street,
                  postcode, and full address)
                </li>
                <li>Profile photo (if you choose to upload one)</li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                c. Livestock &amp; Farm Data
              </h3>
              <p>
                To provide the livestock tracking features, we store data you submit
                through the dashboard, including:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Livestock profiles (name, breed, species, sex, age, photo)</li>
                <li>RFID tags associated with each animal</li>
                <li>
                  Weight logs and related details (weight values, timestamps, status
                  such as gain, stuck, or loss)
                </li>
                <li>
                  Flags and settings (for example, whether a livestock entry is shared
                  publicly on the Global page)
                </li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                d. IoT Device &amp; Technical Data
              </h3>
              <p>
                When your IoT weighing device sends data to {appName}, we may collect:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>RFID tag read by the device</li>
                <li>Measured weight and unit</li>
                <li>Timestamps of each weighing event</li>
                <li>
                  Basic device or integration information necessary to receive and
                  process the data
                </li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">e. Usage &amp; Analytics Data</h3>
              <p>
                We may collect aggregated analytics data to understand how the Service
                is used and to improve it, such as:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Pages visited (e.g. Dashboard, Data Logs, Global, Settings)</li>
                <li>Interactions with charts and tables</li>
                <li>Device type, browser type, and general usage patterns</li>
              </ul>

              <h3 className="mt-3 font-medium text-foreground">
                f. Cookies &amp; Session Data
              </h3>
              <p>
                We use authentication cookies and tokens provided by our backend
                (including Supabase) to maintain secure sessions and keep you logged
                in. These cookies store encrypted session information and are required
                for core functionality of the Service.
              </p>
            </section>

            <Separator />

            {/* 3. How We Use Your Information */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                3. How We Use Your Information
              </h2>
              <p>Your information may be used to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Provide and maintain the core features of the Service</li>
                <li>Authenticate and manage your account and sessions</li>
                <li>
                  Display livestock data, IoT weight logs, and Health Score analytics
                  on your dashboard
                </li>
                <li>
                  Calculate metrics such as total livestock, average weight, stuck/loss
                  counts, and Health Score
                </li>
                <li>
                  Generate aggregated statistics for the Global page (only using data
                  you choose to share)
                </li>
                <li>Analyze usage to improve performance and user experience</li>
                <li>
                  Communicate important updates, notifications, or security-related
                  information
                </li>
                <li>Prevent misuse, detect suspicious activity, and secure the Service</li>
              </ul>
            </section>

            <Separator />

            {/* 4. How We Share Your Information */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                4. How We Share Your Information
              </h2>
              <p>
                We do <strong>not</strong> sell or rent your personal information. We
                only share it with third parties under the following circumstances:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-medium">Service providers</span> that help us
                  run the Service, such as hosting, database, and analytics providers
                  (for example, Supabase).
                </li>
                <li>
                  <span className="font-medium">Authentication providers</span> such as
                  Google OAuth, if you choose to log in using your Google account.
                </li>
                <li>
                  <span className="font-medium">Legal requirements</span> — if we are
                  required to do so by law, regulation, or legal process.
                </li>
              </ul>
              <p className="mt-2">
                When you enable the <span className="font-medium">Shared</span> option
                for a livestock entry, some of its data becomes visible on the Global
                page and may be included in aggregated public statistics. Your personal
                account credentials and private settings are not disclosed.
              </p>
            </section>

            <Separator />

            {/* 5. Data Security */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Data Security</h2>
              <p>We take reasonable measures to protect your information, including:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Encrypted database storage via Supabase</li>
                <li>Secure authentication tokens and cookies</li>
                <li>Row-level security (RLS) so users can only access their own data</li>
                <li>Access controls and permission systems for internal tools</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic
                storage is completely risk-free. While we strive to protect your data,
                we cannot guarantee absolute security. You use the Service at your own
                risk.
              </p>
            </section>

            <Separator />

            {/* 6. Data Retention & Deletion */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                6. Data Retention &amp; Deletion
              </h2>
              <p>
                We retain your account and related data for as long as your account is
                active or as needed to provide the Service.
              </p>
              <p>You may request deletion of your data by:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Using the <span className="font-medium">Delete account</span> option
                  available in the Settings page; or
                </li>
                <li>
                  Contacting us using the details in the{" "}
                  <span className="font-medium">Contact Us</span> section below.
                </li>
              </ul>
              <p>
                Deleting your account will remove your personal account data, livestock
                records, and associated logs from the main database. In some cases,
                anonymized or aggregated data (for example, statistics that no longer
                identify you personally) may be retained for analytics and reporting
                purposes.
              </p>
            </section>

            <Separator />

            {/* 7. Your Rights */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">7. Your Rights</h2>
              <p>Depending on your local regulations, you may have the right to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Access the personal data we hold about you</li>
                <li>Request corrections or updates to your information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your livestock or weight log data for your own use</li>
                <li>
                  Change your sharing preferences for livestock (for example, turning off
                  the Shared option)
                </li>
              </ul>
              <p>
                To exercise these rights, you can use the controls in your account
                (Settings, Dashboard) or contact us using the information below.
              </p>
            </section>

            <Separator />

            {/* 8. Children's Privacy */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                8. Children’s Privacy
              </h2>
              <p>
                The Service is not intended for individuals under the age of 13. We do
                not knowingly collect personal information from children. If you believe
                that a child has provided us with personal information, please contact us
                so we can take appropriate action.
              </p>
            </section>

            <Separator />

            {/* 9. Changes to This Policy */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in
                the Service, applicable laws, or other operational needs. When we make
                changes, we will update the &quot;Last Updated&quot; date below. In some
                cases, we may also provide additional notice (such as a banner or email
                notification).
              </p>
            </section>

            <Separator />

            {/* 10. Contact Us */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">10. Contact Us</h2>
              <p>
                If you have questions about these Privacy Policy or how your data is
                handled in {appName}, you can contact us at:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Email: <span className="font-medium">support@example.com</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                You can also use the{" "}
                <Link
                  href="/support/contacts"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Contact page
                </Link>{" "}
                in the app if you prefer to send us a message through a form.
              </p>
              <p className="pt-1 text-xs text-muted-foreground">
                By continuing to use {appName}, you acknowledge that you have read,
                understood, and agreed to these Privacy Policy.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/main/dashboard">Open dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/support/get-help">Help Center</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Last Updated: {currentYear}
        </p>
      </div>
    </main>
  );
}
