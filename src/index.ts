import cluster from "cluster";
import process from "process";

import { primaryThread } from "./treads/primary.js";
import { workerThread } from "./treads/wokrerThread.js";

const run = async () => {
  
  if (cluster.isPrimary) {
    await primaryThread();
    process.exit(0);
  } else {
    workerThread();
  }
};

run();
