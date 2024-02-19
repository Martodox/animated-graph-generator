import csv from "csvtojson";
import { PolarMeta, PolarSession } from "./types/Polar.js";
import os from "os";
import cluster from "cluster";
import process from "process";

import { getSecondsFromHourString } from "./helpers/time.js";
import { renderGraph } from "./graph.js";
import { jsonArray } from "./plainData.js";

const offsetInSeconds = 34 - 14;
const stepResolution = 10;
const startTime = "07:20:44";
const endTime = "07:26:49";


const timerStart = "07:21:27";
const timerEnd = "07:26:30";

const sessionCSV = "./in/session.CSV";
const sessionMetaCSV = "./in/sessionMeta.CSV";


const numberOfCPUs = os.cpus().length;


if (cluster.isPrimary) {
    for (let i = 0; i < numberOfCPUs; i++) {
        let worker = cluster.fork({from: i^2, to: i * 100});
        worker.on("message", (msg: any) => {
            console.log("rendered frame", msg);
        })
      }
    
} else {

    const {from, to} = process.env as unknown as {from: number, to: number};
    const send = process.send || function () {};

    for (let n = from; n < to; n++) {
        process.send ? process.send({frame: n, total: 100}) : console.log("not defined")
    }
    
    

}


const render = async () => {

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

    const data = croppedSessions.reduce<number[]>((acc, val, index) => {
        const current = val["HR (bpm)"] === "0" ? acc[index - 1] : val["HR (bpm)"]        
        return [...acc, +current];
    }, [])

    jsonArray(data);

    let sessions = [];
    if (stepResolution > 1) {
      for (let i = 0; i < data.length - 1; i++) {
        const diff = +data[i + 1] - +data[i];
        const increment = diff / stepResolution;
  
        sessions.push(+data[i]);
  
        for (let n = 1; n < stepResolution; n++) {
          sessions.push(+(+data[i] + increment * n).toFixed(2));
        }
      }
    } else {
      sessions = data;
    }


    renderGraph({
        devMode: false,
        sessions,
        basedHeight: 1080,
        baseWidth: 1920,
        // frames: 1,
        stepResolution,
        sizeMultiplier: 1,
        timerStartSecond,
        timerStoptSecond,
        datasetLabelsize: 70,
        axisLabelSize: 50,
        timeKnobSize: 20,
        padding: 40,
        lineWidth: 10
    });

};

// render();

