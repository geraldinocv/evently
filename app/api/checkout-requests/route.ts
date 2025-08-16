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

    const { data: requests, error } = await supabase
      .from("checkout_requests")
      .select("*")
      .eq("organizer_id", profile.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching checkout requests:", error)
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("Error in checkout requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { amount, notes } = await request.json()

    const userEmail = "admin@evently.com" // This should come from your auth system

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", userEmail).single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: checkoutRequest, error } = await supabase
      .from("checkout_requests")
      .insert({
        organizer_id: profile.id,
        amount: Number.parseFloat(amount),
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating checkout request:", error)
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
    }

    return NextResponse.json(checkoutRequest)
  } catch (error) {
    console.error("Error in checkout request creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
