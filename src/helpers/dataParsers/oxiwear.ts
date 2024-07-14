import { SourcesConfig } from "../../types/config.js";
import { KeyedDataset } from "../../types/dataparsers.js";
import { parse } from "csv-parse/sync";
import fs from "fs";
import { parseOxiwearTimeToSeconds } from "../time.js";
import { OxiwearDataPoint } from "../../types/oxiwear.js";
import { fillZeroWithPrevNonNull } from "./utils.js";





export const oxiwearCsv = (config: SourcesConfig): KeyedDataset => {

    const input = fs.readFileSync(config.src).toString();

    let data: OxiwearDataPoint[] = parse(input, {
        columns: true,
        skip_empty_lines: true
    })

    const dataSetAlignment = (config.secondsAligment || 0);

    const startTimestamp = parseOxiwearTimeToSeconds(data[0].reading_time) + dataSetAlignment;
    const endTimestamp = parseOxiwearTimeToSeconds(data[data.length - 1].reading_time) + dataSetAlignment;

    let session: KeyedDataset = {}

    for (let i = startTimestamp; i <= endTimestamp; i++) {
      session[i] = 0;
    }
  
    data.forEach((val) => {
      session[parseOxiwearTimeToSeconds(val.reading_time) + dataSetAlignment] = +val.spo2;
    })

    return fillZeroWithPrevNonNull(session)
    
}
