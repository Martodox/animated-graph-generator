import { ChartConfiguration, ChartDataset, ChartOptions, ChartTypeRegistry, LegendItem, LinearScaleOptions, ScaleOptionsByType } from "chart.js";
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
const colorO2 = "rgb(38, 84, 124)";
const colorGarmin = "rgb(253, 126, 53)";
const colorPolar = "rgb(161, 60, 2)";

const datasetLine: {[key in DataSource]: any} = {
  "oxiwearCsv": {
    borderColor: colorO2,
    tension: 0.2,
    weight: 3,
    clip: 100,
    borderJoinStyle: "bevel",
    borderWidth: 6,
    pointBackgroundColor: "#18263A",
  },
  "garminFit": {
    borderColor: colorGarmin,
    tension: 0.2,
    weight: 3,
    clip: 100,
    borderJoinStyle: "bevel",
    borderWidth: 10,
    pointBackgroundColor: "#290001",
  },
  "polarCsv": {
    borderColor: colorPolar,
    tension: 0.2,
    weight: 3,
    clip: 100,
    borderJoinStyle: "bevel",
    borderWidth: 10,
    pointBackgroundColor: "#501E01",
  }
}

const scalesConfig: {[key in DataSource]: any} = {
  polarCsv: {
    grid: {
      display: false,
      drawBorder: false,
    },
    ticks: {
      color: colorPolar,
      maxTicksLimit: 5,
      font: {
        weight: "bold",
        size: 50,
      },
    },
  },
  garminFit: {
    grid: {
      display: false,
      drawBorder: false,
    },
    ticks: {
      color: colorGarmin,
      maxTicksLimit: 5,
      font: {
        weight: "bold",
        size: 50,
      },
    },
  },
  oxiwearCsv: {
    position: "right",
    type: "linear",
    min: 60,
    max: 100,
    grid: {
      display: false,
      drawBorder: false,
    },          
    ticks: {
      color: colorO2,
      maxTicksLimit: 4,
      font: {
        weight: "bold",
        size: 50,
      },
    },
  },
}

let scalesUsed: any = {}

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
    const scaleKey = `yAxis${key}`;

    datasets.push({
    label: `${data?.label}: ${dataPoints[
      getCurrentSecond(currentFrame, chartParams.stepResolution)
    ]
      .toString()
      .padStart(3, "0")}`,    
      
    data: dataPoints,    
    normalized: true,    
    yAxisID: scaleKey,
    ...datasetLine[key as DataSource]
    })
    
    scalesUsed = {
      ...scalesUsed,
      [scaleKey]: scalesConfig[key as DataSource]      
    }
    
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
            generateLabels: (chart) => {
              if (chart?.data?.labels?.length && chart.data.datasets.length) {
                return chart.data.datasets.map((dataset) => {
                  const yAsis = (dataset as unknown as any).yAxisID as string;

                  let color = scalesUsed[yAsis] ? scalesUsed[yAsis].ticks.color : "white";
                  return {
                    text: dataset.label,
                    fontColor: color,                
                  } as LegendItem
                });
              }
              return [];
            },
            boxPadding: 20,
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
          radius: (context) => {
            let index = context.dataIndex;
            return index === currentFrame ? 20 : 0;
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
        ...scalesUsed,
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

  const isDevMode = JSON.parse(options.devMode as any);

  const endFrame = isDevMode ? 0 : options.endFrame;

  for (
    let currentFrame = options.startFrame;
    currentFrame <= endFrame;
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
