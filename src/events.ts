import { partial } from "ramda"

// Sink to receive all player inputs
export const InputSink = {
  keysPressed: {
    up: false,
    down: false,
    left: false,
    right: false,
  },
}
export type Sink = typeof InputSink

const getKey = (event: { key: string }) => event.key.toLowerCase()

// Impure
const updateKeyPressed = (sink: Sink, key: string, value: boolean) => {
  if (key == "w") sink.keysPressed.up = value
  else if (key == "a") sink.keysPressed.left = value
  else if (key == "s") sink.keysPressed.down = value
  else if (key == "d") sink.keysPressed.right = value
}

const handleKeyDown = (sink: Sink, event: any) =>
  updateKeyPressed(sink, getKey(event), true)

const handleKeyUp = (sink: Sink, event: any) =>
  updateKeyPressed(sink, getKey(event), false)

export const bindEvents = (sink: Sink) => {
  document.addEventListener("keydown", partial(handleKeyDown, [sink]))
  document.addEventListener("keyup", partial(handleKeyUp, [sink]))
}
