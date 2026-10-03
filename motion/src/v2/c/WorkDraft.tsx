import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, cyc, easeInOut, fontFamily, lerp, ramp } from "../../lib";

// Work / "Case studies are on the way": a faint case-study layout being drafted
// behind the holding-line copy: image frame, headline rules, a results block whose
// figures are deliberately left blank. The layout is ready; the proof goes in when
// it's real. Transparent, sits inside the dashed holding box (object-fit: cover),
// with the centre kept clear for the copy. Frame 0 = drafted.

export const DRAFT_W = 1600;
export const DRAFT_H = 520;
const INK = C.navy;
const OP = 0.16;

const dash = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p });

export const WorkDraft: React.FC = () => {
  const f = useCurrentFrame();
  // 12s loop: hold drafted → fade → redraft piece by piece
  const out = (a: number, z: number) => cyc(f, [150, 180], [a, z]);
  const img = out(196, 236);
  const x1 = out(226, 252);
  const x2 = out(238, 264);
  const rule = (i: number) => out(214 + i * 10, 244 + i * 10);
  const box = out(250, 286);
  const blanks = out(272, 300);

  // drafting head (single gold accent) follows the active stroke during the redraft
  const headOn = f > 190 && f < 318 ? ramp(f, 190, 198) * (1 - ramp(f, 306, 318, easeInOut)) : 0;
  const hx = f < 236 ? lerp(70, 470, ramp(f, 196, 236, easeInOut)) : lerp(1140, 1520, ramp(f, 236, 300, easeInOut));
  const hy = f < 236 ? 70 : lerp(110, 400, ramp(f, 236, 300, easeInOut));

  // left: image placeholder; right: headline rules + blank results block
  const IL = 70;
  const IT = 70;
  const IR = 470;
  const IB = 450;
  const RL = 1140;
  const RR = 1530;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <svg width={DRAFT_W} height={DRAFT_H} style={{ position: "absolute", inset: 0 }}>
        <rect x={IL} y={IT} width={IR - IL} height={IB - IT} fill="none" stroke={INK} strokeOpacity={OP} strokeWidth={3} {...dash(img)} />
        <line x1={IL} y1={IT} x2={IR} y2={IB} stroke={INK} strokeOpacity={OP * 0.7} strokeWidth={2} {...dash(x1)} />
        <line x1={IR} y1={IT} x2={IL} y2={IB} stroke={INK} strokeOpacity={OP * 0.7} strokeWidth={2} {...dash(x2)} />

        {[RR, RR - 60, RR - 140].map((r, i) => (
          <line key={i} x1={RL} y1={100 + i * 34} x2={lerp(RL, r, rule(i))} y2={100 + i * 34} stroke={INK} strokeOpacity={OP} strokeWidth={i === 0 ? 12 : 6} />
        ))}
        <rect x={RL} y={250} width={RR - RL} height={190} fill="none" stroke={INK} strokeOpacity={OP} strokeWidth={3} {...dash(box)} />
        <line x1={(RL + RR) / 2} y1={262} x2={(RL + RR) / 2} y2={428} stroke={INK} strokeOpacity={OP * 0.7} strokeWidth={2} {...dash(box)} />

        {headOn > 0 ? (
          <rect x={hx - 8} y={hy - 8} width={16} height={16} transform={`rotate(45 ${hx} ${hy})`} fill={C.gold} opacity={headOn} />
        ) : null}
      </svg>
      {/* the results are left blank on purpose */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: RL + 30 + i * ((RR - RL) / 2),
            top: 278,
            opacity: blanks,
            color: INK,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.02em", opacity: OP * 1.4, lineHeight: 1 }}>— —</div>
          <div style={{ marginTop: 22, fontSize: 15, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.32 }}>
            {i === 0 ? "Result" : "Proof"}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: IL,
          top: IB + 18,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: INK,
          opacity: 0.32 * img,
          whiteSpace: "nowrap",
        }}
      >
        Case study · in draft
      </div>
    </AbsoluteFill>
  );
};
