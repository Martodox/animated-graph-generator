import { DataSource, Sources, SourcesConfig } from "../../types/config.js";
import { KeyedDataset } from "../../types/dataparsers.js";
import { garminFit } from "./garminFit.js";
import { oxiwearCsv } from "./oxiwear.js";
import { polarCsv } from "./polar.js";


export const extractDataSets = async (sources: Sources): Promise<{[k in DataSource]?: KeyedDataset}> => {

    type sourceType = { [k in DataSource]: (config: SourcesConfig) => any }

    const parserMap: sourceType = {
        "garminFit": garminFit,
        "oxiwearCsv": oxiwearCsv,
        "polarCsv": polarCsv   
    }

    const datasets: { [key in DataSource]?: KeyedDataset } = {};

    for (const source in sources) {
        const s = source as DataSource; 
        datasets[s] = await parserMap[s](sources[s]!)        
    }
    
    return datasets

}