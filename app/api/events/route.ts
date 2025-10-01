import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Events API: Starting request")
    const supabase = createClient()
    console.log("[v0] Events API: Supabase client created")

    const { data: events, error } = await supabase.from("events").select("*").order("date", { ascending: true })

    console.log("[v0] Events API: Query executed", {
      hasData: !!events,
      dataLength: events?.length,
      hasError: !!error,
      errorDetails: error,
    })

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch events",
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Events API: Returning events", events?.length || 0)
    return NextResponse.json(events || [])
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        ...body,
        organizer_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to create event", details: error.message }, { status: 500 })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 },
    )
  }
}
