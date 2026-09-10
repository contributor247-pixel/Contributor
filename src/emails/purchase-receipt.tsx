import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from "@react-email/components";

interface PurchaseReceiptEmailProps {
  recipientName: string;
  itemLabel: string;
  amountCents: number;
  dashboardUrl: string;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PurchaseReceiptEmail({ recipientName, itemLabel, amountCents, dashboardUrl }: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your receipt for {itemLabel} — {formatCents(amountCents)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              Thanks for your purchase
            </Heading>
            <Text style={paragraph}>Hi {recipientName || "there"},</Text>
            <Text style={paragraph}>
              This confirms your purchase of <strong>{itemLabel}</strong>.
            </Text>
            <Section style={receiptRow}>
              <Text style={receiptLabel}>Amount charged</Text>
              <Text style={receiptAmount}>{formatCents(amountCents)}</Text>
            </Section>
            <Link href={dashboardUrl} style={button}>
              View in your dashboard
            </Link>
            <Text style={smallPrint}>
              This was charged to the payment method you used at checkout. Keep this email for your records.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PurchaseReceiptEmail;

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

const paragraph = {
  color: "#3A3A3E",
  fontSize: "15px",
  lineHeight: "1.6",
};

const receiptRow = {
  backgroundColor: "#F7F6F4",
  borderRadius: "4px",
  padding: "16px 20px",
  margin: "20px 0",
};

const receiptLabel = {
  color: "#7B7A7F",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const receiptAmount = {
  color: "#14141A",
  fontSize: "24px",
  fontWeight: 600,
  margin: 0,
};

const button = {
  backgroundColor: "#8B1E3F",
  borderRadius: "4px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  margin: "16px 0",
  padding: "12px 24px",
  textDecoration: "none",
};

const smallPrint = {
  color: "#7B7A7F",
  fontSize: "13px",
  lineHeight: "1.5",
};
