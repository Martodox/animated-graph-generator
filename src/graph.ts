import { ChartConfiguration } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { createCanvas, loadImage } from "canvas";
import cliProgress from "cli-progress";
import GIFEncoder from "gifencoder";
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
          label: `Apnea: ${getTimer(currentFrame, chartParams.timerStartSecond, chartParams.timerStoptSecond)}`,
          data: [],
          yAxisID: "yAxis2",
        },
        {
          label: `HR: ${chartParams.data[currentFrame].toString().padStart(3, "0")}`,
          data: chartParams.data,
          borderColor: "rgb(225, 112, 0)",
          tension: 0.2,
          weight: 3,
          yAxisID: "yAxis",
          borderJoinStyle: "bevel",
          borderWidth: chartParams.lineWidth
        },
      ],
    },
    options: {
      
      layout: {
        padding: chartParams.padding
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
            }
          }
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
            display: false
          }
        },
        yAxis: {          
          grid: {
            display: false
          },
          ticks: {
            color: "white",
            maxTicksLimit: 5,
            font: {
              size: chartParams.axisLabelSize
            },
          },
        },
        yAxis2: {          
          display: false,
          ticks: {display: false}          
        },
      },
    },
  };
};

const getTimer = (currentSecond: number, start: number = 0, stop: number = Infinity) => {

  let second = 0;

  if (currentSecond >= start && currentSecond < stop) {    
    second = currentSecond - start + 1;
    
  } 
  
  if (currentSecond >= stop) {
    second = stop - start + 1;
  }
  
  return getTimerFromSecondsElapsed(second);

}

export const renderGraph = async (options: GraphOptions) => {
  const label = options.sessions.map((val) => val.Time);
  const data = options.sessions.map((val) => +val["HR (bpm)"]);

  const baseWidth = 1920;
  const basedHeight = 1080;

  const chartParams: ChartParams = {
    label,
    data,
    width: baseWidth * options.sizeMultiplier,
    height: basedHeight * options.sizeMultiplier,
    datasetLabelsize: options.datasetLabelsize * options.sizeMultiplier,
    axisLabelSize: options.axisLabelSize * options.sizeMultiplier,
    timeKnobSize: options.timeKnobSize * options.sizeMultiplier,
    padding: options.padding * options.sizeMultiplier,
    lineWidth: options.lineWidth * options.sizeMultiplier,
    timerStartSecond: options.timerStartSecond,
    timerStoptSecond: options.timerStoptSecond
  }

  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar1.start(chartParams.data.length, 0);
  
  const backgroundColour = "transparent";

  const encoder = new GIFEncoder(chartParams.width, chartParams.height);

  const fileName = options.devMode ? "chart" : `chart - ${new Date().toISOString()}`;
  const quality = options.devMode ? 255 : 10;
  const delay = options.devMode ? 100 : 1000;


  encoder.createReadStream().pipe(fs.createWriteStream(`./out/${fileName}.gif`));
  

  encoder.start();
  encoder.setTransparent("#000000");
  encoder.setRepeat(0);
  encoder.setDelay(delay);
  encoder.setQuality(10);

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chartParams.width,
    height: chartParams.height,
    backgroundColour,
  });



  for (let currentFrame = 0; currentFrame < data.length; currentFrame++) {
    const canvas = createCanvas(chartParams.width, chartParams.height);

    const configuration = getConfigurationForIndex(currentFrame, chartParams);

    const buffer = chartJSNodeCanvas.renderToBufferSync(configuration);

    if (currentFrame === 0) {
      fs.writeFileSync("./out/chart.png", buffer);
    }


    const chartCanvas = await loadImage(buffer);

    let ctx = canvas.getContext("2d");

    ctx.drawImage(chartCanvas, 0, 0, chartParams.width, chartParams.height);
  
    encoder.addFrame(canvas.getContext("2d") as any);
    bar1.update(currentFrame);
  }
  bar1.update(data.length);
  bar1.stop();
  encoder.finish();
};
