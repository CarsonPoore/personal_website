import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, easeInOut, fontFamily, ramp } from "../../lib";

// Contact / "Before the call" → footer: a kinetic band that straddles the seam between
// the pale-grey section and the navy footer (the seam is y = 100 of this canvas).
// Five question markers sit on the light side; a gold rule runs the seam and marks each
// one as it passes ("you don't need answers ready, these just make the conversation
// better"), then carries on into "the call". Transparent.
// Frame 0 == last frame: markers open, no gold on screen.

export const HAND_W = 1920;
export const HAND_H = 200;
const SEAM = 100;
const QX = [420, 660, 900, 1140, 1380];

export const Handoff: React.FC = () => {
  const f = useCurrentFrame();
  // head travels 0 → past the right edge; tail follows later so the rule retracts off-screen
  const head = interpolate(f, [12, 210], [-40, HAND_W + 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const tail = interpolate(f, [150, 290], [-40, HAND_W + 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const reset = 1 - ramp(f, 262, 292, easeInOut); // markers/labels relax before the loop point
  const passed = (x: number) => (head >= x ? ramp(f, frameAt(x), frameAt(x) + 12) * reset : 0);
  const callOn = passed(1640);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={HAND_W} height={HAND_H} style={{ position: "absolute", inset: 0 }}>
        {QX.map((x, i) => {
          const p = passed(x);
          return (
            <g key={i}>
              <line x1={x} y1={SEAM - 34} x2={x} y2={SEAM - 4} stroke={C.navy} strokeOpacity={0.3 + 0.3 * p} strokeWidth={2} />
              <rect x={x - 7} y={SEAM - 48} width={14} height={14} transform={`rotate(45 ${x} ${SEAM - 41})`} fill="none" stroke={C.navy} strokeOpacity={0.45} strokeWidth={2} />
              <rect x={x - 7} y={SEAM - 48} width={14} height={14} transform={`rotate(45 ${x} ${SEAM - 41})`} fill={C.navy} opacity={p} />
            </g>
          );
        })}
        {/* the call: a marker on the navy side */}
        <line x1={1640} y1={SEAM + 4} x2={1640} y2={SEAM + 34} stroke={C.off} strokeOpacity={0.5 * callOn} strokeWidth={2} />
        {/* the gold rule along the seam */}
        {head > tail ? <line x1={Math.max(0, tail)} y1={SEAM} x2={Math.min(HAND_W, head)} y2={SEAM} stroke={C.gold} strokeWidth={6} /> : null}
      </svg>
      {QX.map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: 6,
            transform: "translateX(-50%)",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.22em",
            color: C.slateInk,
            opacity: 0.55 + 0.35 * passed(x),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Q.{String(i + 1).padStart(2, "0")}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 1640,
          top: SEAM + 44,
          transform: "translateX(-50%)",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.slate,
          opacity: callOn,
          whiteSpace: "nowrap",
        }}
      >
        Then, the call
      </div>
    </AbsoluteFill>
  );
};

// frame at which the head reaches x (inverse of the head interpolation, searched)
const frameAt = (x: number) => {
  for (let k = 12; k <= 210; k++) {
    const h = interpolate(k, [12, 210], [-40, HAND_W + 40], { easing: easeInOut });
    if (h >= x) return k;
  }
  return 210;
};
