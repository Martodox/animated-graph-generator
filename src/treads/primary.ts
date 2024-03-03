import cluster from "cluster";
import { prepareDataset } from "../helpers/dataset.js";
import { getSecondsFromHourString } from "../helpers/time.js";
import { jsonArray } from "../plainData.js";
import fs from "fs";
import os from "os";
import cliProgress from "cli-progress";
import { SeedData } from "../types/config.js";
import config from "../config.js";

const numberOfCPUs = os.cpus().length;

export const primaryThread = async () => {
  const {
    raw,
    translated,
    devMode,
    stepResolution,
    timerStart,
    offsetInSeconds,
    timerEnd,
    startTime,
  } = await prepareDataset();

  let fileName;
  if (devMode) {
    fileName = "chart";
  } else {
    fileName = `chart - ${new Date().toISOString()}`;
  }

  const timerStartFromMidinght = getSecondsFromHourString(
    timerStart,
    offsetInSeconds
  );
  const timerStopFromMidinght = getSecondsFromHourString(
    timerEnd,
    offsetInSeconds
  );
  const videoRecordingStart = getSecondsFromHourString(
    startTime,
    offsetInSeconds
  );

  const timerStartSecond =
    (timerStartFromMidinght - videoRecordingStart) / 1000;
  const timerRunInSeconds =
    (timerStopFromMidinght - timerStartFromMidinght) / 1000;
  const timerStoptSecond = timerStartSecond + timerRunInSeconds;

  jsonArray(raw, fileName);

  if (config.textOnly) {
    console.log(
      "Only data.txt rendered. Turn off textOnly to render the full chart!"
    );
    return;
  }

  try {
    fs.mkdirSync(`./out/${fileName}`);
  } catch {}

  let res: number = 0;

  const bar1 = new cliProgress.SingleBar(
    {
      etaBuffer: 1000,
      etaAsynchronousUpdate: true,
    },
    cliProgress.Presets.shades_classic
  );
  bar1.start(translated.length, 0);

  for (let i = 0; i < numberOfCPUs; i++) {
    let worker = cluster.fork({
      chunk: i,
      chunks: numberOfCPUs,
      fileName,
      translated: JSON.stringify(translated),
      timerStartSecond,
      timerStoptSecond,
      stepResolution,
      devMode,
    } as SeedData);

    worker.on("message", () => {
      bar1.increment();
      res++;
      if (res == translated.length) {
        bar1.stop();
        process.exit();
      }
    });
  }
};
