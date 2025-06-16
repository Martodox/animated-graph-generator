import { subtractHourStrings } from "./helpers/time.js";
import { Config } from "./types/config.js";

const config: Config = {
  // Directory where both intermediate data such as frame images and sound wave
  // will be written as well as the final overlay video:
  destinationDirectory: "/input/graphs/dist",
  // where to get the heart rate data from:
  sources: {
    // polarCsv or garminFit:
    polarCsv: {
      // path to polar .CSV file or Garmin .fit file:
      src: "/input/graphs/polar.CSV",
    },
  },
  // used to correct time differences between camera and device logging HRM data
  secondsAligment: subtractHourStrings({
    // time stamp on video from camera
    cameraTime: "14:24:56",
    // time stamp at same time
    // on device logging HRM data eg. phone or watch
    deviceTime: "14:23:33",
  }),

  // Number of middlesteps between HR readings.
  // The higher the number, the better the animation is.
  stepResolution: 25,

  // Don't generate animation, only audio heart beat?
  audioOnly: false,

  // You can generate several videos for one workout, called sections:
  sections: [
    // Each section should be a few minutes long. Longer sections
    // would generate too many frame images.
    // To generate more than one video from the same HRM data.
    // duplicate the below and edit as needed.
    // Make sure to duplicate also the trailing comma after the
    // curly brackets.
    {
      //this will be the name of the generated video
      //in this case dyn-1.mov in destinationDirectory
      name: "dyn-1",

      //times here refer to camera time.
      //this is the start time of the video.
      startTime: "14:41:10",
      //this is the start and end time of the timer
      // eg. when the diver submerges and emerges from water.
      timerStart: "14:41:29",
      timerEnd: "14:44:09",
      //end time of the video.
      endTime: "14:44:30",
      //refers to sources above
      use: {
        polarCsv: {
          label: "HR",
        },
      },
    },
  ],
  // devMode (development mode) true can be helpful for debugging.
  devMode: false,
  // Height and width of the graph in pixels
  basedHeight: 1512,
  baseWidth: 2688,

  // Multiplies both baseWidth and baseHeight proportionally
  sizeMultiplier: 1,
};

export default config;
