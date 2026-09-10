import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from "@react-email/components";

interface ModerationNoticeEmailProps {
  recipientName: string;
  action: "unpublished" | "author_suspended";
  articleTitle?: string;
  reason: string;
  dashboardUrl: string;
}

const COPY = {
  unpublished: {
    subject: "One of your articles was unpublished",
    heading: "Your article was unpublished",
  },
  author_suspended: {
    subject: "Your Contributor account has been suspended",
    heading: "Your account was suspended",
  },
};

export function ModerationNoticeEmail({
  recipientName,
  action,
  articleTitle,
  reason,
  dashboardUrl,
}: ModerationNoticeEmailProps) {
  const copy = COPY[action];
  return (
    <Html>
      <Head />
      <Preview>{copy.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              {copy.heading}
            </Heading>
            <Text style={paragraph}>Hi {recipientName || "there"},</Text>
            {action === "unpublished" ? (
              <Text style={paragraph}>
                Your article <strong>{articleTitle}</strong> was reviewed by a Contributor moderator and has been
                unpublished. It is no longer visible to readers.
              </Text>
            ) : (
              <Text style={paragraph}>
                Your Contributor account was reviewed by a moderator and has been suspended. Your published articles
                are no longer visible to readers while your account is suspended.
              </Text>
            )}
            <Section style={reasonBox}>
              <Text style={reasonLabel}>Reported reason</Text>
              <Text style={reasonText}>{reason}</Text>
            </Section>
            <Link href={dashboardUrl} style={button}>
              Go to your dashboard
            </Link>
            <Text style={smallPrint}>
              If you believe this was a mistake, please reach out to Contributor support.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ModerationNoticeEmail;

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

const reasonBox = {
  backgroundColor: "#F7F6F4",
  borderRadius: "4px",
  padding: "16px 20px",
  margin: "20px 0",
};

const reasonLabel = {
  color: "#7B7A7F",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const reasonText = {
  color: "#14141A",
  fontSize: "15px",
  margin: 0,
  textTransform: "capitalize" as const,
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
