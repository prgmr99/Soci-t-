import type { Metadata } from "next";
import Link from "next/link";
import { Ticket } from "@societe/ui";
import { BRAND } from "@societe/config";

// TODO(cross-agent): If build fails because @societe/ui Typo/SectionFrame aren't
// available yet (landing-agent still in progress), the fallback native elements
// below are already in place — no changes needed.

export const metadata: Metadata = {
  title: "심사 대기권",
  description: "Société 입회 심사 신청이 접수되었습니다.",
  robots: { index: false, follow: false },
};

// Next 15 App Router: searchParams is a Promise in Server Components
export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ serial?: string; name?: string }>;
}) {
  const { serial, name } = await searchParams;
  // Use a stable server-side timestamp — avoids hydration mismatch
  const issuedAt = new Date().toISOString();
  const safeSerial = serial ?? "S-2026-000000";

  // OG share URL for this ticket
  const ogUrl = `/og/ticket?serial=${encodeURIComponent(safeSerial)}${name ? `&name=${encodeURIComponent(name)}` : ""}`;

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-[720px] px-6 py-[120px]">

        {/* ── Received label ─────────────────────────────────────────────── */}
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-brass-strong animate-fade-up">
          접수 완료 · RECEIVED
        </p>

        {/* ── Main title ─────────────────────────────────────────────────── */}
        <h1 className="mt-4 font-serif text-[clamp(1.75rem,3.5vw+0.5rem,2.8rem)] leading-[1.1] tracking-[-0.02em] text-ink animate-fade-up-delay-1">
          당신의 지원서가<br />도착했습니다.
        </h1>

        {/* ── Body copy ──────────────────────────────────────────────────── */}
        <p className="mt-6 max-w-[520px] font-sans text-[1.0625rem] leading-[1.7] text-ink/85 animate-fade-up-delay-2">
          한 명의 독자가 천 권을 대체할 수 있다 믿습니다.
          우리 큐레이터들이 당신의 에세이를 신중히 읽겠습니다.
          결과는 7일 이내에 이메일로 전달됩니다.
        </p>

        {/* ── Brass hairline ─────────────────────────────────────────────── */}
        <div className="mt-10 mb-10 h-[1px] w-full bg-brass/40 animate-fade-up-delay-2" />

        {/* ── Ticket ─────────────────────────────────────────────────────── */}
        <div className="w-full animate-fade-up-delay-3">
          <Ticket
            status="pending"
            name={name}
            issuedAt={issuedAt}
            serial={safeSerial}
          />
        </div>

        {/* ── Action rows ────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col gap-4">

          {/* Share hint */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-subtle">
              이 대기권을 공유하려면
            </p>
            <a
              href={ogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.78rem] text-brass-strong underline decoration-brass/50 underline-offset-4 hover:decoration-brass-strong transition-colors break-all"
              aria-label="OG 이미지 새 탭에서 열기"
            >
              {ogUrl}
            </a>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-12 bg-ink/15" />

          {/* Back home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-muted hover:text-ink transition-colors"
          >
            <span aria-hidden="true">←</span>
            처음으로
          </Link>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="mt-16 border-t border-ink/12 pt-6">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-subtle leading-[1.7]">
            심사 기간 · 7일 이내&ensp;·&ensp;문의{" "}
            <a
              href={`mailto:${BRAND.contact}`}
              className="text-muted underline decoration-muted/50 underline-offset-4 hover:text-ink hover:decoration-ink/60 transition-colors"
            >
              {BRAND.contact}
            </a>
          </p>
        </footer>

      </div>
    </main>
  );
}
