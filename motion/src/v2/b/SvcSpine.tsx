import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, ramp } from "../../lib";
import { ink } from "./shared";

// services.html — a single thread runs down the left edge of the four services and
// ties them together. Strategy is the first node; the gold signal always starts there
// and travels down through Brand, Systems, Execution ("everything else is built on this").
// Stretched (object-fit: fill) to the height of .svc-list; node fractions measured at 1440px. Frame 0 = built.

export const SPINE_NODES = [0.069, 0.293, 0.517, 0.887];

export const SvcSpine: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const X = width / 2;
  const top = SPINE_NODES[0] * height;
  const bot = SPINE_NODES[3] * height;

  // line: built at 0, retracts upward into Strategy, then redraws downward
  const out = ramp(f, 168, 196, easeInOut);
  const inn = ramp(f, 200, 236, easeInOut);
  const drawn = out < 1 ? 1 - out : inn; // 1 = reaches Execution
  const lineEnd = top + (bot - top) * drawn;

  // gold signal descends from Strategy to Execution
  const s = ramp(f, 24, 140, easeInOut);
  const sigY = top + (bot - top) * s;
  const sigOn = ramp(f, 18, 26) * (1 - ramp(f, 140, 150));

  return (
    <AbsoluteFill>
      {/* faint full-height track */}
      <div style={{ position: "absolute", left: X - 1, top: 0, width: 2, height, background: ink(0.08) }} />
      {/* drawn thread */}
      <div style={{ position: "absolute", left: X - 1, top, width: 2, height: lineEnd - top, background: ink(0.42) }} />
      {SPINE_NODES.map((n, i) => {
        const y = n * height;
        const reached = i === 0 ? 1 : Math.max(0, Math.min(1, (lineEnd - y + 40) / 40));
        const hit = sigOn > 0 ? Math.max(0, 1 - Math.abs(sigY - y) / 90) : 0;
        const w = 28 + 20 * hit;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: X - 14,
                top: y - 2,
                width: w * reached,
                height: 4,
                background: hit > 0.35 ? C.gold : ink(0.55),
              }}
            />
          </React.Fragment>
        );
      })}
      {/* signal */}
      <div
        style={{
          position: "absolute",
          left: X - 3,
          top: sigY - 36,
          width: 6,
          height: 72,
          background: C.gold,
          opacity: sigOn,
        }}
      />
    </AbsoluteFill>
  );
};
