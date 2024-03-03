import config from "../config.js";
import fs from "fs";
import csv from "csvtojson";
import { PolarMeta, PolarSession } from "../types/Polar.js";
import { getSecondsFromHourString } from "./time.js";

export const prepareDataset = async () => {
    
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


    const videoRecordingStop = videoRecordingStart + Math.floor(config.runTimeInSeconds * 1000);
  
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
      startTime: config.startTime,
      timerStart: config.timerStart,
      timerEnd: config.timerEnd,
      offsetInSeconds: config.offsetInSeconds,
      stepResolution: config.stepResolution,
      devMode: config.devMode
    };
  };
