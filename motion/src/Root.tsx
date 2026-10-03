import React from "react";
import { Composition } from "remotion";
import { CentralIndiana } from "./CentralIndiana";
import { MethodStack } from "./MethodStack";
import { OneRoof } from "./OneRoof";
import { ProofLine } from "./ProofLine";
import { TacticsToSystem } from "./TacticsToSystem";
import { TierStack } from "./TierStack";
import { FPS } from "./lib";

// Each composition is a seamless loop: frame 0 and the last frame render identically.
// Output names (media/motion/<id>.*) are the kebab-case ids below.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="tactics-to-system" component={TacticsToSystem} durationInFrames={9 * FPS} fps={FPS} width={1120} height={700} />
      <Composition id="one-roof" component={OneRoof} durationInFrames={8 * FPS} fps={FPS} width={960} height={800} />
      <Composition id="method-stack" component={MethodStack} durationInFrames={9 * FPS} fps={FPS} width={960} height={800} />
      <Composition id="tier-stack" component={TierStack} durationInFrames={8 * FPS} fps={FPS} width={960} height={800} />
      <Composition id="central-indiana" component={CentralIndiana} durationInFrames={9 * FPS} fps={FPS} width={960} height={800} />
      <Composition id="proof-line" component={ProofLine} durationInFrames={8 * FPS} fps={FPS} width={960} height={800} />
    </>
  );
};
