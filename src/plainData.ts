import { PolarSession } from "./types/Polar.js";
import fs from "fs";

export const jsonArray = (sessions: any[]) => {

    fs.writeFileSync("./out/data.txt", sessions.join(","));

}
