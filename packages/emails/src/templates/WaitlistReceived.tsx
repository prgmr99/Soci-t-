import { Text, Link, Section } from "@react-email/components";
import { BaseLayout } from "../layout/BaseLayout";

export interface WaitlistReceivedProps {
  name: string;
  serial: string;
  ticketUrl: string;
}

export function WaitlistReceived({ name, serial, ticketUrl }: WaitlistReceivedProps) {
  const preview = `${name} 님의 지원서가 접수되었습니다.`;

  return (
    <BaseLayout preview={preview}>
      {/* Salutation */}
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "18px",
          fontWeight: "400",
          color: "#0b0b0c",
          lineHeight: "1.7",
          margin: "0 0 28px",
        }}
      >
        {name} 님께,
      </Text>

      {/* Opening */}
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "16px",
          color: "#0b0b0c",
          lineHeight: "1.8",
          margin: "0 0 32px",
        }}
      >
        당신의 지원서가 무사히 도착했습니다.
      </Text>

      {/* Receipt / serial */}
      <Section
        style={{
          borderLeft: "2px solid #9a7d3d",
          paddingLeft: "16px",
          marginBottom: "36px",
        }}
      >
        <Text
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: "13px",
            color: "#6c6a66",
            margin: "0 0 4px",
            lineHeight: "1.4",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          접수 번호
        </Text>
        <Text
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: "18px",
            fontWeight: "600",
            color: "#9a7d3d",
            margin: "0",
            lineHeight: "1.4",
            letterSpacing: "0.05em",
          }}
        >
          {serial}
        </Text>
      </Section>

      {/* Body copy */}
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "16px",
          color: "#0b0b0c",
          lineHeight: "1.8",
          margin: "0 0 28px",
        }}
      >
        에세이는 저희 큐레이터들이 직접 읽습니다. 답은 빠르면 3일, 늦어도 7일 이내에 이
        주소로 전해 드리겠습니다.
      </Text>

      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "16px",
          color: "#0b0b0c",
          lineHeight: "1.8",
          margin: "0 0 36px",
        }}
      >
        기다리는 동안, 아래의 대기권을 간직해 주십시오.
      </Text>

      {/* Ticket link */}
      <Section style={{ marginBottom: "48px", textAlign: "center" }}>
        <Link
          href={ticketUrl}
          style={{
            fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
            fontSize: "13px",
            color: "#9a7d3d",
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderBottom: "1px solid #9a7d3d",
            paddingBottom: "2px",
          }}
        >
          대기권 다시 보기 →
        </Link>
      </Section>

      {/* Closing */}
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "16px",
          color: "#0b0b0c",
          lineHeight: "1.8",
          margin: "0 0 8px",
        }}
      >
        좋은 독서 이어 가시길.
      </Text>
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "16px",
          color: "#6c6a66",
          lineHeight: "1.8",
          margin: "0 0 40px",
        }}
      >
        — 컨시어지 팀
      </Text>
    </BaseLayout>
  );
}
