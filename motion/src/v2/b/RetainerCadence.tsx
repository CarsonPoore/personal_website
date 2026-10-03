import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, easeInOut, fontFamily, ramp } from "../../lib";
import { MUTED, SLATE, ink } from "./shared";

// investment.html, full-width band under the tiers — "Three-month minimum, because real
// marketing needs room to work. After that, month to month." Plus "a monthly report that
// says what happened": a gold marker steps through twelve months; each month it passes
// files one report. The first three months sit inside the minimum bracket.

const N = 12;
const X0 = 190;
const DX = 120;
const mx = (i: number) => X0 + i * DX;
const BASE = 168;
const STEP0 = 26;
const STEP = 22;

export const RetainerCadence: React.FC = () => {
  const f = useCurrentFrame();

  // marker: steps month to month, then returns to month 01
  const frames: number[] = [];
  const vals: number[] = [];
  for (let i = 0; i < N - 1; i++) {
    frames.push(STEP0 + i * STEP, STEP0 + i * STEP + 12);
    vals.push(i, i + 1);
  }
  const pos = interpolate(f, frames, vals, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const reset = ramp(f, 300, 318, easeInOut); // fade out at month 12
  const back = ramp(f, 322, 344, easeInOut); // reappear at month 01
  const atStart = f >= 320;
  const markerX = atStart ? mx(0) : mx(0) + pos * DX;
  const markerO = atStart ? back : 1 - reset;
  const reportsO = 1 - reset;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <div style={{ position: "absolute", left: 0, top: BASE - 1, width: 1920, height: 2, background: ink(0.16) }} />

      {/* minimum bracket over months 01–03 */}
      <div style={{ position: "absolute", left: mx(0) - 34, top: 82, width: mx(2) - mx(0) + 68, height: 3, background: ink(0.55) }} />
      <div style={{ position: "absolute", left: mx(0) - 34, top: 82, width: 3, height: 22, background: ink(0.55) }} />
      <div style={{ position: "absolute", left: mx(2) + 31, top: 82, width: 3, height: 22, background: ink(0.55) }} />
      <div style={{ position: "absolute", left: mx(0) - 34, top: 40, fontSize: 21, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SLATE }}>
        Three-month minimum
      </div>
      {/* month to month */}
      <div style={{ position: "absolute", left: mx(3) - 34, top: 83, width: mx(N - 1) - mx(3) + 68, height: 1, background: ink(0.2) }} />
      <div style={{ position: "absolute", left: mx(4) - 34, top: 40, fontSize: 21, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>
        Then month to month
      </div>

      {Array.from({ length: N }).map((_, i) => {
        const filed = ramp(f, STEP0 + (i - 1) * STEP + 12, STEP0 + (i - 1) * STEP + 22) * reportsO;
        const here = Math.max(0, 1 - Math.abs(markerX - mx(i)) / DX);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: mx(i) - 1, top: BASE - 14, width: 3, height: 28, background: ink(0.4) }} />
            {/* monthly report filed */}
            <div
              style={{
                position: "absolute",
                left: mx(i) - 9,
                top: 120,
                width: 18,
                height: 18,
                background: C.navy,
                opacity: i === 0 ? ramp(f, 14, 22) * reportsO : filed,
                translate: `0px ${(1 - (i === 0 ? ramp(f, 14, 22) : filed)) * 10}px`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: mx(i) - 40,
                width: 80,
                top: BASE + 22,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.12em",
                fontVariantNumeric: "tabular-nums",
                color: here > 0.5 ? C.navy : MUTED,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
          </React.Fragment>
        );
      })}

      {/* gold marker: this month */}
      <div style={{ position: "absolute", left: markerX - 11, top: BASE - 11, width: 22, height: 22, background: C.gold, opacity: markerO }} />
      {/* legend */}
      <div style={{ position: "absolute", left: mx(N - 1) + 70, top: 120, width: 18, height: 18, background: C.navy }} />
      <div style={{ position: "absolute", left: mx(N - 1) + 100, top: 117, fontSize: 20, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>
        Monthly report
      </div>
    </AbsoluteFill>
  );
};
