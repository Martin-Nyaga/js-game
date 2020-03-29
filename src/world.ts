import * as R from "rambda"

import * as Scene from "./scene"
import * as Events from "./events"
import * as Position from "./position"
import * as Store from "./objectStore"
import { generateMap } from "./mapGen"

import { ObjectId, Player } from "./gameObjects"

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

// Main function to update the world based on all current events
export const update = (sink: Events.Sink, world: World) => {
  let player = getPlayer(world)
  let oldPlayer = R.clone(player)
  let scene = world.scene
  const dirty = []

  // Move the player if needed
  const { moved: playerMoved, player: newPlayer } = movePlayer(
    sink.keys,
    world,
    player
  )
  if (playerMoved) dirty.push(newPlayer)

  // Handle zooming if needed
  if (sink.keys.zoomOut) scene = Scene.zoom(scene, -1)
  if (sink.keys.zoomIn) scene = Scene.zoom(scene, 1)
  Events.flushZoom(sink)

  // Handle mouse clicks if necessary
  if (sink.mouse.down) Scene.handleClick(scene, sink.mouse.coordinates) 

  let objects = Store.markDirty(dirty, world.objects)
  objects = updatePlayer(oldPlayer, newPlayer, objects)

  return {
    ...world,
    objects,
    scene,
  }
}

const movePlayer = (keys, world, player) => {
  let moved = false

  if (keys.up && !isAtTopEnd(world, player)) {
    moved = true
    player = Player.goUp(player)
  }
  if (keys.down && !isAtBottomEnd(world, player)) {
    moved = true
    player = Player.goDown(player)
  }
  if (keys.right && !isAtRightEnd(world, player)) {
    moved = true

    player = Player.goRight(player)
  }
  if (keys.left && !isAtLeftEnd(world, player)) {
    moved = true
    player = Player.goLeft(player)
  }

  return { player, moved }
}

const updatePlayer = (oldPlayer, newPlayer, store) => {
  store = Store.remove(oldPlayer, store)
  return Store.add(newPlayer, store)
}

export const getPlayer = (world: World): Player.Player =>
  Store.getById(world.playerId, world.objects)

const minDistanceToEdge = 0.01
const isAtTopEnd = (_world, object) => object.position.y <= minDistanceToEdge
const isAtLeftEnd = (_world, object) => object.position.x <= minDistanceToEdge
const isAtRightEnd = (world, object) =>
  object.position.x >= world.width - 1 - minDistanceToEdge
const isAtBottomEnd = (world, object) =>
  object.position.y >= world.height - 1 - minDistanceToEdge
