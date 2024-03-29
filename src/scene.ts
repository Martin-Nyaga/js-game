import * as THREE from "three"
import {
  GameObject,
  Player,
  EmptyTile,
  GrassTile,
  SandTile,
  WaterTile,
  Tree,
} from "./gameObjects"
import * as Position from "./position"
import * as Store from "./objectStore"
import * as JCSS from "./jcss"
import * as R from "rambda"
import * as World from "./world"
import * as Utils from "./utils"

export type SceneConfig = {
  canvasWidth: number
  canvasHeight: number
}

type WebGlObject = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  raycaster: THREE.Raycaster
  geometryCache: { [key: string]: THREE.Geometry }
}

export type Scene = {
  webGl: WebGlObject
  config: SceneConfig
}

const canvasStyle = {
  display: "block",
  margin: "0 auto",
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

const DEFAULT_CAMERA_Z = 15
const MIN_CAMERA_Z = 6
const MAX_CAMERA_Z = 25
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

  const raycaster = new THREE.Raycaster()

  return {
    scene,
    renderer,
    camera,
    raycaster,
    geometryCache: {},
  }
}

export const zoom = (scene: Scene, amt: number) => {
  scene.webGl.camera.position.z = Utils.constrain(
    scene.webGl.camera.position.z + amt,
    MIN_CAMERA_Z,
    MAX_CAMERA_Z
  )
  return scene
}

export const handleClick = (scene: Scene, coords: Position.Position) => {
  const mouse = new THREE.Vector2()
  mouse.x = (coords.x / scene.config.canvasWidth) * 2 - 1
  mouse.y = -(coords.y / scene.config.canvasHeight) * 2 + 1
  const { webGl: gl } = scene
  gl.raycaster.setFromCamera(mouse, gl.camera)
  // calculate objects intersecting the picking ray
  gl.raycaster.intersectObjects(gl.scene.children).forEach((intersect) => {
    ;(intersect.object as any).material.color.set(0xff0000)
  })
}

// Main function to output the world to the screen
export const render = (world: World.World) => {
  const { scene } = world
  const { webGl: gl } = scene
  const player = World.getPlayer(world)
  const cameraCentre = toGlCoordinate(world, player.position)
  gl.camera.position.x = cameraCentre.x
  gl.camera.position.y = cameraCentre.y

  world.objects.dirty
    .map((id) => Store.getById(id, world.objects))
    .forEach(drawObject(world))

  gl.renderer.render(gl.scene, gl.camera)

  return {
    ...world,
    objects: Store.clearDirty(world.objects),
  }
}

const drawObject = R.curry((world, object: GameObject) => {
  if (Player.is(object)) drawPlayer(world, object)
  if (GrassTile.is(object)) drawGrassTile(world, object)
  if (WaterTile.is(object)) drawWaterTile(world, object)
  if (SandTile.is(object)) drawSandTile(world, object)
  if (Tree.is(object)) drawTree(world, object)
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

const drawSandTile = (world, tile) => {
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
    SandTile.color(tile)
  )
}

const drawWaterTile = (world, tile) => {
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
    WaterTile.color(tile)
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

const drawTree = (world, tree) => {
  const geometry = readCached(
    world.scene.webGl.geometryCache,
    tree.type,
    () => {
      const { x, y } = toGlCoordinate(world, tree.position)
      const buffer = new THREE.BufferGeometry()
      const points = new Float32Array([
        x + 1 , y     , 0 ,
        x     , y + 1 , 0 ,
        x - 1 , y     , 0 ,

        x - 1 , y     , 0 ,
        x     , y - 1 , 0 ,
        x + 1 , y     , 0 ,
      ])
      buffer.setAttribute('position', new THREE.BufferAttribute(points, 3))
      return buffer
    }
  )
  const { webGl: gl } = world.scene
  const color = "#00ff00"
  const material = new THREE.MeshBasicMaterial({ color })
  const treeTile = new THREE.Mesh(geometry, material)
  treeTile.name = tree.id
  gl.scene.add(treeTile)
}

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
