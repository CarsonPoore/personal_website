import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Label, NavyPanel, cyc, easeInOut, fmtMoney, lerp, ramp } from "./lib";

// Investment hero: "Every tier includes the strategy. What changes is how much of the
// execution runs through us." Strategy base stays put; execution stacks per tier while
// the monthly price ticks up. Frame 0 = built.

const TIERS = [
  { name: "Lane", n: 1, price: 1200 },
  { name: "System", n: 3, price: 2400 },
  { name: "Partner", n: 5, price: 4800 },
];
const COL_X = [190, 420, 650];
const CW = 190;
const BASE_TOP = 530;
const BASE_H = 70;
const EH = 44;
const EG = 8;
const eTop = (k: number) => BASE_TOP - EG - (k + 1) * EH - k * EG;
const AXIS_X = 100;

export const TierStack: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      <NavyPanel w={width} h={height} refText="Ref. CPC-04 · Investment" secText="Per month · 3-mo. minimum">
        {/* vertical axis: execution through us */}
        <div style={{ position: "absolute", left: AXIS_X, top: 250, width: 2, height: BASE_TOP + BASE_H - 250, background: C.off, opacity: 0.3 }} />
        <svg width={36} height={27} viewBox="0 0 160 120" style={{ position: "absolute", left: AXIS_X - 17, top: 228, rotate: "-90deg", opacity: 0.6 }}>
          <polygon points="0,45 90,45 90,20 160,60 90,100 90,75 0,75" fill={C.off} />
        </svg>
        <Label x={AXIS_X - 26} y={592} style={{ rotate: "-90deg", transformOrigin: "left top", translate: "0 0" }}>
          Execution through us
        </Label>

        {/* shared strategy line through every base */}
        <div style={{ position: "absolute", left: AXIS_X, top: BASE_TOP + BASE_H / 2 - 1, width: 760, height: 2, background: C.off, opacity: 0.22 }} />

        {TIERS.map((t, c) => {
          const s = 92 + c * 30;
          const end = s + (t.n - 1) * 7 + 22;
          const head = cyc(f, [40, 58], [s, s + 16]);
          const tick = f < 80 ? 1 : ramp(f, s, end, easeInOut);
          const x = COL_X[c];
          const stackTop = eTop(t.n - 1);
          return (
            <React.Fragment key={t.name}>
              {/* strategy base: constant in every tier */}
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: BASE_TOP,
                  width: CW,
                  height: BASE_H,
                  background: C.grey,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.navy,
                }}
              >
                Strategy
              </div>

              {Array.from({ length: t.n }).map((_, k) => {
                const p = cyc(f, [40 + (t.n - 1 - k) * 4, 58 + (t.n - 1 - k) * 4], [s + k * 7, s + k * 7 + 22]);
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      left: x,
                      top: eTop(k),
                      width: CW,
                      height: EH,
                      background: c === 1 ? C.blue : "rgba(248,247,244,0.10)",
                      border: c === 1 ? "none" : "2px solid rgba(248,247,244,0.30)",
                      boxSizing: "border-box",
                      borderRadius: 6,
                      opacity: p,
                      translate: `0px ${lerp(-30, 0, p)}px`,
                    }}
                  />
                );
              })}

              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: stackTop - 62,
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: C.off,
                  opacity: head,
                  translate: `0px ${lerp(-14, 0, head)}px`,
                }}
              >
                {t.name}
              </div>

              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: BASE_TOP + BASE_H + 22,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  opacity: head,
                }}
              >
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    color: c === 1 ? C.gold : C.off,
                  }}
                >
                  {fmtMoney(Math.round((t.price * tick) / 50) * 50)}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.slate }}>/mo</span>
              </div>
            </React.Fragment>
          );
        })}
        <Label x={COL_X[0]} y={BASE_TOP + BASE_H + 92}>
          Strategy in every tier
        </Label>
      </NavyPanel>
    </AbsoluteFill>
  );
};
