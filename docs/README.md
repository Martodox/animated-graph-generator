# animated-graph-generator


[Sample graph](graph-sample.mp4 ':include :type=video autoplay loop width=50%')


## What is this?

**animated-graph-generator** is a NodeJS app created for the purpose of generating animated time based data.

It outputs a series of frames that can be later used in a video as an anmiated overlay to present a change in the time series having the whole graph visible at the same time

Config
-----------------------------------

```js
const config: Config = {
  inputFile: "./in/2024-04-05_07-03-01.CSV",
  offsetInSeconds: 8,
  stepResolution: 30,
  textOnly: false,
  sections: [
    {
      name: "graph1",
      startTime: "07:07:43", 
      timerStart: "07:08:10",
      timerEnd: "07:11:12",
      endTime: "07:12:23",
    },
    {
      name: "graph2",
      startTime: "08:13:00", 
      timerStart: "08:13:11",
      timerEnd: "08:17:24",
      endTime: "08:17:39",
      addEndingAudioSeconds: 5

    },
  ],
  devMode: false,
  basedHeight: 1080,
  baseWidth: 1920,
  sizeMultiplier: 1,
};
```



The following options can be changed

- `inputFile` Path to an exported Polar workout csv file
- `offsetInSeconds` In case of GoPro, the internal clock is not always aligned with Polar start timestamp. This offsets the timestrings so you can read out the time straight from GoPro timestamps
- `stepResolution` Number of middlesteps between HR readings. The higher the number, the better the animation is
- `textOnly` Set it to true if you want to only get generate an audio file with HR sound
- `devMode` Set to true if you don't want separate output directories for each run
- `basedHeight` Height of the graph in pixels
- `baseWidth` Width of the graph in pixels
- `sizeMultiplier` Multiplies baseWidth and baseHeigth proportionally

### sections

- `startTime` Simplified time string from which to start the graph
- `endTime` Simplified time string when the graph ends
- `timerStart` Simplified time string from which to start the timer
- `timerEnd` Simplified time string stopping the timer
- `addEndingAudioSeconds` Takes the last HR reading and adds that many seconds to the end of an audio file


