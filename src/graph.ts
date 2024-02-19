import { ChartConfiguration } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { getTimerFromSecondsElapsed } from "./helpers/time.js";
import { ChartParams, GraphOptions } from "./types/graph.js";

const getConfigurationForIndex = (
  currentFrame: number,
  chartParams: ChartParams
): ChartConfiguration => {
  return {
    type: "line",
    data: {
      labels: chartParams.label,
      datasets: [
        {
          normalized: true,
          label: `Apnea: ${getTimer(
            currentFrame,
            chartParams.stepResolution,
            chartParams.timerStartSecond,
            chartParams.timerStoptSecond
          )}`,
          data: [],
          yAxisID: "yAxis2",
        },
        {
          label: `HR: ${chartParams.data[
            getCurrentSecond(currentFrame, chartParams.stepResolution)
          ]
            .toString()
            .padStart(3, "0")}`,
          data: chartParams.data,
          normalized: true,
          borderColor: "rgb(225, 112, 0)",
          tension: 0.2,
          weight: 3,
          yAxisID: "yAxis",
          borderJoinStyle: "bevel",
          borderWidth: chartParams.lineWidth,
        },
      ],
    },
    options: {
      layout: {
        padding: chartParams.padding,
      },
      plugins: {
        legend: {
          align: "end",
          labels: {
            color: "white",
            boxHeight: 0,
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
        yAxis: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "white",
            maxTicksLimit: 5,
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

export const renderGraph = async (options: GraphOptions, cb: (msg: any) => void) => {



  const baseWidth = 1920;
  const basedHeight = 1080;
  const chartParams: ChartParams = {
    label: options.sessions,
    data: options.sessions,
    stepResolution: options.stepResolution,
    width: baseWidth * options.sizeMultiplier,
    height: basedHeight * options.sizeMultiplier,
    datasetLabelsize: options.datasetLabelsize * options.sizeMultiplier,
    axisLabelSize: options.axisLabelSize * options.sizeMultiplier,
    timeKnobSize: options.timeKnobSize * options.sizeMultiplier,
    padding: options.padding * options.sizeMultiplier,
    lineWidth: options.lineWidth * options.sizeMultiplier,
    timerStartSecond: options.timerStartSecond,
    timerStoptSecond: options.timerStoptSecond,
  };

  const framesToRender = options.endFrame - options.startFrame + 1;



  const backgroundColour = "transparent";



  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chartParams.width,
    height: chartParams.height,
    backgroundColour,
  });

  for (let currentFrame = options.startFrame; currentFrame <= options.endFrame; currentFrame++) {

      const configuration = getConfigurationForIndex(currentFrame, chartParams);
  
      const buffer = chartJSNodeCanvas.renderToBufferSync(configuration);
      cb(currentFrame);
      fs.writeFile(
        `./out/${options.fileName}/FrameLoop${(currentFrame + 1)
          .toString()
          .padStart(5, "0")}.png`,
        buffer, () => {}
      );      

          // console.log(currentFrame);
    

    // bar1.update(currentFrame);
  }
  // bar1.update(framesToRender);
  // bar1.stop();
};
