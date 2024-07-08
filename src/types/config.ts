export type TimeString = string;

export interface DataSection {
    "name": string,
    "startTime": TimeString
    "endTime": TimeString,
    "timerStart": TimeString
    "timerEnd": TimeString,
    "addEndingAudioSeconds"?: number;
    "prependAudioSeconds"?: number;
}

export interface Config {
    "inputFile": string,
    "offsetInSeconds": number,
    "stepResolution": number,
    textOnly: boolean,
    sections: DataSection[],
    "devMode": boolean
    
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
