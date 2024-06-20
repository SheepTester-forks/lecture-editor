export type Layout = 'slide-only' | 'slide-avatar' | 'avatar-only'
export type Gesture = 'point' | 'nod' | 'glance'
export type GestureTarget = 'top' | 'middle' | 'bottom'
export type Annotation =
  | { type: 'set-layout'; layout: Layout }
  | { type: 'set-slide'; image: HTMLImageElement }
  | {
      type: 'play-video'
      video: HTMLVideoElement | null
      from: number
      to: number
    }
  | { type: 'gesture'; gesture: Gesture; towards: GestureTarget }
export type PartBase =
  | { type: 'text'; content: string }
  | { type: 'annotation'; annotation: Annotation }
export type Part = PartBase & { id: number }

export type Caption = {
  time: number
  content: string
}
export type Action = Annotation & { time: number }
export type Strategy = {
  captions: Caption[]
  actions: Action[]
  length: number
}
const MAX_CAPTION_LENGTH = 50
// Speaking 150~160 wpm, 5~6.5 chars/word, so 160 * 5 chars/min, or `minute /
// (160 * 5)` = 75 milliseconds/char
const EST_TIME_PER_CHAR = 75
export function strategize (parts: PartBase[]): Strategy {
  const captions: Caption[] = []
  const actions: Action[] = []

  let time = 0
  let captionStartTime = 0
  let caption = ''
  for (const part of parts) {
    if (part.type === 'text') {
      const lines = part.content.split(/\s*\n\s*/)
      for (const line of lines) {
        for (const appendum of splitBySpaces(line)) {
          if (caption.length + appendum.length > MAX_CAPTION_LENGTH) {
            const content = caption.trim()
            captions.push({ content, time: captionStartTime })
            captionStartTime = time
            caption = appendum
          } else {
            caption += appendum
          }
          time += appendum.replace(/\s/g, '').length * EST_TIME_PER_CHAR
        }
      }
      if (caption) {
        caption += ' '
      }
    } else {
      actions.push({ ...part.annotation, time })
    }
  }
  if (caption.length > 0) {
    const content = caption.trim()
    captions.push({ content, time: captionStartTime })
    time += content.replace(/\s/g, '').length * EST_TIME_PER_CHAR
  }

  return { captions, actions, length: time }
}

/**
 * Splits a string by whitespace so that every word in the returned list begins
 * with some whitespace, except for the first word.
 *
 * @example
 * > Array.from(splitBySpaces('Hi! Hello world!'))
 * ['Hi!', ' Hello', ' world!']
 *
 * > Array.from(splitBySpaces(' Hi! Hello  world! '))
 * [' Hi!', ' Hello', '  world!', ' ']
 */
function * splitBySpaces (string: string): Generator<string> {
  let lastIndex = 0
  for (const { index } of string.matchAll(/\s+/g)) {
    if (index === 0) {
      continue
    }
    yield string.slice(lastIndex, index)
    lastIndex = index
  }
  yield string.slice(lastIndex)
}

export function exportScript (parts: PartBase[]): string {
  // https://docs.heygen.com/reference/create-an-avatar-video-v2#voice-settings
  // look into this
  return parts
    .map(part =>
      part.type === 'text'
        ? part.content
        : part.annotation.type === 'set-layout'
        ? `[type: ${
            part.annotation.layout === 'avatar-only'
              ? 'avatar-only'
              : part.annotation.layout === 'slide-avatar'
              ? 'side-by-side'
              : 'media-only'
          }]`
        : 'TODO'
    )
    .join('')
}
