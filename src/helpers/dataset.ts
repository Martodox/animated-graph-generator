import config from "../config.js";
import fs from "fs";
import csv from "csvtojson";
import { PolarMeta, PolarSession } from "../types/Polar.js";
import { getSecondsFromHourString } from "./time.js";
import { DataSection } from "../types/config.js";

const findPrevNonNull = (data: number[], index: number) => {
  
  
  if (!!data[index]) return data[index];
  let iteratorIndex = index;
  let val = data[iteratorIndex];

  while (val === 0 && index > 0) {
    val = data[--index]    
  }

  while (val === 0) {
    val = data[++index]    
  }
  return val;
  }

export const prepareDataset = async ({
  startTime,
  endTime,
  timerStart,
  timerEnd,
}: DataSection) => {
  const input = fs.readFileSync(config.inputFile);
  const individualLines = input.toString().split("\n");
  const header = [individualLines.shift(), individualLines.shift()].join("\n");

  const meta: PolarMeta[] = await csv().fromString(header);
  
  let session: number[] = (await csv().fromString(
    individualLines.join("\n")
  )).map((val) => +val["HR (bpm)"]);

  session = session.map((_, index) => findPrevNonNull(session, index))
  


  const polarSessionStartFromMidnight = getSecondsFromHourString(
    meta[0]["Start time"]
  );
  const videoRecordingStart = getSecondsFromHourString(
    startTime,
    config.offsetInSeconds
  );

  const videoRecordingStop = getSecondsFromHourString(
    endTime,
    config.offsetInSeconds
  );

  const runTimeInSeconds = (videoRecordingStop - videoRecordingStart) / 1000;

  const secondsToRemove =
    (videoRecordingStart - polarSessionStartFromMidnight) / 1000;
  const croppedSessions = session.slice(
    secondsToRemove,
    -(session.length - runTimeInSeconds - secondsToRemove)
  );

  let translated = [];
  if (config.stepResolution > 1) {
    for (let i = 0; i < croppedSessions.length - 1; i++) {
      const diff = +croppedSessions[i + 1] - +croppedSessions[i];
      const increment = diff / config.stepResolution;

      translated.push(+croppedSessions[i]);

      for (let n = 1; n < config.stepResolution; n++) {
        translated.push(+(+croppedSessions[i] + increment * n).toFixed(2));
      }
    }
  } else {
    translated = croppedSessions;
  }

  return {
    raw: croppedSessions,
    translated,
    startTime: startTime,
    timerStart: timerStart,
    timerEnd: timerEnd,
    offsetInSeconds: config.offsetInSeconds,
    stepResolution: config.stepResolution,
    devMode: config.devMode,
  };
};
