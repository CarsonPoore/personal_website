import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily, easeInOut, easeOut } from "../../lib";
import { keyed } from "./util";

// Home "What we do": transparent connector threaded *behind* the three circle icons
// (Strategy → Design → Execution). Copy: "Everything below runs as one system."
// A gold pulse carries from one service into the next; each icon registers it with a
// hairline ring. Icon centres sit at x = 100 / 1000 / 1900 of the 2000px canvas.

const W = 2000;
const H = 200;
const CY = 100;
const IX = [100, 1000, 1900];
const R = 78; // just outside the 64px icon at display scale

export const ServicesLink: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const P = durationInFrames; // loop period: frame P would equal frame 0

  // pulse head position along x (from icon 1 edge to icon 3 edge), with dwell at icon 2
  const hxAt = (t: number) => keyed(t, [16, 92, 120, 196], [IX[0] + R, IX[1] - R, IX[1] + R, IX[2] - R], easeInOut);
  const hx = hxAt(f);
  const lag = hxAt(f - 16);
  const pieces = [0, 1].map((i) => ({ a: Math.max(lag, IX[i] + R), b: Math.min(hx, IX[i + 1] - R) }));

  const ring = (t0: number) => {
    const t = (((f - t0) % P) + P) % P;
    const p = Math.min(1, t / 34);
    const e = easeOut(p);
    return { r: R + 30 * e, o: t < 34 ? 0.45 * (1 - e) : 0 };
  };
  const rings = [ring(P - 6), ring(92), ring(196)];


  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[0, 1].map((i) => (
          <g key={i}>
            <line x1={IX[i] + R} y1={CY} x2={IX[i + 1] - R} y2={CY} stroke={C.navy} strokeOpacity={0.28} strokeWidth={3} />
            {/* mid tick */}
            <line x1={(IX[i] + IX[i + 1]) / 2} y1={CY - 12} x2={(IX[i] + IX[i + 1]) / 2} y2={CY + 12} stroke={C.navy} strokeOpacity={0.28} strokeWidth={3} />
            {/* chevron into the next service */}
            <polyline
              points={`${IX[i + 1] - R - 16},${CY - 12} ${IX[i + 1] - R - 2},${CY} ${IX[i + 1] - R - 16},${CY + 12}`}
              fill="none"
              stroke={C.navy}
              strokeOpacity={0.4}
              strokeWidth={3}
            />
          </g>
        ))}
        {pieces.map((p, i) =>
          p.b - p.a > 1 ? <line key={i} x1={p.a} y1={CY} x2={p.b} y2={CY} stroke={C.gold} strokeWidth={6} /> : null,
        )}
        {rings.map((g, i) => (
          <circle key={i} cx={IX[i]} cy={CY} r={g.r} fill="none" stroke={C.navy} strokeOpacity={g.o} strokeWidth={3} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
