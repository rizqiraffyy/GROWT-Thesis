// app/legal/privacy/page.tsx

import Link from "next/link"

import { ModeToggle } from "@/components/dark-mode"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  const appName = "Growt" // ganti sesuai nama aplikasi kamu

  return (
    <main className="flex min-h-screen justify-center px-4 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>
              How we collect, use, and protect your personal information.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* 1. Introduction */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                1. Introduction
              </h2>
              <p>
                This Privacy Policy explains how {appName} (&quot;we&quot;,
                &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects
                your personal information when you access or use the Service.
              </p>
              <p>
                By using the Service, you agree to the terms outlined in this
                Privacy Policy. If you do not agree, please stop using the Service.
              </p>
            </section>

            <Separator />

            {/* 2. Information We Collect */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                2. Information We Collect
              </h2>

              <h3 className="font-medium text-foreground">a. Account Information</h3>
              <p>When you register, we collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Password (stored securely through hashing)</li>
              </ul>

              <h3 className="font-medium text-foreground mt-3">
                b. Usage Data
              </h3>
              <p>
                We collect aggregated analytics data such as pages visited,
                device type, and interaction events to improve the Service.
              </p>

              <h3 className="font-medium text-foreground mt-3">
                c. Livestock & Farm Data
              </h3>
              <p>
                If your app includes livestock or farm tracking features, we may
                collect and store data you submit such as livestock records,
                weight logs, and farm activity data.
              </p>

              <h3 className="font-medium text-foreground mt-3">
                d. Cookies & Authentication Data
              </h3>
              <p>
                We use authentication cookies provided by Supabase to maintain
                secure sessions. These cookies store encrypted access tokens required for login.
              </p>
            </section>

            <Separator />

            {/* 3. How We Use Your Information */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                3. How We Use Your Information
              </h2>
              <p>Your information may be used to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide and maintain the core features of the Service</li>
                <li>Authenticate and manage your account</li>
                <li>Analyze usage to improve performance and user experience</li>
                <li>
                  Communicate updates, notifications, or important security alerts
                </li>
                <li>Secure and protect the Service from misuse or unauthorized access</li>
              </ul>
            </section>

            <Separator />

            {/* 4. How We Share Information */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                4. How We Share Your Information
              </h2>
              <p>
                We do <strong>not</strong> sell or rent your personal information.  
                We only share it with third parties under these circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Service providers such as hosting or analytics partners</li>
                <li>Authentication provider (e.g., Google OAuth)</li>
                <li>If required by law, regulation, or legal process</li>
              </ul>
            </section>

            <Separator />

            {/* 5. Data Security */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                5. Data Security
              </h2>
              <p>
                We take reasonable measures to protect your information using:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Encrypted database storage (via Supabase)</li>
                <li>Secure authentication cookies</li>
                <li>Access controls and permission systems</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure.  
                You use the Service at your own risk.
              </p>
            </section>

            <Separator />

            {/* 6. Your Rights */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                6. Your Rights
              </h2>
              <p>You may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access your personal data</li>
                <li>Request corrections or updates</li>
                <li>Request deletion of your account</li>
                <li>Export your livestock or farm data</li>
              </ul>
            </section>

            <Separator />

            {/* 7. Children's Privacy */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                7. Children’s Privacy
              </h2>
              <p>
                This Service is not intended for individuals under the age of 13.
                We do not knowingly collect personal data from children.
              </p>
            </section>

            <Separator />

            {/* 8. Changes */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                8. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we
                will update the “Last Updated” date below.
              </p>
            </section>

            <Separator />

            {/* 9. Contact */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                9. Contact Us
              </h2>
              <p>If you have questions about this Privacy Policy, contact us at:</p>

              <ul className="list-disc pl-5">
                <li>
                  Email: <span className="font-medium">support@example.com</span>
                </li>
              </ul>

              <p className="text-xs text-muted-foreground">
                Replace the contact information above with your actual support address.
              </p>
            </section>

            <p className="pt-4 text-xs text-muted-foreground">
              Last Updated: {new Date().getFullYear()}
            </p>

            <div className="pt-4 text-right text-xs">
              <Link
                href="/"
                className="text-primary underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}