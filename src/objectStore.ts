import { curry } from "ramda"
import * as Position from "./position"
import { GameObject } from "./gameObjects"

export type ObjectStore = {
  [x: number]: {
    [y: number]: GameObject[]
  }
}

export const add = curry((object: GameObject, store: ObjectStore) => {
  const { x, y } = object.position
  if (store[x] == undefined) store[x] = { [y]: [object] }
  else if(store[x][y] == undefined) store[x][y] = [object]
  else store[x][y] = [...store[x][y], object]
  return store
})

export const remove = curry((object: GameObject, store: ObjectStore) => {
  const { x, y } = object.position
  if (store[x] == undefined) return store 
  if (store[x][y] == undefined) return store 
  const objectIndex = store[x][y].findIndex(obj => obj.id == object.id)
  if (objectIndex != -1) store[x][y].splice(objectIndex, 1)
  return store
})

export const get = curry((position: Position.Position, store: ObjectStore): GameObject[] | undefined => {
  const { x, y } = position
  if (store[x] == undefined) return undefined
  if (store[x][y] == undefined) return undefined 
  else return store[x][y]
})

