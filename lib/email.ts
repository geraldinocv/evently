import { Resend } from "resend"
import { render } from "@react-email/render"
import TicketEmail from "../emails/ticket-email"
import type { Ticket } from "./tickets"
import { getBaseUrl } from "./utils"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTicketEmail(tickets: Ticket[]): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[MOCK EMAIL] RESEND_API_KEY not found, using mock email")
    console.log(`[MOCK EMAIL] Sending ${tickets.length} ticket(s) to ${tickets[0].customerEmail}`)
    return
  }

  try {
    const emailHtml = render(
      TicketEmail({
        tickets,
        customerName: tickets[0].customerName,
      }),
    )

    const { data, error } = await resend.emails.send({
      from: "Evently <noreply@evently.app>",
      to: [tickets[0].customerEmail],
      subject: `Seus bilhetes para ${tickets[0].eventTitle} - Evently`,
      html: emailHtml,
    })

    if (error) {
      console.error("[RESEND ERROR]", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("[RESEND SUCCESS] Email sent successfully:", data?.id)
  } catch (error) {
    console.error("[EMAIL ERROR]", error)
    // Fallback to mock in case of error
    console.log(`[FALLBACK EMAIL] Sending ${tickets.length} ticket(s) to ${tickets[0].customerEmail}`)
  }
}

export async function sendTicketSMS(tickets: Ticket[]): Promise<void> {
  // SMS functionality can be added later with services like Twilio
  console.log(`[MOCK SMS] Sending ${tickets.length} ticket link(s) to ${tickets[0].customerPhone}`)
  console.log("SMS content would include:")
  tickets.forEach((ticket) => {
    console.log(`- Event: ${ticket.eventTitle}`)
    console.log(`- Link: ${getBaseUrl()}/ticket/${ticket.uniqueLink}`)
  })
}
