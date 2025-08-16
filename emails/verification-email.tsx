import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components"

interface VerificationEmailProps {
  name: string
  verificationUrl: string
}

export default function VerificationEmail({ name, verificationUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirme sua conta na plataforma Evently</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bem-vindo à Evently!</Heading>
          <Text style={text}>Olá {name},</Text>
          <Text style={text}>
            Obrigado por se registrar na plataforma Evently. Para completar o seu registro e começar a usar a
            plataforma, por favor confirme o seu endereço de email clicando no botão abaixo:
          </Text>
          <Link href={verificationUrl} style={button}>
            Confirmar Email
          </Link>
          <Text style={text}>Se não conseguir clicar no botão, copie e cole este link no seu navegador:</Text>
          <Text style={link}>{verificationUrl}</Text>
          <Text style={text}>Este link expira em 24 horas por motivos de segurança.</Text>
          <Text style={text}>Se não criou esta conta, pode ignorar este email.</Text>
          <Text style={text}>
            Atenciosamente,
            <br />
            Equipa Evently
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
}

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
  margin: "20px 0",
}

const link = {
  color: "#007ee6",
  fontSize: "14px",
  textDecoration: "underline",
}
