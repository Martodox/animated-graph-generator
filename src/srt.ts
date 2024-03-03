import srtParser2 from "srt-parser-2";
import fs from "fs";
import { parsePolarTime, polarTimeToSrtTimeChunks, srtTimeChunksToTimeString } from "./helpers/time.js";
import { PolarSession } from "./types/Polar.js";

export const renderSrt = (sessions: PolarSession[], secondsFromStart: number) => {

    const parser = new srtParser2();

    const lines: any[] = sessions.map((val, index) => {
    
        const polarTime = parsePolarTime(val.Time);
                    
        const milisecondsStart = polarTimeToSrtTimeChunks(polarTime, -secondsFromStart * 1000);
        const milisecondsEnd = polarTimeToSrtTimeChunks(polarTime, 1000 - secondsFromStart * 1000);

        return {
            id: `${index}`,
            startTime: srtTimeChunksToTimeString(milisecondsStart),
            endTime: srtTimeChunksToTimeString(milisecondsEnd),
            text: `HR: ${val["HR (bpm)"].padStart(3, "0")}`
        }
    })
    
    const srt = parser.toSrt(lines);
    
    
    fs.writeFileSync(`./out/session.srt`, srt, {});

}
