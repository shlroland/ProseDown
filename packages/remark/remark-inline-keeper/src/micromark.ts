import { constants, codes, types } from 'micromark-util-symbol'
import type {
  Code,
  Construct,
  Extension,
  State,
  Token,
  Tokenizer,
} from 'micromark-util-types'

export const KEEPER_START = '￾'
const KEEPER_START_NUMBER = 65534
export const KEEPER_END = '￿'
const KEEPER_END_NUMBER = 65535

const tokenizeInlineKeeper: Tokenizer = function tokenizeInlineKeeper(
  effects,
  ok,
) {
  const handleSpecialCase: State = (code) => {
    const lastEvent = this.events.at(-1)
    if (
      lastEvent &&
      lastEvent[0] === 'enter' &&
      lastEvent[1].type === types.chunkText
    ) {
      effects.exit(types.chunkText)
    }

    effects.exit(types.content)

    if (code !== codes.eof) {
      effects.enter('dummyText')
      effects.consume(code)
      effects.exit('dummyText')
    }

    return ok(code)
  }

  function start(code: Code) {
    effects.enter('dummyText')
    effects.consume(code)
    effects.exit('dummyText')
    effects.enter(types.content)

    return more
  }

  function blank(code: Code) {
    effects.enter(types.lineEndingBlank)
    effects.consume(code)
    effects.exit(types.lineEndingBlank)
    effects.exit(types.chunkText)
    return more
  }

  let previous: Token

  function more(code: Code) {
    if (code === KEEPER_END_NUMBER) {
      return handleSpecialCase(code)
    }

    const chunk = effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
      previous,
    })

    if (previous) {
      previous.next = chunk
    }

    previous = chunk

    return handleLineEnding(code)
  }

  function handleLineEnding(code: Code): State | undefined {
    return code === codes.eof || code === KEEPER_END_NUMBER
      ? handleSpecialCase(code)
      : isBlank(code)
        ? blank(code)
        : // biome-ignore lint/style/noCommaOperator: <explanation>
          (effects.consume(code), handleLineEnding)
  }

  function isBlank(code: number | undefined) {
    return code != null && code < -2
  }

  return start
}

export function inlineKeeper(): Extension {
  const tokenizerInlineKeeper = {
    name: 'inlineKeeper',
    tokenize: tokenizeInlineKeeper,
  } satisfies Construct

  return {
    text: {
      [KEEPER_START_NUMBER]: tokenizerInlineKeeper,
    },
  }
}

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    dummyText: 'dummyText'
  }
}
