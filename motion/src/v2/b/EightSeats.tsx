import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, easeInOut, easeOut, fontFamily, ramp } from "../../lib";
import { ink } from "./shared";

// investment.html, inline beside "We take on eight retainer clients at a time":
// eight seats, a hard stop after the eighth, and a counter that only ever reaches 08.
// Frame 0 = all eight filled.

const S = 42;
const G = 16;
const X0 = 6;
const Y0 = 21;
const sx = (i: number) => X0 + i * (S + G);
const STOP = sx(7) + S + 22;

export const EightSeats: React.FC = () => {
  const f = useCurrentFrame();
  const clear = ramp(f, 150, 176, easeInOut);
  const fills = Array.from({ length: 8 }).map((_, i) => {
    const on = ramp(f, 190 + i * 11, 200 + i * 11, easeOut);
    return Math.max(1 - clear, on);
  });
  const count = f < 176 ? 8 : fills.filter((p) => p > 0.5).length;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {fills.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: sx(i),
            top: Y0,
            width: S,
            height: S,
            boxSizing: "border-box",
            border: `4px solid ${ink(0.5)}`,
            background: `rgba(30,79,216,${p})`,
            borderColor: p > 0.5 ? C.blue : ink(0.4),
          }}
        />
      ))}
      {/* the stop */}
      <div style={{ position: "absolute", left: STOP, top: 9, width: 6, height: 66, background: C.navy }} />
      <div
        style={{
          position: "absolute",
          left: STOP + 22,
          top: 10,
          fontSize: 58,
          lineHeight: "64px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: count === 8 ? C.gold : C.navy,
          opacity: count === 0 ? 0.25 : 1,
        }}
      >
        {String(count).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};
