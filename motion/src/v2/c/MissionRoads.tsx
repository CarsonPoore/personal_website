import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, cyc, fontFamily } from "../../lib";

// About / Mission: full-bleed, very low-contrast background for the stone Mission band.
// Indianapolis sits right of centre (behind the intro paragraph); the interstates draw
// outward from it toward the surrounding central Indiana towns, which tick in as
// small markers when a road reaches them. Transparent. Frame 0 = built.

const W = 1920;
const H = 900;
const CX = 1300;
const CY = 470;
const RING = 92; // I-465

// Approximate bearings (deg, 0 = east, counter-clockwise positive = north) and the
// towns each road passes. Distances in px from the city centre.
type Road = { name: string; deg: number; len: number; towns: { name: string; d: number }[] };
const ROADS: Road[] = [
  { name: "US-31 N", deg: 92, len: 520, towns: [{ name: "Carmel", d: 190 }, { name: "Westfield", d: 280 }] },
  { name: "I-69 NE", deg: 50, len: 760, towns: [{ name: "Fishers", d: 210 }, { name: "Noblesville", d: 330 }] },
  { name: "I-70 E", deg: 2, len: 900, towns: [{ name: "Greenfield", d: 300 }] },
  { name: "I-74 SE", deg: -38, len: 760, towns: [{ name: "Shelbyville", d: 360 }] },
  { name: "I-65 S", deg: -82, len: 520, towns: [{ name: "Greenwood", d: 180 }, { name: "Franklin", d: 300 }] },
  { name: "I-70 W", deg: 186, len: 1400, towns: [{ name: "Plainfield", d: 220 }] },
  { name: "I-74 W", deg: 160, len: 1400, towns: [{ name: "Brownsburg", d: 230 }] },
  { name: "I-65 NW", deg: 128, len: 900, towns: [{ name: "Zionsville", d: 220 }, { name: "Lebanon", d: 360 }] },
];

const INK = C.navy;
const LINE_OP = 0.13;

const pt = (deg: number, d: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + Math.cos(a) * d, y: CY - Math.sin(a) * d };
};

export const MissionRoads: React.FC = () => {
  const f = useCurrentFrame();
  // 12s loop: hold built, fade the drawing away, then redraw outward from the city.
  const ring = cyc(f, [200, 236], [244, 276]);
  const roadDraw = (i: number) => cyc(f, [200, 236], [258 + i * 5, 340 + i * 2]);
  const townOn = (road: number, d: number, len: number) => {
    // a town appears when its road's draw passes it
    const p = roadDraw(road);
    return Math.min(1, Math.max(0, (p * len - d) / 40));
  };
  const labelFade = cyc(f, [196, 222], [320, 352]);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* faint survey grid, every 160px */}
        {Array.from({ length: Math.floor(W / 160) }, (_, i) => (
          <line key={"v" + i} x1={(i + 1) * 160} y1={0} x2={(i + 1) * 160} y2={H} stroke={INK} strokeOpacity={0.045} strokeWidth={2} />
        ))}
        {Array.from({ length: Math.floor(H / 160) }, (_, i) => (
          <line key={"h" + i} x1={0} y1={(i + 1) * 160} x2={W} y2={(i + 1) * 160} stroke={INK} strokeOpacity={0.045} strokeWidth={2} />
        ))}

        {ROADS.map((r, i) => {
          const s = pt(r.deg, RING);
          const e = pt(r.deg, r.len);
          return (
            <line
              key={r.name}
              x1={s.x}
              y1={s.y}
              x2={e.x}
              y2={e.y}
              stroke={INK}
              strokeOpacity={LINE_OP}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - roadDraw(i)}
            />
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r={RING}
          fill="none"
          stroke={INK}
          strokeOpacity={LINE_OP}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ring}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        {/* city fix */}
        <rect x={CX - 9} y={CY - 9} width={18} height={18} transform={`rotate(45 ${CX} ${CY})`} fill={INK} fillOpacity={0.2 * ring} />

        {ROADS.map((r, i) =>
          r.towns.map((t) => {
            const p = pt(r.deg, t.d);
            const on = townOn(i, t.d - RING, r.len - RING);
            return (
              <g key={t.name} opacity={on}>
                <rect x={p.x - 6} y={p.y - 6} width={12} height={12} fill={INK} fillOpacity={0.18} />
              </g>
            );
          }),
        )}
      </svg>
      {ROADS.map((r, i) =>
        r.towns.map((t) => {
          const p = pt(r.deg, t.d);
          const on = townOn(i, t.d - RING, r.len - RING);
          return (
            <div
              key={t.name}
              style={{
                position: "absolute",
                // roads heading west/north-west label to the left of the town, others to the right
                ...(r.deg > 100 ? { right: W - p.x + 14 } : { left: p.x + 14 }),
                top: p.y - 26,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: INK,
                opacity: 0.22 * on * labelFade,
                whiteSpace: "nowrap",
              }}
            >
              {t.name}
            </div>
          );
        }),
      )}
      <div
        style={{
          position: "absolute",
          left: CX + RING + 18,
          top: CY + 14,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: INK,
          opacity: 0.26 * ring,
          whiteSpace: "nowrap",
        }}
      >
        Indianapolis · 39.7684° N
      </div>
    </AbsoluteFill>
  );
};
