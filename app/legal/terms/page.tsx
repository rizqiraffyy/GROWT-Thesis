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

export default function TermsOfServicePage() {
  const appName = "GROWT (Growth Recording of Weight Tracking)"

  return (
    <main className="flex min-h-screen justify-center px-4 py-10">
      {/* Theme toggle*/}
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
            <CardDescription>
              Please read these Terms of Service carefully before using {appName}.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                1. Introduction
              </h2>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of
                {` ${appName} `} (the &quot;Service&quot;). By accessing or using the Service,
                you agree to be bound by these Terms. If you do not agree, you may not use
                the Service.
              </p>
              <p>
                {appName} may update or revise these Terms from time to time. When we make
                changes, we will update the &quot;Last updated&quot; date and, where
                appropriate, notify you through the Service. Your continued use of the
                Service after any changes means that you accept the updated Terms.
              </p>
              <p className="italic text-xs">
                These Terms are provided as a general template only and do not constitute
                legal advice. For production use, please have them reviewed by a qualified
                legal professional.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                2. Eligibility
              </h2>
              <p>
                You may use the Service only if you are at least 18 years old (or the age
                of majority in your jurisdiction) and capable of forming a binding contract.
                By using the Service, you represent and warrant that you meet these
                requirements.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                3. Account Registration
              </h2>
              <p>
                To access certain features of the Service, you may be required to create an
                account. You agree to provide accurate, current, and complete information
                during registration and to keep your account information up to date.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your login
                credentials and for all activities that occur under your account. If you
                suspect any unauthorized use of your account, you must notify us promptly.
              </p>
            </section>

            <Separator />

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
                  Attempt to gain unauthorized access to the Service or any related systems
                  or networks;
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the Service;
                </li>
                <li>
                  Upload or transmit any malicious code, viruses, or harmful content; or
                </li>
                <li>
                  Reverse engineer, decompile, or attempt to derive the source code of the
                  Service, except where permitted by law.
                </li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                5. Data and Privacy
              </h2>
              <p>
                By using the Service, you may submit data related to your activities (for
                example, livestock records, farm information, or other operational data).
                You retain ownership of the data you submit to the Service.
              </p>
              <p>
                We process your data in accordance with our Privacy Policy, which describes
                how we collect, use, and protect your information. By using the Service, you
                consent to such processing. You are responsible for ensuring that you have
                all necessary rights and consents to submit data to the Service.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                6. Subscription, Payments, and Trials
              </h2>
              <p>
                If certain features of the Service are offered on a paid or subscription
                basis, your access may be subject to timely payment of applicable fees.
                Unless otherwise stated, all fees are non-refundable.
              </p>
              <p>
                We may offer free trials or promotional access to premium features. We
                reserve the right to modify, cancel, or limit any trial or promotional
                offer at our sole discretion.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                7. Intellectual Property
              </h2>
              <p>
                The Service, including all software, designs, text, graphics, logos, and
                other content (excluding user-submitted data), is owned by us or our
                licensors and is protected by intellectual property laws.
              </p>
              <p>
                Subject to your compliance with these Terms, we grant you a limited,
                non-exclusive, non-transferable, revocable license to access and use the
                Service for your internal business or personal use. You may not use our
                trademarks, logos, or branding without our prior written consent.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                8. Third-Party Services
              </h2>
              <p>
                The Service may integrate with or link to third-party services (for example,
                authentication providers, analytics tools, or cloud platforms). We are not
                responsible for the content, policies, or practices of any third-party
                service and make no warranties about them.
              </p>
              <p>
                Your use of third-party services is subject to their respective terms and
                policies.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                9. Disclaimer of Warranties
              </h2>
              <p>
                The Service is provided on an &quot;as is&quot; and &quot;as available&quot;
                basis. To the fullest extent permitted by law, we disclaim all warranties of
                any kind, whether express or implied, including but not limited to implied
                warranties of merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
              <p>
                We do not guarantee that the Service will be uninterrupted, error-free, or
                secure, or that any data will be accurate or complete. You are responsible
                for maintaining appropriate backups and safeguards for your data.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                10. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, or for
                any loss of profits or revenues, whether incurred directly or indirectly,
                or any loss of data, use, goodwill, or other intangible losses, resulting
                from:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Your access to or use of (or inability to access or use) the Service;</li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any unauthorized access, use, or alteration of your data; or</li>
                <li>Any other matter relating to the Service.</li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                11. Termination
              </h2>
              <p>
                We may suspend or terminate your access to the Service at any time, with or
                without notice, if we reasonably believe that you have violated these Terms,
                pose a risk to other users or to the Service, or as required by law.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. Some
                provisions of these Terms, by their nature, will continue to apply after
                termination (including, without limitation, ownership provisions, warranty
                disclaimers, and limitations of liability).
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                12. Changes to These Terms
              </h2>
              <p>
                We may modify these Terms from time to time. When we do, we will update the
                &quot;Last updated&quot; date at the bottom of this page and, where
                appropriate, provide additional notice within the Service.
              </p>
              <p>
                Your continued use of the Service after the effective date of any changes
                constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                13. Contact Us
              </h2>
              <p>
                If you have any questions about these Terms or the Service, you can contact
                us at:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Email: <span className="font-medium">support@example.com</span></li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Replace the contact information above with your actual support or company
                contact details.
              </p>
            </section>

            <p className="pt-4 text-xs text-muted-foreground">
              Last updated: {new Date().getFullYear()}
            </p>

            <p className="pt-1 text-xs text-muted-foreground">
              By continuing to use {appName}, you acknowledge that you have read, understood,
              and agreed to these Terms of Service.
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
