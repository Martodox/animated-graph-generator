import fs from "fs";

import { parse } from "csv-parse/sync";
import { getSecondsFromHourString } from "../time.js";
import { KeyedDataset } from "../../types/dataparsers.js";
import { SourcesConfig } from "../../types/config.js";


const fillZeroWithPrevNonNull = (set: KeyedDataset): KeyedDataset => {
    const keys = Object.keys(set);

    let prevNotNull = set[+keys[0]];
    let prevNotNullIndex = 0;
    while (prevNotNull === 0) {        
        prevNotNull = set[+keys[prevNotNullIndex++]];
    }

    for (const key in set) {
        prevNotNull = set[key] === 0 ? prevNotNull : set[key];
        set[key] = prevNotNull
    }

    return set;
}

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
