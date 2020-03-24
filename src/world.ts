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
    objects: (emptyLabelledTiles as GameObject[]).concat(
      Player.newPlayer({
        position: {
          x: mapWidth / 2,
          y: mapHeight / 2,
        } as Position.Position,
      })
    ),
    width: mapWidth,
    height: mapHeight,
  }
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

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let player = getPlayer(world)
  if (sink.keysPressed.up && !isAtTopEnd(world, player))
    player = Player.goUp(player)
  if (sink.keysPressed.down && !isAtBottomEnd(world, player))
    player = Player.goDown(player)
  if (sink.keysPressed.right && !isAtRightEnd(world, player))
    player = Player.goRight(player)
  if (sink.keysPressed.left && !isAtLeftEnd(world, player))
    player = Player.goLeft(player)
  const scene = Scene.followObject(world.scene, player)
  return {
    ...world,
    scene: scene,
    objects: replacePlayer(world.objects, player),
  }
}

const replacePlayer = (objects, newPlayer) =>
  objects.map((object) => (Player.isPlayer(object) ? newPlayer : object))

const getPlayer = (world) => world.objects.find(Player.isPlayer)

const minDistanceToEdge = 0.01
const isAtTopEnd = (_world, object) => object.position.y <= minDistanceToEdge
const isAtLeftEnd = (_world, object) => object.position.x <= minDistanceToEdge
const isAtRightEnd = (world, object) =>
  object.position.x >= world.width - 1 - minDistanceToEdge
const isAtBottomEnd = (world, object) =>
  object.position.y >= world.height - 1 - minDistanceToEdge
