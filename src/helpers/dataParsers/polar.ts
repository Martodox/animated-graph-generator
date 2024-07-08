// import { DataParser, DataParserConfig } from "../../types/dataparsers.js";
import fs from "fs";
import csv from "csvtojson";
import config from "../../config.sample.js";
import { PolarMeta } from "../../types/Polar.js";




export const polarCsv = async (fileName: string) => {
    
console.log("polarCsvpolarCsvpolarCsv")
  const input = fs.readFileSync(fileName);
  

  const individualLines = input.toString().split("\n");
  
  const header = [individualLines.shift(), individualLines.shift()].join("\n");
//   console.log(header)
  const meta: PolarMeta[] = await csv().fromString(header);
  console.log(meta)
  let session: number[] = (await csv().fromString(
    individualLines.join("\n")
  )).map((val) => +val["HR (bpm)"]);


  

//   session = session.map((_, index) => findPrevNonNull(session, index))

    return fileName;
    
}
