import { OG_COLORS } from "./constants";

interface OgImageLayoutProps {
  siteName: string;
  badge?: string;
  title: string;
  description?: string;
  meta?: string;
  footer?: string;
}

function TrafficLights() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[OG_COLORS.trafficRed, OG_COLORS.trafficYellow, OG_COLORS.trafficGreen].map(
        (color) => (
          <div
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        )
      )}
    </div>
  );
}

function truncateForOg(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function OgImageLayout({
  siteName,
  badge,
  title,
  description,
  meta,
  footer,
}: OgImageLayoutProps) {
  const displayTitle = truncateForOg(title, 80);
  const displayDescription = description ? truncateForOg(description, 120) : undefined;
  const titleFontSize =
    displayTitle.length > 56 ? 40 : displayTitle.length > 40 ? 48 : 56;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: OG_COLORS.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1040,
          border: `1px solid ${OG_COLORS.border}`,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: OG_COLORS.background,
          boxShadow: OG_COLORS.cardShadow,
        }}
      >
        {/* 터미널 헤더 — IntroSection 스타일 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            backgroundColor: OG_COLORS.terminalBg,
          }}
        >
          <TrafficLights />
          <span
            style={{
              fontSize: 14,
              color: OG_COLORS.terminalMuted,
              letterSpacing: "0.02em",
            }}
          >
            {siteName}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "48px 56px",
            gap: 20,
            backgroundColor: OG_COLORS.card,
          }}
        >
          {(badge || meta) && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {badge && (
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: OG_COLORS.foreground,
                    backgroundColor: OG_COLORS.orange,
                    padding: "6px 14px",
                    borderRadius: 8,
                  }}
                >
                  {badge}
                </span>
              )}
              {meta && (
                <span style={{ fontSize: 18, color: OG_COLORS.muted }}>{meta}</span>
              )}
            </div>
          )}

          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 700,
              color: OG_COLORS.foreground,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {displayTitle}
          </div>

          {displayDescription && (
            <div
              style={{
                fontSize: 24,
                color: OG_COLORS.muted,
                lineHeight: 1.5,
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {displayDescription}
            </div>
          )}
        </div>
      </div>

      {footer && (
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 80,
            fontSize: 20,
            color: OG_COLORS.muted,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
