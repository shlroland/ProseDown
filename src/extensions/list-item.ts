import { defineNodeSpec, type Extension } from "prosekit/core";
import { isString } from "remeda";
import { registerAstFrom } from "../markdown/methods";
import type { Attrs } from "prosekit/pm/model";

export function defineListItemSpec() {
  return defineNodeSpec({
    name: "listItem",
    defining: true,
    content: "(paragraph block* | bulletList | orderedList)",
    attrs: {
      checked: {
        default: null,
        validate: "null|boolean",
      },
    },
    parseDOM: [
      {
        tag: "li",
        getAttrs: (node) => {
          if (isString(node)) {
            return false;
          }
          const checked = node.getAttribute("checked");
          return { checked: checked ? checked === "true" : null };
        },
      },
    ],
    toDOM: (node) => ["li", { checked: node.attrs.checked }, 0],
  });
}

type ListItemExtension = Extension<{
  Nodes: {
    listItem: {
      checked: null;
    };
    paragraph: Attrs;
  };
}>;

export function defineListItem() {
  return defineListItemSpec();
}

export const astListItemFrom = registerAstFrom<ListItemExtension>()(
  "listItem",
  (ctx, ast, text) => {
    let nodes = ctx.processParentContent(ast, text);
    const listItem = ctx.editor.nodes.listItem;
    if (nodes.length <= 0) {
      nodes = [ctx.editor.nodes.paragraph()];
    }
    return listItem(...nodes);
  },
);
