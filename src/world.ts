import * as Player from "./player"
import * as Scene from "./scene"
import * as Events from "./events"

export type World = {
  canvas: HTMLCanvasElement
  renderingContext: CanvasRenderingContext2D
  player: Player.Player
}

export const initialWorld = (): World => {
  const canvas = Scene.build(1200, 800)
  const renderingContext = canvas.getContext("2d")
  return {
    canvas,
    renderingContext,
    player: Player.newPlayer(),
  }
}

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let { player } = world
  if (sink.keysPressed.up) player = Player.goUp(player)
  if (sink.keysPressed.down) player = Player.goDown(player)
  if (sink.keysPressed.right) player = Player.goRight(player)
  if (sink.keysPressed.left) player = Player.goLeft(player)
  return { ...world, player }
}
