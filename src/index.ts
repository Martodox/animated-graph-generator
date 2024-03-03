import cluster from "cluster";

import { primaryThread } from "./treads/primary.js";
import { workerThread } from "./treads/wokrerThread.js";

if (cluster.isPrimary) {
  primaryThread();
} else {
  workerThread();
}
