import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from "@react-email/components";

interface InviteResponseNoticeEmailProps {
  ownerName: string;
  authorName: string;
  publicationName: string;
  response: "accepted" | "declined";
  publicationUrl: string;
}

export function InviteResponseNoticeEmail({
  ownerName,
  authorName,
  publicationName,
  response,
  publicationUrl,
}: InviteResponseNoticeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {authorName} {response} your invite to {publicationName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contributor</Heading>
          <Section style={card}>
            <Heading as="h2" style={subheading}>
              {response === "accepted" ? "Invite accepted" : "Invite declined"}
            </Heading>
            <Text style={paragraph}>Hi {ownerName || "there"},</Text>
            {response === "accepted" ? (
              <Text style={paragraph}>
                <strong>{authorName}</strong> has accepted your invite to contribute to{" "}
                <strong>{publicationName}</strong>. They can now publish articles into your Publication.
              </Text>
            ) : (
              <Text style={paragraph}>
                <strong>{authorName}</strong> has declined your invite to contribute to{" "}
                <strong>{publicationName}</strong>.
              </Text>
            )}
            <Link href={publicationUrl} style={button}>
              Manage Publication
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteResponseNoticeEmail;

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
