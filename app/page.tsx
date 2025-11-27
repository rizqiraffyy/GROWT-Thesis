import { redirect } from "next/navigation"
import { getSupabaseServerReadOnly } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await getSupabaseServerReadOnly()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/main/dashboard")
  }

  redirect("/auth/signin")
}