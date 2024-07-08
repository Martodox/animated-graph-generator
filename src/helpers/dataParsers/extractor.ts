import { DataSource } from "../../types/config.js";
import { garminFit } from "./garminFit.js";
import { oxiwearCsv } from "./oxiwear.js";
import { polarCsv } from "./polar.js";


export const extractDataSets = (sources: { [k in DataSource]?: string }) => {

    type sourceType = { [k in DataSource]: (fileName: string) => any }

    const parserMap: sourceType = {
        "garminFit": garminFit,
        "oxiwearCsv": oxiwearCsv,
        "polarCsv": polarCsv   
    }

    const datasets: { [key in DataSource]?: any } = {};

    for (const source in sources) {
        const s = source as DataSource; 
        datasets[s] = parserMap[s](sources[s]!)        
    }

    console.log(datasets);


    

}