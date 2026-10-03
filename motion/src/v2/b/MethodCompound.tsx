import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Diamond, easeInOut, easeOut, ramp } from "../../lib";
import { ink } from "./shared";

// method.html, step 05 — "Delight is the only marketing that compounds for free."
// One delighted customer (gold) at the centre; each ring outward reaches twice as many
// people as the one before. Bleeds off the right edge of the viewport.
// Frame 0 = only the centre, which is also where it ends.

const RINGS = [96, 182, 268, 354];

const onDiamond = (R: number, t: number): [number, number] => {
  t = ((t % 1) + 1) % 1;
  const s = Math.floor(t * 4);
  const u = t * 4 - s;
  const V: [number, number][] = [
    [0, -R],
    [R, 0],
    [0, R],
    [-R, 0],
  ];
  const a = V[s];
  const b = V[(s + 1) % 4];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
};

export const MethodCompound: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const fade = 1 - ramp(f, 300, 336, easeInOut);
  // first two branches point straight up and down, so they stay on screen
  const phase = 0.75;

  const nodes: React.ReactNode[] = [];
  const links: React.ReactNode[] = [];
  const rings: React.ReactNode[] = [];

  RINGS.forEach((R, k) => {
    const n = 2 ** (k + 1);
    const start = 30 + k * 48;
    const ringP = ramp(f, start - 6, start + 30, easeOut) * fade;
    rings.push(
      <div
        key={"r" + k}
        style={{
          position: "absolute",
          left: cx - R / Math.SQRT2,
          top: cy - R / Math.SQRT2,
          width: R * Math.SQRT2,
          height: R * Math.SQRT2,
          boxSizing: "border-box",
          border: `2px solid ${ink(0.12)}`,
          rotate: "45deg",
          scale: String(((RINGS[k - 1] ?? 0) + (R - (RINGS[k - 1] ?? 0)) * ringP) / R),
          opacity: ringP,
        }}
      />,
    );
    for (let i = 0; i < n; i++) {
      const t = phase + (i + 0.5) / n;
      const [x, y] = onDiamond(R, t);
      const p = ramp(f, start + i * (40 / n), start + i * (40 / n) + 18, easeOut) * fade;
      // parent on the previous ring (or the centre)
      let px = 0;
      let py = 0;
      if (k > 0) {
        const pn = n / 2;
        const pi = Math.floor(i / 2);
        [px, py] = onDiamond(RINGS[k - 1], phase + (pi + 0.5) / pn);
      }
      const dx = x - px;
      const dy = y - py;
      const len = Math.sqrt(dx * dx + dy * dy);
      links.push(
        <div
          key={`l${k}-${i}`}
          style={{
            position: "absolute",
            left: cx + px,
            top: cy + py - 1,
            width: len * p,
            height: 2,
            background: ink(0.22),
            transformOrigin: "0 50%",
            rotate: `${Math.atan2(dy, dx)}rad`,
            opacity: p > 0 ? 1 : 0,
          }}
        />,
      );
      nodes.push(
        <div
          key={`n${k}-${i}`}
          style={{
            position: "absolute",
            left: cx + x - 7,
            top: cy + y - 7,
            width: 14,
            height: 14,
            background: C.navy,
            opacity: ramp(f, start + i * (40 / n) + 12, start + i * (40 / n) + 22) * fade * (0.5 - k * 0.09),
          }}
        />,
      );
    }
  });

  return (
    <AbsoluteFill>
      {rings}
      {links}
      {nodes}
      <Diamond cx={cx} cy={cy} size={44} color={C.gold} />
    </AbsoluteFill>
  );
};
