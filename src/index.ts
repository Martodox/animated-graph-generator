import csv from "csvtojson";
import { PolarMeta, PolarSession } from "./types/Polar.js";

import { getSecondsFromHourString } from "./helpers/time.js";
import { renderGraph } from "./graph.js";

const offsetInSeconds = -13;

const startTime = "08:44:17";
const endTime = "08:47:22";
// const endTime = "08:44:27";

const timerStart = "08:44:45";
const timerEnd = "08:47:00";

const sessionCSV = "./in/session.CSV";
const sessionMetaCSV = "./in/sessionMeta.CSV";


(async () => {

    const session: PolarSession[] = await csv().fromFile(sessionCSV);
    const meta: PolarMeta[] = await csv().fromFile(sessionMetaCSV);


    const polarSessionStartFromMidnight = getSecondsFromHourString(meta[0]["Start time"]);
    const videoRecordingStart = getSecondsFromHourString(startTime, offsetInSeconds) 
    const videoRecordingStop = getSecondsFromHourString(endTime, offsetInSeconds);

    const runTimeInSeconds = (videoRecordingStop - videoRecordingStart) / 1000;

    const timerStartFromMidinght = getSecondsFromHourString(timerStart, offsetInSeconds);
    const timerStopFromMidinght = getSecondsFromHourString(timerEnd, offsetInSeconds);

    const timerStartSecond = (timerStartFromMidinght - videoRecordingStart) / 1000;
    const timerRunInSeconds = (timerStopFromMidinght - timerStartFromMidinght) / 1000;
    const timerStoptSecond = timerStartSecond + timerRunInSeconds;

    const secondsToRemove = (videoRecordingStart - polarSessionStartFromMidnight)/ 1000;
    
    const croppedSessions = session.slice(secondsToRemove, -(session.length - runTimeInSeconds - secondsToRemove));
    
    renderGraph({
        devMode: false,
        sessions: croppedSessions,
        basedHeight: 1080,
        baseWidth: 1920,
        sizeMultiplier: 1,
        timerStartSecond,
        timerStoptSecond,
        datasetLabelsize: 70,
        axisLabelSize: 50,
        timeKnobSize: 20,
        padding: 40,
        lineWidth: 10
    });

})()


