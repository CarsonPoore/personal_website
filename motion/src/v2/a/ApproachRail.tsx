import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, ramp, easeInOut, easeOut } from "../../lib";
import { keyed } from "./util";

// Home "Our approach": a transparent rail set into the left edge of the 01–05 method list.
// Copy: "Five steps, in the order they matter." A gold rule travels down the rail and
// stops at each step in order, pointing at it, then clears. Rows are 1/5 of the height.

const W = 112;
const H = 675;
const X = 30;
const ROW = H / 5;
const STN = [0, 1, 2, 3, 4].map((i) => ROW * (i + 0.5));
const ARRIVE = [30, 72, 114, 156, 198];

export const ApproachRail: React.FC = () => {
  const f = useCurrentFrame();
  const fillY = keyed(f, [10, 30, 52, 72, 94, 114, 136, 156, 178, 198], [0, STN[0], STN[0], STN[1], STN[1], STN[2], STN[2], STN[3], STN[3], STN[4]]);
  const fade = 1 - ramp(f, 222, 238, easeInOut);

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={X} y1={0} x2={X} y2={H} stroke={C.navy} strokeOpacity={0.14} strokeWidth={2} />
        {STN.map((y) => (
          <line key={y} x1={X - 8} y1={y} x2={X + 8} y2={y} stroke={C.navy} strokeOpacity={0.3} strokeWidth={2} />
        ))}
        <g opacity={fade}>
          {fillY > 0.5 && <line x1={X} y1={0} x2={X} y2={fillY} stroke={C.gold} strokeWidth={4} />}
          {STN.map((y, i) => {
            const p = ramp(f, ARRIVE[i], ARRIVE[i] + 16, easeOut);
            return p > 0 ? <line key={i} x1={X} y1={y} x2={X + (W - X - 6) * p} y2={y} stroke={C.gold} strokeWidth={4} /> : null;
          })}
        </g>
      </svg>
      {STN.map((y, i) => {
        const p = ramp(f, ARRIVE[i] - 4, ARRIVE[i] + 12, easeOut);
        return <Diamond key={i} cx={X} cy={y} size={26} scale={p} opacity={p * fade} />;
      })}
    </AbsoluteFill>
  );
};
