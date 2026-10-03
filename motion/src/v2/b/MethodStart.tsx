import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, fontFamily, ramp } from "../../lib";
import { SLATE } from "./shared";

// method.html — straddles the navy hero and the steps section. "Most marketing starts in
// the middle ... We start at the beginning and build forward." A gold plumb line drops out
// of the hero and lands exactly on step 01 of the rail (whose active border is also gold).
// Frame 0 = built.

const LX = 48;

export const MethodStart: React.FC = () => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();

  // collapse into the rail, then drop again from the top
  const out = ramp(f, 170, 200, easeInOut);
  const inn = ramp(f, 206, 256, easeInOut);
  const top = out < 1 ? out * height : 0;
  const bot = out < 1 ? height : inn * height;

  // bead descending the built line
  const b = ramp(f, 30, 130, easeInOut);
  const bOn = ramp(f, 26, 34) * (1 - ramp(f, 126, 136));
  const labelOn = 1 - 0.55 * ramp(f, 172, 196) + 0.55 * ramp(f, 240, 262);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <div style={{ position: "absolute", left: LX - 2, top, width: 4, height: Math.max(0, bot - top), background: C.gold }} />
      {/* top tick */}
      <div style={{ position: "absolute", left: LX - 14, top, width: 28, height: 4, background: C.gold, opacity: bot - top > 6 ? 1 : 0 }} />
      <div style={{ position: "absolute", left: LX - 6, top: 4 + b * (height - 60), width: 12, height: 44, background: C.gold, opacity: bOn }} />
      <div
        style={{
          position: "absolute",
          left: LX + 26,
          top: height - 74,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: SLATE,
          opacity: labelOn,
          whiteSpace: "nowrap",
        }}
      >
        Start at 01
      </div>
    </AbsoluteFill>
  );
};
