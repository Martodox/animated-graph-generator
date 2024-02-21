export type TimeString = string;

export interface Config {
    "inputFile": string,
    "offsetInSeconds": number,
    "stepResolution": number,
    "startTime": TimeString
    "endTime": TimeString,
    "devMode": boolean
    "timerStart": TimeString
    "timerEnd": TimeString
}
