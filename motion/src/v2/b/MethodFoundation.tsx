import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Diamond, easeInOut, ramp } from "../../lib";
import { ink } from "./shared";

// method.html, full-bleed background behind step 01 "Conviction" — "it's the foundation
// everything else stands on." A foundation line holds steady along the bottom edge of the
// step; the blueprint grid above it sinks into it and rises back off it, always standing on
// it. Very low contrast: body copy sits on top. Frame 0 = built.

const STEP = 160;

export const MethodFoundation: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const FOUND = height - 2;
  const cx = width / 2;

  const cols: number[] = [];
  for (let x = cx % STEP; x < width; x += STEP) cols.push(x);
  const rows: number[] = [];
  for (let y = FOUND - STEP; y > 0; y -= STEP) rows.push(y);

  // a surveyor's level mark slides along the foundation
  const lv = ramp(f, 20, 200, easeInOut);
  const lvOn = ramp(f, 14, 26) * (1 - ramp(f, 196, 210));

  return (
    <AbsoluteFill>
      {cols.map((x) => {
        const d = Math.abs(x - cx) / (width / 2); // 0 centre .. 1 edge
        const down = ramp(f, 214 + d * 24, 244 + d * 24, easeInOut);
        const up = ramp(f, 262 + d * 40, 312 + d * 40, easeInOut);
        const p = down < 1 ? 1 - down : up;
        return (
          <div key={"v" + x} style={{ position: "absolute", left: x - 1, top: FOUND - p * FOUND, width: 2, height: p * FOUND, background: ink(0.045) }} />
        );
      })}
      {rows.map((y, k) => {
        const down = ramp(f, 214 + k * 10, 240 + k * 10, easeInOut);
        const up = ramp(f, 262 + k * 22, 300 + k * 22, easeInOut);
        const p = down < 1 ? 1 - down : up;
        return <div key={"h" + y} style={{ position: "absolute", left: 0, top: y - 1, width, height: 2, background: ink(0.04), opacity: p }} />;
      })}
      {/* the foundation */}
      <div style={{ position: "absolute", left: 0, top: FOUND - 2, width, height: 3, background: ink(0.14) }} />
      <Diamond cx={cx} cy={FOUND - 15} size={26} color={C.gold} opacity={0.9} />
      <div style={{ position: "absolute", left: 120 + lv * (width - 240) - 40, top: FOUND - 7, width: 80, height: 5, background: C.gold, opacity: 0.55 * lvOn }} />
    </AbsoluteFill>
  );
};
