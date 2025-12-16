import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function VerifyEmail({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Notesify - Verify your email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={logoText}>Notesify</Text>

            <Heading style={heading}>Verify your email</Heading>
            <Text style={paragraph}>
              Click below to verify your email address
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={redirectUrl}>
                Verify Email
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            If the button doesn't work, copy this link into your browser:
          </Text>
          <Link href={redirectUrl} style={link}>
            {redirectUrl}
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: 'Georgia, "Times New Roman", serif',
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  padding: "0 24px",
  maxWidth: "480px",
};

const content = {
  textAlign: "center" as const,
};

const logoText = {
  fontSize: "24px",
  fontWeight: "400",
  color: "#1a1a1a",
  margin: "0 0 32px",
  textAlign: "center" as const,
};

const heading = {
  fontSize: "32px",
  fontWeight: "400",
  color: "#1a1a1a",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#6b7280",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "8px 0 0",
};

const button = {
  backgroundColor: "#3B82F6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "40px 0 24px",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#9ca3af",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const link = {
  fontSize: "13px",
  color: "#3B82F6",
  wordBreak: "break-all" as const,
  textAlign: "center" as const,
  display: "block" as const,
};
