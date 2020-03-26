import * as R from "ramda"
import * as Position from "./position"
import { GameObject, ObjectId } from "./gameObjects"

type GameObjectIdMap = {
  [key: string]: GameObject
}

export type ObjectStore = {
  [x: number]: {
    [y: number]: ObjectId[]
  }
  byId: GameObjectIdMap
  dirty: ObjectId[]
}

const floorPosition = ({ x, y }) => ({ x: Math.floor(x), y: Math.floor(y) })

export const add = R.curry((object: GameObject, store: ObjectStore) => {
  const { x, y } = floorPosition(object.position)

  if (store.byId == undefined) store.byId = {}
  store.byId[object.id] = object

  if (store[x] == undefined) store[x] = { [y]: [object.id] }
  else if (store[x][y] == undefined) store[x][y] = [object.id]
  else store[x][y] = [...store[x][y], object.id]

  return { ...store, dirty: [...store.dirty, object.id] }
})

export const remove = R.curry((object: GameObject, store: ObjectStore) => {
  const { x, y } = floorPosition(object.position)
  if (store[x] == undefined) return store
  if (store[x][y] == undefined) return store
  const objectIndex = store[x][y].findIndex((id) => id == object.id)
  if (objectIndex != -1) store[x][y].splice(objectIndex, 1)
  delete store.byId[object.id]
  return store
})

export const getByPosition = R.curry(
  (
    position: Position.Position,
    store: ObjectStore
  ): GameObject[] | undefined => {
    const { x, y } = floorPosition(position)
    if (store[x] == undefined) return undefined
    if (store[x][y] == undefined) return undefined
    else return store[x][y].map(getById)
  }
)

export const getById = R.curry((id, store) => store.byId[id])

export const getAll = (store: ObjectStore) => R.values(store.byId)

export const markDirty = R.curry((dirtyObjects, store) => ({
  ...store,
  dirty: [...store.dirty, ...dirtyObjects.map((o) => o.id)],
}))

export const clearDirty = (store) => ({ ...store, dirty: [] })

export const empty = (): ObjectStore => ({
  dirty: [],
  byId: {} as GameObjectIdMap,
})
