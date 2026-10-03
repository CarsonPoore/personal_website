import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Diamond, Grid, Label, fontFamily, ramp, easeInOut, easeOut } from "../../lib";
import { polyline, ptsAttr, keyed } from "./util";
import { MARK_D, MARK_H, MARK_VIEWBOX, MARK_W } from "./mark";

// 404 (full-bleed navy background). "This page wandered off."
// A route plots across the blueprint grid, runs into a dead end, backs out, then finds
// its way to an oversized ghost CPC mark (upright, bleeding off the right edge) that
// assembles as the route arrives: home. Complete at frame 0 and the last frame.

const W = 1920;
const H = 1080;

const A = polyline([
  { x: -10, y: 880 },
  { x: 320, y: 880 },
  { x: 320, y: 240 },
  { x: 800, y: 240 },
  { x: 960, y: 240 },
]);
const A_KEEP = A.cum[3]; // up to (800,240); the last leg is the dead end
const B = polyline([
  { x: 800, y: 240 },
  { x: 800, y: 128 },
  { x: 1360, y: 128 },
  { x: 1360, y: 412 },
  { x: 1400, y: 412 },
]);

const MH = 640;
const MW = (MH * MARK_W) / MARK_H;
const MX = 1400;
const MY = 220;

export const NotFoundPath: React.FC = () => {
  const f = useCurrentFrame();
  const clear = 1 - ramp(f, 20, 58, easeInOut);
  const fresh = f >= 58;

  // route timeline
  const aDraw = fresh ? keyed(f, [70, 150], [0, A.total]) : A.total;
  const retract = fresh ? keyed(f, [170, 200], [0, A.total - A_KEEP]) : A.total - A_KEEP;
  const aLen = Math.min(aDraw, A.total - retract);
  const deadCap = fresh ? ramp(f, 148, 158, easeOut) * (1 - ramp(f, 172, 186)) : 0;
  const deadLabel = fresh ? ramp(f, 150, 162) * (1 - ramp(f, 196, 214, easeInOut)) : 0;
  const bLen = fresh ? keyed(f, [204, 292], [0, B.total]) : B.total;

  const head = !fresh ? B.at(B.total) : f < 204 ? A.at(aLen) : B.at(bLen);
  const markLine = fresh ? ramp(f, 230, 306, easeInOut) : 1;
  const markFill = fresh ? ramp(f, 292, 326, easeOut) : 1;
  const homeLabel = fresh ? ramp(f, 296, 316) : 1;
  const o = fresh ? 1 : clear;

  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily }}>
      <Grid w={W} h={H} step={160} color={C.off} opacity={0.06} />
      <svg
        viewBox={MARK_VIEWBOX}
        width={MW}
        height={MH}
        style={{ position: "absolute", left: MX, top: MY, opacity: o, overflow: "visible" }}
      >
        <path d={MARK_D} fill={C.off} fillOpacity={0.07 * markFill} />
        <path
          d={MARK_D}
          fill="none"
          stroke={C.off}
          strokeOpacity={0.22}
          strokeWidth={0.6}
          pathLength={1}
          strokeDasharray={`${markLine} 1`}
        />
      </svg>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
        {aLen > 0.5 && <polyline points={ptsAttr(A.upTo(aLen))} fill="none" stroke={C.off} strokeOpacity={0.4} strokeWidth={3} />}
        {deadCap > 0 && (
          <line x1={960} y1={240 - 18 * deadCap} x2={960} y2={240 + 18 * deadCap} stroke={C.off} strokeOpacity={0.5} strokeWidth={3} />
        )}
        {bLen > 0.5 && (fresh ? f >= 204 : true) && (
          <polyline points={ptsAttr(B.upTo(bLen))} fill="none" stroke={C.off} strokeOpacity={0.4} strokeWidth={3} />
        )}
      </svg>
      <Label x={64} y={52} opacity={0.9}>Ref. 404</Label>
      <Label x={976} y={266} size={16} opacity={deadLabel * 0.9}>Dead end</Label>
      <Label x={1420} y={436} size={16} opacity={homeLabel * o * 0.9}>Home</Label>
      <Diamond cx={head.x} cy={head.y} size={30} opacity={o} />
    </AbsoluteFill>
  );
};
