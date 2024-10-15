import { KeyedDataset } from "./dataparsers.js";

export type TimeString = string;

export type DataSource = "polarCsv" | "garminFit" | "oxiwearCsv" | "oxiwearHRCsv";

export interface DataSection {
    name: string,
    startTime: TimeString
    endTime: TimeString,
    timerStart: TimeString
    timerEnd: TimeString,
    appendAudioSeconds?: number;
    prependAudioSeconds?: number;
    use: { [k in DataSource]?: SourceUse },
}

export type DataSourceData = {
    label: string,
    dataPoints: number[]
};

export type NormalisedDataSection = {
    name: string;
    timerStartIndex: number,
    timerSeconds: number,
    appendAudioSeconds?: number;
    prependAudioSeconds?: number;
    use: { [k in DataSource]?: DataSourceData },
}

export interface SourceUse {
    label?: string
}

export type Sources = { [k in DataSource]?: SourcesConfig };
export type SourcesConfig = { src: string, secondsAligment?: number };

export interface Config {
    destinationDirectory: string;
    sources: Sources,
    secondsAligment: number,
    stepResolution: number,
    audioOnly: boolean,
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
    section: string;
    stepResolution: number;
    devMode: boolean;
}
