import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, easeInOut, fontFamily, ramp } from "../../lib";
import { MUTED, ink } from "./shared";

// services.html, full-width band under the list — "Because the strategy came first,
// every campaign has a clear job and a clear reason. Nothing runs just to look busy."
// One strategy line runs edge to edge; every campaign (ads, content, social, launches,
// promotions) stands on a leader that traces straight back to it. Frame 0 = built.

const CAMPAIGNS = ["Ads", "Content", "Social", "Launches", "Promotions"];
const BASE = 214;
const CX = (i: number) => 470 + i * 270;
const LEAD_TOP = 112;

export const SvcTraced: React.FC = () => {
  const f = useCurrentFrame();

  // gold pulse travels the strategy line left→right
  const pulse = ramp(f, 16, 170, easeInOut);
  const pX = 180 + pulse * (1800 - 180);
  const pOn = ramp(f, 12, 20) * (1 - ramp(f, 166, 178));

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* strategy line, full bleed */}
      <div style={{ position: "absolute", left: 0, top: BASE - 1, width: 1920, height: 3, background: ink(0.32) }} />
      <Diamond cx={180} cy={BASE} size={34} color={C.gold} />
      <div
        style={{
          position: "absolute",
          left: 212,
          top: BASE - 44,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        Strategy first
      </div>

      {CAMPAIGNS.map((name, i) => {
        const x = CX(i);
        // leaders sink into the line and rise again, staggered
        const down = ramp(f, 200 + i * 5, 222 + i * 5, easeInOut);
        const up = ramp(f, 236 + i * 7, 268 + i * 7, easeInOut);
        const h = (down < 1 ? 1 - down : up) * (BASE - LEAD_TOP);
        const hit = pOn > 0 ? Math.max(0, 1 - Math.abs(pX - x) / 110) : 0;
        return (
          <React.Fragment key={name}>
            <div style={{ position: "absolute", left: x - 1, top: BASE - h, width: 3, height: h, background: ink(0.32 + 0.4 * hit) }} />
            <div
              style={{
                position: "absolute",
                left: x - 8,
                top: BASE - 8,
                width: 16,
                height: 16,
                background: hit > 0.3 ? C.gold : C.navy,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: x + 18,
                top: LEAD_TOP - 8,
                opacity: h / (BASE - LEAD_TOP),
                translate: `0px ${(1 - h / (BASE - LEAD_TOP)) * 30}px`,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.015em", color: C.navy, lineHeight: 1 }}>{name}</div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                Job {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* pulse */}
      <div style={{ position: "absolute", left: pX - 60, top: BASE - 2, width: 120, height: 5, background: C.gold, opacity: pOn }} />
    </AbsoluteFill>
  );
};
