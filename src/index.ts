import csv from "csvtojson";
import { PolarMeta, PolarSession } from "./types/Polar.js";
import os from "os";
import fs from "fs";
import cluster from "cluster";
import process from "process";
import cliProgress from "cli-progress";

import { getSecondsFromHourString } from "./helpers/time.js";
import { renderGraph } from "./graph.js";
import { jsonArray } from "./plainData.js";
import { prepareDataset } from "./helpers/dataset.js";
const numberOfCPUs = os.cpus().length;



const start = Date.now();



const run = async () => {
  
  const { raw, translated, devMode, stepResolution, timerStart, offsetInSeconds, timerEnd, startTime } = await prepareDataset();

  if (cluster.isPrimary) {
    let fileName;
    if (devMode) {
      fileName = "chart";
    } else {
      fileName = `chart - ${new Date().toISOString()}`;
      fs.rmSync(`./out/${fileName}`, { recursive: true, force: true });
      fs.mkdirSync(`./out/${fileName}`);
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

    jsonArray(raw);

    let res: number = 0;

    const bar1 = new cliProgress.SingleBar(
      {},
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
      });

      worker.on("message", () => {
        bar1.update(++res);
        if (res == translated.length) {
          bar1.stop();
          console.log((Date.now() - start) / 1000);
          process.exit();
        }
      });
    }
  } else {
    const seedData = (process.env as unknown) as {
      chunk: number;
      chunks: number;
      fileName: string;
      translated: string;
      timerStartSecond: string;
      timerStoptSecond: string;
    };

    const chunk = +seedData.chunk;
    const chunks = +seedData.chunks;
    const translated = JSON.parse(seedData.translated);

    let perChunk = Math.ceil(translated.length / chunks);
    let startFrame = chunk * perChunk + chunk;
    let endFrame = perChunk * (chunk + 1) + chunk;

    if (chunk + 1 === chunks) {
      perChunk = translated.length - perChunk * chunks + perChunk;
      endFrame = translated.length - 1;
    }

    const send = (msg: any) => {
      process.send ? process.send(msg) : null;
    };

    if (endFrame - perChunk > translated.length - 1) {
      return;
    }

    if (endFrame > translated.length - 1) {
      endFrame = translated.length - 1;
    }

    renderGraph(
      {
        fileName: seedData.fileName,
        devMode: true,
        startFrame,
        endFrame,
        sessions: translated,
        basedHeight: 1080,
        baseWidth: 1920,
        stepResolution: stepResolution,
        sizeMultiplier: 0.3,
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
  }
};

run();
