import config from "../config.js";
// import csv from "csvtojson";
import { getSecondsFromHourString } from "./time.js";
import { DataSource, NormalisedDataSection } from "../types/config.js";
import { KeyedDataset } from "../types/dataparsers.js";

export const prepareDataset = async (normalisedDataSets: {
  [k in DataSource]?: KeyedDataset;
}): Promise<NormalisedDataSection[]> => {
  const normalisedDataSections: NormalisedDataSection[] = [];

  config.sections.forEach((section) => {
    const startTime = getSecondsFromHourString(
      section.startTime,
      config.secondsAligment
    );
    const endTime = getSecondsFromHourString(
      section.endTime,
      config.secondsAligment
    );

    const timerStart = getSecondsFromHourString(
      section.timerStart,
      config.secondsAligment
    );
    const timerEnd = getSecondsFromHourString(
      section.timerEnd,
      config.secondsAligment
    );

    const timerStartIndex = timerStart - startTime;
    const timerSeconds = timerEnd - timerStart;
    const graphSeconds = endTime - startTime;

    const slicedOutput: any = {};
    for (const k in section.use) {
      if (!normalisedDataSets[k as DataSource]) {
        throw Error(`${k} is not defined in sources`);
      }

      slicedOutput[k] = {
        label: section.use[k as DataSource]?.label,
        dataPoints: [],
      };
      for (let i = startTime; i <= startTime + graphSeconds; i++) {
        slicedOutput[k].dataPoints.push(
          normalisedDataSets[k as DataSource]![i]
        );
      }
    }

    normalisedDataSections.push({
      name: section.name,
      timerStartIndex,
      timerSeconds,
      prependAudioSeconds: section.prependAudioSeconds,
      appendAudioSeconds: section.appendAudioSeconds,
      use: slicedOutput,
    });
  });

  return normalisedDataSections;
};
