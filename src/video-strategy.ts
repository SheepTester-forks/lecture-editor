export type Layout = 'slide-only' | 'slide-avatar' | 'avatar-only'
export type Gesture = 'point' | 'nod' | 'glance'
export type GestureTarget = 'top' | 'middle' | 'bottom'
export type Annotation =
  | { type: 'set-layout'; layout: Layout }
  | { type: 'set-slide'; image: HTMLImageElement | null }
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
  let caption = ''
  for (const part of parts) {
    if (part.type === 'text') {
      const lines = part.content.split(/\s*\n\s*/)
      for (const line of lines) {
        let lastIndex = 0
        for (const { index } of line.matchAll(/\s+/g)) {
          // `index` is the index of the first whitespace character
          const appendum = line.slice(lastIndex, index)
          if (caption.length + appendum.length > MAX_CAPTION_LENGTH) {
            const content = caption.trim()
            captions.push({ content, time })
            time += content.replace(/\s/g, '').length * EST_TIME_PER_CHAR
            caption = appendum
          } else {
            caption += appendum
          }
          lastIndex = index
        }
        const rest = line.slice(lastIndex)
        if (caption.length + rest.length > MAX_CAPTION_LENGTH) {
          const content = caption.trim()
          captions.push({ content, time })
          time += content.replace(/\s/g, '').length * EST_TIME_PER_CHAR
          caption = rest
        } else {
          caption += rest
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
    captions.push({ content, time })
    time += content.replace(/\s/g, '').length * EST_TIME_PER_CHAR
  }

  return { captions, actions, length: time }
}
