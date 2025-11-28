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

export default function TermsOfServicePage() {
  const appName = "Growt";
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <section className="space-y-3 text-center">
          <Badge variant="outline" className="text-xs">
            Legal • Terms of Service
          </Badge>
          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Terms of Service
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Please read these Terms carefully before using {appName} (Growth Recording
            of Weight Tracking) for livestock monitoring, RFID &amp; IoT logging, and
            dashboard analytics.
          </p>
        </section>

        {/* Main card */}
        <Card>
          <CardHeader>
            <CardTitle>Agreement to use {appName}</CardTitle>
            <CardDescription>
              By accessing or using {appName}, you agree to these Terms of Service.
              If you do not agree, you may not use the Service.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* 1. Introduction */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Introduction</h2>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your access to and
                use of {appName} (the &quot;Service&quot;). The Service is designed to
                help farmers, cooperatives, and research projects record livestock
                weights using RFID, IoT devices, and web dashboards.
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms.
                If you do not agree with these Terms, you may not use the Service.
              </p>
              <p>
                We may update or revise these Terms from time to time. When we make
                changes, we will update the &quot;Last updated&quot; date and, where
                appropriate, notify you through the Service. Your continued use of the
                Service after any changes means that you accept the updated Terms.
              </p>
              <p className="italic text-xs">
                These Terms are provided as a general template only and do not constitute
                legal advice. For production or commercial use, please have them reviewed
                by a qualified legal professional.
              </p>
            </section>

            <Separator />

            {/* 2. Eligibility */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. Eligibility</h2>
              <p>
                You may use the Service only if you are at least 18 years old (or the age
                of majority in your jurisdiction) and capable of forming a binding
                contract. By using the Service, you represent and warrant that you meet
                these requirements.
              </p>
            </section>

            <Separator />

            {/* 3. Account Registration */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                3. Account Registration
              </h2>
              <p>
                To access certain features of the Service, such as dashboards,
                Settings, livestock management, and data logs, you may be required to
                create an account.
              </p>
              <p>
                You agree to provide accurate, current, and complete information during
                registration and to keep your account information up to date (including
                your contact details and farm address in the Settings section).
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your login
                credentials and for all activities that occur under your account. If you
                suspect any unauthorized use of your account, you must notify us
                promptly.
              </p>
            </section>

            <Separator />

            {/* 4. Use of the Service */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                4. Use of the Service
              </h2>
              <p>
                You agree to use the Service only in accordance with these Terms and
                applicable laws and regulations. You must not:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Use the Service for any unlawful or fraudulent purpose;</li>
                <li>
                  Attempt to gain unauthorized access to the Service or any related
                  systems or networks;
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the Service,
                  including dashboards, IoT integrations, or database operations;
                </li>
                <li>
                  Upload or transmit any malicious code, viruses, or harmful content; or
                </li>
                <li>
                  Reverse engineer, decompile, or attempt to derive the source code of
                  the Service, except where permitted by law.
                </li>
              </ul>
            </section>

            <Separator />

            {/* 5. Data and Privacy */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                5. Data and Privacy
              </h2>
              <p>
                By using the Service, you may submit data related to your activities,
                such as livestock records, RFID tags, weight logs, farm address details,
                and other operational data. You retain ownership of the data you submit
                to the Service.
              </p>
              <p>
                We process your data in accordance with our{" "}
                <Link
                  href="/legal/privacy"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your information. By
                using the Service, you consent to such processing. You are responsible
                for ensuring that you have all necessary rights and consents to submit
                data to the Service.
              </p>
              <p>
                When you mark livestock as{" "}
                <span className="font-medium">Shared</span>, some of its information may
                be included in aggregated statistics and visible on the Global page.
                You are responsible for deciding which records you choose to share.
              </p>
            </section>

            <Separator />

            {/* 6. Subscription, Payments, and Trials */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                6. Subscription, Payments, and Trials
              </h2>
              <p>
                At this stage, the Service may be used as a learning, prototype, or
                research tool without a formal subscription model. However, these Terms
                also cover any future paid features or plans.
              </p>
              <p>
                If certain features of the Service are offered on a paid or subscription
                basis, your access may be subject to timely payment of applicable fees.
                Unless otherwise stated, all fees will be non-refundable.
              </p>
              <p>
                We may offer free trials or promotional access to premium features. We
                reserve the right to modify, cancel, or limit any trial or promotional
                offer at our sole discretion.
              </p>
            </section>

            <Separator />

            {/* 7. Intellectual Property */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                7. Intellectual Property
              </h2>
              <p>
                The Service, including all software, designs, text, graphics, logos,
                charts, components, and other content (excluding user-submitted data),
                is owned by us or our licensors and is protected by intellectual
                property laws.
              </p>
              <p>
                Subject to your compliance with these Terms, we grant you a limited,
                non-exclusive, non-transferable, revocable license to access and use the
                Service for your internal farm, business, academic, or personal use. You
                may not use our trademarks, logos, or branding without our prior written
                consent.
              </p>
            </section>

            <Separator />

            {/* 8. Third-Party Services */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                8. Third-Party Services
              </h2>
              <p>
                The Service may integrate with or link to third-party services (for
                example, authentication providers, analytics tools, Supabase, or IoT
                infrastructure). We are not responsible for the content, policies, or
                practices of any third-party service and make no warranties about them.
              </p>
              <p>
                Your use of third-party services is subject to their respective terms and
                policies.
              </p>
            </section>

            <Separator />

            {/* 9. Disclaimer of Warranties */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                9. Disclaimer of Warranties
              </h2>
              <p>
                The Service is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis. To the fullest extent permitted by law, we
                disclaim all warranties of any kind, whether express or implied,
                including but not limited to implied warranties of merchantability,
                fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                We do not guarantee that the Service (including dashboards, IoT
                integrations, or Health Score calculations) will be uninterrupted,
                error-free, or secure, or that any data will be accurate or complete.
                You are responsible for maintaining appropriate backups and safeguards
                for your data.
              </p>
            </section>

            <Separator />

            {/* 10. Limitation of Liability */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                10. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, or
                for any loss of profits or revenues, whether incurred directly or
                indirectly, or any loss of data, use, goodwill, or other intangible
                losses, resulting from:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Your access to or use of (or inability to access or use) the Service;
                </li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any unauthorized access, use, or alteration of your data; or</li>
                <li>Any other matter relating to the Service.</li>
              </ul>
            </section>

            <Separator />

            {/* 11. Termination */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                11. Termination
              </h2>
              <p>
                We may suspend or terminate your access to the Service at any time, with
                or without notice, if we reasonably believe that you have violated these
                Terms, pose a risk to other users or to the Service, or as required by
                law.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease.
                Some provisions of these Terms, by their nature, will continue to apply
                after termination (including, without limitation, ownership provisions,
                warranty disclaimers, and limitations of liability).
              </p>
            </section>

            <Separator />

            {/* 12. Changes to These Terms */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                12. Changes to These Terms
              </h2>
              <p>
                We may modify these Terms from time to time. When we do, we will update
                the &quot;Last updated&quot; date at the bottom of this page and, where
                appropriate, provide additional notice within the Service.
              </p>
              <p>
                Your continued use of the Service after the effective date of any
                changes constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <Separator />

            {/* 13. Contact Us */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">13. Contact Us</h2>
              <p>
                If you have questions about these Terms of Service or how your data is
                handled in {appName}, you can contact us at:
              </p>
              <ul className="list-disc space-y-1 pl-5">
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
            </section>
            <p className="pt-1 text-xs text-muted-foreground">
              By continuing to use {appName}, you acknowledge that you have read,
              understood, and agreed to these Terms of Service.
            </p>
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
