import ffmpeg from "fluent-ffmpeg";
import path from "path";
import config from "./config.js";
import pLimit from "p-limit";
import { getBar } from "./barProgress.js";

interface IProps {
  inputDirectory: string;
  destinationDirectory: string;
  fileName: string;
  numberOfFrames: number;
}

const limit = pLimit(2);

const renderMovie = async (props: IProps) => {
  const fileName = `${props.fileName} - Movie`;

  const bar1 = getBar(fileName);
  bar1.setTotal(props.numberOfFrames);

  const inputPattern = path.join(props.inputDirectory, "img-%05d.png");

  const audio = path.join(props.destinationDirectory, `${props.fileName}.wav`);
  const outputVideo = path.join(
    props.destinationDirectory,
    `${props.fileName}.mov`
  );
  const overlayReadout = path.join("./src/helpers", "readout-background-2k.png");
  const overlayWatermark = path.join("./src/helpers", "watermark.png");
  return new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(overlayReadout)      // [0:v] background
      .input(overlayWatermark)    // [1:v] watermark
      .input(inputPattern)        // [2:v] graph animation frames
      .inputFPS(config.stepResolution)
      .input(audio)
      .inputOption("-hwaccel", "videotoolbox")
      .complexFilter(["[0:v][2:v] overlay=0:0 [tmp1];[tmp1][1:v] overlay=0:0 [v]"])  
      .outputOptions([
        "-map [v]",
        "-map 3:a:0", // Map the audio track from the audio file
        `-r ${config.stepResolution}`,
        "-pix_fmt yuva444p10le",
        "-profile:v 4444",
        `-s ${config.baseWidth}x${config.basedHeight}`,
        "-c:a aac", // Encode audio in AAC format (compatible with MOV)
        "-b:a 192k", // Set audio bitrate for good quality
        "-ar 48000",
        "-shortest",
      ])
      .videoCodec("prores_ks")
      .output(outputVideo)
      .on("start", () => {})
      .on("progress", (progress) => {
        bar1.update(progress.frames);
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err.message);
      })
      .run();
  });
};

const scheduleMovieRender = async (
  props: IProps,
  finishCallback: () => void
) => {
  await limit(() => renderMovie(props));
  finishCallback();
};

export { scheduleMovieRender };
