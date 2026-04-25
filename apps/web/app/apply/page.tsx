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
      {/* Server-rendered intro — visible before JS hydrates */}
      <div className="bg-paper-soft pt-20 pb-0 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/"
            aria-label={`${BRAND.name} — 홈`}
            className="inline-block text-[0.78rem] font-mono tracking-[0.16em] uppercase text-brass-strong mb-5 underline-offset-4 transition-colors hover:text-ink focus-visible:underline"
          >
            Société
          </Link>
          <h1 className="font-serif text-[clamp(1.875rem,3vw+0.5rem,2.5rem)] text-ink mb-5 tracking-[-0.01em] leading-[1.1]">
            입회 신청
          </h1>
          <p className="font-serif text-ink/85 text-[1.125rem] leading-[1.75] max-w-prose mx-auto">
            소시에테는 지적 성장과 깊이 있는 대화를 추구하는 이들의 살롱입니다.
            아래 질문들에 진지하게 답해 주시면, 검토 후 연락 드리겠습니다.
          </p>
        </div>
      </div>

      {/* Client form */}
      <ApplyForm />
    </main>
  );
}
