import fs from "fs";
import { spawn } from 'child_process';

export const audioBackground = (sessions: any[], fileName: string): Promise<void> => {

    return new Promise<void>(resolve => {
        const file = `./out/${fileName}.txt`;
        
        fs.writeFileSync(file, sessions.join(","));

        console.log("\n")
        const ls = spawn("./hr-sound-generator/bin/hr-sound-generator", [fileName, "out"]);
    
        ls.stdout.on("data", data => {
            console.log(`${data}`);
        });
    
        ls.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });
        
        ls.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });
        
        ls.on("close", () => {                        
            fs.rmSync(file);
            resolve();
        });
    })



}
