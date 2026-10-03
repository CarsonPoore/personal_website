import { C } from "../../lib";

// Group B: transparent overlays that sit directly on light page surfaces (bone / pale grey).
export const INK = C.navy;
export const SLATE = C.slateInk;
export const MUTED = C.muted;

/** navy with alpha, for hairlines on light surfaces */
export const ink = (a: number) => `rgba(11,27,51,${a})`;

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
