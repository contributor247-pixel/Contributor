import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from "@react-email/components";

interface PublicationInviteEmailProps {
  inviteeName: string;
  publicationName: string;
  inviterName: string;
  invitesUrl: string;
}

export function PublicationInviteEmail({
  inviteeName,
  publicationName,
  inviterName,
  invitesUrl,
}: PublicationInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to contribute to {publicationName} on Contributor</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              You&apos;ve been invited to contribute
            </Heading>
            <Text style={paragraph}>Hi {inviteeName || "there"},</Text>
            <Text style={paragraph}>
              <strong>{inviterName}</strong> has invited you to contribute to their Publication,{" "}
              <strong>{publicationName}</strong>, on Contributor.
            </Text>
            <Text style={paragraph}>Review and respond to this invite from your dashboard:</Text>
            <Link href={invitesUrl} style={button}>
              View invite
            </Link>
            <Text style={smallPrint}>
              If you don&apos;t want to contribute, you can decline from the same page — no action is required.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PublicationInviteEmail;

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
