import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Diamond, Label, NavyPanel, cyc, easeInOut, lerp, ramp } from "./lib";

// About hero: "Central Indiana marketers." A blueprint grid draws itself, Indiana is
// traced, and Indianapolis is fixed with a coordinate readout and the CPC mark.
// Frame 0 = built.

const IN: [number, number][] = [
  [-87.53, 41.7], [-87.4, 41.64], [-87.12, 41.63], [-86.9, 41.72], [-86.82, 41.76], [-84.81, 41.76],
  [-84.82, 39.1], [-84.9, 38.95], [-84.87, 38.78], [-85.17, 38.69], [-85.44, 38.73], [-85.6, 38.44],
  [-85.83, 38.28], [-85.95, 38.0], [-86.1, 38.01], [-86.32, 38.17], [-86.45, 38.04], [-86.52, 37.92],
  [-86.8, 37.99], [-87.05, 37.88], [-87.3, 37.92], [-87.6, 37.97], [-87.92, 37.79], [-88.03, 37.8],
  [-87.93, 38.12], [-87.97, 38.24], [-87.8, 38.4], [-87.65, 38.55], [-87.53, 38.68], [-87.53, 38.9],
  [-87.62, 39.1], [-87.55, 39.35], [-87.53, 39.48],
];
const px = (lon: number) => 130 + (lon + 88.1) * 115.2;
const py = (lat: number) => 110 + (41.76 - lat) * 150;
const PATH = "M " + IN.map(([lo, la]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join(" L ") + " Z";
const PIN = { x: px(-86.1581), y: py(39.7684) };
const R = 96;
const RX = 600;

export const CentralIndiana: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const outline = cyc(f, [46, 80], [115, 178]);
  const cross = cyc(f, [40, 58], [165, 192]);
  const pin = cyc(f, [40, 56], [186, 202]);
  const circle = cyc(f, [40, 58], [192, 226]);
  const readout = cyc(f, [40, 58], [182, 200]);
  const tick = f < 80 ? 1 : ramp(f, 186, 228, easeInOut);
  const mark = cyc(f, [40, 58], [218, 238]);
  const gridDraw = (i: number, axis: "v" | "h") =>
    cyc(f, [60, 84], [95 + i * 3 + (axis === "h" ? 6 : 0), 128 + i * 3 + (axis === "h" ? 6 : 0)]);

  const lat = lerp(39, 39.7684, tick);
  const lon = lerp(86, 86.1581, tick);

  return (
    <AbsoluteFill>
      <NavyPanel w={width} h={height} refText="Ref. CPC-06 · About" secText="Fig. 06 · Home base" gridDraw={gridDraw}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* crosshair leaders to the pin */}
          <line x1={PIN.x} y1={110} x2={PIN.x} y2={lerp(110, PIN.y, cross)} stroke={C.off} strokeOpacity={0.3} strokeWidth={2} />
          <line x1={RX - 24} y1={PIN.y} x2={lerp(RX - 24, PIN.x, cross)} y2={PIN.y} stroke={C.off} strokeOpacity={0.3} strokeWidth={2} />
          {/* state outline */}
          <path
            d={PATH}
            fill="none"
            stroke={C.off}
            strokeOpacity={0.85}
            strokeWidth={3}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - outline}
          />
          {/* central radius */}
          <circle
            cx={PIN.x}
            cy={PIN.y}
            r={R}
            fill="none"
            stroke={C.off}
            strokeOpacity={0.4}
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - circle}
            transform={`rotate(-90 ${PIN.x} ${PIN.y})`}
          />
        </svg>
        <Diamond cx={PIN.x} cy={PIN.y} size={36} scale={pin} />

        {/* readout */}
        <div style={{ position: "absolute", left: RX, top: 296, opacity: readout }}>
          <Label x={0} y={0}>Central Indiana</Label>
          <div style={{ position: "absolute", top: 36, fontSize: 46, fontWeight: 800, letterSpacing: "-0.02em", color: C.off, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {lat.toFixed(4)}° N
          </div>
          <div style={{ position: "absolute", top: 94, fontSize: 46, fontWeight: 800, letterSpacing: "-0.02em", color: C.off, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {lon.toFixed(4)}° W
          </div>
          <div style={{ position: "absolute", top: 172, width: 280, height: 2, background: C.off, opacity: 0.2 }} />
          <Label x={0} y={192}>Indianapolis, IN</Label>
        </div>
        <Img
          src={staticFile("cpc-mark-offwhite.svg")}
          style={{ position: "absolute", left: RX, top: 560, width: 76, opacity: mark }}
        />
      </NavyPanel>
    </AbsoluteFill>
  );
};
