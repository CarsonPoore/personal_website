import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, fontFamily, ramp, easeInOut } from "../../lib";
import { polyline, ptsAttr, keyed } from "./util";

// Home hero, transparent strip under the CTAs, sitting on the Blueprint grid.
// Copy: "...makes the right customers see it, choose it, and come back."
// A measured baseline with three stations; the gold diamond travels See it → Choose it,
// then a return line routes it back to the start: come back. Frame 0 == last frame.

const W = 1920;
const BASE = 66;
const RET = 128;
const S = [170, 830, 1490];
const LABELS = ["See it", "Choose it", "Come back"];

const RETURN = polyline([
  { x: S[2], y: BASE },
  { x: S[2], y: RET },
  { x: S[0], y: RET },
  { x: S[0], y: BASE },
]);

export const HeroRoute: React.FC = () => {
  const f = useCurrentFrame();

  // forward travel along the baseline
  const fx = keyed(f, [0, 24, 72, 104, 152, 184], [S[0], S[0], S[1], S[1], S[2], S[2]]);
  // return travel along the routed line (184 → 270)
  const rd = keyed(f, [184, 270], [0, RETURN.total]);
  const returning = f >= 184;
  const head = returning ? RETURN.at(rd) : { x: fx, y: BASE };

  const fwdLen = returning ? S[2] - S[0] : fx - S[0];
  const fwdOpacity = 1 - ramp(f, 196, 236, easeInOut);
  const retOpacity = 1 - ramp(f, 272, 296, easeInOut);

  const ticks: React.ReactNode[] = [];
  for (let x = 26; x < W; x += 48) {
    ticks.push(<line key={x} x1={x} y1={BASE - 6} x2={x} y2={BASE} stroke={C.off} strokeOpacity={0.16} strokeWidth={2} />);
  }

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={W} height={160} style={{ position: "absolute", inset: 0 }}>
        {/* ruler baseline */}
        <line x1={0} y1={BASE} x2={W} y2={BASE} stroke={C.off} strokeOpacity={0.2} strokeWidth={2} />
        {ticks}
        {/* travelled segment */}
        {fwdLen > 0.5 && (
          <line x1={S[0]} y1={BASE} x2={S[0] + fwdLen} y2={BASE} stroke={C.off} strokeOpacity={0.7 * fwdOpacity} strokeWidth={3} />
        )}
        {/* return route */}
        {returning && rd > 0.5 && (
          <polyline
            points={ptsAttr(RETURN.upTo(rd))}
            fill="none"
            stroke={C.off}
            strokeOpacity={0.55 * retOpacity}
            strokeWidth={3}
            strokeDasharray="12 10"
          />
        )}
        {/* stations */}
        {S.map((x) => (
          <g key={x}>
            <line x1={x} y1={BASE - 22} x2={x} y2={BASE + 22} stroke={C.off} strokeOpacity={0.5} strokeWidth={2} />
          </g>
        ))}
      </svg>
      {S.map((x, i) => {
        const near = Math.max(0, 1 - Math.hypot(head.x - x, head.y - BASE) / 140);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + 16,
              top: 14,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              color: C.off,
              opacity: 0.42 + 0.5 * near,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ color: C.slate, marginRight: 14 }}>{String(i + 1).padStart(2, "0")}</span>
            {LABELS[i]}
          </div>
        );
      })}
      <Diamond cx={head.x} cy={head.y} size={30} />
    </AbsoluteFill>
  );
};
