import cliProgress, { SingleBar } from "cli-progress";

const bars: {
  [key: string]: SingleBar;
} = {};

const multibar = new cliProgress.MultiBar(
  {
    etaBuffer: 1000,
    clearOnComplete: false,
    stopOnComplete: true,
    autopadding: true,
    forceRedraw: false,
    emptyOnZero: true,
    format: "{bar} | {filename} | {value}/{total} | ETA: {eta_formatted}",
  },
  cliProgress.Presets.shades_classic
);

const createBar = (fileName: string) => {
  bars[fileName] = multibar.create(9999, 0, {
    filename: fileName,
  });
  return bars[fileName];
};

const getBar = (fileName: string) => {
  return bars[fileName];
};

export { multibar, createBar, getBar };
