import { GameObject } from "."

export interface Tree extends GameObject {
  type: "tree",
  size: 4
}

export const is = obj => obj.type == "tree"
