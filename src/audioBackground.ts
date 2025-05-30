import fs from "fs";
import { spawn } from "child_process";
import config from "./config.js";
export const audioBackground = (
  sessions: any[],
  fileName: string,
  appendAudioSeconds: number = 0,
  prependAudioSeconds: number = 0
): Promise<void> => {
  return new Promise<void>((resolve) => {
    const file = `${config.destinationDirectory}/${fileName}.txt`;
    const sessionsExtended = [...sessions];

    for (let i = 0; i < prependAudioSeconds; i++) {
      sessionsExtended.unshift(sessionsExtended[0]);
    }

    for (let i = 0; i < appendAudioSeconds; i++) {
      sessionsExtended.push(sessionsExtended[sessionsExtended.length - 1]);
    }

    fs.writeFileSync(file, sessionsExtended.join(","));

    const ls = spawn("./hr-sound-generator/bin/hr-sound-generator", [
      fileName,
      config.destinationDirectory,
    ]);

    ls.stdout.on("data", (data) => {
      // console.log(`${data}`);
    });

    ls.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    ls.on("error", (error) => {
      console.log(`error: ${error.message}`);
    });

    ls.on("close", () => {
      fs.rmSync(file);
      resolve();
    });
  });
};
