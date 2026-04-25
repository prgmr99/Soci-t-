import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@societe/config";
import ApplyForm from "./ApplyForm";

export const metadata: Metadata = {
  title: "입회 신청 — Société",
  description: "소시에테 입회를 신청합니다.",
};

export default function ApplyPage() {
  return (
    <main>
      {/* Server-rendered intro — visible before JS hydrates.
          Page-entry choreography (mounts top→down like a letterhead being
          set on paper): brass hairline draws in, then the wordmark,
          headline, subtitle, and finally the form ease up in sequence.
          Pure transform/opacity so it never blocks the main thread. */}
      <div className="bg-paper-soft pt-20 pb-0 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div
            aria-hidden="true"
            className="animate-hairline-draw mx-auto mb-8 h-px w-16 bg-brass/60"
          />
          <Link
            href="/"
            aria-label={`${BRAND.name} — 홈`}
            className="animate-fade-up-delay-1 inline-block text-[0.78rem] font-mono tracking-[0.16em] uppercase text-brass-strong mb-5 underline-offset-4 transition-colors hover:text-ink focus-visible:underline"
          >
            Société
          </Link>
          <h1 className="animate-fade-up-delay-2 font-serif text-[clamp(1.875rem,3vw+0.5rem,2.5rem)] text-ink mb-5 tracking-[-0.01em] leading-[1.1]">
            입회 신청
          </h1>
          <p className="animate-fade-up-delay-3 font-serif text-ink/85 text-[1.125rem] leading-[1.75] max-w-prose mx-auto">
            소시에테는 지적 성장과 깊이 있는 대화를 추구하는 이들의 살롱입니다.
            아래 질문들에 진지하게 답해 주시면, 검토 후 연락 드리겠습니다.
          </p>
        </div>
      </div>

      {/* Client form */}
      <div className="animate-fade-up-delay-4">
        <ApplyForm />
      </div>
    </main>
  );
}
