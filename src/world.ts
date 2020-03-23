import * as Player from "./player"
import * as Scene from "./scene"
import * as Events from "./events"
import * as Position from "./position"
import { range } from "ramda"

export interface GameObject {
  type: string
  position: Position.Position
  size: number
}
export type World = {
  scene: Scene.Scene
  width: number
  height: number
  objects: GameObject[]
}
interface EmptyTile extends GameObject {
  type: "emptyTile"
  label: string
}

const buildEmptyTiles = (width, height) =>
  range(0, width * height).map((i) => {
    const x = i % width
    const y = Math.floor(i / height)
    return {
      type: "emptyTile",
      position: { x, y } as Position.Position,
      label: i.toString(),
      size: 1,
    } as EmptyTile
  })

type WorldConfig = {
  scene: Scene.SceneConfig
  mapWidth: number
  mapHeight: number
}
export const initialWorld = ({
  scene,
  mapWidth,
  mapHeight,
}: WorldConfig): World => {
  const builtScene = Scene.build(scene)
  const emptyLabelledTiles = buildEmptyTiles(mapWidth, mapHeight)
  return {
    scene: builtScene,
    objects: (emptyLabelledTiles as GameObject[]).concat(Player.newPlayer()),
    width: mapWidth,
    height: mapHeight,
  }
}

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let player = getPlayer(world)
  if (sink.keysPressed.up) player = Player.goUp(player)
  if (sink.keysPressed.down) player = Player.goDown(player)
  if (sink.keysPressed.right) player = Player.goRight(player)
  if (sink.keysPressed.left) player = Player.goLeft(player)
  const scene = Scene.followObject(world.scene, player)
  return { ...world, scene: scene, objects: replacePlayer(world.objects, player) }
}

const replacePlayer = (objects, newPlayer) =>
  objects.map((object) => (Player.isPlayer(object) ? newPlayer : object))
const getPlayer = (world) => world.objects.find(Player.isPlayer)
