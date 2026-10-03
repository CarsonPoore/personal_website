import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Bracket, C, Diamond, Grid, Label, easeInOut, easeOut, fontFamily, lerp, ramp } from "./lib";

// Home / "The problem": a pile of disconnected tactics snaps into one connected system,
// holds, then lets go again. Frame 0 = scattered (the problem), last frame = scattered.

const BG = C.grey; // .section--stone (#eaedf1)

type Chip = { label: string; note: string; sx: number; sy: number; col: number; row: number; ph: number };
const CHIPS: Chip[] = [
  { label: "Boosted post", note: "Wk 1", sx: 236, sy: 182, col: 0, row: 0, ph: 0.0 },
  { label: "New logo", note: "Wk 3", sx: 600, sy: 124, col: 1, row: 0, ph: 1.7 },
  { label: "One-month ad", note: "Stopped", sx: 908, sy: 236, col: 2, row: 0, ph: 3.1 },
  { label: "Flyer", note: "Mo. 2", sx: 176, sy: 470, col: 0, row: 1, ph: 4.4 },
  { label: "Email blast", note: "Once", sx: 566, sy: 404, col: 1, row: 1, ph: 2.3 },
  { label: "Website refresh", note: "Paused", sx: 884, sy: 560, col: 2, row: 1, ph: 5.2 },
];

const CHIP_H = 66;
const SYS_W = 254;
const COLS = [272, 562, 852];
const ROWS = [276, 432];

export const TacticsToSystem: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const last = durationInFrames - 1;
  const loopT = (f / last) * Math.PI * 2; // drift returns exactly to start on last frame

  // Release first so the system state (sys) is 0 at both ends of the loop.
  const chipIn = (i: number) => ramp(f, 60 + i * 4, 96 + i * 4, easeOut);
  const chipOut = (i: number) => ramp(f, 222 + i * 3, 254 + i * 3, easeInOut);
  const sysOf = (i: number) => chipIn(i) - chipOut(i);

  // connectors: 4 horizontal + 3 vertical
  const links: { x1: number; y1: number; x2: number; y2: number }[] = [];
  ROWS.forEach((y) => {
    links.push({ x1: COLS[0] + SYS_W / 2, y1: y, x2: COLS[1] - SYS_W / 2, y2: y });
    links.push({ x1: COLS[1] + SYS_W / 2, y1: y, x2: COLS[2] - SYS_W / 2, y2: y });
  });
  COLS.forEach((x) => links.push({ x1: x, y1: ROWS[0] + CHIP_H / 2, x2: x, y2: ROWS[1] - CHIP_H / 2 }));
  const linkP = (i: number) => ramp(f, 100 + i * 6, 118 + i * 6, easeOut) - ramp(f, 214, 232, easeInOut);
  const connected = links.reduce((n, _, i) => n + (linkP(i) > 0.98 ? 1 : 0), 0);

  const frameP = ramp(f, 140, 166, easeOut) - ramp(f, 212, 228, easeInOut);
  const sysLabel = ramp(f, 96, 120) - ramp(f, 212, 226, easeInOut);

  // system frame bounds
  const fx0 = COLS[0] - SYS_W / 2 - 34;
  const fx1 = COLS[2] + SYS_W / 2 + 34;
  const fy0 = ROWS[0] - CHIP_H / 2 - 34;
  const fy1 = ROWS[1] + CHIP_H / 2 + 34;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily }}>
      <Grid w={width} h={height} step={70} color={C.navy} opacity={0.07} />

      {/* annotation: state label crossfades */}
      <Label x={44} y={38} color={C.slateInk} opacity={1 - sysLabel}>
        Ref. 01 — Tactics, unconnected
      </Label>
      <Label x={44} y={38} color={C.slateInk} opacity={sysLabel}>
        Ref. 02 — One system
      </Label>
      <Label x={44} y={height - 58} color={C.slateInk}>
        Links&nbsp;&nbsp;{String(connected).padStart(2, "0")} / {String(links.length).padStart(2, "0")}
      </Label>
      <Label x={44} y={height - 58} align="right" color={C.slateInk} opacity={0.8}>
        Fig. A
      </Label>

      {/* connectors */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {links.map((l, i) => {
          const p = Math.max(0, linkP(i));
          return (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={lerp(l.x1, l.x2, p)}
              y2={lerp(l.y1, l.y2, p)}
              stroke={C.blue}
              strokeWidth={4}
              opacity={p > 0 ? 1 : 0}
            />
          );
        })}
        {/* system frame: hairline */}
        <rect
          x={fx0}
          y={fy0}
          width={fx1 - fx0}
          height={fy1 - fy0}
          fill="none"
          stroke={C.navy}
          strokeOpacity={0.22}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - Math.max(0, frameP)}
        />
      </svg>

      {/* bracket corners frame the finished system */}
      {(
        [
          [fx0 - 6, fy0 - 6, 0],
          [fx1 - 34, fy0 - 6, 90],
          [fx1 - 34, fy1 - 34, 180],
          [fx0 - 6, fy1 - 34, 270],
        ] as const
      ).map(([x, y, r], i) => (
        <Bracket key={i} x={x} y={y} size={40} rot={r} color={C.navy} opacity={Math.max(0, frameP)} />
      ))}
      <Diamond cx={fx0 + 8} cy={fy0 - 30} size={22} scale={Math.max(0, frameP)} />
      <Label x={fx0 + 28} y={fy0 - 41} color={C.navy} opacity={Math.max(0, frameP)} style={{ fontWeight: 700 }}>
        Built to work together
      </Label>

      {/* chips */}
      {CHIPS.map((c, i) => {
        const s = Math.max(0, Math.min(1, sysOf(i)));
        const drift = 1 - s;
        const dx = Math.sin(loopT + c.ph) * 7 * drift;
        const dy = Math.cos(loopT * 2 + c.ph) * 5 * drift;
        const cx = lerp(c.sx, COLS[c.col], s) + dx;
        const cy = lerp(c.sy, ROWS[c.row], s) + dy;
        const fill = interpolateColors(s, [0, 1], [C.off, C.navy]);
        const ink = interpolateColors(s, [0, 0.5, 1], [C.slateInk, C.slateInk, C.off]);
        const borderA = interpolate(s, [0, 1], [0.16, 0]);
        return (
          <React.Fragment key={c.label}>
            <div
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                translate: "-50% -50%",
                height: CHIP_H,
                minWidth: lerp(0, SYS_W, s),
                padding: "0 26px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: fill,
                border: `2px solid rgba(11,27,51,${borderA})`,
                borderRadius: 12,
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: ink,
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </div>
            <Label
              x={cx}
              y={cy + CHIP_H / 2 + 12}
              size={14}
              color={C.muted}
              opacity={1 - Math.min(1, s * 2.5)}
              style={{ translate: "-50% 0" }}
            >
              {c.note}
            </Label>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
