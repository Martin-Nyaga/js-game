import { partial } from "ramda"

// Sink to receive all player inputs
export const InputSink = {
  keysPressed: {
    up: false,
    down: false,
    left: false,
    right: false,
    zoomIn: false,
    zoomOut: false
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
  if (direction !== undefined) sink.keysPressed[direction] = value
  if (key == "z") sink.keysPressed.zoomIn = value
  if (key == "o") sink.keysPressed.zoomOut = value
}

const handleKeyDown = (sink: Sink, event: any) =>
  updateKeyPressed(sink, getKey(event), true)

const handleKeyUp = (sink: Sink, event: any) =>
  updateKeyPressed(sink, getKey(event), false)

const stopAllKeyPresses = (sink) => {
  for (let key in sink.keysPressed) {
    sink.keysPressed[key] = false
  }
}

// Stop all key presses
const handleFocusChange = (sink: Sink, event: any) => {
  if (!document.hasFocus()) stopAllKeyPresses(sink)
}

export const bindEvents = (sink: Sink) => {
  document.addEventListener("keydown", partial(handleKeyDown, [sink]))
  document.addEventListener("keyup", partial(handleKeyUp, [sink]))
  document.addEventListener(
    "visibilitychange",
    partial(handleFocusChange, [sink])
  )
}
