import { interpolate } from "remotion";
import { easeInOut } from "../../lib";

export type Pt = { x: number; y: number };

/** Polyline helper: total length + point at distance d. */
export const polyline = (pts: Pt[]) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const cum = seg.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s], [0]);
  const total = cum[cum.length - 1];
  const at = (d: number): Pt => {
    const dd = Math.max(0, Math.min(total, d));
    for (let i = 0; i < seg.length; i++) {
      if (dd <= cum[i + 1]) {
        const t = seg[i] === 0 ? 0 : (dd - cum[i]) / seg[i];
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t };
      }
    }
    return pts[pts.length - 1];
  };
  /** Points of the polyline from 0 up to distance d (for partial drawing). */
  const upTo = (d: number): Pt[] => [...pts.filter((_, i) => cum[i] < d), at(d)];
  return { total, cum, at, upTo };
};

export const ptsAttr = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

/** Keyframed scalar: eased between keys, clamped. */
export const keyed = (f: number, frames: number[], values: number[], easing = easeInOut) =>
  interpolate(f, frames, values, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
