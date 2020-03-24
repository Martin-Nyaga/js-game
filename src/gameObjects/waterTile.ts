import { GameObject } from "."

export interface WaterTile extends GameObject {
  type: "waterTile"
  variant: 1 | 2 | 3 | 4 | 5
  size: 1
}

export const is = (object: GameObject) => object.type == "waterTile"

const toRgb = (arr) => `rgb(${arr.join(",")})`
export const color = (tile: WaterTile) =>
  toRgb([
    30 + tile.variant * 3,
    136 + tile.variant * 5,
    229 + tile.variant * 2,
  ])
