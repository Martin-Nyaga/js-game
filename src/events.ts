import { partial } from "rambda"

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
  mouse: {},
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

export const bindEvents = (sink: Sink) => {
  document.addEventListener("keydown", partial(handleKeyDown, sink))
  document.addEventListener("keyup", partial(handleKeyUp, sink))
  document.addEventListener(
    "visibilitychange",
    partial(handleFocusChange, sink)
  )
  window.addEventListener("wheel", partial(handleMouseWheel, sink))
}
