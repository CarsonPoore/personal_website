import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, easeInOut, fontFamily, lerp, ramp } from "../../lib";

// Contact / hero: the discovery call, drawn. A line leaves "You", passes where things
// stand, routes around what's getting in the way, checks for fit, and arrives at a
// plan that sketches itself inside a Blueprint frame. Transparent on the navy hero;
// the plan's hairlines run off the right edge of the canvas (and the viewport).
// Frame 0 = built.

export const PATH_W = 1040;
export const PATH_H = 460;
const SHIFT = -250; // content was laid out on a 720-tall canvas; crop the empty top
const Y = 470;
const PTS: [number, number][] = [
  [70, Y],
  [330, Y],
  [330, 372],
  [490, 372],
  [490, Y],
  [660, Y],
];
const segLen = PTS.slice(1).map(([x, y], i) => Math.hypot(x - PTS[i][0], y - PTS[i][1]));
const TOTAL = segLen.reduce((a, b) => a + b, 0);
const D = "M " + PTS.map(([x, y]) => `${x} ${y}`).join(" L ");
const at = (len: number) => len / TOTAL; // fraction of the path at a given length

// Plan frame
const FX0 = 680;
const FX1 = 1000;
const FY0 = 330;
const FY1 = 610;
const BS = 40;

const Lbl: React.FC<{ x: number; y: number; op: number; children: React.ReactNode; color?: string }> = ({
  x,
  y,
  op,
  children,
  color = C.slate,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translateX(-50%)",
      fontFamily,
      fontSize: 19,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color,
      opacity: op,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Corner: React.FC<{ x: number; y: number; rot: 0 | 90 | 180 | 270; op: number }> = ({ x, y, rot, op }) => (
  <svg width={BS} height={BS} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, opacity: op }}>
    <rect x="0" y="0" width="14" height="100" fill={C.off} fillOpacity={0.7} />
    <rect x="0" y="0" width="100" height="14" fill={C.off} fillOpacity={0.7} />
  </svg>
);

export const ContactPath: React.FC = () => {
  const f = useCurrentFrame();
  // Everything is built at frame 0; it fades out 118-146 and rebuilds 150-286.
  const out = 1 - ramp(f, 118, 146, easeInOut);
  const building = f >= 146;
  const b = (a: number, z: number) => (building ? ramp(f, a, z) : out);

  const you = b(152, 166);
  const path = b(162, 238);
  // a stop's label appears the frame the drawing line reaches it
  const reach = (len: number) => {
    for (let k = 162; k <= 238; k++) if (ramp(k, 162, 238) >= at(len)) return k;
    return 238;
  };
  const stop = (len: number) => (building ? ramp(f, reach(len), reach(len) + 12) : out);
  const s1 = stop(130);
  const s2 = stop(260 + 92 + 80);
  const s3 = stop(TOTAL - 60);
  const frame = b(232, 254);
  const bar = (i: number) => b(246 + i * 8, 272 + i * 8);
  const hair = b(240, 286);

  const bars = [210, 150, 250, 120];

  return (
    <AbsoluteFill style={{ fontFamily }}>
     <div style={{ position: "absolute", left: 0, top: SHIFT, width: PATH_W, height: 720 }}>
      <svg width={PATH_W} height={720} style={{ position: "absolute", inset: 0 }}>
        {/* plan hairlines run off to the right edge */}
        {[FY0 + 0.5, FY1 - 0.5].map((y, i) => (
          <line key={i} x1={FX1} y1={y} x2={lerp(FX1, PATH_W, hair)} y2={y} stroke={C.off} strokeOpacity={0.14} strokeWidth={2} />
        ))}
        {/* obstacle: what's getting in the way */}
        <rect x={380} y={430} width={60} height={80} fill="none" stroke={C.slate} strokeOpacity={0.55 * s2} strokeWidth={2} strokeDasharray="6 6" />
        {/* the conversation */}
        <path
          d={D}
          fill="none"
          stroke={C.off}
          strokeOpacity={0.75}
          strokeWidth={3}
          strokeLinejoin="miter"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - path}
        />
        <circle cx={70} cy={Y} r={11} fill={C.off} opacity={you} />
        {/* stop ticks */}
        <line x1={200} y1={Y - 12} x2={200} y2={Y + 12} stroke={C.off} strokeOpacity={0.6 * s1} strokeWidth={2} />
        <line x1={410} y1={372 - 12} x2={410} y2={372 + 12} stroke={C.off} strokeOpacity={0.6 * s2} strokeWidth={2} />
        {/* fit: the single gold accent */}
        <rect x={600 - 10} y={Y - 10} width={20} height={20} transform={`rotate(45 600 ${Y})`} fill={C.gold} opacity={s3} />
        {/* the plan */}
        {bars.map((w, i) => {
          const p = bar(i);
          return <rect key={i} x={FX0 + 40} y={FY0 + 48 + i * 52} width={w * p} height={12} fill={C.off} fillOpacity={0.8} />;
        })}
      </svg>
      <Corner x={FX0} y={FY0} rot={0} op={frame} />
      <Corner x={FX1 - BS} y={FY0} rot={90} op={frame} />
      <Corner x={FX1 - BS} y={FY1 - BS} rot={180} op={frame} />
      <Corner x={FX0} y={FY1 - BS} rot={270} op={frame} />

      <Lbl x={70} y={Y - 52} op={you} color={C.off}>
        You
      </Lbl>
      <Lbl x={200} y={Y + 26} op={s1}>
        01 · Where it stands
      </Lbl>
      <Lbl x={410} y={372 - 52} op={s2}>
        02 · In the way
      </Lbl>
      <Lbl x={600} y={Y + 26} op={s3}>
        03 · Fit
      </Lbl>
      <Lbl x={(FX0 + FX1) / 2} y={FY1 + 22} op={frame}>
        The plan
      </Lbl>
     </div>
    </AbsoluteFill>
  );
};
