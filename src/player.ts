import * as Position from "./position"

export type Player = {
  position: Position.Position
}

export const newPlayer = (): Player => ({
  position: {
    x: 100,
    y: 100,
  },
})

export const goUp = (player: Player) => ({
  ...player,
  position: Position.goUp(player.position),
})
export const goDown = (player: Player) => ({
  ...player,
  position: Position.goDown(player.position),
})
export const goRight = (player: Player) => ({
  ...player,
  position: Position.goRight(player.position),
})
export const goLeft = (player: Player) => ({
  ...player,
  position: Position.goLeft(player.position),
})
