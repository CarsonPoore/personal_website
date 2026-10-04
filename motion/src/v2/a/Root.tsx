import React from "react";
import { Composition } from "remotion";
import { FPS } from "../../lib";
import { HeroRoute } from "./HeroRoute";
import { ServicesLink } from "./ServicesLink";
import { ApproachRail } from "./ApproachRail";
import { ClosingField } from "./ClosingField";
import { TicketDial } from "./TicketDial";
import { TicketPerf } from "./TicketPerf";
import { NotFoundPath } from "./NotFoundPath";

// Group A compositions. Render: ENTRY=src/v2/a/index.ts ./render.sh <id>
// Every loop is seamless: the frame after the last equals frame 0.
export const RootV2A: React.FC = () => {
  return (
    <>
      <Composition id="a-hero-route" component={HeroRoute} durationInFrames={10 * FPS} fps={FPS} width={1920} height={160} />
      <Composition id="a-services-link" component={ServicesLink} durationInFrames={8 * FPS} fps={FPS} width={2000} height={200} />
      <Composition id="a-approach-rail" component={ApproachRail} durationInFrames={8 * FPS} fps={FPS} width={112} height={540} />
      <Composition id="a-closing-field" component={ClosingField} durationInFrames={12 * FPS} fps={FPS} width={1920} height={640} />
      <Composition id="a-ticket-dial" component={TicketDial} durationInFrames={6 * FPS} fps={FPS} width={160} height={160} />
      <Composition id="a-ticket-perf" component={TicketPerf} durationInFrames={7 * FPS} fps={FPS} width={120} height={720} />
      <Composition id="a-404-path" component={NotFoundPath} durationInFrames={12 * FPS} fps={FPS} width={1920} height={1080} />
    </>
  );
};
