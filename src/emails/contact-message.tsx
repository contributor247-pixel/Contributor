import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from "@react-email/components";

interface ContactMessageEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactMessageEmail({ name, email, subject, message }: ContactMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact message from {name}: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              New message from the Contact page
            </Heading>
            <Section style={metaRow}>
              <Text style={metaLabel}>From</Text>
              <Text style={metaValue}>
                {name} &lt;<Link href={`mailto:${email}`} style={metaLink}>{email}</Link>&gt;
              </Text>
            </Section>
            <Section style={metaRow}>
              <Text style={metaLabel}>Subject</Text>
              <Text style={metaValue}>{subject}</Text>
            </Section>
            <Text style={paragraph}>{message}</Text>
            <Text style={smallPrint}>
              Reply directly to this email to respond to {name} at {email}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactMessageEmail;

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
  color: "#14141A",
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
  color: "#14141A",
  fontSize: "20px",
  fontWeight: 600,
  marginTop: 0,
};

const metaRow = {
  margin: "16px 0",
};

const metaLabel = {
  color: "#7B7A7F",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 2px",
};

const metaValue = {
  color: "#14141A",
  fontSize: "15px",
  margin: 0,
};

const metaLink = {
  color: "#8B1E3F",
};

const paragraph = {
  color: "#3A3A3E",
  fontSize: "15px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap" as const,
  backgroundColor: "#F7F6F4",
  borderRadius: "4px",
  padding: "16px 20px",
  margin: "20px 0",
};

const smallPrint = {
  color: "#7B7A7F",
  fontSize: "12px",
  marginTop: "20px",
};
