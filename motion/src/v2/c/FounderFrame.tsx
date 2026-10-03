import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, cyc, fontFamily, lerp } from "../../lib";

// About / Founder card: a transparent Blueprint overlay that sits exactly over the
// founder portrait (portrait occupies x 60..460, y 60..560 of this canvas). Bracket
// corners close in on the photo and dimension lines measure it at 1:1, "true scale",
// for the "Not louder. Truer." line beside it. Nothing is drawn over the photo itself.
// Frame 0 = built.

export const FOUNDER_W = 520;
export const FOUNDER_H = 620;
const L = 60;
const T = 60;
const R = 460;
const B = 560;
const BR = 34; // bracket size
const GAP = 12; // bracket offset from the photo edge

const Corner: React.FC<{ x: number; y: number; rot: 0 | 90 | 180 | 270; op: number }> = ({ x, y, rot, op }) => (
  <svg width={BR} height={BR} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, opacity: op }}>
    <rect x="0" y="0" width="16" height="100" fill={C.navy} />
    <rect x="0" y="0" width="100" height="16" fill={C.navy} />
  </svg>
);

const Lbl: React.FC<{ x: number; y: number; children: React.ReactNode; op: number; color?: string; weight?: number }> = ({
  x,
  y,
  children,
  op,
  color = C.slateInk,
  weight = 600,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      fontFamily,
      fontSize: 13,
      fontWeight: weight,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color,
      opacity: op,
      whiteSpace: "nowrap",
      background: "transparent",
      padding: "0 10px",
      fontVariantNumeric: "tabular-nums",
    }}
  >
    {children}
  </div>
);

export const FounderFrame: React.FC = () => {
  const f = useCurrentFrame();
  const close = cyc(f, [150, 178], [190, 222]); // brackets settle onto the photo
  const off = lerp(26, 0, close);
  const dimTop = cyc(f, [154, 176], [206, 238]);
  const dimSide = cyc(f, [154, 176], [220, 252]);
  const lbl = cyc(f, [150, 166], [236, 262]);

  const midX = (L + R) / 2;
  const midY = (T + B) / 2;
  const tY = 26; // top dimension line
  const sX = R + 34; // right dimension line

  return (
    <AbsoluteFill>
      {/* corners */}
      {/* corners slide in horizontally only, so the bottom pair never drops into the caption below */}
      <Corner x={L - GAP - off} y={T - GAP} rot={0} op={close} />
      <Corner x={R + GAP - BR + off} y={T - GAP} rot={90} op={close} />
      <Corner x={R + GAP - BR + off} y={B + 4 - BR} rot={180} op={close} />
      <Corner x={L - GAP - off} y={B + 4 - BR} rot={270} op={close} />

      <svg width={FOUNDER_W} height={FOUNDER_H} style={{ position: "absolute", inset: 0 }}>
        {/* top dimension: extension ticks + line drawing out from the centre */}
        <line x1={L} y1={tY - 9} x2={L} y2={tY + 9} stroke={C.slateInk} strokeOpacity={0.6 * dimTop} strokeWidth={2} />
        <line x1={R} y1={tY - 9} x2={R} y2={tY + 9} stroke={C.slateInk} strokeOpacity={0.6 * dimTop} strokeWidth={2} />
        <line x1={midX - 122} y1={tY} x2={lerp(midX - 122, L, dimTop)} y2={tY} stroke={C.slateInk} strokeOpacity={0.6} strokeWidth={2} />
        <line x1={midX + 122} y1={tY} x2={lerp(midX + 122, R, dimTop)} y2={tY} stroke={C.slateInk} strokeOpacity={0.6} strokeWidth={2} />
        {/* right dimension */}
        <line x1={sX - 9} y1={T} x2={sX + 9} y2={T} stroke={C.slateInk} strokeOpacity={0.6 * dimSide} strokeWidth={2} />
        <line x1={sX - 9} y1={B} x2={sX + 9} y2={B} stroke={C.slateInk} strokeOpacity={0.6 * dimSide} strokeWidth={2} />
        <line x1={sX} y1={midY - 44} x2={sX} y2={lerp(midY - 44, T, dimSide)} stroke={C.slateInk} strokeOpacity={0.6} strokeWidth={2} />
        <line x1={sX} y1={midY + 44} x2={sX} y2={lerp(midY + 44, B, dimSide)} stroke={C.slateInk} strokeOpacity={0.6} strokeWidth={2} />
      </svg>

      <Lbl x={midX} y={tY} op={lbl}>
        1 : 1 · True scale
      </Lbl>
      {/* side label, set at 90deg so it reads along the dimension line */}
      <div style={{ position: "absolute", left: sX, top: midY, rotate: "90deg", opacity: lbl }}>
        <Lbl x={0} y={0} op={1} color={C.navy} weight={700}>
          4 : 5
        </Lbl>
      </div>
    </AbsoluteFill>
  );
};
