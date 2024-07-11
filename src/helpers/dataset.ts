import config from "../config.js";
import fs from "fs";
// import csv from "csvtojson";
import { PolarMeta, PolarSession } from "../types/Polar.js";
import { getSecondsFromHourString } from "./time.js";
import { DataSection, DataSource, NormalisedDataSections } from "../types/config.js";
import { KeyedDataset } from "../types/dataparsers.js";




export const prepareDataset = async (normalisedDataSets: { [k in DataSource]?: KeyedDataset }): Promise<NormalisedDataSections> => {

  const normalisedDataSections: NormalisedDataSections = [];


  config.sections.forEach(section => {

    const startTime = getSecondsFromHourString(section.startTime, config.secondsAligment);
    const endTime = getSecondsFromHourString(section.endTime, config.secondsAligment);

    const timerStart = getSecondsFromHourString(section.timerStart, config.secondsAligment);
    const timerEnd = getSecondsFromHourString(section.timerEnd, config.secondsAligment);

    const timerStartIndex = timerStart - startTime;
    const timerSeconds = timerEnd - timerStart;
    const graphSeconds = endTime - startTime;

    const slicedOutput: any = {}
    for (const k in normalisedDataSets) {
      
      slicedOutput[k] = {
        label: section.use[k as DataSource]?.label,
        dataPoints: []
      }

      for (let i = startTime; i <= startTime + graphSeconds; i++) {
        slicedOutput[k].dataPoints.push(normalisedDataSets[k as DataSource]![i]);
      }


    }

    normalisedDataSections.push({
      name: section.name,
      timerStartIndex,
      timerSeconds,
      use: slicedOutput
    })

  })

  //   for (let i = 0; i < croppedSessions.length - 1; i++) {
  //     const diff = +croppedSessions[i + 1] - +croppedSessions[i];
  //     const increment = diff / config.stepResolution;

  //     translated.push(+croppedSessions[i]);

  //     for (let n = 1; n < config.stepResolution; n++) {
  //       translated.push(+(+croppedSessions[i] + increment * n).toFixed(2));
  //     }
  //   }




  return normalisedDataSections;

};
