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

import config from "./config.js";


const start = Date.now();

const prepareDataset = async () => {
  const input = fs.readFileSync(config.inputFile);
  const individualLines = input.toString().split("\n");
  const header = [individualLines.shift(), individualLines.shift()].join("\n")
  
  const meta: PolarMeta[] = await csv().fromString(header);
  const session: PolarSession[] = await csv().fromString(individualLines.join("\n"))
  

  const polarSessionStartFromMidnight = getSecondsFromHourString(
    meta[0]["Start time"]
  );
  const videoRecordingStart = getSecondsFromHourString(
    config.startTime,
    config.offsetInSeconds
  );
  const videoRecordingStop = getSecondsFromHourString(config.endTime, config.offsetInSeconds);

  const runTimeInSeconds = (videoRecordingStop - videoRecordingStart) / 1000;

  const secondsToRemove =
    (videoRecordingStart - polarSessionStartFromMidnight) / 1000;

  const croppedSessions = session.slice(
    secondsToRemove,
    -(session.length - runTimeInSeconds - secondsToRemove)
  );

  const data = croppedSessions.reduce<number[]>((acc, val, index) => {
    const current = val["HR (bpm)"] === "0" ? acc[index - 1] : val["HR (bpm)"];
    return [...acc, +current];
  }, []);

  let sessions = [];
  if (config.stepResolution > 1) {
    for (let i = 0; i < data.length - 1; i++) {
      const diff = +data[i + 1] - +data[i];
      const increment = diff / config.stepResolution;

      sessions.push(+data[i]);

      for (let n = 1; n < config.stepResolution; n++) {
        sessions.push(+(+data[i] + increment * n).toFixed(2));
      }
    }
  } else {
    sessions = data;
  }

  return {
    raw: data,
    translated: sessions,
  };
};

const run = async () => {
  const numberOfCPUs = os.cpus().length;

  if (cluster.isPrimary) {
    let fileName;
    if (config.devMode) {
      fileName = "chart";
    } else {
      fileName = `chart - ${new Date().toISOString()}`;
      fs.rmSync(`./out/${fileName}`, { recursive: true, force: true });
      fs.mkdirSync(`./out/${fileName}`);
    }

    const { raw, translated } = await prepareDataset();

    const timerStartFromMidinght = getSecondsFromHourString(
      config.timerStart,
      config.offsetInSeconds
    );
    const timerStopFromMidinght = getSecondsFromHourString(
      config.timerEnd,
      config.offsetInSeconds
    );
    const videoRecordingStart = getSecondsFromHourString(
      config.startTime,
      config.offsetInSeconds
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
        stepResolution: config.stepResolution,
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
