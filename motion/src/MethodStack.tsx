import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Label, NavyPanel, cyc, easeOut, lerp } from "./lib";

// Method hero: "Five steps, in an order that actually matters."
// The five steps build bottom-up on a rail, Conviction as the foundation, Word of mouth
// on top, which then compounds outward. Frame 0 = built.

const STEPS = ["Conviction", "Your people", "A sharp offer", "The experience", "Word of mouth"];
const BH = 82;
const GAP = 14;
const FLOOR = 680;
const LEFT = 168;
const W = [640, 600, 560, 520, 480];
const top = (i: number) => FLOOR - (i + 1) * BH - i * GAP;
const RAIL_X = 112;

export const MethodStack: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const ps = STEPS.map((_, i) => cyc(f, [40 + (4 - i) * 6, 64 + (4 - i) * 6], [100 + i * 18, 124 + i * 18]));
  const railP = ps.reduce((a, b) => a + b, 0) / STEPS.length;
  const landed = ps.filter((p) => p > 0.6).length;
  const railTop = lerp(FLOOR, top(4), railP);

  const echo = (a: number) => {
    const t = interpolate(f, [a, a + 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
    return { s: 1 + 0.07 * t, o: t > 0 && t < 1 ? 0.45 * (1 - t) : 0 };
  };
  const echoes = [echo(200), echo(216)];

  return (
    <AbsoluteFill>
      <NavyPanel w={width} h={height} refText="Ref. CPC-03 · Method" secText="Build order · bottom up">
        {/* rail */}
        <div style={{ position: "absolute", left: RAIL_X, top: top(4), width: 2, height: FLOOR - top(4), background: C.off, opacity: 0.1 }} />
        <div style={{ position: "absolute", left: RAIL_X, top: railTop, width: 2, height: FLOOR - railTop, background: C.off, opacity: 0.5 }} />
        {STEPS.map((_, i) => (
          <div
            key={"t" + i}
            style={{
              position: "absolute",
              left: RAIL_X - 5,
              top: top(i) + BH / 2 - 6,
              width: 12,
              height: 12,
              background: ps[i] > 0.6 ? (i === 4 ? C.gold : C.off) : C.navy,
              border: `2px solid rgba(248,247,244,${ps[i] > 0.6 ? 0 : 0.3})`,
              boxSizing: "border-box",
            }}
          />
        ))}
        <Label x={LEFT} y={top(4) - 52}>
          Step {String(Math.max(landed, 0)).padStart(2, "0")} / 05
        </Label>

        {/* compounding echoes off the top step */}
        {echoes.map((e, k) => (
          <div
            key={"e" + k}
            style={{
              position: "absolute",
              left: LEFT,
              top: top(4),
              width: W[4],
              height: BH,
              border: "2px solid " + C.off,
              borderRadius: 10,
              boxSizing: "border-box",
              opacity: e.o,
              scale: String(e.s),
            }}
          />
        ))}

        {STEPS.map((name, i) => {
          const p = ps[i];
          const isBase = i === 0;
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: LEFT,
                top: top(i),
                width: W[i],
                height: BH,
                boxSizing: "border-box",
                borderRadius: 10,
                background: isBase ? C.blue : "rgba(248,247,244,0.06)",
                border: isBase ? "none" : "2px solid rgba(248,247,244,0.26)",
                opacity: p,
                translate: `0px ${lerp(-44, 0, p)}px`,
                display: "flex",
                alignItems: "center",
                gap: 26,
                paddingLeft: 28,
              }}
            >
              <span
                style={{
                  fontSize: 23,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontVariantNumeric: "tabular-nums",
                  color: i === 4 ? C.gold : isBase ? "rgba(248,247,244,0.75)" : C.slate,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 31, fontWeight: 800, letterSpacing: "-0.015em", color: C.off }}>{name}</span>
            </div>
          );
        })}
        <Label x={LEFT} y={FLOOR + 22} opacity={ps[0]}>
          Foundation
        </Label>
      </NavyPanel>
    </AbsoluteFill>
  );
};
