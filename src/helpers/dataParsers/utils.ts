import { KeyedDataset } from "../../types/dataparsers.js";

export const fillZeroWithPrevNonNull = (set: KeyedDataset): KeyedDataset => {
    const keys = Object.keys(set);

    let prevNotNull = set[+keys[0]];
    let prevNotNullIndex = 0;
    while (prevNotNull === 0) {        
        prevNotNull = set[+keys[prevNotNullIndex++]];
    }

    for (const key in set) {
        prevNotNull = set[key] === 0 ? prevNotNull : set[key];
        set[key] = prevNotNull
    }

    return set;
}