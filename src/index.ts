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

const start = Date.now();

const offsetInSeconds = 34 - 14;
const stepResolution = 10;
const startTime = "07:20:44";
const endTime = "07:26:51";
const devMode = false;
const timerStart = "07:21:27";
const timerEnd = "07:26:30";

const sessionCSV = "./in/session.CSV";
const sessionMetaCSV = "./in/sessionMeta.CSV";

const prepareDataset = async () => {
  const session: PolarSession[] = await csv().fromFile(sessionCSV);
  const meta: PolarMeta[] = await csv().fromFile(sessionMetaCSV);

  const polarSessionStartFromMidnight = getSecondsFromHourString(
    meta[0]["Start time"]
  );
  const videoRecordingStart = getSecondsFromHourString(
    startTime,
    offsetInSeconds
  );
  const videoRecordingStop = getSecondsFromHourString(endTime, offsetInSeconds);

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
  if (stepResolution > 1) {
    for (let i = 0; i < data.length - 1; i++) {
      const diff = +data[i + 1] - +data[i];
      const increment = diff / stepResolution;

      sessions.push(+data[i]);

      for (let n = 1; n < stepResolution; n++) {
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
  // const numberOfCPUs = os.cpus().length;
  const numberOfCPUs = 7;

  if (cluster.isPrimary) {    
    let fileName;
    if (devMode) {
      fileName = "chart";
    } else {
      fileName = `chart - ${new Date().toISOString()}`;
      fs.rmSync(`./out/${fileName}`, { recursive: true, force: true });
      fs.mkdirSync(`./out/${fileName}`);
    }


    const { raw, translated } = await prepareDataset();

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
    let lastUpdate: number = -1;

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
        timerStoptSecond
      });
      worker.on("message", () => {
        res++;
      });
    }

    const getProgress = () => {    
      if (res > 0 && res != lastUpdate) {
         bar1.update(res)
         lastUpdate = res;
      }
      if (res < translated.length) {
        setTimeout(getProgress, 100)
      } else {        
        bar1.stop();
        console.log(Date.now() - start)
        process.exit(0);
      }
    };

    getProgress();
  } else {
    
    const seedData = (process.env as unknown) as {
      chunk: number,
      chunks: number,
      fileName: string,
      translated: string,
      timerStartSecond: string,
      timerStoptSecond: string
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
    }

    if ((endFrame - perChunk) > (translated.length -1)) {
      return;
    }

    if (endFrame > (translated.length -1)) {
      endFrame = translated.length -1
    }



    renderGraph({
      fileName: seedData.fileName,
      devMode: true,
      startFrame,
      endFrame,
      sessions: translated,
      basedHeight: 1080,
      baseWidth: 1920,
      stepResolution,
      sizeMultiplier: 0.3,
      timerStartSecond: +seedData.timerStartSecond,
      timerStoptSecond: +seedData.timerStoptSecond,
      datasetLabelsize: 70,
      axisLabelSize: 50,
      timeKnobSize: 20,
      padding: 40,
      lineWidth: 10,
    }, send);

    // process.send
    //   ? process.send({
    //       chunk,
    //       startFrame,
    //       endFrame,
    //       frames: endFrame - startFrame +1,
    //     })
    //   : null;
  }
};

run();
