import fs from "fs";
import { parse } from "csv-parse/sync";
import { getSecondsFromHourString } from "../time.js";
import { KeyedDataset } from "../../types/dataparsers.js";
import { SourcesConfig } from "../../types/config.js";
import { fillZeroWithPrevNonNull } from "./utils.js";


export const polarCsv = (config: SourcesConfig): KeyedDataset => {

    const input = fs.readFileSync(config.src);


    const individualLines = input.toString().split("\n");

    const header = [individualLines.shift(), individualLines.shift()].join("\n");

    const startTime = parse(header, {
        columns: true,
        skip_empty_lines: true
    })[0]['Start time'];

    const startSecond = getSecondsFromHourString(startTime) + (config.secondsAligment || 0);

    let session: KeyedDataset = parse(individualLines.join("\n"), {
        columns: true,
        skip_empty_lines: true
    }).map((val: any) => +val["HR (bpm)"]).reduce((acc: any, val: any, index: number) => {
        acc[startSecond + index] = val;
        return acc;
    }, {});

    return fillZeroWithPrevNonNull(session);

}
