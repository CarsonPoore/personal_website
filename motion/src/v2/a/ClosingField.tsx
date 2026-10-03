import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, Grid, Label, fontFamily, ramp, easeInOut, easeOut } from "../../lib";

// Home closing band (full-bleed Royal Blue background, behind real copy).
// Copy: "Ready to build? Let's make it happen." A low-contrast blueprint drafts a
// structure block by block at the right edge (bleeding off it), measured by a
// dimension line with one gold point. Built at frame 0 and the last frame.

const W = 1920;
const H = 640;
const LINE = C.off;

type Block = { x: number; y: number; w: number; h: number; t: number };
const BLOCKS: Block[] = [
  { x: 1330, y: 452, w: 640, h: 108, t: 84 },
  { x: 1410, y: 330, w: 460, h: 122, t: 146 },
  { x: 1500, y: 222, w: 270, h: 108, t: 208 },
];
const DIM_X = 1270;
const DIM_T = BLOCKS[2].y;
const DIM_B = BLOCKS[0].y + BLOCKS[0].h;

export const ClosingField: React.FC = () => {
  const f = useCurrentFrame();
  const clear = 1 - ramp(f, 24, 64, easeInOut); // existing drawing fades out
  const rebuilding = f >= 64;

  const blockState = (b: Block) => {
    if (!rebuilding) return { draw: 1, fill: 1, o: clear };
    return { draw: ramp(f, b.t, b.t + 52, easeInOut), fill: ramp(f, b.t + 44, b.t + 70, easeOut), o: 1 };
  };
  const dim = rebuilding ? ramp(f, 270, 316, easeInOut) : 1;
  const dimO = rebuilding ? 1 : clear;

  return (
    <AbsoluteFill style={{ background: C.blue, fontFamily }}>
      <Grid w={W} h={H} step={160} color={C.off} opacity={0.07} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {BLOCKS.map((b, i) => {
          const s = blockState(b);
          const per = 2 * (b.w + b.h);
          return (
            <g key={i} opacity={s.o}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={LINE} fillOpacity={0.06 * s.fill} />
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="none"
                stroke={LINE}
                strokeOpacity={0.3}
                strokeWidth={2}
                strokeDasharray={`${per * s.draw} ${per}`}
              />
            </g>
          );
        })}
        <g opacity={dimO}>
          <line x1={DIM_X} y1={DIM_B} x2={DIM_X} y2={DIM_B - (DIM_B - DIM_T) * dim} stroke={LINE} strokeOpacity={0.34} strokeWidth={2} />
          <line x1={DIM_X - 14} y1={DIM_B} x2={DIM_X + 14} y2={DIM_B} stroke={LINE} strokeOpacity={0.34} strokeWidth={2} />
          <line x1={DIM_X - 14} y1={DIM_T} x2={DIM_X + 14} y2={DIM_T} stroke={LINE} strokeOpacity={0.34 * dim} strokeWidth={2} />
          {/* extension lines to the structure */}
          <line x1={DIM_X + 20} y1={DIM_T} x2={BLOCKS[2].x - 10} y2={DIM_T} stroke={LINE} strokeOpacity={0.18 * dim} strokeWidth={2} strokeDasharray="6 8" />
        </g>
      </svg>
      <Diamond cx={DIM_X} cy={DIM_T} size={26} scale={dim} opacity={dim * dimO} />
      <Label x={DIM_X - 24} y={DIM_T - 8} align="left" color={LINE} size={15} opacity={0.5 * dim * dimO} style={{ translate: "-100% 0" }}>
        39.7684° N
      </Label>
    </AbsoluteFill>
  );
};
