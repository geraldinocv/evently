import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Events API: Creating Supabase client...")
    const supabase = createClient()

    console.log("[v0] Events API: Fetching events from database...")
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, description, date, location, price, max_attendees, image_url, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Database error:", error.message, error.details)
      return NextResponse.json({ error: "Failed to fetch events", details: error.message }, { status: 500 })
    }

    console.log("[v0] Events API: Successfully fetched", events?.length || 0, "events")
    return NextResponse.json(events || [])
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
