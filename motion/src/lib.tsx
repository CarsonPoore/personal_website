import React from "react";
import { Easing, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Figtree";

// CPC brand system — flat fills only, no gradients/glows/shadows.
export const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const C = {
  navy: "#0b1b33",
  blue: "#1e4fd8",
  gold: "#e0a030",
  off: "#f8f7f4",
  grey: "#eaedf1",
  slate: "#8892b0", // annotation tone on navy
  slateInk: "#3a4560", // body/annotation tone on light
  muted: "#6b7690",
} as const;

export const FPS = 30;

// Engineered, calm easings
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.75, 0.2);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 between frames a and b */
export const ramp = (f: number, a: number, b: number, easing = easeOut) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing });

/**
 * Loop helper for "built at frame 0" loops: 1 while built, eases to 0 during
 * `out`, then back to 1 during `inn`. Frame 0 and the last frame are both 1.
 */
export const cyc = (
  f: number,
  out: [number, number],
  inn: [number, number],
) => 1 - ramp(f, out[0], out[1], easeInOut) + ramp(f, inn[0], inn[1], easeOut);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hairline blueprint grid built from individual lines (never a gradient). */
export const Grid: React.FC<{
  w: number;
  h: number;
  step: number;
  color: string;
  opacity: number;
  draw?: (i: number, axis: "v" | "h") => number; // 0..1 draw progress per line
}> = ({ w, h, step, color, opacity, draw }) => {
  const v: React.ReactNode[] = [];
  const hz: React.ReactNode[] = [];
  let i = 0;
  for (let x = step; x < w; x += step, i++) {
    const p = draw ? draw(i, "v") : 1;
    v.push(
      <div
        key={"v" + x}
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: 2,
          height: h,
          background: color,
          opacity,
          transformOrigin: "top",
          scale: `1 ${p}`,
        }}
      />,
    );
  }
  i = 0;
  for (let y = step; y < h; y += step, i++) {
    const p = draw ? draw(i, "h") : 1;
    hz.push(
      <div
        key={"h" + y}
        style={{
          position: "absolute",
          top: y,
          left: 0,
          height: 2,
          width: w,
          background: color,
          opacity,
          transformOrigin: "left",
          scale: `${p} 1`,
        }}
      />,
    );
  }
  return (
    <>
      {v}
      {hz}
    </>
  );
};

/** Small uppercase technical annotation label. */
export const Label: React.FC<{
  x: number;
  y: number;
  color?: string;
  size?: number;
  opacity?: number;
  align?: "left" | "right";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, color = C.slate, size = 17, opacity = 1, align = "left", children, style }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      ...(align === "left" ? { left: x } : { right: x }),
      fontFamily,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color,
      opacity,
      whiteSpace: "nowrap",
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    {children}
  </div>
);

/** CPC signature diamond (flat filled square at 45deg, from the brand kit). */
export const Diamond: React.FC<{
  cx: number;
  cy: number;
  size: number;
  color?: string;
  scale?: number;
  opacity?: number;
}> = ({ cx, cy, size, color = C.gold, scale = 1, opacity = 1 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    style={{
      position: "absolute",
      left: cx - size / 2,
      top: cy - size / 2,
      scale: String(scale),
      opacity,
      overflow: "visible",
    }}
  >
    <rect x="25" y="25" width="70" height="70" rx="4" transform="rotate(45 60 60)" fill={color} />
  </svg>
);

/** CPC signature bracket (L-shape). rot in 90° steps only. */
export const Bracket: React.FC<{
  x: number;
  y: number;
  size: number;
  rot: 0 | 90 | 180 | 270;
  color: string;
  opacity?: number;
}> = ({ x, y, size, rot, color, opacity = 1 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, opacity }}
  >
    <rect x="0" y="0" width="18" height="100" fill={color} />
    <rect x="0" y="0" width="100" height="18" fill={color} />
  </svg>
);

export const fmtMoney = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Navy hero panel chrome: hairline grid + two annotation labels. */
export const NavyPanel: React.FC<{
  w: number;
  h: number;
  refText: string;
  secText: string;
  gridDraw?: (i: number, axis: "v" | "h") => number;
  children: React.ReactNode;
}> = ({ w, h, refText, secText, gridDraw, children }) => (
  <div style={{ position: "absolute", inset: 0, background: C.navy, fontFamily, overflow: "hidden" }}>
    <Grid w={w} h={h} step={80} color={C.off} opacity={0.07} draw={gridDraw} />
    <Label x={40} y={34}>{refText}</Label>
    <Label x={40} y={h - 54} align="right">{secText}</Label>
    {children}
  </div>
);
