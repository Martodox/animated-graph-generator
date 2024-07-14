import { SourcesConfig } from "../../types/config.js";
import { KeyedDataset } from "../../types/dataparsers.js";
import fs from 'fs';
import FitParser from 'fit-file-parser';
import { GarminFit } from "../../types/garminFit.js";
import { parseGarminTimeToSeconds } from "../time.js";
import { fillZeroWithPrevNonNull } from "./utils.js";


export const garminFit = async (config: SourcesConfig): Promise<KeyedDataset> => {

  const input = fs.readFileSync(config.src);

  const fitParser = new FitParser.default({
    force: true,
    elapsedRecordField: true,
    mode: 'list',
  });

  const data: GarminFit = await new Promise((resolve, reject) => {
    fitParser.parse(input, function (error: any, data: any) {
      if (error) {
        reject(reject);
      } else {
        resolve(data);
      }
    });
  })

  const dataSetAlignment = (config.secondsAligment || 0) + (data.device_settings.time_offset)

  const startTimestamp = parseGarminTimeToSeconds(data.records[0].timestamp) + dataSetAlignment;
  const endTimestamp = parseGarminTimeToSeconds(data.records[data.records.length - 1].timestamp) + dataSetAlignment;

  let session: KeyedDataset = {}

  for (let i = startTimestamp; i <= endTimestamp; i++) {
    session[i] = 0;
  }

  data.records.forEach((val) => {
    session[parseGarminTimeToSeconds(val.timestamp) + dataSetAlignment] = val.heart_rate
  })

  return fillZeroWithPrevNonNull(session);
}
