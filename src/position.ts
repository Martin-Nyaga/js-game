export type Position = {
  x: number
  y: number
}

export const goUp = ({ x, y }, amt) => ({ x, y: y - amt })
export const goDown = ({ x, y }, amt) => ({ x, y: y + amt })
export const goLeft = ({ x, y }, amt) => ({ x: x - amt, y })
export const goRight = ({ x, y }, amt) => ({ x: x + amt, y })
