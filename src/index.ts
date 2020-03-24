import { partial, pipe } from "ramda"
import * as Events from "./events"
import * as World from "./world"
import * as Scene from "./scene"

const FPS = 60
const now = () => new Date().getTime()

const gameLoop = (world: World.World, prevTimestamp: number) => {
  const timestamp = now()
  const elapsed = timestamp - prevTimestamp
  if (elapsed < 1000 / FPS)
    return requestAnimationFrame(partial(gameLoop, [world, prevTimestamp]))
  const nextWorld = pipe(partial(World.update, [Events.InputSink]), Scene.render)(world)
  requestAnimationFrame(partial(gameLoop, [nextWorld, timestamp]))
}

const main = () => {
  let world = World.initialWorld({
    scene: {
      canvasWidth: window.innerWidth - 100,
      canvasHeight: window.innerHeight - 100,
      tilePixelSize: 30
    },
    mapWidth: 300,
    mapHeight: 300
  })
  console.log("World: ", world)
  Scene.init(world)
  Events.bindEvents(Events.InputSink)
  gameLoop(world, now())
}
main()
