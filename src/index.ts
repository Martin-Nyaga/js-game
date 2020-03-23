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
  let world = World.initialWorld()
  Scene.init(world)
  Events.bindEvents(Events.InputSink)
  gameLoop(world, now())
}
main()
