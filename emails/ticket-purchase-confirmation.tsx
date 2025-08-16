import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface TicketPurchaseConfirmationProps {
  customerName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  ticketType: string
  quantity: number
  totalAmount: string
  currency: string
  qrCodeUrl: string
  ticketUrl: string
}

export default function TicketPurchaseConfirmation({
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
}: TicketPurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Os seus bilhetes para {eventTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src="/evently-logo.png" width="150" height="50" alt="Evently" style={logo} />
          </Section>

          <Heading style={h1}>Compra Confirmada!</Heading>

          <Text style={text}>Olá {customerName},</Text>

          <Text style={text}>A sua compra foi processada com sucesso! Aqui estão os detalhes dos seus bilhetes:</Text>

          <Section style={eventDetails}>
            <Heading style={h2}>{eventTitle}</Heading>
            <Text style={eventInfo}>
              <strong>Data:</strong> {eventDate}
              <br />
              <strong>Local:</strong> {eventLocation}
              <br />
              <strong>Tipo de Bilhete:</strong> {ticketType}
              <br />
              <strong>Quantidade:</strong> {quantity}
              <br />
              <strong>Total Pago:</strong> {totalAmount} {currency}
            </Text>
          </Section>

          <Section style={qrSection}>
            <Text style={text}>
              <strong>O seu QR Code:</strong>
            </Text>
            <div style={qrContainer}>
              <Img src={qrCodeUrl} width="200" height="200" alt="QR Code do Bilhete" style={qrCode} />
            </div>
            <Text style={qrText}>Apresente este QR code na entrada do evento</Text>
          </Section>

          <Section style={buttonContainer}>
            <Link style={button} href={ticketUrl}>
              Ver Bilhete Completo
            </Link>
          </Section>

          <Section style={instructions}>
            <Heading style={h3}>Instruções Importantes:</Heading>
            <Text style={instructionText}>
              • Guarde este email e o QR code
              <br />• Chegue 30 minutos antes do evento
              <br />• Traga um documento de identificação
              <br />• O QR code é único e não pode ser duplicado
            </Text>
          </Section>

          <Text style={footer}>
            Obrigado por escolher a Evently!
            <br />
            Equipa Evently
          </Text>
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

const logoContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const h1 = {
  color: "#333",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#2563eb",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
}

const h3 = {
  color: "#333",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  fontWeight: "bold",
  margin: "24px 0 12px 0",
}

const text = {
  color: "#333",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "14px",
  margin: "24px 0",
  padding: "0 40px",
}

const eventDetails = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
}

const eventInfo = {
  color: "#333",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
}

const qrSection = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const qrContainer = {
  textAlign: "center" as const,
  margin: "16px 0",
}

const qrCode = {
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
}

const qrText = {
  color: "#666",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "12px",
  margin: "8px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const instructions = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
}

const instructionText = {
  color: "#92400e",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
}

const footer = {
  color: "#666",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "12px",
  margin: "24px 0",
  padding: "0 40px",
  textAlign: "center" as const,
}
