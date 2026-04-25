import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// ─── Inline color palette (CSS variables not supported in satori) ─────────────
const C = {
  paper: "#f8f6f1",
  paperSoft: "#efece4",
  ink: "#0b0b0c",
  brass: "#9a7d3d",
  muted: "#6c6a66",
  border: "rgba(11,11,12,0.12)",
  dimText: "rgba(11,11,12,0.5)",
} as const;

// ─── Utility: format Korean date ─────────────────────────────────────────────
function formatKoreanDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// ─── Deterministic barcode widths from serial ─────────────────────────────────
function barWidths(serial: string, count = 28): number[] {
  const seed = Array.from(serial).reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7);
  const widths: number[] = [];
  let state = seed >>> 0;
  for (let i = 0; i < count; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state = state >>> 0;
    widths.push((state % 3) + 1);
  }
  return widths;
}

// ─── Satori-safe barcode SVG string ──────────────────────────────────────────
// Satori supports <img src="data:image/svg+xml,..."> for inline SVG.
function buildBarcodeSvg(serial: string): string {
  const widths = barWidths(serial);
  const totalW = widths.reduce((a, b) => a + b, 0) + widths.length - 1;
  let x = 0;
  const rects = widths
    .map((w) => {
      const r = `<rect x="${x}" y="0" width="${w}" height="60" fill="${C.ink}" opacity="0.35"/>`;
      x += w + 1;
      return r;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} 60" width="${totalW}" height="60">${rects}</svg>`;
}

// ─── OG Image Route ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serial = searchParams.get("serial") ?? "S-2026-000000";
  const rawStatus = searchParams.get("status");
  const status: "pending" | "approved" =
    rawStatus === "approved" ? "approved" : "pending";
  const name = searchParams.get("name") ?? undefined;
  const isApproved = status === "approved";

  const issuedAt = new Date().toISOString();
  const formattedDate = formatKoreanDate(issuedAt);
  const nameOrSerial = name ? name : `N° ${serial}`;
  const titleText = isApproved ? "입회 허가증" : "인비테이션 대기권";
  const headerLabel = isApproved ? "SOCIÉTÉ · APPROVED TICKET" : "SOCIÉTÉ · WAITLIST TICKET";
  const statusLabel = isApproved ? "STATUS · APPROVED" : "STATUS · PENDING";

  // Build barcode as data URI SVG for satori img support
  const barcodeSvgEncoded =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(buildBarcodeSvg(serial));

  // TODO: embed Fraunces (serif) and JetBrains Mono fonts here for production.
  // For MVP, satori uses its built-in default sans font — acceptable for OG images.
  // Example pattern:
  //   const fontRes = await fetch(new URL("/fonts/Fraunces.ttf", req.url));
  //   const fontData = await fontRes.arrayBuffer();
  // Then pass: fonts: [{ name: "Fraunces", data: fontData, style: "normal" }]

  return new ImageResponse(
    (
      // Canvas: 1200 × 630, paper background
      <div
        style={{
          width: 1200,
          height: 630,
          background: C.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}
      >
        {/* ── Ticket card: 8:5 ratio ≈ 840×525, centered ── */}
        <div
          style={{
            width: 920,
            height: 575,
            background: C.paperSoft,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            display: "flex",
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(11,11,12,0.08), inset 0 0 0 1px rgba(11,11,12,0.04)",
            position: "relative",
          }}
        >
          {/* ── Left column (2/3) ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "40px 44px",
            }}
          >
            {/* Header section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Header label */}
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: isApproved ? C.brass : C.muted,
                }}
              >
                {headerLabel}
              </span>

              {/* Brass hairline */}
              <div
                style={{
                  height: 2,
                  width: "100%",
                  background: C.brass,
                  opacity: 0.65,
                }}
              />
            </div>

            {/* Title + metadata */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                style={{
                  fontFamily: "serif",
                  fontSize: 44,
                  lineHeight: 1.0,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                }}
              >
                {titleText}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "serif",
                    fontSize: 18,
                    color: "rgba(11,11,12,0.75)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {nameOrSerial}
                </span>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 14,
                    color: C.muted,
                  }}
                >
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Edition mark */}
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(108,106,102,0.65)",
              }}
            >
              ÉDITION · MMXXVI
            </span>
          </div>

          {/* ── Perforation line ── */}
          <div
            style={{
              width: 1,
              margin: "16px 0",
              background: `repeating-linear-gradient(to bottom, rgba(11,11,12,0.18) 0px, rgba(11,11,12,0.18) 5px, transparent 5px, transparent 10px)`,
            }}
          />

          {/* ── Right column (1/3) ── */}
          <div
            style={{
              width: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px 28px 40px 28px",
            }}
          >
            {/* Status */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                width: "100%",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: isApproved ? C.brass : C.muted,
                }}
              >
                {statusLabel}
              </span>
              {isApproved && (
                <div
                  style={{
                    height: 1,
                    width: "100%",
                    background: C.brass,
                    opacity: 0.55,
                  }}
                />
              )}
            </div>

            {/* Vertical serial */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "rgba(108,106,102,0.55)",
                  transform: "rotate(90deg)",
                  whiteSpace: "nowrap",
                }}
              >
                {serial}
              </span>
            </div>

            {/* Barcode SVG image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={barcodeSvgEncoded}
              alt=""
              width={180}
              height={44}
              style={{ opacity: 0.5 }}
            />

            {/* Approved seal or spacer */}
            <div style={{ height: 44, display: "flex", alignItems: "center" }}>
              {isApproved ? (
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="18" cy="18" r="16" stroke={C.brass} strokeWidth="1.5" />
                  <circle cx="18" cy="18" r="10" stroke={C.brass} strokeWidth="0.75" />
                  <text
                    x="18"
                    y="20.5"
                    textAnchor="middle"
                    fontSize="5"
                    fontFamily="monospace"
                    fill={C.brass}
                    letterSpacing="0.5"
                  >
                    SCT
                  </text>
                </svg>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // TODO: embed Fraunces + JetBrains Mono font data here for production
      // fonts: [
      //   { name: "Fraunces", data: frauncesData, style: "normal", weight: 400 },
      //   { name: "JetBrains Mono", data: jbMonoData, style: "normal", weight: 400 },
      // ],
    }
  );
}
