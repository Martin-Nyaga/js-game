import { partial, pipe, range } from "rambda"

import * as Events from "./events"
import * as World from "./world"
import * as Scene from "./scene"

const FPS = 60
const now = () => new Date().getTime()

const gameLoop = (world: World.World, prevTimestamp: number) => {
  const timestamp = now()
  const elapsed = timestamp - prevTimestamp
  if (elapsed < 1000 / FPS)
    return requestAnimationFrame(partial(gameLoop, world, prevTimestamp))
  const nextWorld = pipe(
    partial(World.update, Events.InputSink),
    Scene.render
  )(world)
  requestAnimationFrame(partial(gameLoop, nextWorld, timestamp))
}

const main = () => {
  console.log("Starting...")
  const mapSize = 20
  let world = World.initialWorld({
    scene: {
      canvasWidth: 1500,
      canvasHeight: 1000
    },
    width: mapSize,
    height: mapSize,
  })
  console.log("Created World...", world)
  Scene.init(world)
  console.log("Initialized scene...")
  Events.bindEvents(Events.InputSink, world)
  console.log("Bound input events...")
  gameLoop(world, now())
}

const startButton = document.getElementById("start") as HTMLInputElement
startButton.addEventListener("click", (_e) => {
  startButton.parentElement.removeChild(startButton)
  main()
})
