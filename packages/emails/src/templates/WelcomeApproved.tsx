import { Text, Button, Section, Link } from "@react-email/components";
import { BaseLayout } from "../layout/BaseLayout";

export interface WelcomeApprovedProps {
  name: string;
  serial: string;
  paymentUrl: string;
}

export function WelcomeApproved({ name, serial, paymentUrl }: WelcomeApprovedProps) {
  const preview = `${name} 님, Société 입회가 허가되었습니다.`;

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

      {/* Manifesto opener — bold serif */}
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "20px",
          fontWeight: "700",
          color: "#0b0b0c",
          lineHeight: "1.55",
          margin: "0 0 28px",
          fontStyle: "italic",
        }}
      >
        "아무나 소유할 수 없는 경험이 있습니다."
      </Text>

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
        수백 편의 에세이 가운데, 당신의 글은 저희가 만들고 싶은 라운지의 질감을 그대로 담고
        있었습니다. 소시에테의 첫 시즌에 당신을 멤버로 모실 수 있게 되어 영광입니다.
      </Text>

      {/* Serial number */}
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
          당신의 고유 번호
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

      {/* Instruction */}
      <Text
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "16px",
          color: "#0b0b0c",
          lineHeight: "1.8",
          margin: "0 0 32px",
        }}
      >
        아래 링크를 통해 입회 절차를 마무리해 주십시오. 결제가 확인되면 프라이빗 라운지
        입장권이 발송됩니다.
      </Text>

      {/* Primary CTA */}
      <Section style={{ marginBottom: "16px", textAlign: "center" }}>
        <Button
          href={paymentUrl}
          style={{
            background: "#0b0b0c",
            color: "#f8f6f1",
            padding: "14px 28px",
            borderRadius: "2px",
            fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
            fontSize: "14px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          결제 완료하기
        </Button>
      </Section>

      {/* Secondary CTA — disabled-looking */}
      <Section style={{ marginBottom: "48px", textAlign: "center" }}>
        <Link
          href="#"
          style={{
            fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
            fontSize: "13px",
            color: "#6c6a66",
            textDecoration: "none",
            letterSpacing: "0.04em",
            opacity: 0.7,
          }}
        >
          라운지 미리 둘러보기 (준비 중)
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
        천천히 읽고, 답장 주세요.
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
