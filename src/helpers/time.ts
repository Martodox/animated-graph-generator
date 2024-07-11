export const getTimerFromSecondsElapsed = (seconds: number) => {
    const date = new Date(`2000-01-01T00:00:00.000Z`).getTime();

    const newDate = new Date(date + seconds * 1000);
    return `${newDate.getMinutes().toString().padStart(2, "0")}:${newDate.getSeconds().toString().padStart(2, "0")}`
}


export const getSecondsFromHourString = (input: string, offsetInSeconds: number = 0) => {
    const date = new Date(`2000-01-01:${input}`);
    return Math.floor(date.getTime()/1000) + (offsetInSeconds);    
} 







//////////////////////////////


export const parsePolarTime = (timeString: string): number => {
    const split = timeString.split(":")
    return new Date(`2000-01-01T${split[0]}:${split[1]}:${split[2]}.000Z`).getTime();
}

export const polarTimeToSrtTimeChunks = (polarTime: number, offset: number = 0) => {
        const time = new Date(polarTime + offset);
        const isoString = time.toISOString().split("T")[1].replace("Z", "");
        const hours = isoString.split(":")[0];
        const minutes = isoString.split(":")[1];
        const seconds = isoString.split(":")[2].split(".")[0]
        const miliseconds = isoString.split(":")[2].split(".")[1]

        return {
            hours,
            minutes,
            seconds,
            miliseconds
        }
};

export const srtTimeChunksToTimeString = (chunks: any) => {
    return `${chunks.hours}:${chunks.minutes}:${chunks.seconds},${chunks.miliseconds}`
}






