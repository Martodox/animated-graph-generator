import fs from "fs";
import { spawn } from 'child_process';

export const audioBackground = (sessions: any[], fileName: string, addEndingAudioSeconds: number = 0): Promise<void> => {

    return new Promise<void>(resolve => {
        const file = `./out/${fileName}.txt`;
        
        const sessionsExtended = [...sessions];

        for (let i = 0; i < addEndingAudioSeconds; i++) {
            sessionsExtended.push(sessionsExtended[sessionsExtended.length - 1])
        }

        fs.writeFileSync(file, sessionsExtended.join(","));

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
