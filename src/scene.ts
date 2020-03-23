import * as JCSS from "./jcss"
import { World } from "./world"

export const init = (world: World) => {
  const { canvas } = world
  document.body.append(canvas)
  return world
}

const canvasStyle = {
  border: "thick black solid",
  display: "block",
  margin: "100px auto",
}

export const build = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  canvas.setAttribute("style", JCSS.toCss(canvasStyle))
  return canvas
}


// Main function to output the world to the screen
export const render = (world: World) => {
  const { canvas, renderingContext: ctx } = world
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#000"
  ctx.fillRect(world.player.position.x, world.player.position.y, 10, 10)
  return world
}
