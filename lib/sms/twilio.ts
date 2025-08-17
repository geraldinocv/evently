import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

export interface SMSData {
  to: string
  message: string
}

export async function sendSMS({ to, message }: SMSData) {
  try {
    console.log("[v0] Sending SMS to:", to)

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio credentials not configured")
    }

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    })

    console.log("[v0] SMS sent successfully:", result.sid)
    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error("[v0] SMS sending failed:", error)
    return { success: false, error: error.message }
  }
}

export function formatTicketConfirmationSMS(
  customerName: string,
  eventTitle: string,
  ticketQuantity: number,
  totalAmount: number,
  qrCode: string,
) {
  return `🎫 EVENTLY - Confirmação de Compra

Olá ${customerName}!

Bilhetes confirmados para:
📅 ${eventTitle}
🎟️ Quantidade: ${ticketQuantity}
💰 Total: ${totalAmount} CVE

Código QR: ${qrCode}

Apresente este código na entrada do evento.

Obrigado pela sua compra!`
}

export function formatEventReminderSMS(customerName: string, eventTitle: string, eventDate: string, venue: string) {
  return `🔔 EVENTLY - Lembrete de Evento

Olá ${customerName}!

Seu evento é amanhã:
📅 ${eventTitle}
🕐 ${eventDate}
📍 ${venue}

Não se esqueça de levar seu código QR!

Nos vemos lá! 🎉`
}
