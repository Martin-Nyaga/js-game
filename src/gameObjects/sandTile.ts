import { GameObject } from "."

export interface SandTile extends GameObject {
  type: "sandTile"
  variant: 1 | 2 | 3 | 4 | 5
  size: 1
}

export const is = (object: GameObject) => object.type == "sandTile"

const toRgb = (arr) => `rgb(${arr.join(",")})`
export const color = (tile: SandTile) =>
  toRgb([
    240 - tile.variant * 3,
    178 - tile.variant * 5,
    122 - tile.variant * 2,
  ])
