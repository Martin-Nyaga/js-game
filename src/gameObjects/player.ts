import * as Position from "../position"
import { GameObject, objectId } from "."

export interface Player extends GameObject {
  type: "player"
  speed: number // player speed in tiles per frame
}

export const newPlayer = ({
  position,
}: {
  position: Position.Position
}): Player => ({
  id: objectId(),
  type: "player",
  position: position,
  size: 1,
  speed: 0.3,
})
export const isPlayer = (object: GameObject) => object.type == "player"
export const is = isPlayer 

export const goUp = (player: Player) => ({
  ...player,
  position: Position.goUp(player.position, player.speed),
})
export const goDown = (player: Player) => ({
  ...player,
  position: Position.goDown(player.position, player.speed),
})
export const goRight = (player: Player) => ({
  ...player,
  position: Position.goRight(player.position, player.speed),
})
export const goLeft = (player: Player) => ({
  ...player,
  position: Position.goLeft(player.position, player.speed),
})
