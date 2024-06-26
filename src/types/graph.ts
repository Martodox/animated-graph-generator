interface Params {
    timerStartSecond: number,
    timerStoptSecond: number,
    datasetLabelsize: number,
    axisLabelSize: number,
    timeKnobSize: number,
    stepResolution: number;
    padding: number,
    lineWidth: number
}

export interface GraphOptions extends Params {
    sessions: number[],
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
    data: number[],
    width: number,
    height: number,
}

export interface RenderCallback {
    currentFrame: number;
    renderTime: number
}
