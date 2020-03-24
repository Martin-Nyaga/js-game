import { GameObject } from "."

export interface GrassTile extends GameObject {
  type: "grassTile"
  variant: 1 | 2 | 3 | 4 | 5
  size: 1
}

export const is = (object: GameObject) => object.type == "grassTile"

const toRgb = (arr) => `rgb(${arr.join(",")})`
export const color = (tile: GrassTile) =>
  toRgb([34, 153 + 5 * tile.variant, 84])
