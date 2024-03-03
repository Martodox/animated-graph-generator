# polar-animated-graph-generator

![Sample graph](example.png "Sample graph")

```js
const config: Config = {
    inputFile: "./in/2024-02-28_08-23-34.CSV",
    startTime: "09:14:15",
    timerStart: "09:14:29",
    timerEnd: "09:16:35",
    endTime: "09:16:50",    
    offsetInSeconds: 20,
    stepResolution: 3,
    textOnly: false,    
    devMode: true,
    basedHeight: 1080,
    baseWidth: 1920,
    sizeMultiplier: 1,
}
```

Config
-----------------------------------

The following options can be changed

- `inputFile` Path to an exported Polar workout csv file
- `startTime` Simplified time string from which to start the graph
- `endTime` Simplified time string when the graph ends
- `timerStart` Simplified time string from which to start the timer
- `timerEnd` Simplified time string stopping the timer
- `offsetInSeconds` In case of GoPro, the internal clock is not always aligned with Polar start timestamp. This offsets the timestrings so you can read out the time straight from GoPro timestamps
- `stepResolution` Number of middlesteps between HR readings. The higher the number, the better the animation is
- `textOnly` Set it to true if you want to only get raw data for an audiofile
- `devMode` Set to true if you don't want separate output directories for each run
- `basedHeight` 
- `baseWidth` 
- `sizeMultiplier` Multiplies baseWidth and baseHeigth proportionally



