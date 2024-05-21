import { Config } from "./types/config.js";

const config: Config = {
  sources: {
    polarCsv: "./in/PolarExport_2024-05-10_06-59-01.CSV",
    garminFit: "./in/15411374432_ACTIVITY.fit",
    oxiwearCsv: "./in/export-2024-05-17_15_00_00-19_00_00_805c50c9-a7bf-4813-adf4-5a0543951542.csv",
  },
  offsetInSeconds: 27,
  stepResolution: 30,
  textOnly: false,
  sections: [
    {
      name: "section-1",
      startTime: "08:31:29", 
      timerStart: "08:31:50", 
      timerEnd: "08:36:09",
      endTime: "08:36:35",
      use: [
        {
          source: "polarCsv"
        }
      ]
    },
    {
      name: "section-2",
      startTime: "08:31:29", 
      timerStart: "08:31:50", 
      timerEnd: "08:36:09",
      endTime: "08:36:35",
      use: [
        {
          source: "polarCsv",
          offsetInSeconds: 2,
          label: "hearth rate"
        },
        {
          source: "polarCsv"
        },
        {
          source: "polarCsv"
        }
      ]
    },
  ],
  devMode: false,
  basedHeight: 1080,
  baseWidth: 1920,
  sizeMultiplier: 1,
};

export default config;
