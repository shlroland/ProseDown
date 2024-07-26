import { defineNodeSpec, type Extension } from "prosekit/core"
import type { Attrs } from "prosekit/pm/model"

export function defineDoc(): DocExtension {
  return defineNodeSpec({
    name: 'doc',
    content: 'block+',
    topNode: true,
  })
}

export type DocExtension = Extension<{ Nodes: { doc: Attrs } }>