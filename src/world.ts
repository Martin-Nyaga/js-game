import { range, clone, compose } from "ramda"

import * as Scene from "./scene"
import * as Events from "./events"
import * as Position from "./position"
import * as Store from "./objectStore"

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
  objects: Store.ObjectStore
  playerPosition: Position.Position
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
  let objects = generateMap(mapWidth, mapHeight)
  const playerPosition: Position.Position = {
    x: Math.floor(mapWidth / 2),
    y: Math.floor(mapHeight / 2),
  }
  const player = Player.newPlayer({
    position: playerPosition,
  })
  objects = Store.add(player, objects)

  return {
    scene: builtScene,
    objects,
    playerPosition,
    width: mapWidth,
    height: mapHeight,
  }
}

const objectId = () => Math.floor(Math.random() * 8)

const generateMap = (width, height): Store.ObjectStore =>
  range(0, width * height).reduce((store, i) => {
    const x = i % width
    const y = Math.floor(i / height)

    let tile
    if (x > width / 2) {
      if (y > height / 2) {
        tile = {
          id: objectId(),
          type: "sandTile",
          position: { x, y } as Position.Position,
          size: 1,
          variant: Math.ceil(Math.random() * 5),
        } as SandTile.SandTile
      } else {
        tile = {
          id: objectId(),
          type: "waterTile",
          position: { x, y } as Position.Position,
          size: 1,
          variant: Math.ceil(Math.random() * 5),
        } as WaterTile.WaterTile
      }
    } else {
      tile = {
        id: objectId(),
        type: "grassTile",
        position: { x, y } as Position.Position,
        size: 1,
        variant: Math.ceil(Math.random() * 5),
      } as GrassTile.GrassTile
    }
    return Store.add(tile, store)
  }, {})

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let player = getPlayer(world)
  let oldPlayer = clone(player)
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
    playerPosition: player.position,
    objects: updatePlayer(world.objects, oldPlayer, player),
  }
}

const updatePlayer = (objects, oldPlayer, newPlayer) => {
  objects = Store.add(newPlayer, objects)
  return Store.remove(oldPlayer, objects)
}

const getPlayer = (world: World): Player.Player =>
  Store.get(world.playerPosition, world.objects).find(Player.is)

const minDistanceToEdge = 0.01
const isAtTopEnd = (_world, object) => object.position.y <= minDistanceToEdge
const isAtLeftEnd = (_world, object) => object.position.x <= minDistanceToEdge
const isAtRightEnd = (world, object) =>
  object.position.x >= world.width - 1 - minDistanceToEdge
const isAtBottomEnd = (world, object) =>
  object.position.y >= world.height - 1 - minDistanceToEdge
