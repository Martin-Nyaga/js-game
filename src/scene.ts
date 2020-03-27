import * as THREE from "three"
import {
  GameObject,
  Player,
  EmptyTile,
  GrassTile,
  SandTile,
  WaterTile,
} from "./gameObjects"
import * as Position from "./position"
import * as Store from "./objectStore"
import * as JCSS from "./jcss"
import * as R from "ramda"
import * as World from "./world"

export type SceneConfig = {
  canvasWidth: number
  canvasHeight: number
}

type WebGlObject = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  geometryCache: { [key: string]: THREE.Geometry }
}

export type Scene = {
  webGl: WebGlObject
  config: SceneConfig
}

const canvasStyle = {
  border: "thick black solid",
  display: "block",
  margin: "100px auto",
}
export const init = (world: World.World) => {
  const { scene } = world
  const { webGl: gl } = scene
  const canvas = gl.renderer.domElement
  canvas.setAttribute("style", JCSS.toCss(canvasStyle))
  document.body.append(canvas)
  return world
}

export const build = (config: SceneConfig): Scene => {
  const webGl = buildWebGlObject(config.canvasWidth, config.canvasHeight)
  return {
    webGl,
    config,
  }
}

const buildWebGlObject = (width, height): WebGlObject => {
  const scene = new THREE.Scene()
  const fieldOfView = 75
  const aspect = width / height
  const near = 0.1
  const far = 1000

  const camera = new THREE.PerspectiveCamera(fieldOfView, aspect, near, far)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  camera.position.z = 15

  return {
    scene,
    renderer,
    camera,
    geometryCache: {},
  }
}

// TODO: Implement Zooming
// export const zoom = (scene, amt) => {
//   const newPixelSize = scene.config.tilePixelSize + amt
//   return {
//     ...scene,
//     config: {
//       ...scene.config,
//       tilePixelSize: newPixelSize,
//     },
//   }
// }

// Main function to output the world to the screen
export const render = (world: World.World) => {
  const { scene } = world
  const { webGl: gl } = scene
  const player = World.getPlayer(world)
  const cameraCentre = toGlCoordinate(world, player.position)
  gl.camera.position.x = cameraCentre.x
  gl.camera.position.y = cameraCentre.y

  // TODO: off White background for empty canvas
  // ctx.fillStyle = "#f5f5f5"
  // ctx.fillRect(0, 0, canvas.width, canvas.height)
  world.objects.dirty
    .map((id) => Store.getById(id, world.objects))
    .forEach(drawObject(world))

  // console.log("Render")
  // console.log(world.scene)
  // console.log(gl.scene)
  gl.renderer.render(gl.scene, gl.camera)

  return {
    ...world,
    objects: Store.clearDirty(world.objects),
  }
}

const drawObject = R.curry((world, object: GameObject) => {
  if (Player.is(object)) drawPlayer(world, object)
  if (GrassTile.is(object)) drawGrassTile(world, object)
  // if (WaterTile.is(object)) drawWaterTile(scene, object)
  // if (SandTile.is(object)) drawSandTile(scene, object)
  // if (EmptyTile.is(object)) drawEmptyTile(scene, object)
})

const drawPlayer = (world, player) => {
  const geometry = readCached(
    world.scene.webGl.geometryCache,
    player.type,
    () => {
      return new THREE.PlaneGeometry(player.size, player.size)
    }
  )
  drawGenericColoredTile(world, player.id, player.position, geometry, "#000000")
}

const drawGrassTile = (world, tile) => {
  const geometry = readCached(
    world.scene.webGl.geometryCache,
    tile.type,
    () => {
      return new THREE.PlaneGeometry(tile.size, tile.size)
    }
  )
  drawGenericColoredTile(
    world,
    tile.id,
    tile.position,
    geometry,
    GrassTile.color(tile)
  )
}

const drawGenericColoredTile = (world, id, position, geometry, color) => {
  const { webGl: gl } = world.scene

  // Convert map tile coordinates to gl coordinates. Map tiles go from 0 ->
  // width, 0 -> height, while gl coordinates go from -1 to 1 on both
  // axes.
  const { x, y } = toGlCoordinate(world, position)

  // Also convert map tile sizes to gl sizes. A tile of size  1 on the map is
  // actually size 2/width in webGl

  const tile = gl.scene.getObjectByName(id)
  if (tile) {
    tile.position.x = x
    tile.position.y = y
  } else {
    const material = new THREE.MeshBasicMaterial({ color })
    const newTile = new THREE.Mesh(geometry, material)
    newTile.name = id
    newTile.position.x = x
    newTile.position.y = y
    gl.scene.add(newTile)
  }
}

// const drawSandTile = (world, tile) =>
//   drawGenericColoredTile(
//     world,
//     tile.id,
//     tile.position,
//     tile.size,
//     SandTile.color(tile)
//   )

// const drawWaterTile = (world, tile) =>
//   drawGenericColoredTile(
//     world,
//     tile.id,
//     tile.position,
//     tile.size,
//     WaterTile.color(tile)
//   )

// Map world tile coordinates to gl Coordinates which are always -1 -> 1
// Then include the scene windowing by scaling by half of the gl width & height
const toGlCoordinate = (world, position) => ({
  x: position.x - world.width / 2,
  y: world.height / 2 - position.y,
})

export const getDomElement = (scene) => scene.webGl.renderer.domElement

const readCached = (cache, key, fn) => {
  let value = cache[key]
  if (value == undefined) {
    value = fn()
    cache[key] = value
  }
  return value
}
