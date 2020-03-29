import { toPairs } from "rambda"

const isUpper = (c: string) => c.toUpperCase() == c

const kebabize = (str: string) =>
  str
    .split("")
    .map((c) => (isUpper(c) ? "-" + c.toLowerCase() : c))
    .join("")

export const toCss = (style: any) =>
  toPairs(style).reduce(
    (styleStr: string, [key, value]) =>
      styleStr + `${kebabize(key)}: ${value}; `,
    ""
  )

