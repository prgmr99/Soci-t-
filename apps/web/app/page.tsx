import type { Metadata } from "next";
import { BRAND } from "@societe/config";
import { Button } from "@societe/ui";
import { SectionFrame } from "@societe/ui";
import { Typo } from "@societe/ui";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.statement,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: BRAND.name,
    description: BRAND.statement,
    url: BRAND.domain,
  },
};

// ── Brass hairline divider ────────────────────────────────────────────────────
function BrassDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-full bg-brass/30 ${className}`}
      role="separator"
      aria-hidden="true"
    />
  );
}

// ── Section: Hero ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative flex min-h-svh flex-col justify-between bg-paper px-6 pb-10 pt-10 md:px-12 md:pt-14 lg:px-20"
      aria-label="소개"
    >
      {/* Top row: wordmark + edition number */}
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg tracking-[-0.01em] text-ink">
          Société
        </p>
        <Typo.Meta as="p" className="tabular-nums">
          N° 001 / 2026
        </Typo.Meta>
      </div>

      {/* Main hero: 2-column grid (content + monogram crest on ≥md) */}
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 py-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] md:gap-16 lg:gap-20">
        {/* Left column — hero content */}
        <div>
          <BrassDivider className="mb-12 animate-fade-up" />

          <h1 className="animate-fade-up break-keep font-serif text-ink text-[clamp(2.5rem,4.5vw+0.5rem,5rem)] leading-[1.05] tracking-[-0.02em]">
            아무나 소유할 수&nbsp;없는
            <br />
            지적 경험의 큐레이션.
          </h1>

          <p className="animate-fade-up-delay-1 mt-10 max-w-md font-sans text-[1.0625rem] leading-[1.65] text-ink/85">
            검증된 소수만을 위한 독서 라운지.
          </p>

          <BrassDivider className="mb-0 mt-14 animate-fade-up-delay-1" />

          {/* CTA row */}
          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center gap-6">
            <Button variant="primary" href="/apply">
              가입 심사 신청
            </Button>
            <a
              href="#manifesto"
              className="font-sans text-[0.95rem] tracking-[0.04em] text-ink/75 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              매니페스토 읽기 →
            </a>
          </div>
        </div>

        {/* Right column — editorial crest (visual anchor) */}
        <div
          aria-hidden="true"
          className="relative hidden md:flex md:justify-center"
        >
          <div className="animate-fade-up-delay-1 relative flex aspect-square w-full max-w-[360px] items-center justify-center">
            {/* four corner meta labels — forms a "stamp/crest" silhouette */}
            <span className="absolute left-0 top-0 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-brass-strong">
              Issue 001
            </span>
            <span className="absolute right-0 top-0 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-brass-strong">
              MMXXVI
            </span>
            <span className="absolute bottom-0 left-0 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-brass-strong">
              Privé
            </span>
            <span className="absolute bottom-0 right-0 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-brass-strong">
              Seoul
            </span>

            {/* hairline frame */}
            <span className="pointer-events-none absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-brass/20" />

            {/* italic serif monogram */}
            <span className="select-none font-serif italic leading-none text-ink/90 text-[clamp(9rem,16vw,17rem)]">
              S
            </span>
          </div>
        </div>
      </div>

      {/* Bottom micro-label — new info (location + editorial framing) */}
      <div className="animate-fade-up-delay-3 flex items-end justify-between">
        <Typo.Meta as="p" className="text-subtle">
          Scroll ↓
        </Typo.Meta>
        <Typo.Meta as="p">서울 · 창간호</Typo.Meta>
      </div>
    </section>
  );
}

// ── Section: Manifesto ────────────────────────────────────────────────────────
function ManifestoSection() {
  const stanzas = [
    {
      id: "stanza-1",
      text: "당신의 서가는 당신의 사고의 지형도다. 우리는 서로의 지형을 마주 볼 자격이 있는 사람들을 모은다. 취향이 아니라 사유의 깊이로 선별된 공동체—그것이 소시에테의 출발점이다.",
    },
    {
      id: "stanza-2",
      text: "독서는 본래 고독한 행위지만, 고독이 충돌할 때 무언가가 생겨난다. 우리는 그 충돌을 설계한다. 당신이 밑줄 친 문장이 누군가의 다음 질문이 되는 공간. 그 마찰 안에서 생각은 단단해진다.",
    },
    {
      id: "stanza-3",
      text: "문을 두드리는 것은 지원서가 아니다. 당신이 지금까지 쌓아온 사고의 궤적이다. 소시에테는 결제 정보 대신 에세이 한 편을 먼저 요구한다. 입장권은 언제나 글로 발행된다.",
    },
  ];

  return (
    <SectionFrame id="manifesto" tone="paper-soft">
      <div className="mb-14">
        <Typo.Meta as="p" className="mb-4 text-brass-strong">
          매니페스토
        </Typo.Meta>
        <BrassDivider />
      </div>

      <div className="grid gap-12 md:grid-cols-3 md:gap-10">
        {stanzas.map((stanza, i) => (
          <div key={stanza.id} className="flex flex-col gap-4">
            <Typo.Meta as="span" className="text-brass-strong">
              {String(i + 1).padStart(2, "0")}
            </Typo.Meta>
            <p className="font-serif text-[1.125rem] leading-[1.7] text-ink">
              {stanza.text}
            </p>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

// ── Section: Curation Principles ─────────────────────────────────────────────
function PrinciplesSection() {
  const principles = [
    {
      numeral: "I.",
      title: "게이트",
      body: "심사는 결제보다 먼저다. 에세이로 문을 두드려라. 우리는 당신의 카드 번호보다 당신의 문장을 먼저 읽는다.",
    },
    {
      numeral: "II.",
      title: "아카이브",
      body: "당신의 발제문과 서재가 포트폴리오처럼 축적된다. 매 시즌이 지나도 당신의 사유는 기록으로 남는다.",
    },
    {
      numeral: "III.",
      title: "오케스트레이션",
      body: "보이지 않는 컨시어지가 당신의 독서 성향을 매칭한다. 취향 데이터가 아니라 발제 이력이 기준이다.",
    },
  ];

  return (
    <SectionFrame tone="paper">
      <div className="mb-14">
        <Typo.Meta as="p" className="mb-4 text-brass-strong">
          큐레이션 원칙
        </Typo.Meta>
        <BrassDivider />
      </div>

      <div className="grid gap-8 md:grid-cols-3 md:gap-10">
        {principles.map((p) => (
          <article
            key={p.numeral}
            className="flex flex-col gap-5 border border-brass/25 bg-paper-soft p-8"
          >
            <Typo.Meta as="span" className="font-mono text-brass-strong">
              {p.numeral}
            </Typo.Meta>
            <Typo.Title as="h3" className="text-[1.5rem] text-ink">
              {p.title}
            </Typo.Title>
            <BrassDivider />
            <Typo.Body as="p" className="text-[1rem] leading-[1.7]">
              {p.body}
            </Typo.Body>
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

// ── Section: The Season ───────────────────────────────────────────────────────
function SeasonSection() {
  return (
    <SectionFrame tone="ink">
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <Typo.Meta as="p" className="text-paper/75">
          시즌 안내
        </Typo.Meta>
        <p className="font-mono text-[0.95rem] tracking-[0.16em] uppercase text-paper">
          2026년 봄 시즌 · 첫 멤버 모집 中
        </p>
        <div className="h-px w-16 bg-brass/70" aria-hidden="true" />
        <Typo.Meta as="p" className="text-paper/65">
          정원 엄수 · 심사 후 초청
        </Typo.Meta>
      </div>
    </SectionFrame>
  );
}

// ── Section: CTA Block ────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <SectionFrame tone="paper-soft">
      {/* Full-width hairline frame matches Manifesto / Principles sections;
          the closing CTA stays anchored to the same editorial grid instead
          of floating as a centered island. */}
      <div className="mb-14">
        <Typo.Meta as="p" className="mb-4 text-brass-strong">
          멤버십 심사
        </Typo.Meta>
        <BrassDivider />
      </div>

      <div className="flex flex-col items-center gap-10 py-8 text-center">
        <Typo.Display as="h2" className="max-w-3xl text-ink">
          문을 두드리시겠습니까?
        </Typo.Display>

        <p className="max-w-md break-keep font-sans text-[1.0625rem] leading-[1.7] text-ink/85">
          심사는 에세이 한 편으로 시작됩니다.
          <br />
          결제 전에 당신의 사유를 먼저 보여주세요.
        </p>

        <Button variant="primary" size="lg" href="/apply">
          심사 신청
        </Button>
      </div>
    </SectionFrame>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="w-full border-t border-brass/30 bg-paper px-6 py-10 md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        {/* Wordmark */}
        <p className="font-serif text-lg tracking-[-0.01em] text-ink">
          {BRAND.name}
        </p>

        {/* Contact */}
        <Typo.Meta as="p" className="text-muted">
          <a
            href={`mailto:${BRAND.contact}`}
            className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4"
          >
            {BRAND.contact}
          </a>
        </Typo.Meta>

        {/* Copyright */}
        <Typo.Meta as="p" className="text-subtle">
          © 2026 {BRAND.name}
        </Typo.Meta>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ManifestoSection />
      <PrinciplesSection />
      <SeasonSection />
      <CtaSection />
      <Footer />
    </>
  );
}
