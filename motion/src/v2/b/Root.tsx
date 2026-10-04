import React from "react";
import { Composition } from "remotion";
import { FPS } from "../../lib";
import { EightSeats } from "./EightSeats";
import { MethodStart } from "./MethodStart";
import { RetainerCadence } from "./RetainerCadence";
import { SvcEngine } from "./SvcEngine";
import { SvcTraced } from "./SvcTraced";

// Group B compositions — all transparent overlays for light page surfaces.
// Render: ENTRY=src/v2/b/index.ts ALPHA=1 ./render.sh <id>
export const RootV2B: React.FC = () => {
  return (
    <>
      <Composition id="b-svc-engine" component={SvcEngine} durationInFrames={8 * FPS} fps={FPS} width={1200} height={240} />
      <Composition id="b-svc-traced" component={SvcTraced} durationInFrames={10 * FPS} fps={FPS} width={1920} height={280} />
      <Composition id="b-method-start" component={MethodStart} durationInFrames={9 * FPS} fps={FPS} width={320} height={440} />
      <Composition id="b-retainer-cadence" component={RetainerCadence} durationInFrames={12 * FPS} fps={FPS} width={1920} height={240} />
      <Composition id="b-eight-seats" component={EightSeats} durationInFrames={10 * FPS} fps={FPS} width={600} height={84} />
    </>
  );
};
