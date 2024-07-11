import { SourcesConfig } from "../../types/config.js";
import { KeyedDataset } from "../../types/dataparsers.js";




export const oxiwearCsv = (config: SourcesConfig): KeyedDataset => {
    config;
    return {};
    
}

    // const meta: PolarMeta[] = [];
  
    // let session: any[] = (await csv().fromFile(config.inputFile)).map(val => ({
    //   time: new Date(val['reading_time']).getTime()/1000,
    //   spo2: val['spo2']
    // }))
  
  
    // const keyedSessions = session.reduce((acc, val) => {
  
    //   acc[val.time] = val.spo2;
    //   return acc;
  
    // }, {})
    // // console.log(keyedSessions);
    // let keyedSessionsWithNulls: any = [];
    // let startTimestamp = session[0]['time'];
    // let endTimestamp = session[session.length - 1]['time'];
    
    // for (let i = startTimestamp; i <= endTimestamp; i++) {
    //   keyedSessionsWithNulls.push(+keyedSessions[i] || 0)
    // }
  
  
  
    // keyedSessionsWithNulls = keyedSessionsWithNulls.map((_: any, index: any) => findPrevNonNull(keyedSessionsWithNulls, index))

// }
