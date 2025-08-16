import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const userEmail = "admin@evently.com" // This should come from your auth system

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", userEmail).single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: earnings, error } = await supabase.rpc("get_organizer_earnings", { organizer_id_param: profile.id })

    if (error) {
      console.error("Error fetching earnings:", error)
      return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
    }

    return NextResponse.json(
      earnings[0] || {
        total_earnings: 0,
        pending_earnings: 0,
        total_tickets_sold: 0,
        events_count: 0,
      },
    )
  } catch (error) {
    console.error("Error in earnings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
