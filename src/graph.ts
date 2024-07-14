import { ChartConfiguration, ChartDataset, ChartOptions } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs";
import { getTimerFromSecondsElapsed } from "./helpers/time.js";
import { ChartParams, GraphOptions } from "./types/graph.js";
import { DataSource } from "./types/config.js";

const calculateTimeDiff = () => {
  const start = Date.now();
  return () => {
    const diff = Date.now() - start;;
    return diff;
  }
}

const datasetLine: {[key in DataSource]: any} = {
  "oxiwearCsv": {
    borderColor: "rgb(0, 49, 225)",
    tension: 0.2,
    weight: 3,
    clip: 100,
    borderJoinStyle: "bevel",
    borderWidth: 6,
  },
  "garminFit": {
    borderColor: "rgb(225, 112, 0)",
    tension: 0.2,
    weight: 3,
    clip: 100,
    borderJoinStyle: "bevel",
    borderWidth: 10,
  },
  "polarCsv": {
    borderColor: "rgb(225, 112, 0)",
    tension: 0.2,
    weight: 3,
    clip: 100,
    borderJoinStyle: "bevel",
    borderWidth: 10,
  }
}

const getConfigurationForIndex = (
  currentFrame: number,
  chartParams: ChartParams
): ChartConfiguration => {

  const datasets: ChartDataset[] = [
    {
      normalized: true,
      label: `Apnea: ${getTimer(
        currentFrame,
        chartParams.stepResolution,
        chartParams.timerStartSecond,
        chartParams.timerStoptSecond
      )}`,

      data: [],
      yAxisID: "yAxis2"
    }
  ];


  for (const key in chartParams.data) {
    const data = chartParams.data[key as DataSource];
    const dataPoints = data!.dataPoints;
    
    datasets.push({
    label: `${data?.label}: ${dataPoints[
      getCurrentSecond(currentFrame, chartParams.stepResolution)
    ]
      .toString()
      .padStart(3, "0")}`,    
    data: dataPoints,
    normalized: true,    
    yAxisID: `yAxis${key}`,
    ...datasetLine[key as DataSource]
    })
    
  }

  return {
    type: "line",

    data: {
      labels: datasets[1].data,
      datasets: datasets
    },
    options: {
      layout: {
        padding: {
          bottom: chartParams.padding,
          left: chartParams.padding,
          right: chartParams.padding,
          top: -40 + chartParams.padding
        }
      },
      plugins: {
        legend: {
          align: "end",          
          labels: {
            boxPadding: 20,
            color: "white",
            boxHeight: 120,
            boxWidth: 0,            
            font: {
              size: chartParams.datasetLabelsize,
            },
          },
        },
      },
      elements: {
        point: {
          pointStyle: "circle",
          backgroundColor: "white",
          borderColor: "white",
          borderWidth: 0,          
          radius: (context) => {
            let index = context.dataIndex;
            return index === currentFrame ? chartParams.timeKnobSize : 0;
          },
        },
      },
      scales: {
        xAxis: {
          display: false,
          grid: {
            display: false,
          },
        },
        yAxisgarminFit: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "rgb(225, 112, 0)",
            maxTicksLimit: 5,
            font: {
              weight: "bold",
              size: chartParams.axisLabelSize,
            },
          },
        },
        yAxisoxiwearCsv: {
          position: "right",
          type: "linear",
          min: 60,
          max: 100,
          grid: {
            display: false,
            drawBorder: false,
          },          
          ticks: {
            color: "rgb(0, 49, 225)",
            maxTicksLimit: 4,
            font: {
              weight: "bold",
              size: chartParams.axisLabelSize,
            },
          },
        },

        yAxis2: {
          display: false,
          ticks: { display: false },
        },
      },
    },
  };
};

const getTimer = (
  currentFrame: number,
  stepResolution: number,
  start: number = 0,
  stop: number = Infinity
) => {
  let second = 0;

  const currentSecond = Math.floor(currentFrame / stepResolution);

  if (currentSecond >= start && currentSecond < stop) {
    second = currentSecond - start + 1;
  }

  if (currentSecond >= stop) {
    second = stop - start + 1;
  }

  return getTimerFromSecondsElapsed(second);
};

const getCurrentSecond = (currentFrame: number, stepResolution: number) => {
  return Math.floor(currentFrame / stepResolution) * stepResolution;
};

export const renderGraph = async (
  options: GraphOptions,
  cb: (msg: any) => void
) => {
  
  const chartParams: ChartParams = {
    label: [],
    data: options.section.use,
    stepResolution: options.stepResolution,
    width: options.baseWidth * options.sizeMultiplier,
    height: options.basedHeight * options.sizeMultiplier,
    datasetLabelsize: options.datasetLabelsize * options.sizeMultiplier,
    axisLabelSize: options.axisLabelSize * options.sizeMultiplier,
    timeKnobSize: options.timeKnobSize * options.sizeMultiplier,
    padding: options.padding * options.sizeMultiplier,
    lineWidth: options.lineWidth * options.sizeMultiplier,
    timerStartSecond: options.section.timerStartIndex,
    timerStoptSecond: options.section.timerStartIndex + options.section.timerSeconds,
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chartParams.width,
    height: chartParams.height,
    backgroundColour: "transparent",
  });

  for (
    let currentFrame = options.startFrame;
    currentFrame <= options.endFrame;
    currentFrame++
  ) {
    const configuration = getConfigurationForIndex(currentFrame, chartParams);

    const bufferSyncTime = calculateTimeDiff();
    const buffer = chartJSNodeCanvas.renderToBufferSync(configuration);
    const renderTime = bufferSyncTime();
    
    cb(JSON.stringify({
      currentFrame,
      renderTime,
    }));
    
    fs.writeFile(
      `./out/${options.fileName}/${options.fileName}Loop${(currentFrame + 1)
        .toString()
        .padStart(5, "0")}.png`,
      buffer,
      () => {}
    );
  }
};
