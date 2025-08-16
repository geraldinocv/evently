import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface AccountConfirmationEmailProps {
  userName: string
  confirmationUrl: string
}

export default function AccountConfirmationEmail({ userName, confirmationUrl }: AccountConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirme a sua conta Evently</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src="/evently-logo.png" width="150" height="50" alt="Evently" style={logo} />
          </Section>

          <Heading style={h1}>Bem-vindo à Evently!</Heading>

          <Text style={text}>Olá {userName},</Text>

          <Text style={text}>
            Obrigado por se registar na Evently! Para completar o seu registo e começar a usar a nossa plataforma,
            precisa de confirmar o seu endereço de email.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={confirmationUrl}>
              Confirmar Email
            </Link>
          </Section>

          <Text style={text}>
            Após a confirmação do email, a sua conta ficará pendente de aprovação pela nossa equipa. Receberá um email
            de confirmação quando a sua conta for aprovada.
          </Text>

          <Text style={text}>Se não se registou na Evently, pode ignorar este email.</Text>

          <Text style={footer}>
            Cumprimentos,
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

const text = {
  color: "#333",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "14px",
  margin: "24px 0",
  padding: "0 40px",
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

const footer = {
  color: "#666",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "12px",
  margin: "24px 0",
  padding: "0 40px",
}
