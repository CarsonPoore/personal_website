import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Diamond, Label, NavyPanel, easeInOut, easeOut, lerp, ramp } from "./lib";

// Work hero: "Proof, not promises." A measured line plots month by month, each monthly
// report checked off as it passes. No invented figures, just the shape of momentum.
// Frame 0 = built.

const X0 = 130;
const X1 = 860;
const TOP = 170;
const BASE = 600;
const V = [0.08, 0.12, 0.1, 0.18, 0.25, 0.23, 0.34, 0.42, 0.47, 0.58, 0.67, 0.8];
const PTS = V.map((v, i) => ({ x: 156 + i * (680 / 11), y: BASE - v * 400 }));
const SEG = PTS.slice(1).map((p, i) => Math.hypot(p.x - PTS[i].x, p.y - PTS[i].y));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const CUM = SEG.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s], [0]);

const at = (d: number) => {
  for (let i = 0; i < SEG.length; i++) {
    if (d <= CUM[i + 1]) {
      const t = (d - CUM[i]) / SEG[i];
      return { x: lerp(PTS[i].x, PTS[i + 1].x, t), y: lerp(PTS[i].y, PTS[i + 1].y, t) };
    }
  }
  return PTS[PTS.length - 1];
};

export const ProofLine: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const vis = f < 72 ? 1 - ramp(f, 40, 64, easeInOut) : 1;
  const draw = f < 72 ? 1 : ramp(f, 86, 192, easeInOut);
  const d = draw * TOTAL;
  const head = at(d);
  const headScale = f < 72 ? 1 : ramp(f, 80, 94, easeOut);
  const notes = f < 72 ? vis : ramp(f, 188, 208);

  const poly = [...PTS.filter((_, i) => CUM[i] <= d), head].map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <AbsoluteFill>
      <NavyPanel w={width} h={height} refText="Ref. CPC-05 · Work" secText="Fig. W · 12 months">
        <Label x={40} y={34} align="right">Measured, not promised</Label>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* axes */}
          <line x1={X0} y1={TOP} x2={X0} y2={BASE} stroke={C.off} strokeOpacity={0.4} strokeWidth={2} />
          <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke={C.off} strokeOpacity={0.4} strokeWidth={2} />
          {/* starting level reference */}
          <line x1={X0} y1={PTS[0].y} x2={X1} y2={PTS[0].y} stroke={C.off} strokeOpacity={0.18} strokeWidth={2} strokeDasharray="8 10" />
          {/* the line */}
          <g opacity={vis}>
            <polyline points={poly} fill="none" stroke={C.off} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
            {PTS.map((p, i) => {
              const reached = d >= CUM[i] - 0.5;
              const pop = reached ? Math.min(1, (d - CUM[i]) / 40 + 0.35) : 0;
              return <circle key={i} cx={p.x} cy={p.y} r={8 * pop} fill={C.navy} stroke={C.off} strokeWidth={4} />;
            })}
          </g>
        </svg>
        {PTS.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: BASE + 18,
              translate: "-50% 0",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: C.slate,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            M{String(i + 1).padStart(2, "0")}
          </div>
        ))}
        <Label x={X0 + 14} y={PTS[0].y + 14} size={14} opacity={0.9}>
          Start
        </Label>
        <Diamond cx={head.x} cy={head.y} size={34} scale={headScale} opacity={vis} />
        <Label x={PTS[11].x - 18} y={PTS[11].y - 66} align="left" opacity={notes} style={{ translate: "-100% 0" }}>
          Reported monthly
        </Label>
      </NavyPanel>
    </AbsoluteFill>
  );
};
