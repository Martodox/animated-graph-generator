import cluster from "cluster";
import { prepareDataset } from "../helpers/dataset.js";
import { getSecondsFromHourString } from "../helpers/time.js";
import { audioBackground } from "../audioBackground.js";
import fs from "fs";
import os from "os";
import cliProgress from "cli-progress";
import { DataSection, SeedData } from "../types/config.js";
import config from "../config.js";
import { RenderCallback } from "../types/graph.js";
import {
  mean,
  median,
} from '@basementuniverse/stats';

import percentile from 'percentile';
const numberOfCPUs = os.cpus().length;
const renderTimes: number[] = [];

type statKeys = "mean (ms)" | "median (ms)" | "p95 (ms)" | "p90 (ms)";

const computeStats = (times: number[]): {[key in statKeys]: number|number[]} => {

  return {
    "mean (ms)": Math.floor(mean(times)),
    "median (ms)":  Math.floor(median(times)),
    "p95 (ms)": percentile(95, times),
    "p90 (ms)": percentile(90, times),
  }

  
}

export const processDataSection = async (section: DataSection): Promise<object> => {
  return new Promise(async (resolve) => {
    const {
      raw,
      translated,
      devMode,
      stepResolution,
      timerStart,
      offsetInSeconds,
      timerEnd,
      startTime,
    } = await prepareDataset(section);
  
    let fileName;
    if (devMode) {
      fileName = "chart";
      try {
        fs.rmSync(`./out/${fileName}`, { recursive: true, force: true });
      } catch (errpr) {
        console.log("rm dir error", errpr)
      }
    } else {
      fileName = `chart - ${section.name}`;
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
  
    try {
      await audioBackground(raw, fileName, section.addEndingAudioSeconds);
    } catch (error) {
      console.log("Audio file not generated due to error", error)
    } 
    
    
  
    if (config.textOnly) {
      console.log(
        "Only audio file rendered. Turn off textOnly to render the full chart!"
      );
      return;
    }
  
    try {
      fs.mkdirSync(`./out/${fileName}`);
    } catch {}
  
    let res: number = 0;
  
    const bar1 = new cliProgress.SingleBar(
      {
        format: `${fileName} | {bar} {percentage}% | {value}/{total} | ETA: {eta_formatted} | Elapsed {duration}s`,
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
  
      worker.on("message", ({msg}) => {

        const parsedMsg = (JSON.parse(msg) as RenderCallback);

        renderTimes.push(parsedMsg.renderTime);
        
        bar1.increment();
        res++;
        if (res == translated.length) {          
          bar1.stop();
          resolve(computeStats(renderTimes));
        }
      });
    }
  })
}



export const primaryThread = async () => {

const stats: any[] = [];
  
for (const section of config.sections) {  
  stats.push(await processDataSection(section));
}

const keys = Object.keys(stats[0]);

const oneLiners = keys.reduce<any>((acc, key) => {

  const arr = stats.map(val => val[key])
  const numbers = computeStats(arr);
  return {
    ...acc,
    [key]: numbers[key as statKeys]
  };

}, {}) 

console.table(oneLiners);

  process.exit(0);

};
