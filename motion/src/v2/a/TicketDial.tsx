import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../lib";
import { keyed } from "./util";

// Ticket page, inline micro-loop set right after "45 minutes" in the headline.
// A clock face sweeps a flat gold wedge from 0 to 45 minutes (270°), holds, rewinds.

const S = 160;
const CXY = S / 2;
const R = 64;

const pt = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: CXY + r * Math.cos(a), y: CXY + r * Math.sin(a) };
};

const wedge = (deg: number) => {
  if (deg < 0.5) return "";
  const e = pt(deg, R - 10);
  const large = deg > 180 ? 1 : 0;
  return `M ${CXY} ${CXY} L ${CXY} ${CXY - (R - 10)} A ${R - 10} ${R - 10} 0 ${large} 1 ${e.x} ${e.y} Z`;
};

export const TicketDial: React.FC = () => {
  const f = useCurrentFrame();
  // full (45 min) at frame 0 and the last frame
  const deg = keyed(f, [0, 30, 62, 76, 160, 180], [270, 270, 0, 0, 270, 270]);
  const hand = pt(deg, R - 4);

  return (
    <AbsoluteFill>
      <svg width={S} height={S} style={{ position: "absolute", inset: 0 }}>
        <circle cx={CXY} cy={CXY} r={R} fill="none" stroke={C.navy} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = pt(i * 30, R - 2);
          const b = pt(i * 30, R - (i % 3 === 0 ? 16 : 10));
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.navy} strokeWidth={i % 3 === 0 ? 6 : 4} />;
        })}
        <path d={wedge(deg)} fill={C.gold} />
        <line x1={CXY} y1={CXY} x2={hand.x} y2={hand.y} stroke={C.navy} strokeWidth={7} strokeLinecap="round" />
        <circle cx={CXY} cy={CXY} r={7} fill={C.navy} />
      </svg>
    </AbsoluteFill>
  );
};
