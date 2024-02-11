import { PolarSession } from "./Polar.js";

export interface GraphOptions {
    sessions: PolarSession[],
    baseWidth: number,
    basedHeight: number,
    sizeMultiplier: number,
    timerStartSecond: number,
    timerStoptSecond: number,
    datasetLabelsize: number,
    axisLabelSize: number,
    timeKnobSize: number,
    padding: number,
    lineWidth: number
    devMode: boolean
}


export interface ChartParams {
    label: any[],
    data: any[],
    width: number,
    height: number,
    datasetLabelsize: number,
    axisLabelSize: number,
    timeKnobSize: number,
    padding: number,
    lineWidth: number,
    timerStartSecond: number,
    timerStoptSecond: number
}

