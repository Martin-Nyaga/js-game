import * as Scene from "./scene"
import * as Events from "./events"
import * as Position from "./position"
import { range } from "ramda"

import {
  GameObject,
  Player,
  GrassTile,
  SandTile,
  WaterTile,
} from "./gameObjects"

export type World = {
  scene: Scene.Scene
  width: number
  height: number
  objects: GameObject[]
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

  return {
    scene: builtScene,
    objects: generateMap(mapWidth, mapHeight).concat(
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

const generateMap = (width, height): GameObject[] =>
  range(0, width * height).map((i) => {
    const x = i % width
    const y = Math.floor(i / height)

    if (x > width / 2) {
      if (y > height / 2) {
        return {
          type: "sandTile",
          position: { x, y } as Position.Position,
          size: 1,
          variant: Math.ceil(Math.random() * 5),
        } as SandTile.SandTile
      } else {
        return {
          type: "waterTile",
          position: { x, y } as Position.Position,
          size: 1,
          variant: Math.ceil(Math.random() * 5),
        } as WaterTile.WaterTile
      }
    } else {
      return {
        type: "grassTile",
        position: { x, y } as Position.Position,
        size: 1,
        variant: Math.ceil(Math.random() * 5),
      } as GrassTile.GrassTile
    }
  })

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let player = getPlayer(world)
  let scene = world.scene

  if (sink.keysPressed.up && !isAtTopEnd(world, player))
    player = Player.goUp(player)
  if (sink.keysPressed.down && !isAtBottomEnd(world, player))
    player = Player.goDown(player)
  if (sink.keysPressed.right && !isAtRightEnd(world, player))
    player = Player.goRight(player)
  if (sink.keysPressed.left && !isAtLeftEnd(world, player))
    player = Player.goLeft(player)
  if (sink.keysPressed.zoomOut) scene = Scene.zoom(scene, -1)
  if (sink.keysPressed.zoomIn) scene = Scene.zoom(scene, 1)

  scene = Scene.followObject(scene, player)
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
