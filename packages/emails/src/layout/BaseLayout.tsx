import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Preview,
  Font,
} from "@react-email/components";
import { BRAND } from "@societe/config";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang="ko" dir="ltr">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily={["Times New Roman", "serif"]}
          webFont={undefined}
          fontWeight={400}
          fontStyle="normal"
        />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1814 !important; }
            .email-container { background-color: #201e1a !important; }
            .ink-text { color: #e8e4dc !important; }
            .muted-text { color: #9a9690 !important; }
            .footer-text { color: #7a7874 !important; }
            .hairline { background: #3a3630 !important; }
            .brass-text { color: #c49a4d !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="email-body"
        style={{
          backgroundColor: "#f8f6f1",
          margin: "0",
          padding: "0",
          fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Container
          className="email-container"
          style={{
            maxWidth: "540px",
            width: "100%",
            margin: "0 auto",
            backgroundColor: "#f8f6f1",
            padding: "0",
          }}
        >
          {/* Header wordmark */}
          <Section
            style={{
              padding: "40px 48px 24px",
              textAlign: "center",
            }}
          >
            <Text
              className="brass-text"
              style={{
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: "14px",
                fontWeight: "400",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9a7d3d",
                margin: "0",
                lineHeight: "1",
              }}
            >
              {BRAND.name}
            </Text>
            {/* Brass hairline under wordmark */}
            <div
              style={{
                height: "1px",
                background: "#9a7d3d",
                margin: "16px auto 0",
                width: "40px",
                opacity: 0.6,
              }}
            />
          </Section>

          {/* Main content */}
          <Section style={{ padding: "0 48px" }}>{children}</Section>

          {/* Footer */}
          <Section style={{ padding: "40px 48px 48px" }}>
            {/* Hairline separator */}
            <div
              className="hairline"
              style={{
                height: "1px",
                background: "#d9d4c7",
                marginBottom: "24px",
              }}
            />
            <Text
              className="footer-text"
              style={{
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: "12px",
                color: "#6c6a66",
                margin: "0 0 6px",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              {BRAND.name} · 지적 교류를 위한 프라이빗 살롱
            </Text>
            <Text
              className="footer-text"
              style={{
                fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: "11px",
                color: "#6c6a66",
                margin: "0 0 6px",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              {BRAND.contact}
            </Text>
            <Text
              className="footer-text"
              style={{
                fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: "11px",
                color: "#6c6a66",
                margin: "0",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              {/* Phase 2: substituted by email provider */}
              <a
                href="{{UNSUBSCRIBE_URL}}"
                style={{ color: "#6c6a66", textDecoration: "underline" }}
              >
                수신거부
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
