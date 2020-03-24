import { GameObject } from "."

export interface EmptyTile extends GameObject {
  type: "emptyTile"
  size: 1
}

export const is = (object: GameObject) => object.type == "emptyTile"

