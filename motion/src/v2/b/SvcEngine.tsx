import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../../lib";
import { MUTED, SLATE, ink } from "./shared";

// services.html, 03 / Systems — "the email flows, the follow-up, the booking and lead
// capture ... Set up once, working every day." A closed circuit: a marker laps the
// four stations at constant speed, forever. One lap per loop, so it is seamless.

const STATIONS = ["Lead capture", "Email flow", "Follow-up", "Booking"];
const X0 = 60;
const X1 = 1140;
const YT = 104; // working line
const YB = 176; // return line
const sx = (i: number) => X0 + 110 + (i * (X1 - X0 - 220)) / 3;

const W = X1 - X0;
const H = YB - YT;
const PER = 2 * W + 2 * H;

const pointAt = (d: number): [number, number] => {
  d = ((d % PER) + PER) % PER;
  if (d < W) return [X0 + d, YT];
  d -= W;
  if (d < H) return [X1, YT + d];
  d -= H;
  if (d < W) return [X1 - d, YB];
  d -= W;
  return [X0, YB - d];
};

export const SvcEngine: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = (f / durationInFrames) * PER;
  const [mx, my] = pointAt(d);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* circuit */}
      <div style={{ position: "absolute", left: X0, top: YT - 1, width: W, height: 3, background: ink(0.4) }} />
      <div style={{ position: "absolute", left: X0, top: YB - 1, width: W, height: 2, background: ink(0.16) }} />
      <div style={{ position: "absolute", left: X0 - 1, top: YT, width: 2, height: H, background: ink(0.16) }} />
      <div style={{ position: "absolute", left: X1 - 1, top: YT, width: 2, height: H, background: ink(0.16) }} />

      {STATIONS.map((name, i) => {
        const x = sx(i);
        const dist = mx - x;
        const lit = my === YT ? Math.max(0, 1 - Math.abs(dist) / 70) : 0;
        const after = my === YT && dist > 0 ? Math.max(0, 1 - dist / 260) : 0;
        const fill = Math.max(lit, after * 0.6);
        return (
          <React.Fragment key={name}>
            <div
              style={{
                position: "absolute",
                left: x - 13,
                top: YT - 13,
                width: 26,
                height: 26,
                boxSizing: "border-box",
                border: `3px solid ${C.navy}`,
                background: `rgba(11,27,51,${fill})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: x - 150,
                width: 300,
                top: 34,
                textAlign: "center",
                fontSize: 23,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: SLATE,
                opacity: 0.72 + 0.28 * lit,
              }}
            >
              {name}
            </div>
          </React.Fragment>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: X0,
          width: W,
          top: YB + 16,
          textAlign: "center",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        Set up once · working every day
      </div>

      {/* marker */}
      <div style={{ position: "absolute", left: mx - 9, top: my - 9, width: 18, height: 18, background: C.gold }} />
    </AbsoluteFill>
  );
};
