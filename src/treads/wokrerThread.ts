import { renderGraph } from "../graph.js";
import { DataSource, NormalisedDataSection, SeedData } from "../types/config.js";
import config from "../config.js";

export const workerThread = () => {
  const seedData = (process.env as unknown) as SeedData;
  const { basedHeight, baseWidth, sizeMultiplier } = config;
  const chunk = +seedData.chunk;
  const chunks = +seedData.chunks;
  const section = JSON.parse(seedData.section) as NormalisedDataSection;

  const send = (msg: any) => {
    process.send ? process.send({
      workerID: chunk,
      msg,
    }) : null;
  };

  let dataPointsLength = 0;

  for (const key in section.use) {
    dataPointsLength = section.use[key as DataSource]!.dataPoints.length;
  }

  let perChunk = Math.ceil(dataPointsLength / chunks);
  let startFrame = chunk * perChunk + chunk;
  let endFrame = perChunk * (chunk + 1) + chunk;

  if (chunk + 1 === chunks) {
    perChunk = dataPointsLength - perChunk * chunks + perChunk;
    endFrame = dataPointsLength - 1;
  }

  if (endFrame - perChunk > dataPointsLength - 1) {
    return;
  }

  if (endFrame > dataPointsLength - 1) {
    endFrame = dataPointsLength - 1;
  }

  renderGraph(
    {
      fileName: seedData.fileName,
      devMode: seedData.devMode,
      startFrame,
      endFrame,
      section,
      basedHeight,
      baseWidth,
      sizeMultiplier,
      stepResolution: +seedData.stepResolution,
      datasetLabelsize: 60,
      axisLabelSize: 50,
      timeKnobSize: 20,
      padding: 40,
      lineWidth: 10,
    },
    send
  );
};
