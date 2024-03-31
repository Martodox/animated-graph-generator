import { Config } from "./types/config.js";

const config: Config = {
    inputFile: "./in/02-07_08-24-58.CSV",
    offsetInSeconds: 20,
    stepResolution: 30,
    textOnly: true,
    devMode: false,
    sections: [
        {
          name: "4",
          startTime: "07:24:59",
          timerStart: "07:25:23",
          timerEnd: "07:30:01",
          endTime: "07:30:14",
        },
        {
          name: "5",
          startTime: "07:32:43",
          timerStart: "07:33:04",
          timerEnd: "07:38:08",
          endTime: "07:38:27",
          addEndingAudioSeconds: 20
        },
      ],
    basedHeight: 1080,
    baseWidth: 1920,
    sizeMultiplier: 1,
}

export default config;
