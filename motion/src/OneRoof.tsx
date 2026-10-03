import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Diamond, Label, NavyPanel, cyc, lerp } from "./lib";

// Services hero: "Everything your marketing needs, under one roof."
// Four disciplines stand at uneven, unrelated heights (stitched-together freelancers),
// then rise to one level and a single beam ties them together. Frame 0 = built.

const NAMES = ["Strategy", "Brand", "Systems", "Execution"];
const PW = 150;
const BASE = 600;
const BUILT_H = 300;
const REST_H = [128, 226, 92, 178];
const REST_DX = [-16, 24, -10, 30];
const X = (i: number) => 120 + i * 190;

export const OneRoof: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const beam = cyc(f, [40, 62], [150, 178]);
  const gem = cyc(f, [40, 52], [172, 192]);

  return (
    <AbsoluteFill>
      <NavyPanel w={width} h={height} refText="Ref. CPC-02 · Services" secText="04 disciplines · 01 team">
        {/* baseline */}
        <div style={{ position: "absolute", left: 80, top: BASE, width: 800, height: 2, background: C.off, opacity: 0.35 }} />

        {NAMES.map((n, i) => {
          const p = cyc(f, [52 + i * 4, 84 + i * 4], [100 + i * 7, 134 + i * 7]);
          const h = lerp(REST_H[i], BUILT_H, p);
          const x = X(i) + lerp(REST_DX[i], 0, p);
          return (
            <React.Fragment key={n}>
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: BASE - h,
                  width: PW,
                  height: h,
                  boxSizing: "border-box",
                  background: "rgba(248,247,244,0.06)",
                  border: "2px solid rgba(248,247,244,0.34)",
                  borderBottom: "none",
                  borderRadius: "8px 8px 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x + 20,
                  top: BASE - h + 18,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: C.slate,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: X(i) + lerp(REST_DX[i], 0, p),
                  top: BASE + 22,
                  width: PW,
                  textAlign: "center",
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: C.off,
                  opacity: 0.9,
                }}
              >
                {n}
              </div>
            </React.Fragment>
          );
        })}

        {/* the roof: one beam over all four */}
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 238,
            width: 760,
            height: 56,
            background: C.blue,
            borderRadius: 8,
            opacity: beam,
            translate: `0px ${lerp(-56, 0, beam)}px`,
            display: "flex",
            alignItems: "center",
            paddingLeft: 30,
            boxSizing: "border-box",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.off,
          }}
        >
          One team · one plan
        </div>
        <Diamond cx={822} cy={266 + lerp(-56, 0, beam)} size={30} scale={gem} />
        <Label x={100} y={196} align="right" opacity={beam}>
          Under one roof
        </Label>
      </NavyPanel>
    </AbsoluteFill>
  );
};
