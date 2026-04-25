import { notFound } from "next/navigation";
import { renderEmail, type EmailProps } from "@societe/emails";

export const dynamic = "force-dynamic";

const SAMPLES: Record<string, EmailProps> = {
  "welcome-approved": {
    name: "welcome-approved",
    props: {
      name: "김지훈",
      serial: "S-2026-000042",
      paymentUrl: "https://societe.example/pay/abc123",
    },
  },
  "waitlist-received": {
    name: "waitlist-received",
    props: {
      name: "김지훈",
      serial: "S-2026-000042",
      ticketUrl:
        "https://societe.example/apply/submitted?serial=S-2026-000042",
    },
  },
};

export default async function EmailPreviewPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { name } = await params;
  const sample = SAMPLES[name];
  if (!sample) notFound();

  const rendered = await renderEmail(sample);

  return (
    <div style={{ padding: 32 }}>
      <h1
        style={{
          fontFamily: "system-ui",
          marginBottom: 8,
          fontSize: 16,
          fontWeight: 600,
          color: "#0b0b0c",
        }}
      >
        Email preview: {name}
      </h1>
      <p
        style={{
          fontFamily: "system-ui",
          color: "#6c6a66",
          marginBottom: 24,
          fontSize: 14,
        }}
      >
        Subject: {rendered.subject}
      </p>
      <iframe
        title="email"
        srcDoc={rendered.html}
        style={{
          width: "100%",
          minHeight: "90vh",
          border: "1px solid #d9d4c7",
          background: "#f8f6f1",
        }}
      />
    </div>
  );
}
