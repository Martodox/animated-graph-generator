import { Config } from "./types/config.js";

const config: Config = {
  sources: {
    polarCsv: {
      src: "./in/Karolina.CSV",
    }
    // garminFit: {
    //   src: "./in/15411374432_ACTIVITY.fit",
    // }
    // oxiwearCsv: {
    //   src: "./in/export-2024-05-17_15_00_00-19_00_00_805c50c9-a7bf-4813-adf4-5a0543951542.csv",
    // }
  },
  secondsAligment: 27,
  stepResolution: 30,
  textOnly: false,
  sections: [
    {
      name: "section-1",
      startTime: "07:05:49",
      timerStart: "07:06:12",
      timerEnd: "07:09:11",
      endTime: "07:09:30",
      use: {
        polarCsv: { 
          label: "elo",
        }
      }
    }
  ],
  devMode: false,
  basedHeight: 1080,
  baseWidth: 1920,
  sizeMultiplier: 1,
};

export default config;
