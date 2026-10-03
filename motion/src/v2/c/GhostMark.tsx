import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, cyc, easeInOut, ramp } from "../../lib";
import { MARK_D, MARK_H, MARK_W } from "./markPath";

// Work / hero: an oversized ghost CPC mark (upright, ~7% ink) that assembles itself
// behind the headline: construction lines set out its proportions, the outline is
// traced, then the solid is laid down in courses from the ground up, the way the
// work gets built before anyone gets to point at it. Transparent, bleeds off the
// hero's left and bottom edges on the page. Frame 0 = built.

export const GHOST_W = 1200;
export const GHOST_H = 940;
const S = 3; // mark scale
const OX = 60;
const OY = 50;
const COURSES = 5;

const INK = C.off;

export const GhostMark: React.FC = () => {
  const f = useCurrentFrame();
  // 12s: hold solid → solid lifts away → construction lines → outline trace → courses → hold
  const solidOut = 1 - ramp(f, 120, 160, easeInOut); // whole solid fades away
  const guides = cyc(f, [100, 130], [176, 216]);
  const guidesOut = 1 - ramp(f, 300, 340, easeInOut); // guides fade once built
  const trace = f < 170 ? 0 : ramp(f, 196, 262, easeInOut);
  const traceOp = f < 170 ? 0 : 1 - ramp(f, 300, 340, easeInOut);
  const course = (i: number) => ramp(f, 236 + i * 12, 262 + i * 12, easeInOut);
  const built = f < 170 ? solidOut : 1;

  const hLines = [0, 34.6, 135.6, 170.4, MARK_H].map((y) => OY + y * S);
  const vLines = [0, 131, 182.3, 238, MARK_W].map((x) => OX + x * S);
  const courseH = (MARK_H * S) / COURSES;

  // guides are visible only during the build window; frame 0 and the last frame show none
  const gOp = f < 170 ? 0 : Math.min(guides, guidesOut);

  return (
    <AbsoluteFill>
      <svg width={GHOST_W} height={GHOST_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* one clip made of five courses (a union, so overlaps never double the ink);
              course 0 is the bottom one and each rises up into its slot */}
          <clipPath id="c-ghost-courses">
            {Array.from({ length: COURSES }, (_, i) => {
              const y = OY + MARK_H * S - (i + 1) * courseH;
              const p = f < 170 ? 1 : course(i);
              return p > 0 ? <rect key={i} x={0} y={y + courseH * (1 - p) - 1} width={GHOST_W} height={courseH * p + 2} /> : null;
            })}
          </clipPath>
        </defs>

        {/* construction lines */}
        {hLines.map((y, i) => (
          <line
            key={"h" + i}
            x1={0}
            y1={y}
            x2={GHOST_W * Math.min(1, guides * 1.02)}
            y2={y}
            stroke={INK}
            strokeOpacity={0.07 * gOp}
            strokeWidth={2}
          />
        ))}
        {vLines.map((x, i) => (
          <line key={"v" + i} x1={x} y1={GHOST_H} x2={x} y2={GHOST_H * (1 - guides)} stroke={INK} strokeOpacity={0.07 * gOp} strokeWidth={2} />
        ))}

        {/* outline trace */}
        <g transform={`translate(${OX} ${OY}) scale(${S})`}>
          <path
            d={MARK_D}
            fill="none"
            stroke={INK}
            strokeOpacity={0.16 * traceOp}
            strokeWidth={2 / S}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - trace}
          />
        </g>

        {/* the solid, laid in courses */}
        <g clipPath="url(#c-ghost-courses)" opacity={built}>
          <g transform={`translate(${OX} ${OY}) scale(${S})`}>
            <path d={MARK_D} fill={INK} fillOpacity={0.07} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
