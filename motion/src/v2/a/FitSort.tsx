import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, easeOut } from "../../lib";
import { polyline, keyed } from "./util";

// Home "Fit": a transparent sorter threaded down the gutter between the two fit cards.
// Copy: "The industry matters far less than the mindset."
// Businesses of every shape (industry) drop through one stream; the gold mindset gate
// sorts them: a blue check into "A good fit if", a slate dash into "Probably not, if".

const W = 240;
const H = 720;
const CX = W / 2;
const GATE = 236;
const ROW = 290;
const SPAN = 40; // frames between items

const LEFT = polyline([
  { x: CX, y: GATE },
  { x: CX, y: ROW },
  { x: 26, y: ROW },
]);
const RIGHT = polyline([
  { x: CX, y: GATE },
  { x: CX, y: ROW },
  { x: W - 26, y: ROW },
]);

const ITEMS: { shape: 0 | 1 | 2; fit: boolean }[] = [
  { shape: 0, fit: true },
  { shape: 1, fit: false },
  { shape: 2, fit: true },
  { shape: 1, fit: true },
  { shape: 0, fit: false },
  { shape: 2, fit: true },
];

const Shape: React.FC<{ s: 0 | 1 | 2; x: number; y: number; o: number }> = ({ s, x, y, o }) => {
  const st = { fill: "none", stroke: C.navy, strokeWidth: 3, strokeOpacity: 0.7 * o };
  if (s === 0) return <circle cx={x} cy={y} r={9} {...st} />;
  if (s === 1) return <rect x={x - 8} y={y - 8} width={16} height={16} {...st} />;
  return <polygon points={`${x},${y - 10} ${x + 10},${y + 8} ${x - 10},${y + 8}`} {...st} />;
};

export const FitSort: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const P = durationInFrames; // frame P would equal frame 0

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* guides */}
        <line x1={CX} y1={0} x2={CX} y2={ROW} stroke={C.navy} strokeOpacity={0.16} strokeWidth={2} />
        <line x1={26} y1={ROW} x2={W - 26} y2={ROW} stroke={C.navy} strokeOpacity={0.16} strokeWidth={2} />
        <line x1={CX - 30} y1={GATE} x2={CX + 30} y2={GATE} stroke={C.gold} strokeWidth={4} />
        <line x1={CX} y1={ROW} x2={CX} y2={H - 40} stroke={C.navy} strokeOpacity={0.08} strokeWidth={2} strokeDasharray="6 10" />
        {ITEMS.map((it, i) => {
          const t = (((f - i * SPAN) % P) + P) % P; // 0..P
          if (t > 96) return null;
          const fall = keyed(t, [0, 40], [-24, GATE], easeInOut);
          const fade = Math.min(1, t / 8);
          if (t < 42) return <Shape key={i} s={it.shape} x={CX} y={fall} o={fade} />;
          const path = it.fit ? LEFT : RIGHT;
          const d = keyed(t, [42, 90], [0, path.total], easeOut);
          const p = path.at(d);
          const out = 1 - keyed(t, [78, 96], [0, 1], easeInOut);
          return it.fit ? (
            <polyline
              key={i}
              points={`${p.x - 9},${p.y} ${p.x - 2},${p.y + 7} ${p.x + 10},${p.y - 8}`}
              fill="none"
              stroke={C.blue}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={out}
            />
          ) : (
            <line key={i} x1={p.x - 9} y1={p.y} x2={p.x + 9} y2={p.y} stroke={C.muted} strokeWidth={4} strokeLinecap="round" opacity={out} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
