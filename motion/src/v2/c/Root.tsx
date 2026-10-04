import React from "react";
import { Composition } from "remotion";
import { FPS } from "../../lib";
import { CalRuler, RULER_H, RULER_W } from "./CalRuler";
import { ContactPath, PATH_H, PATH_W } from "./ContactPath";
import { GHOST_H, GHOST_W, GhostMark } from "./GhostMark";
import { HAND_H, HAND_W, Handoff } from "./Handoff";
import { MissionRoads } from "./MissionRoads";
import { ValuesGlyphs } from "./ValuesGlyphs";

// Group C compositions (about / work / contact). All transparent:
//   ENTRY=src/v2/c/index.ts ALPHA=1 ./render.sh <id>
// Every composition is a seamless loop (frame 0 renders identically to the last frame).
export const RootV2C: React.FC = () => {
  return (
    <>
      <Composition id="c-values-glyphs" component={ValuesGlyphs} durationInFrames={10 * FPS} fps={FPS} width={480} height={120} />
      <Composition id="c-mission-roads" component={MissionRoads} durationInFrames={12 * FPS} fps={FPS} width={1920} height={900} />
      <Composition id="c-work-ghost-mark" component={GhostMark} durationInFrames={12 * FPS} fps={FPS} width={GHOST_W} height={GHOST_H} />
      <Composition id="c-contact-path" component={ContactPath} durationInFrames={10 * FPS} fps={FPS} width={PATH_W} height={PATH_H} />
      <Composition id="c-cal-ruler" component={CalRuler} durationInFrames={10 * FPS} fps={FPS} width={RULER_W} height={RULER_H} />
      <Composition id="c-handoff" component={Handoff} durationInFrames={10 * FPS} fps={FPS} width={HAND_W} height={HAND_H} />
    </>
  );
};
