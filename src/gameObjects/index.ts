import * as Position from "../position"

export interface GameObject {
  type: string
  position: Position.Position
  size: number
}

export * as Player from "./player"
export * as EmptyTile from "./emptyTile"
export * as GrassTile from "./grassTile"
export * as SandTile from "./sandTile"
export * as WaterTile from "./waterTile"
