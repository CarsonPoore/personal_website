import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, ramp, easeInOut } from "../../lib";
import { keyed } from "./util";

// Ticket page: the stub's tear line, extended past the top and bottom of the ticket card
// onto the page. A gold cutter runs the perforation top to bottom, punching each hole
// as it passes: the ticket being redeemed. Fully punched at frame 0 and the last frame.

const W = 120;
const H = 720;
const X = W / 2;
const GAP = 24;
const N = Math.floor(H / GAP);

export const TicketPerf: React.FC = () => {
  const f = useCurrentFrame();
  const reset = ramp(f, 26, 56, easeInOut); // 0 = punched, 1 = waiting
  const cy = keyed(f, [70, 176], [-30, H + 30]);
  const cutting = f >= 70;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }, (_, i) => {
          const y = i * GAP + GAP / 2;
          const punched = cutting ? Math.min(1, Math.max(0, (cy - y) / 30)) : 1 - reset;
          return <rect key={i} x={X - 3} y={y - 7} width={6} height={14} rx={3} fill={C.navy} opacity={0.14 + 0.5 * punched} />;
        })}
      </svg>
      {cutting && cy > -20 && cy < H + 20 && <Diamond cx={X} cy={cy} size={30} />}
    </AbsoluteFill>
  );
};
