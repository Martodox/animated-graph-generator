import cluster from "cluster";
import { prepareDataset } from "../helpers/dataset.js";
import { audioBackground } from "../audioBackground.js";
import fs from "fs";
import os from "os";
import cliProgress from "cli-progress";
import {
  DataSource,
  NormalisedDataSection,
  SeedData,
} from "../types/config.js";
import config from "../config.js";
import { RenderCallback } from "../types/graph.js";
import { mean, median } from "@basementuniverse/stats";

import percentile from "percentile";
import { extractDataSets } from "../helpers/dataParsers/extractor.js";
import { scheduleMovieRender } from "../movieGenerator.js";
import { createBar, getBar } from "../barProgress.js";
const numberOfCPUs = os.cpus().length;
const renderTimes: number[] = [];

type statKeys = "mean (ms)" | "median (ms)" | "p95 (ms)" | "p90 (ms)";

const computeStats = (
  times: number[]
): { [key in statKeys]: number | number[] } => {
  return {
    "mean (ms)": Math.floor(mean(times)),
    "median (ms)": Math.floor(median(times)),
    "p95 (ms)": percentile(95, times),
    "p90 (ms)": percentile(90, times),
  };
};

const processDataSection = async (
  section: NormalisedDataSection
): Promise<any> => {
  return new Promise(async (resolve) => {
    if (config.destinationDirectory.length === 0) {
      throw Error("config.destinationDirectory can't be empty");
    }

    const devMode = config.devMode;

    const fileName = `${section.name}`;

    if ((section.use["polarCsv"] || section.use["garminFit"]) && !devMode) {
      const use = section.use["polarCsv"]
        ? section.use["polarCsv"]
        : section.use["garminFit"];
      await audioBackground(
        use!.dataPoints,
        fileName,
        section.appendAudioSeconds,
        section.prependAudioSeconds
      );
    }

    if (config.stepResolution > 1) {
      for (const key in section.use) {
        const data = section.use[key as DataSource]!.dataPoints;
        const translated: number[] = [];

        for (let i = 0; i < data.length - 1; i++) {
          const diff = +data[i + 1] - +data[i];
          const increment = diff / config.stepResolution;

          translated.push(+data[i]);

          for (let n = 1; n < config.stepResolution; n++) {
            translated.push(+(+data[i] + increment * n).toFixed(2));
          }
        }
        section.use[key as DataSource]!.dataPoints = translated;
      }
    }
    let dataPointsLength = 0;

    for (const key in section.use) {
      dataPointsLength = section.use[key as DataSource]!.dataPoints.length;
    }

    if (config.audioOnly) {
      console.log(
        "Only audio file rendered. Turn off audioOnly to render the full chart!"
      );
      resolve(renderTimes);
    } else {
      fs.mkdirSync(`${config.destinationDirectory}/${fileName}`, {
        recursive: true,
      });

      let res: number = 0;
      let bar1: any;

      // console.log(
      //   `Timer for ${fileName}: ${Math.floor(
      //     (section.timerSeconds + 1) / 60
      //   )}:${(section.timerSeconds + 1) % 60}`
      // );

      fs.writeFile(
        `${config.destinationDirectory}/${fileName}.json`,
        JSON.stringify(config),
        () => {}
      );

      bar1 = getBar(fileName);
      bar1.setTotal(devMode ? 1 : dataPointsLength);

      const workerThreads = devMode ? 1 : numberOfCPUs;

      for (let i = 0; i < workerThreads; i++) {
        let worker = cluster.fork({
          chunk: i,
          chunks: numberOfCPUs,
          fileName,
          section: JSON.stringify(section),
          stepResolution: config.stepResolution,
          devMode,
        } as SeedData);

        worker.on("message", async ({ msg }) => {
          const parsedMsg = JSON.parse(msg) as RenderCallback;
          renderTimes.push(parsedMsg.renderTime);
          bar1.increment();

          res++;
          if (res == dataPointsLength || devMode) {
            resolve({
              stats: computeStats(renderTimes),
              videoRenderParams: {
                inputDirectory: `${config.destinationDirectory}/${fileName}`,
                fileName: fileName,
                destinationDirectory: config.destinationDirectory,
                numberOfFrames: dataPointsLength,
              },
            });
          }
        });
      }
    }
  });
};

export const primaryThread = async () => {
  let jobsCompleted: number = 0;

  const normalisedDataSets = await extractDataSets(config.sources);

  const graphableDataSet = await prepareDataset(normalisedDataSets);

  const jobsToBeCompleted = config.devMode
    ? graphableDataSet.length
    : graphableDataSet.length * 2;
  for (const section of graphableDataSet) {
    createBar(section.name);
    if (!config.devMode) {
      createBar(`${section.name} - Movie`);
    }
  }

  for (const section of graphableDataSet) {
    const completed = await processDataSection(section);
    jobsCompleted++;
    if (!config.devMode) {
      scheduleMovieRender(completed.videoRenderParams, () => {
        jobsCompleted++;
      });
    }
  }

  setInterval(() => {
    if (jobsCompleted === jobsToBeCompleted) {
      process.exit(0);
    }
  }, 100);
};
