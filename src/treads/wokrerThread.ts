import { renderGraph } from "../graph.js";
import { SeedData } from "../types/config.js";
import config from "../config.js";

export const workerThread = () => {
  const seedData = (process.env as unknown) as SeedData;
  const { basedHeight, baseWidth, sizeMultiplier } = config;
  const chunk = +seedData.chunk;
  const chunks = +seedData.chunks;
  const translated = JSON.parse(seedData.translated);

  const send = (msg: any) => {
    process.send ? process.send({
      workerID: chunk,
      msg,
    }) : null;
  };

  let perChunk = Math.ceil(translated.length / chunks);
  let startFrame = chunk * perChunk + chunk;
  let endFrame = perChunk * (chunk + 1) + chunk;

  if (chunk + 1 === chunks) {
    perChunk = translated.length - perChunk * chunks + perChunk;
    endFrame = translated.length - 1;
  }

  if (endFrame - perChunk > translated.length - 1) {
    return;
  }

  if (endFrame > translated.length - 1) {
    endFrame = translated.length - 1;
  }

  renderGraph(
    {
      fileName: seedData.fileName,
      devMode: seedData.devMode,
      startFrame,
      endFrame,
      sessions: translated,
      basedHeight,
      baseWidth,
      sizeMultiplier,
      stepResolution: +seedData.stepResolution,
      timerStartSecond: +seedData.timerStartSecond,
      timerStoptSecond: +seedData.timerStoptSecond,
      datasetLabelsize: 70,
      axisLabelSize: 50,
      timeKnobSize: 20,
      padding: 40,
      lineWidth: 10,
    },
    send
  );
};
