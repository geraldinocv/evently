import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendTicketConfirmation } from "@/lib/payments/notifications"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { eventId, ticketTypeId, quantity, customerData } = await request.json()

    console.log("[v0] Processing ticket purchase:", { eventId, ticketTypeId, quantity })

    const supabase = createServerClient(cookies())

    // Verificar disponibilidade
    const { data: ticketType, error: ticketError } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("id", ticketTypeId)
      .single()

    if (ticketError || !ticketType) {
      return NextResponse.json({ error: "Ticket type not found" }, { status: 404 })
    }

    if (ticketType.available_quantity < quantity) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 })
    }

    // Calcular total
    const totalAmount = ticketType.price * quantity

    // Gerar QR code único
    const qrCode = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Criar ticket
    const { data: ticket, error: createError } = await supabase
      .from("tickets")
      .insert({
        event_id: eventId,
        ticket_type_id: ticketTypeId,
        user_id: customerData.userId,
        quantity,
        total_amount: totalAmount,
        qr_code: qrCode,
        status: "confirmed",
      })
      .select()
      .single()

    if (createError) {
      throw new Error("Failed to create ticket")
    }

    // Atualizar quantidade disponível
    await supabase
      .from("ticket_types")
      .update({
        available_quantity: ticketType.available_quantity - quantity,
      })
      .eq("id", ticketTypeId)

    // Enviar SMS de confirmação
    const smsResult = await sendTicketConfirmation(ticket.id)

    console.log("[v0] SMS result:", smsResult)

    return NextResponse.json({
      success: true,
      ticket,
      smsNotification: smsResult.success,
    })
  } catch (error) {
    console.error("[v0] Ticket purchase error:", error)
    return NextResponse.json({ error: "Failed to process ticket purchase" }, { status: 500 })
  }
}
