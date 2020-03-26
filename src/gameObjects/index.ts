import * as Position from "../position"

export type ObjectId = string
export interface GameObject {
  id: ObjectId,
  type: string
  position: Position.Position
  size: number
}

export const objectId = (): ObjectId => Math.random().toString(16).substr(2, 9)

export * as Player from "./player"
export * as EmptyTile from "./emptyTile"
export * as GrassTile from "./grassTile"
export * as SandTile from "./sandTile"
export * as WaterTile from "./waterTile"
