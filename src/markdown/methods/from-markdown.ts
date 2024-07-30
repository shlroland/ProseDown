import type { ParentContent, PhrasingContent, Root, RootContent } from 'mdast'
import type { Editor, MarkAction } from 'prosekit/core'
import type { Mark, ProseMirrorNode } from 'prosekit/pm/model'
import type { MarkdownProcessor } from '..'
import type { DocExtension } from '../../extensions/doc'
import { isArray } from '../../utils/is'
import type { RemoveNonCallable } from '../../utils/type'
import { isBasicContainerAst, isParentContent } from '../utils'

export function fromRoot(
  ctx: MarkdownProcessor<Editor>,
  root: Root,
  text: string,
) {
  return (ctx.editor as Editor<DocExtension>).nodes.doc(
    fromParentContent(ctx, root, text),
  )
}

export function fromParentContent(
  ctx: MarkdownProcessor<Editor>,
  content: ParentContent | Root,
  text: string,
) {
  return fromChildrenContent(ctx, content.children, text, content)
}

export function fromChildrenContent(
  ctx: MarkdownProcessor<Editor>,
  content: RootContent[],
  text: string,
  parent: RootContent | Root,
) {
  const result: ProseMirrorNode[] = []
  content.forEach((child, index) => {
    const astFromAction = ctx.astFrom.get(child.type)
    if (astFromAction) {
      const childNodes = astFromAction(ctx, child, text, index, [], parent)
      if (!childNodes) return
      isArray(childNodes) ? result.push(...childNodes) : result.push(childNodes)
    }
  })

  return result
}

export function fromPhrasingContent(
  ctx: MarkdownProcessor<Editor>,
  content: ParentContent | Root,
  text: string,
  marks: Mark[],
) {
  const result: ProseMirrorNode[] = []
  content.children.forEach((child, index) => {
    if (isBasicContainerAst(child)) {
      result.push(...fromPhrasingContent(ctx, child, text, marks))
      return
    }

    const astFromAction = ctx.astFrom.get(child.type)
    if (astFromAction) {
      const childNodes = astFromAction(ctx, child, text, index, marks, content)
      if (!childNodes) return
      isArray(childNodes) ? result.push(...childNodes) : result.push(childNodes)
      return
    }
  })

  return result
}

export function fromIndicatorContent(
  ctx: MarkdownProcessor<Editor>,
  markAction: RemoveNonCallable<MarkAction>,
  content: PhrasingContent,
  text: string,
  // index: number,
  // marks: Mark[]
) {
  const contentStart = content.position!.start.offset!
  const contentEnd = content.position!.end.offset!
  if (!isParentContent(content)) {
    const contentText = text.slice(contentStart, contentStart)
    return [createTextNode(ctx, contentText)]
  }

  const firstChild = content.children[0]
  const lastChild = content.children.at(-1) ?? firstChild

  const firstChildStart = firstChild.position!.start.offset!
  const lastChildEnd = lastChild.position!.end.offset!

  const firstIndicator = text.slice(
    contentStart,
    contentStart + (firstChildStart - contentStart),
  )
  const lastIndicator = text.slice(
    lastChildEnd,
    lastChildEnd + (contentEnd - lastChildEnd),
  )

  return markAction(
    ...[
      firstIndicator,
      ...fromPhrasingContent(ctx, content, text, []),
      lastIndicator,
    ],
  )
}

export function createTextNode(ctx: MarkdownProcessor<Editor>, text: string) {
  return ctx.editor.schema.text(text)
}
