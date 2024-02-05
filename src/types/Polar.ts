export interface PolarSession {
    Time: string;
    "HR (bpm)": string;
}

export interface PolarMeta {
    Name: string,
    Date: string,
    'Start time': string,
    Duration: string,    
    'Average heart rate (bpm)': string,
    'Height (cm)': string,
    'Weight (kg)': string,
}

export interface PolarTime {
    hours: number, 
    minutes: number, 
    seconds: number
}
