import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: events, error } = await supabase
      .from("events")
      .select(`
        *,
        profiles!events_organizer_id_fkey (
          name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching events:", error)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    return NextResponse.json(events || [])
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
