import { subtractHourStrings } from "./helpers/time.js";
import { Config } from "./types/config.js";

const config: Config = {
  destinationDirectory: "/input/graphs/dist",
  sources: {
    polarCsv: {
      src: "/input/graphs/polar.CSV",
    },
  },
  secondsAligment: subtractHourStrings({
    cameraTime: "14:24:56",
    deviceTime: "14:23:33",
  }),
  stepResolution: 25,
  audioOnly: false,
  sections: [
    {
      name: "dyn-1",
      startTime: "14:41:10",
      timerStart: "14:41:29",
      timerEnd: "14:44:09",
      endTime: "14:44:30",
      use: {
        polarCsv: {
          label: "HR",
        },
      },
    },
  ],
  devMode: false,
  basedHeight: 1512,
  baseWidth: 2688,
  sizeMultiplier: 1,
};

export default config;
