import {
  GameObject,
  Player,
  EmptyTile,
  GrassTile,
  SandTile,
  WaterTile,
} from "./gameObjects"
import { Position } from "./position"
import * as Store from "./objectStore"
import * as JCSS from "./jcss"
import { range, curry } from "ramda"
import { World } from "./world"

type Offset = {
  top: number
  left: number
}

export type SceneConfig = {
  canvasWidth: number
  canvasHeight: number
  tilePixelSize: number
}

export type Scene = {
  canvas: HTMLCanvasElement
  renderingContext: CanvasRenderingContext2D
  mapTileOffset: Offset
  tileWidth: number
  tileHeight: number

  config: SceneConfig
}

const canvasStyle = {
  border: "thick black solid",
  display: "block",
  margin: "0 auto",
}
export const init = (world: World) => {
  const { scene } = world
  document.body.append(scene.canvas)
  return world
}

const toPixels = curry((tilePixelSize, tiles) => tiles * tilePixelSize)
const toTiles = curry((tilePixelSize, px) => px / tilePixelSize)

export const build = (config: SceneConfig): Scene => {
  const canvas = buildCanvas(config.canvasWidth, config.canvasHeight)
  return {
    canvas,
    renderingContext: canvas.getContext("2d"),
    mapTileOffset: { top: 0, left: 0 },
    tileWidth: toTiles(config.tilePixelSize, config.canvasWidth),
    tileHeight: toTiles(config.tilePixelSize, config.canvasHeight),
    config: config,
  }
}

export const zoom = (scene, amt) => {
  const newPixelSize = scene.config.tilePixelSize + amt
  return {
    ...scene,
    tileWidth: toTiles(newPixelSize, scene.config.canvasWidth),
    tileHeight: toTiles(newPixelSize, scene.config.canvasHeight),
    config: {
      ...scene.config,
      tilePixelSize: newPixelSize,
    },
  }
}

const buildCanvas = (width, height): HTMLCanvasElement => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  canvas.setAttribute("style", JCSS.toCss(canvasStyle))
  return canvas
}

// Main function to output the world to the screen
export const render = (world: World) => {
  const { scene } = world
  const { renderingContext: ctx, canvas } = scene
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#f5f5f5"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  getObjectsInScene(world, scene).map(object => drawObject(scene, object))
  return world
}

const getObjectsInScene = (world: World, scene: Scene): GameObject[] => {
  const [top, bottom, right, left] =
    [topEdge, bottomEdge, rightEdge, leftEdge].map(f => Math.floor(f(scene)))
  return range(left, right + 1).flatMap(x => {
    return range(top, bottom + 1).flatMap(y => {
      [x, y] = [x, y].map(Math.floor)
      return Store.get({ x, y } as Position, world.objects)
    })
  }).filter(Boolean)
}

const topEdge = (scene) => scene.mapTileOffset.top - 1
const bottomEdge = (scene) => scene.mapTileOffset.top + scene.tileHeight
const leftEdge = (scene) => scene.mapTileOffset.left - 1
const rightEdge = (scene) => scene.mapTileOffset.left + scene.tileWidth
const isInScene = curry(
  (scene, object) =>
    topEdge(scene) <= object.position.y &&
    leftEdge(scene) <= object.position.x &&
    bottomEdge(scene) >= object.position.y &&
    rightEdge(scene) >= object.position.x
)

const drawObject = (scene, object: GameObject) => {
  if (Player.is(object)) drawPlayer(scene, object)
  if (GrassTile.is(object)) drawGrassTile(scene, object)
  if (WaterTile.is(object)) drawWaterTile(scene, object)
  if (SandTile.is(object)) drawSandTile(scene, object)
  if (EmptyTile.is(object)) drawEmptyTile(scene, object)
}

const drawPlayer = (scene, player) => {
  const { renderingContext: ctx } = scene
  ctx.fillStyle = "#000"
  let [x, y, w, h] = getPixelBounds(scene, player)
  ctx.fillRect(x, y, w, h)
}

const drawEmptyTile = (scene, tile) => {
  const { renderingContext: ctx } = scene
  let [x, y, w, h] = getPixelBounds(scene, tile)
  ctx.fillStyle = "#fff"
  ctx.fillRect(x, y, w, h)
}

const drawGrassTile = (scene, tile) => {
  const { renderingContext: ctx } = scene
  let [x, y, w, h] = getPixelBounds(scene, tile)
  ctx.fillStyle = GrassTile.color(tile)
  ctx.fillRect(x, y, w, h)
}

const drawSandTile = (scene, tile) => {
  const { renderingContext: ctx } = scene
  let [x, y, w, h] = getPixelBounds(scene, tile)
  ctx.fillStyle = SandTile.color(tile)
  ctx.fillRect(x, y, w, h)
}

const drawWaterTile = (scene, tile) => {
  const { renderingContext: ctx } = scene
  let [x, y, w, h] = getPixelBounds(scene, tile)
  ctx.fillStyle = WaterTile.color(tile)
  ctx.fillRect(x, y, w, h)
}

const getPixelBounds = (scene, object) =>
  [
    object.position.x - scene.mapTileOffset.left,
    object.position.y - scene.mapTileOffset.top,
    object.size,
    object.size,
  ].map(toPixels(scene.config.tilePixelSize))

// Make sure object is always at the center of the scene
// by updating offset based on width and height
export const followObject = (scene, object) => {
  const newOffset = {
    top: object.position.y - scene.tileHeight / 2,
    left: object.position.x - scene.tileWidth / 2,
  }
  // console.log(scene)
  // console.log(object)
  // console.log(newOffset)
  return { ...scene, mapTileOffset: newOffset }
}
