import { PolarSession } from "./types/Polar.js";
import fs from "fs";

export const jsonArray = (sessions: any[], fileName: string) => {

    fs.writeFileSync(`./out/${fileName}.txt`, sessions.join(","));

}
