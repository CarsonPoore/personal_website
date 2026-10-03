import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, easeInOut, fontFamily, ramp } from "../../lib";

// Contact / scheduler: a dimension line set directly above the booking calendar,
// measuring the call itself: thirty minutes, minute by minute. A gold marker walks
// the half hour. Transparent on the bone page. Frame 0 == last frame (marker hidden).

export const RULER_W = 1600;
export const RULER_H = 120;
const X0 = 20;
const X1 = 1580;
const Y = 84;
const MIN = 30;
const mx = (m: number) => X0 + ((X1 - X0) * m) / MIN;

export const CalRuler: React.FC = () => {
  const f = useCurrentFrame();
  const m = interpolate(f, [18, 258], [0, MIN], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const op = ramp(f, 0, 18) * (1 - ramp(f, 268, 296, easeInOut));
  const x = mx(m);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={RULER_W} height={RULER_H} style={{ position: "absolute", inset: 0 }}>
        {/* dimension line + end caps */}
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke={C.navy} strokeOpacity={0.28} strokeWidth={2} />
        <line x1={X0} y1={Y - 22} x2={X0} y2={Y + 22} stroke={C.navy} strokeOpacity={0.5} strokeWidth={2} />
        <line x1={X1} y1={Y - 22} x2={X1} y2={Y + 22} stroke={C.navy} strokeOpacity={0.5} strokeWidth={2} />
        {Array.from({ length: MIN - 1 }, (_, i) => {
          const k = i + 1;
          const major = k % 5 === 0;
          const tx = mx(k);
          const passed = m >= k ? op : 0;
          return (
            <line
              key={k}
              x1={tx}
              y1={Y}
              x2={tx}
              y2={Y - (major ? 16 : 8) - passed * 4}
              stroke={C.navy}
              strokeOpacity={0.3 + 0.3 * passed}
              strokeWidth={2}
            />
          );
        })}
        {/* elapsed: the single gold accent line */}
        <line x1={X0} y1={Y} x2={x} y2={Y} stroke={C.gold} strokeWidth={4} opacity={op} />
        <rect x={x - 8} y={Y - 8} width={16} height={16} transform={`rotate(45 ${x} ${Y})`} fill={C.gold} opacity={op} />
      </svg>
      {[0, 5, 10, 15, 20].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: mx(k),
            top: 24,
            transform: k === 0 ? "none" : "translateX(-50%)",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.16em",
            color: C.slateInk,
            opacity: 0.7,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {k}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          right: RULER_W - X1,
          top: 24,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.navy,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        30 min · one real conversation
      </div>
    </AbsoluteFill>
  );
};
