import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

interface OtpCodeEmailProps {
  name: string;
  code: string;
}

export function OtpCodeEmail({ name, code }: OtpCodeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Contributor sign-in code is {code}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              Your sign-in code
            </Heading>
            <Text style={paragraph}>Hi {name || "there"},</Text>
            <Text style={paragraph}>Use this code to finish signing in:</Text>
            <Text style={codeStyle}>{code}</Text>
            <Text style={smallPrint}>
              This code expires in 10 minutes. If you didn&apos;t try to sign in, you can
              safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OtpCodeEmail;

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

const codeStyle = {
  backgroundColor: "#F7F6F4",
  border: "1px solid #E7E5E1",
  borderRadius: "4px",
  color: "#C8102E",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "8px",
  margin: "24px 0",
  padding: "16px 0",
  textAlign: "center" as const,
};

const smallPrint = {
  color: "#7B7A7F",
  fontSize: "13px",
  lineHeight: "1.5",
};
