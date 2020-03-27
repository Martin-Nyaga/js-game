export const constrain = (x: number, min: number, max: number): number => (x < min ? min : x > max ? max : x)
