export type TimeString = string;

export interface Config {
    "inputFile": string,
    "offsetInSeconds": number,
    "stepResolution": number,
    "startTime": TimeString
    "endTime": TimeString,
    "devMode": boolean
    "timerStart": TimeString
    "timerEnd": TimeString,
    basedHeight: number,
    baseWidth: number,
    sizeMultiplier: number,
}

export interface SeedData {
    chunk: number;
    chunks: number;
    fileName: string;
    translated: string;
    timerStartSecond: number;
    timerStoptSecond: number;
    stepResolution: number;
    devMode: boolean;
  }
