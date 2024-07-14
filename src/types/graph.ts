import { DataSource, DataSourceData, NormalisedDataSection } from "./config.js";

interface Params {
    datasetLabelsize: number,
    axisLabelSize: number,
    timeKnobSize: number,
    stepResolution: number;
    padding: number,
    lineWidth: number
}

export interface GraphOptions extends Params {
    section: NormalisedDataSection,
    baseWidth: number,
    basedHeight: number,
    sizeMultiplier: number,
    devMode: boolean,
    frames?: number,
    startFrame: number,
    endFrame: number,
    fileName: string,
}


export interface ChartParams extends Params {
    label: number[],
    data: { [k in DataSource]?: DataSourceData },
    width: number,
    height: number,
    timerStartSecond: number,
    timerStoptSecond: number
}

export interface RenderCallback {
    currentFrame: number;
    renderTime: number
}
