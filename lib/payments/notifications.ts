import { sendSMS, formatTicketConfirmationSMS } from "../sms/twilio"
import { createServerClient } from "../supabase/server"
import { cookies } from "next/headers"

export async function sendTicketConfirmation(ticketId: string) {
  try {
    console.log("[v0] Sending ticket confirmation for:", ticketId)

    const supabase = createServerClient(cookies())

    // Buscar dados do ticket e evento
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        events (
          title,
          date,
          venue
        ),
        profiles (
          name,
          phone
        )
      `)
      .eq("id", ticketId)
      .single()

    if (error || !ticket) {
      throw new Error("Ticket not found")
    }

    if (!ticket.profiles?.phone) {
      console.log("[v0] No phone number for ticket:", ticketId)
      return { success: false, error: "No phone number" }
    }

    const message = formatTicketConfirmationSMS(
      ticket.profiles.name || "Cliente",
      ticket.events.title,
      ticket.quantity,
      ticket.total_amount,
      ticket.qr_code,
    )

    const result = await sendSMS({
      to: ticket.profiles.phone,
      message,
    })

    // Registrar notificação na base de dados
    if (result.success) {
      await supabase.from("notifications").insert({
        user_id: ticket.user_id,
        type: "sms",
        title: "Confirmação de Bilhete",
        message: "SMS de confirmação enviado",
        metadata: {
          ticket_id: ticketId,
          sms_id: result.messageId,
        },
      })
    }

    return result
  } catch (error) {
    console.error("[v0] Error sending ticket confirmation:", error)
    return { success: false, error: error.message }
  }
}

export async function scheduleEventReminders(eventId: string) {
  try {
    const supabase = createServerClient(cookies())

    // Buscar todos os tickets do evento
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(`
        *,
        events (
          title,
          date,
          venue
        ),
        profiles (
          name,
          phone
        )
      `)
      .eq("event_id", eventId)

    if (error || !tickets) {
      throw new Error("No tickets found for event")
    }

    // Agendar lembretes (implementar com cron job ou similar)
    console.log("[v0] Scheduling reminders for", tickets.length, "tickets")

    return { success: true, count: tickets.length }
  } catch (error) {
    console.error("[v0] Error scheduling reminders:", error)
    return { success: false, error: error.message }
  }
}
