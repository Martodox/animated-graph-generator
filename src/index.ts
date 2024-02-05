import csv from "csvtojson";
import { PolarMeta, PolarSession } from "./types/Polar";
import srtParser2, { Line } from "srt-parser-2";
import fs from "fs";

const offset = 0;
const startTime = "08:28:49"
const sessionCSV = "./in/session.CSV";
const sessionMetaCSV = "./in/sessionMeta.CSV";

const parsePolarTime = (timeString: string): number => {
    const split = timeString.split(":")
    return new Date(`2000-01-01T${split[0]}:${split[1]}:${split[2]}.000Z`).getTime();
}

const polarTimeToSrtTimeChunks = (polarTime: number, offset: number = 0) => {
        const time = new Date(polarTime + offset);
        const isoString = time.toISOString().split("T")[1].replace("Z", "");
        const hours = isoString.split(":")[0];
        const minutes = isoString.split(":")[1];
        const seconds = isoString.split(":")[2].split(".")[0]
        const miliseconds = isoString.split(":")[2].split(".")[1]

        return {
            hours,
            minutes,
            seconds,
            miliseconds
        }
};

const srtTimeChunksToTimeString = (chunks: any) => {
    return `${chunks.hours}:${chunks.minutes}:${chunks.seconds},${chunks.miliseconds}`
}

const getSecondsFromHourString = (input: string) => {
    const date = new Date(`2000-01-01:${input}`);
    return date.getTime();
    
} 

(async () => {

    const session: PolarSession[] = await csv().fromFile(sessionCSV);
    const meta: PolarMeta[] = await csv().fromFile(sessionMetaCSV);


    const sessionStartFromMidnight = getSecondsFromHourString(meta[0]["Start time"]);
    const videoRecordingStart = getSecondsFromHourString(startTime)

    const secondsToRemove = (videoRecordingStart - sessionStartFromMidnight)/ 1000 - 1;

    const parser = new srtParser2();

    const lines: any[] = session.slice(secondsToRemove).map((val, index) => {

        const polarTime = parsePolarTime(val.Time);
        
        

        const milisecondsStart = polarTimeToSrtTimeChunks(polarTime, offset - secondsToRemove * 1000);
        const milisecondsEnd = polarTimeToSrtTimeChunks(polarTime, offset + 999 - secondsToRemove * 1000);

        return {
            id: `${index}`,
            startTime: srtTimeChunksToTimeString(milisecondsStart),
            endTime: srtTimeChunksToTimeString(milisecondsEnd),
            text: `HR: ${val["HR (bpm)"].padStart(3, "0")}`
        }
    })

    const srt = parser.toSrt(lines);


    fs.writeFileSync(`./out/session+${Date.now()}.srt`, srt, {});


})()


