import { type NextRequest, NextResponse } from "next/server"
import { validateVinti4Response } from "@/lib/payments/vinti4"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const responseData: any = {}

    formData.forEach((value, key) => {
      responseData[key] = value.toString()
    })

    console.log("[v0] Vinti4 callback received:", responseData)

    const validation = validateVinti4Response(responseData)

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const ticketTypeId = searchParams.get("ticketTypeId")
    const quantity = Number.parseInt(searchParams.get("quantity") || "1")
    const customerName = searchParams.get("customerName") || ""
    const customerEmail = searchParams.get("customerEmail") || ""
    const customerPhone = searchParams.get("customerPhone") || ""

    if (validation.success && validation.fingerPrintValid) {
      const { data: event } = await supabase.from("events").select("*, ticket_types(*)").eq("id", eventId).single()

      if (event) {
        const ticketType = event.ticket_types.find((tt: any) => tt.id === ticketTypeId)

        if (ticketType) {
          const tickets = []
          for (let i = 0; i < quantity; i++) {
            const uniqueLink = `vinti4-${responseData.merchantRespTid}-${Date.now()}-${i}`

            tickets.push({
              event_id: eventId,
              ticket_type_id: ticketTypeId,
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              unique_link: uniqueLink,
              qr_code: uniqueLink,
              status: "active",
              payment_method: "vinti4",
              payment_reference: responseData.merchantRespTid,
              amount_paid: Number.parseFloat(responseData.merchantRespPurchaseAmount),
            })
          }

          const { data: createdTickets } = await supabase.from("tickets").insert(tickets).select()

          await supabase.from("transactions").insert({
            event_id: eventId,
            customer_email: customerEmail,
            amount: Number.parseFloat(responseData.merchantRespPurchaseAmount),
            currency: "CVE",
            payment_method: "vinti4",
            payment_reference: responseData.merchantRespTid,
            status: "completed",
            transaction_data: responseData,
          })

          console.log("[v0] Tickets created successfully:", createdTickets)

          return NextResponse.redirect(
            new URL(`/events/${eventId}/success?tickets=${createdTickets?.length}&payment=vinti4`, request.url),
          )
        }
      }
    }

    const errorMessage = validation.message
    console.log("[v0] Payment failed:", errorMessage)

    return NextResponse.redirect(
      new URL(`/events/${eventId}/error?message=${encodeURIComponent(errorMessage)}`, request.url),
    )
  } catch (error) {
    console.error("[v0] Vinti4 callback error:", error)

    return NextResponse.redirect(
      new URL(`/events/error?message=${encodeURIComponent("Erro no processamento do pagamento")}`, request.url),
    )
  }
}
