export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

type ContactPayload = {
  firstName: string
  lastName: string
  phone: string
  email: string
  message: string
}

// simple type guard (no any)
function isValidPayload(body: unknown): body is ContactPayload {
  if (typeof body !== "object" || body === null) return false
  const b = body as Record<string, unknown>

  return (
    typeof b.firstName === "string" &&
    typeof b.lastName === "string" &&
    typeof b.phone === "string" &&
    typeof b.email === "string" &&
    typeof b.message === "string"
  )
}

export async function POST(req: Request) {
  const noStore = { "Cache-Control": "no-store" as const }

  try {
    // guard content-type
    const contentType = req.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 415, headers: noStore },
      )
    }

    // parse body
    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: noStore },
      )
    }

    if (!isValidPayload(raw)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400, headers: noStore },
      )
    }

    const { firstName, lastName, phone, email, message } = raw

    // basic email sanity check (optional)
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400, headers: noStore },
      )
    }

    // env config (SMTP)
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      CONTACT_RECEIVER_EMAIL,
    } = process.env

    if (
      !SMTP_HOST ||
      !SMTP_PORT ||
      !SMTP_USER ||
      !SMTP_PASS ||
      !CONTACT_RECEIVER_EMAIL
    ) {
      console.error("[contact] SMTP env not configured")
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500, headers: noStore },
      )
    }

    // create transporter (nodemailer)
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // note: true only for 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    const subject = `[Growt Contact] Message from ${firstName} ${lastName}`

    const text = `
New contact form submission:

Name  : ${firstName} ${lastName}
Phone : ${phone}
Email : ${email}

Message:
${message}
    `.trim()

    // send mail
    await transporter.sendMail({
      from: `"Growt Contact" <${SMTP_USER}>`, // note: sender = SMTP user
      to: CONTACT_RECEIVER_EMAIL,            // note: your inbox
      replyTo: email,                        // note: reply goes to user
      subject,
      text,
    })

    return NextResponse.json(
      { success: true },
      { status: 200, headers: noStore },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("[contact] Fatal error:", msg)

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
