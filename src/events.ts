import { partial } from "rambda"
import { World } from "./world"
import * as Scene from "./scene"

// Sink to receive all player inputs
export const InputSink = {
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    zoomIn: false,
    zoomOut: false,
  },
  mouse: {
    down: false,
    coordinates: null
  },
}
export type Sink = typeof InputSink

const getKey = (event: { key: string }) => event.key.toLowerCase()
const keyToDirectionMap = {
  w: "up",
  a: "left",
  s: "down",
  d: "right",
}

// Impure
const updateKeyPressed = (sink: Sink, key: string, value: boolean) => {
  const direction = keyToDirectionMap[key]
  if (direction !== undefined) sink.keys[direction] = value
  if (key == "i") sink.keys.zoomIn = value
  if (key == "o") sink.keys.zoomOut = value
}

const handleKeyDown = (sink: Sink, event: any) =>
  updateKeyPressed(sink, getKey(event), true)

const handleKeyUp = (sink: Sink, event: any) =>
  updateKeyPressed(sink, getKey(event), false)

const handleMouseWheel = (sink: Sink, event: any) => {
  const delta = Math.sign(event.deltaY)
  if (delta > 0) {
    sink.keys.zoomIn = true
  } else {
    sink.keys.zoomOut = true
  }
}

export const flushZoom = (sink: Sink) => {
  sink.keys.zoomOut = false
  sink.keys.zoomIn = false
}

const handleMouseDown = (sink: Sink, canvas: HTMLCanvasElement, event: any) => {
  const rect = canvas.getBoundingClientRect()
  const canvasPixelCoordinates = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  sink.mouse.down = true
  sink.mouse.coordinates = canvasPixelCoordinates
}

const handleMouseUp = (sink: Sink, _event: any) => {
  flushMouseDown(sink)
}

const handleMouseMove = (sink: Sink, canvas: HTMLCanvasElement, event: any) => {
  if (sink.mouse.down) {
    const rect = canvas.getBoundingClientRect()
    const canvasPixelCoordinates = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    sink.mouse.coordinates = canvasPixelCoordinates
  }
}

export const flushMouseDown = (sink: Sink) => {
  sink.mouse.down = false
  sink.mouse.coordinates = null
}

export const flush = (sink) => {
  for (let key in sink.keys) {
    sink.keys[key] = false
  }
  for (let action in sink.mouse) {
    sink.mouse[action] = false
  }
}

// Flush the sink when document is unfocused
const handleFocusChange = (sink: Sink, event: any) => {
  if (!document.hasFocus()) flush(sink)
}

export const bindEvents = (sink: Sink, world: World) => {
  const canvas = Scene.getDomElement(world.scene) 
  document.addEventListener("keydown", partial(handleKeyDown, sink))
  document.addEventListener("keyup", partial(handleKeyUp, sink))
  document.addEventListener(
    "visibilitychange",
    partial(handleFocusChange, sink)
  )
  canvas.addEventListener("wheel", partial(handleMouseWheel, sink))
  canvas.addEventListener("mousedown", partial(handleMouseDown, sink, canvas))
  canvas.addEventListener("mousemove", partial(handleMouseMove, sink, canvas))
  canvas.addEventListener("mouseup", partial(handleMouseUp, sink))
}
