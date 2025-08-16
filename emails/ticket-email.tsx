import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"
import type { Ticket } from "../lib/tickets"
import { getBaseUrl } from "../lib/utils"

interface TicketEmailProps {
  tickets: Ticket[]
  customerName: string
}

export default function TicketEmail({ tickets, customerName }: TicketEmailProps) {
  const firstTicket = tickets[0]

  return (
    <Html>
      <Head />
      <Preview>Seus bilhetes para {firstTicket.eventTitle} - Evently</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎟️ Seus Bilhetes - Evently</Heading>

          <Text style={text}>Olá {customerName},</Text>

          <Text style={text}>
            Obrigado pela sua compra! Aqui estão os seus bilhetes para <strong>{firstTicket.eventTitle}</strong>.
          </Text>

          {tickets.map((ticket, index) => (
            <Section key={ticket.id} style={ticketSection}>
              <Heading style={h2}>Bilhete #{index + 1}</Heading>
              <Text style={ticketInfo}>
                <strong>Tipo:</strong> {ticket.ticketTypeName}
                <br />
                <strong>Preço:</strong> €{ticket.price}
                <br />
                <strong>ID:</strong> {ticket.id}
              </Text>

              <Section style={qrSection}>
                <Img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrCode)}`}
                  alt="QR Code do Bilhete"
                  width="200"
                  height="200"
                  style={qrCode}
                />
              </Section>

              <Text style={text}>
                <Link href={`${getBaseUrl()}/ticket/${ticket.uniqueLink}`} style={button}>
                  Ver Bilhete Online
                </Link>
              </Text>
            </Section>
          ))}

          <Text style={text}>
            <strong>Instruções importantes:</strong>
          </Text>
          <Text style={text}>
            • Apresente o QR code na entrada do evento
            <br />• Guarde este email ou acesse o link do bilhete
            <br />• Chegue com antecedência para evitar filas
          </Text>

          <Text style={footer}>Evently - Plataforma de Gestão de Eventos</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
}

const ticketSection = {
  border: "1px solid #eee",
  borderRadius: "8px",
  margin: "20px 0",
  padding: "20px",
}

const ticketInfo = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "10px 0",
}

const qrSection = {
  textAlign: "center" as const,
  margin: "20px 0",
}

const qrCode = {
  border: "1px solid #eee",
  borderRadius: "8px",
}

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "10px 0",
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "40px",
}
