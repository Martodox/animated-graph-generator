import fs from "fs";
import { GraphOptions } from "./types/graph.js";
import config from "./config.js";
import { CustomRenderer } from "./customRenderer.js";

const calculateTimeDiff = () => {
  const start = Date.now();
  return () => {
    const diff = Date.now() - start;
    return diff;
  };
};

export const renderGraph = async (
  options: GraphOptions,
  cb: (msg: any) => void
) => {
  const renderer = new CustomRenderer({
    width: options.baseWidth,
    height: options.basedHeight,
    padding: options.padding * options.sizeMultiplier,
    datasetLabelsize: options.datasetLabelsize * options.sizeMultiplier,
    axisLabelSize: options.axisLabelSize * options.sizeMultiplier,
    timeKnobSize: options.timeKnobSize * options.sizeMultiplier,
    lineWidth: options.lineWidth * options.sizeMultiplier,
  });

  const isDevMode = JSON.parse(options.devMode as any);
  const endFrame = isDevMode ? 0 : options.endFrame;
  const timerStartSecond = options.section.timerStartIndex;
  const timerStopSecond = options.section.timerStartIndex + options.section.timerSeconds;

  for (
    let currentFrame = options.startFrame;
    currentFrame <= endFrame;
    currentFrame++
  ) {
    const bufferSyncTime = calculateTimeDiff();
    const buffer = renderer.renderFrame(
      options.section.use,
      currentFrame,
      options.stepResolution,
      timerStartSecond,
      timerStopSecond
    );
    const renderTime = bufferSyncTime();

    cb(
      JSON.stringify({
        currentFrame,
        renderTime,
      })
    );

    fs.writeFile(
      `${config.destinationDirectory}/${options.fileName}/img-${(
        currentFrame + 1
      )
        .toString()
        .padStart(5, "0")}.png`,
      buffer,
      () => {}
    );
  }
};
