import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, cyc, easeInOut, lerp, ramp } from "../../lib";

// About / Values: four inline glyphs in one 4-cell strip (each cell 120x120).
// The page shows each cell beside its value title by cropping the same video
// with object-position, so one small file serves all four.
// Transparent. Frame 0 = built; each glyph un-builds and re-builds on its own beat.

const CELL = 120;
const SW = 7; // stroke width (renders ~2.5px at 44px display)

const dash = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p });

/** Build It Better: three bars, each a sharper version of the last; the newest is gold. */
const BuildBetter: React.FC<{ f: number }> = ({ f }) => {
  const bars = [
    { x: 16, h: 34 },
    { x: 48, h: 58 },
    { x: 80, h: 86 },
  ];
  return (
    <svg width={CELL} height={CELL} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={10} y1={104} x2={110} y2={104} stroke={C.navy} strokeWidth={4} strokeOpacity={0.35} />
      {bars.map((b, i) => {
        const p = cyc(f, [150, 172], [186 + i * 14, 214 + i * 14]);
        const h = b.h * p;
        return <rect key={i} x={b.x} y={100 - h} width={24} height={h} fill={i === 2 ? C.gold : C.navy} />;
      })}
    </svg>
  );
};

/** Kind and Candid: two circles held together; where they overlap (both at once) is gold. */
const KindCandid: React.FC<{ f: number }> = ({ f }) => {
  const t = cyc(f, [160, 190], [200, 250]);
  const ax = lerp(26, 46, t);
  const bx = lerp(94, 74, t);
  const r = 30;
  return (
    <svg width={CELL} height={CELL} style={{ position: "absolute", left: CELL, top: 0 }}>
      <defs>
        <clipPath id="c-kc-a">
          <circle cx={ax} cy={60} r={r} />
        </clipPath>
      </defs>
      <circle cx={bx} cy={60} r={r} fill={C.gold} clipPath="url(#c-kc-a)" />
      <circle cx={ax} cy={60} r={r} fill="none" stroke={C.navy} strokeWidth={SW} />
      <circle cx={bx} cy={60} r={r} fill="none" stroke={C.navy} strokeWidth={SW} />
    </svg>
  );
};

/** Nothing Half-Checked: a check, then a second check. Looked at more than once. */
const DoubleCheck: React.FC<{ f: number }> = ({ f }) => {
  const a = cyc(f, [170, 186], [204, 226]);
  const b = cyc(f, [164, 180], [238, 262]);
  return (
    <svg width={CELL} height={CELL} style={{ position: "absolute", left: CELL * 2, top: 0 }}>
      <path d="M 10 62 L 34 86 L 74 34" fill="none" stroke={C.navy} strokeWidth={SW + 1} strokeLinecap="square" {...dash(a)} />
      <path d="M 46 62 L 70 86 L 110 34" fill="none" stroke={C.gold} strokeWidth={SW + 1} strokeLinecap="square" {...dash(b)} />
    </svg>
  );
};

/** Founders Over Funnels: the person sits above the pipeline, which recedes. */
const FounderOverFunnel: React.FC<{ f: number }> = ({ f }) => {
  const funnel = cyc(f, [176, 200], [206, 236]);
  const person = cyc(f, [168, 188], [236, 264]);
  const lift = lerp(14, 0, person);
  // Funnel draws at full ink, then recedes behind the person (frame 0 == last frame)
  const fo = f >= 200 && f < 236 ? 1 : f >= 236 && f <= 266 ? lerp(1, 0.38, ramp(f, 236, 266, easeInOut)) : 0.38;
  return (
    <svg width={CELL} height={CELL} style={{ position: "absolute", left: CELL * 3, top: 0 }}>
      <path
        d="M 18 64 L 102 64 L 70 92 L 70 112 L 50 112 L 50 92 Z"
        fill="none"
        stroke={C.navy}
        strokeOpacity={fo}
        strokeWidth={SW - 1}
        strokeLinejoin="miter"
        {...dash(funnel)}
      />
      <g opacity={person} transform={`translate(0 ${lift})`}>
        <circle cx={60} cy={20} r={12} fill={C.navy} />
        <path d="M 38 54 Q 38 36 60 36 Q 82 36 82 54 Z" fill={C.navy} />
      </g>
    </svg>
  );
};

export const ValuesGlyphs: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <BuildBetter f={f} />
      <KindCandid f={(f + 40) % 300} />
      <DoubleCheck f={(f + 80) % 300} />
      <FounderOverFunnel f={(f + 120) % 300} />
    </AbsoluteFill>
  );
};
