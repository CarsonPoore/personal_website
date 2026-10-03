import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, fontFamily, ramp, easeInOut, easeOut, lerp } from "../../lib";

// Home, transparent full-bleed seam between the industry marquee and "What we do".
// Copy: "Everything below runs as one system, not four separate vendors."
// Four misaligned rules (four vendors) slide into register and join into one continuous
// rule with a gold joint. Hangers drop from the marquee border (canvas top edge). Joined at frame 0 and the last frame.

const W = 1920;
const Y = 100;
const X0 = 240;
const STEP = 370;
const LEN = 330;
const OFF = [
  { dx: -36, dy: -40 },
  { dx: 24, dy: 26 },
  { dx: -14, dy: -16 },
  { dx: 34, dy: 42 },
];

export const SeamOneSystem: React.FC = () => {
  const f = useCurrentFrame();
  const sepOf = (i: number) => ramp(f, 40 + i * 6, 96 + i * 6, easeInOut) - ramp(f, 156 + i * 8, 214 + i * 8, easeInOut);
  const joined = 1 - Math.max(0, ...[0, 1, 2, 3].map(sepOf));
  // gold joint visible while joined (frames 0-26 and 236-end)
  const jointVis = 1 - ramp(f, 26, 44, easeInOut) + ramp(f, 236, 256, easeOut);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={W} height={200} style={{ position: "absolute", inset: 0 }}>
        {OFF.map((o, i) => {
          const s = sepOf(i);
          const x = X0 + i * STEP + o.dx * s;
          const y = Y + o.dy * s;
          // joined: segments butt together (fill the 40px gap); separated: gaps open
          const len = i < 3 ? lerp(STEP, LEN - 30, s) : lerp(LEN, LEN - 30, s);
          return (
            <g key={i}>
              {/* hanger from the marquee's bottom border (canvas top = section seam) */}
              <line x1={X0 + i * STEP + LEN / 2} y1={0} x2={X0 + i * STEP + LEN / 2} y2={Y + o.dy * s} stroke={C.navy} strokeOpacity={0.16} strokeWidth={2} />
              <line x1={x} y1={y} x2={x + len} y2={y} stroke={C.navy} strokeOpacity={0.5} strokeWidth={3} />
              <line x1={x} y1={y - 9} x2={x} y2={y + 9} stroke={C.navy} strokeOpacity={0.5 * s + 0.0} strokeWidth={2} />
            </g>
          );
        })}
        {/* end caps of the joined rule */}
        <line x1={X0} y1={Y - 12} x2={X0} y2={Y + 12} stroke={C.navy} strokeOpacity={0.5 * joined} strokeWidth={2} />
        <line x1={X0 + 3 * STEP + LEN} y1={Y - 12} x2={X0 + 3 * STEP + LEN} y2={Y + 12} stroke={C.navy} strokeOpacity={0.5 * joined} strokeWidth={2} />
      </svg>
      <Diamond cx={W / 2} cy={Y} size={30} scale={0.4 + 0.6 * jointVis} opacity={jointVis} />
      <Label2 x={X0} y={Y + 62} opacity={1 - joined}>
        Not four separate vendors
      </Label2>
      <Label2 x={X0} y={Y + 62} opacity={joined}>
        One system
      </Label2>
    </AbsoluteFill>
  );
};

const Label2: React.FC<{ x: number; y: number; opacity: number; children: React.ReactNode }> = ({ x, y, opacity, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: C.slateInk,
      opacity,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
