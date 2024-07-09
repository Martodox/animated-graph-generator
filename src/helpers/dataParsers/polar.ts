// import { DataParser, DataParserConfig } from "../../types/dataparsers.js";
import fs from "fs";

import { PolarMeta } from "../../types/Polar.js";
import { parse, } from "csv-parse/sync";
import { getSecondsFromHourString } from "../time.js";
import { findPrevNonNull } from "../dataset.js";
import { KeyedDataset } from "../../types/dataparsers.js";


const fillZeroWithPrevNonNull = (set: KeyedDataset): KeyedDataset => {

    const keys = Object.keys(set) as unknown as number[];

    let keyedSessionsWithNulls: number[] = [];
    let startTimestamp = keys[0]
    let endTimestamp = keys[keys.length - 1];
    for (let i = startTimestamp; i <= endTimestamp; i++) {
        keyedSessionsWithNulls.push(+set[i] || 0)
    }

    keyedSessionsWithNulls = keyedSessionsWithNulls.map((_: any, index: any) => findPrevNonNull(keyedSessionsWithNulls, index))

    

    for (let i = 0; i <= endTimestamp - startTimestamp; i++) {
        set[keys[i]] = keyedSessionsWithNulls[i]
    }
    return set;
}

export const polarCsv = async (fileName: string) => {

    const input = fs.readFileSync(fileName);


    const individualLines = input.toString().split("\n");

    const header = [individualLines.shift(), individualLines.shift()].join("\n");

    const startTime = parse(header, {
        columns: true,
        skip_empty_lines: true
    })[0]['Start time'];

    const startSecond = getSecondsFromHourString(startTime);

    let session: KeyedDataset = parse(individualLines.join("\n"), {
        columns: true,
        skip_empty_lines: true
    }).map((val: any) => +val["HR (bpm)"]).reduce((acc: any, val: any, index: number) => {
        acc[startSecond + index] = val;
        return acc;
    }, {});

    session = fillZeroWithPrevNonNull(session);


    return fileName;

}
