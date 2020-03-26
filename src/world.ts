import * as R from "ramda"

import * as Scene from "./scene"
import * as Events from "./events"
import * as Position from "./position"
import * as Store from "./objectStore"

import {
  GameObject,
  ObjectId,
  objectId,
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
  playerId: ObjectId
}

type WorldConfig = {
  scene: Scene.SceneConfig
  width: number
  height: number
}
export const initialWorld = ({ scene, width, height }: WorldConfig): World => {
  const builtScene = Scene.build(scene)
  let objects = generateMap(width, height)
  const playerPosition: Position.Position = {
    x: Math.floor(width / 2),
    y: Math.floor(height / 2),
  }
  const player = Player.newPlayer({
    position: playerPosition,
  })
  objects = Store.add(player, objects)

  return {
    scene: builtScene,
    playerId: player.id,
    width: width,
    height: height,
    objects,
  }
}

const generateMap = (width, height): Store.ObjectStore =>
  R.range(0, width * height).reduce((store, i) => {
    const x = i % width
    const y = Math.floor(i / height)

    let tile = {
      id: objectId(),
      type: "grassTile",
      position: { x, y } as Position.Position,
      size: 1,
      variant: Math.ceil(Math.random() * 5),
    } as GrassTile.GrassTile
    return Store.add(tile, store)
  }, Store.empty() as Store.ObjectStore)

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let player = getPlayer(world)
  let oldPlayer = R.clone(player)
  let scene = world.scene
  const dirty = []

  const { moved: playerMoved, player: newPlayer } = movePlayer(
    sink.keysPressed,
    world,
    player
  )
  if (playerMoved) dirty.push(newPlayer)

  // if (sink.keysPressed.zoomOut) scene = Scene.zoom(scene, -1)
  // if (sink.keysPressed.zoomIn) scene = Scene.zoom(scene, 1)
  let objects = Store.markDirty(dirty, world.objects)
  objects = updatePlayer(oldPlayer, newPlayer, objects)

  return {
    ...world,
    objects,
    scene,
  }
}

const movePlayer = (keysPressed, world, player) => {
  let moved = false

  if (keysPressed.up && !isAtTopEnd(world, player)) {
    moved = true
    player = Player.goUp(player)
  }
  if (keysPressed.down && !isAtBottomEnd(world, player)) {
    moved = true
    player = Player.goDown(player)
  }
  if (keysPressed.right && !isAtRightEnd(world, player)) {
    moved = true

    player = Player.goRight(player)
  }
  if (keysPressed.left && !isAtLeftEnd(world, player)) {
    moved = true
    player = Player.goLeft(player)
  }

  return { player, moved }
}

const updatePlayer = R.curry((oldPlayer, newPlayer, store) =>
  R.pipe(Store.remove(oldPlayer), Store.add(newPlayer))(store)
)

export const getPlayer = (world: World): Player.Player =>
  Store.getById(world.playerId, world.objects)

const minDistanceToEdge = 0.01
const isAtTopEnd = (_world, object) => object.position.y <= minDistanceToEdge
const isAtLeftEnd = (_world, object) => object.position.x <= minDistanceToEdge
const isAtRightEnd = (world, object) =>
  object.position.x >= world.width - 1 - minDistanceToEdge
const isAtBottomEnd = (world, object) =>
  object.position.y >= world.height - 1 - minDistanceToEdge
