import { Resend } from "resend"
import { render } from "@react-email/render"
import TicketEmail from "../emails/ticket-email"
import AccountConfirmationEmail from "../emails/account-confirmation"
import TicketPurchaseConfirmation from "../emails/ticket-purchase-confirmation"
import type { Ticket } from "./tickets"
import { getBaseUrl } from "./utils"

let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }

  return resend
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendClient = getResendClient()

  if (!resendClient) {
    console.log("[MOCK EMAIL] RESEND_API_KEY not found, using mock email")
    console.log(`[MOCK EMAIL] Sending email to ${to}`)
    console.log(`[MOCK EMAIL] Subject: ${subject}`)
    return
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: "Evently <noreply@evently.app>",
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("[RESEND ERROR]", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("[RESEND SUCCESS] Email sent successfully:", data?.id)
  } catch (error) {
    console.error("[EMAIL ERROR]", error)
    // Fallback to mock in case of error
    console.log(`[FALLBACK EMAIL] Email to ${to} with subject "${subject}"`)
  }
}

export async function sendTicketEmail(tickets: Ticket[]): Promise<void> {
  const resendClient = getResendClient()

  if (!resendClient) {
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

    const { data, error } = await resendClient.emails.send({
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

export async function sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
  const verificationUrl = `${getBaseUrl()}/auth/verify?token=${verificationToken}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verificar Conta - Evently</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Bem-vindo ao Evently!</h1>
          <p>Obrigado por se registrar na nossa plataforma de eventos.</p>
          <p>Para ativar sua conta, clique no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verificar Conta
            </a>
          </div>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #666;">
            Se você não criou uma conta no Evently, pode ignorar este email.
          </p>
        </div>
      </body>
    </html>
  `

  await sendEmail(email, "Verificar sua conta - Evently", html)
}

export async function sendAccountConfirmationEmail(
  email: string,
  userName: string,
  confirmationUrl: string,
): Promise<void> {
  const resendClient = getResendClient()

  if (!resendClient) {
    console.log("[MOCK EMAIL] RESEND_API_KEY not found, using mock email")
    console.log(`[MOCK EMAIL] Sending account confirmation to ${email}`)
    return
  }

  try {
    const emailHtml = render(
      AccountConfirmationEmail({
        userName,
        confirmationUrl,
      }),
    )

    const { data, error } = await resendClient.emails.send({
      from: "Evently <noreply@evently.app>",
      to: [email],
      subject: "Confirme a sua conta Evently",
      html: emailHtml,
    })

    if (error) {
      console.error("[RESEND ERROR]", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("[RESEND SUCCESS] Account confirmation email sent:", data?.id)
  } catch (error) {
    console.error("[EMAIL ERROR]", error)
    console.log(`[FALLBACK EMAIL] Account confirmation to ${email}`)
  }
}

export async function sendTicketPurchaseConfirmationEmail(
  customerEmail: string,
  customerName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  ticketType: string,
  quantity: number,
  totalAmount: string,
  currency: string,
  qrCodeUrl: string,
  ticketUrl: string,
): Promise<void> {
  const resendClient = getResendClient()

  if (!resendClient) {
    console.log("[MOCK EMAIL] RESEND_API_KEY not found, using mock email")
    console.log(`[MOCK EMAIL] Sending ticket purchase confirmation to ${customerEmail}`)
    return
  }

  try {
    const emailHtml = render(
      TicketPurchaseConfirmation({
        customerName,
        eventTitle,
        eventDate,
        eventLocation,
        ticketType,
        quantity,
        totalAmount,
        currency,
        qrCodeUrl,
        ticketUrl,
      }),
    )

    const { data, error } = await resendClient.emails.send({
      from: "Evently <noreply@evently.app>",
      to: [customerEmail],
      subject: `Os seus bilhetes para ${eventTitle} - Evently`,
      html: emailHtml,
    })

    if (error) {
      console.error("[RESEND ERROR]", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("[RESEND SUCCESS] Ticket purchase confirmation sent:", data?.id)
  } catch (error) {
    console.error("[EMAIL ERROR]", error)
    console.log(`[FALLBACK EMAIL] Ticket purchase confirmation to ${customerEmail}`)
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
