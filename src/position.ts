export type Position = {
  x: number
  y: number
}

export const goUp = ({ x, y }) => ({ x, y: y - 1 })
export const goDown = ({ x, y }) => ({ x, y: y + 1 })
export const goLeft = ({ x, y }) => ({ x: x - 1, y })
export const goRight = ({ x, y }) => ({ x: x + 1, y })
