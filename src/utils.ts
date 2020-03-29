export const constrain = (x: number, min: number, max: number): number => (x < min ? min : x > max ? max : x)

export const random = (min: number, max: number): number => min + Math.random() * (max - min)

export const average = arr => arr.reduce((sum, x) => sum + x, 0) / arr.length
