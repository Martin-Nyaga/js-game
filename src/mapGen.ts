import * as R from "rambda"
import * as Store from "./objectStore"
import * as Position from "./position"
import * as Utils from "./utils"

import {
  GameObject,
  ObjectId,
  objectId,
  Player,
  GrassTile,
  SandTile,
  WaterTile,
} from "./gameObjects"

export const generateMap = (width, height): Store.ObjectStore => {
  // Generate 3 different map grids ("fractals") which have random numbers at
  // each grid point. Each grid is contiguous at different length scales.
  const fractals = [1, Math.ceil(height / 20), Math.ceil(height / 3)].map((i) =>
    generateFractal(width, height, 1, 15, i)
  )
  // Take the random grids, overlay them to average and then interpolate to
  // smooth out harshness
  const fractal = interpolate(overlay(fractals), Math.ceil(height / 10))

  const flatFractal = (R.flatten(fractal) as unknown[]) as number[]
  return flatFractal.reduce((store, fractalValue, index) => {
    const x = index % width
    const y = Math.floor(index / height)
    const tileType = Math.ceil(fractalValue / 5)
    const tileVariant = Utils.constrain(
      Math.ceil(Math.ceil(fractalValue / 3) + Utils.random(-2, 2)),
      0,
      5
    )

    let tile: GameObject
    if (tileType === 1) {
      tile = {
        id: objectId(),
        type: "sandTile",
        position: { x, y } as Position.Position,
        size: 1,
        variant: tileVariant,
      } as SandTile.SandTile
    } else if (tileType == 2) {
      tile = {
        id: objectId(),
        type: "grassTile",
        position: { x, y } as Position.Position,
        size: 1,
        variant: tileVariant,
      } as GrassTile.GrassTile
    } else if (tileType == 3) {
      tile = {
        id: objectId(),
        type: "waterTile",
        position: { x, y } as Position.Position,
        size: 1,
        variant: tileVariant,
      } as WaterTile.WaterTile
    }
    store = Store.add(tile, store)

    if (Math.random() < 0.01) {
      store = Store.add(
        {
          id: objectId(),
          type: "tree",
          position: { x, y } as Position.Position,
          size: 4,
        },
        store
      )
    }
    return store
  }, Store.empty() as Store.ObjectStore)
}

const generateFractal = (width, height, min, max, resolution): number[][] => {
  let downsampledFractalWidth = Math.ceil(width / resolution)
  let downsampledFractalHeight = Math.ceil(height / resolution)
  const downsampledFractal = R.range(0, downsampledFractalHeight).map((_) =>
    R.range(0, downsampledFractalWidth).map((_) =>
      Math.round(Utils.random(min, max))
    )
  )
  const finalFractal = R.range(0, height).map((_, j) =>
    R.range(0, width).map((_, i) => {
      const x = Math.floor(i / resolution)
      const y = Math.floor(j / resolution)
      return downsampledFractal[y][x]
    })
  )

  return finalFractal
}

const interpolate = (fractal, size) => {
  // First interpolate in X
  const interpolatedX = interpolate1D(fractal, size)
  // Then interpolate in Y by transposing and transposing back
  const interpolatedY = R.transpose(
    interpolate1D(R.transpose(interpolatedX), size)
  )
  return interpolatedY
}

const interpolate1D = (fractal, size) => {
  // Interpolate the along in the X dimension
  return fractal.map((row: number[]) => {
    return row.map((_, i) => {
      let start = i - Math.ceil(size / 2)
      let count = size
      if (start < 0) {
        count = size + start
        start = 0
      }
      const values = row.slice(start, start + count)
      const value = Math.round(Utils.average(values))
      return value
    })
  })
}

// Take multiple fractals and "average" them to produce a final fractal
const overlay = (fractals) => {
  const height = fractals[0].length
  const width = fractals[0][0].length
  return R.range(0, height).map((j) =>
    R.range(0, width).map((i) =>
      Math.round(Utils.average(fractals.map((f) => f[j][i])))
    )
  )
}
