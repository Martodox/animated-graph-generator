import { SourceUse } from "./config.js"

export interface DataParserConfig extends SourceUse {
    src: string
    startTime: string
    endTime: string
    sourceOffsetInSeconds: number
}

export type KeyedDataset = { [key: number]: number }

export type DataParser = (fileName: string) => number[];
