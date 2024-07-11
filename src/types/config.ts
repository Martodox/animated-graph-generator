import { KeyedDataset } from "./dataparsers.js";

export type TimeString = string;

export type DataSource = "polarCsv" | "garminFit" | "oxiwearCsv";

export interface DataSection {
    name: string,
    startTime: TimeString
    endTime: TimeString,
    timerStart: TimeString
    timerEnd: TimeString,
    addEndingAudioSeconds?: number;
    prependAudioSeconds?: number;
    use: { [k in DataSource]?: SourceUse },
}

export type NormalisedDataSections = {
    name: string;
    timerStartIndex: number,
    timerSeconds: number,
    use: { [k in DataSource]?: {
        label: string,
        dataPoints: number[]
    } },
}[]

export interface SourceUse {
    label?: string
}

export type Sources = { [k in DataSource]?: SourcesConfig };
export type SourcesConfig = { src: string, secondsAligment?: number };

export interface Config {
    sources: Sources,
    secondsAligment: number,
    stepResolution: number,
    textOnly: boolean,
    sections: DataSection[],
    devMode: boolean,
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
