import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to finish setting up your Contributor account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              Verify your email
            </Heading>
            <Text style={paragraph}>Hi {name || "there"},</Text>
            <Text style={paragraph}>
              Thanks for signing up. Confirm your email address to finish setting up your
              account.
            </Text>
            <Button href={verifyUrl} style={button}>
              Verify your email
            </Button>
            <Text style={smallPrint}>
              This link expires in 24 hours. If you didn&apos;t create a Contributor account,
              you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default VerifyEmail;

const main = {
  backgroundColor: "#F7F6F4",
  fontFamily:
    'Georgia, "Times New Roman", serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: "40px 0",
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
};

const heading = {
  color: "#111114",
  fontSize: "22px",
  fontWeight: 600,
  textAlign: "center" as const,
  marginBottom: "24px",
};

const card = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E5E1",
  borderRadius: "4px",
  padding: "32px",
};

const subheading = {
  color: "#111114",
  fontSize: "20px",
  fontWeight: 600,
  marginTop: 0,
};

const paragraph = {
  color: "#3A3A3E",
  fontSize: "15px",
  lineHeight: "1.6",
};

const button = {
  backgroundColor: "#C8102E",
  borderRadius: "4px",
  color: "#FFFFFF",
  display: "block",
  fontSize: "15px",
  fontWeight: 600,
  padding: "14px 0",
  textAlign: "center" as const,
  textDecoration: "none",
  margin: "24px 0",
};

const smallPrint = {
  color: "#7B7A7F",
  fontSize: "13px",
  lineHeight: "1.5",
};
