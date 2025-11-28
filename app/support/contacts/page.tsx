"use client";

import { useState } from "react";
import { User, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ContactFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  agreedToPrivacy: boolean;
};

type ContactApiResponse = {
  success?: boolean;
  error?: string;
};

export default function ContactPage() {
  const appName = "Growt";

  const [formData, setFormData] = useState<ContactFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    agreedToPrivacy: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    field: keyof ContactFormState,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.agreedToPrivacy) {
      setErrorMessage(
        "Please agree to the privacy policy before sending your message.",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const json = (await res.json()) as ContactApiResponse;

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to send message.");
      }

      setSuccessMessage(
        "Thank you! We’ve received your message and will get back to you soon.",
      );

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
        agreedToPrivacy: false,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const messageLength = formData.message.length;
  const isSubmitDisabled =
    loading ||
    !formData.firstName.trim() ||
    !formData.lastName.trim() ||
    !formData.phone.trim() ||
    !formData.email.trim() ||
    !formData.message.trim() ||
    !formData.agreedToPrivacy;

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header Section */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Contact {appName} Support
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Having trouble with your account, livestock & RFID, IoT weighing
            device, dashboards, or Health Score? Tell us what&apos;s happening
            and we&apos;ll take a look.
          </p>
        </div>

        {/* Contact Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below with as much detail as possible so we can
              help you faster.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="John"
                      className="pl-9"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Doe"
                      className="pl-9"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us briefly what you need help with (e.g. can’t see logs, RFID not detected, IoT device issue, Health Score looks off, etc.)."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  disabled={loading}
                  className="min-h-28 resize-none"
                />
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <p>{messageLength} characters</p>
                  <p>
                    Tip: Include which page you were on (Dashboard, Data Logs,
                    Global, Settings), what you expected to see, and what
                    actually happened.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={formData.agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    handleChange("agreedToPrivacy", checked === true)
                  }
                  disabled={loading}
                />
                <Label htmlFor="privacy" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitDisabled}
              >
                {loading ? "Sending..." : "Send your message"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <Link href="/support/get-help">Back to Help Center</Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>
              Prefer reaching out directly? You can also use the details below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Email</p>
              <p>support@example.com</p>
              {/* TODO: Update with your real support email, e.g. support@growt.app */}
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Phone</p>
              <p>+62 812-0000-0000</p>
            </div>

            <Separator />

            <div>
              <p className="font-medium text-foreground">Location</p>
              <p>Malang, Indonesia</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
