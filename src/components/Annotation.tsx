import { Annotation, Gesture, GestureTarget, Layout } from '../video-strategy'

const layoutNames: Record<Layout, string> = {
  'slide-only': 'slide with voiceover',
  'slide-avatar': 'slide and avatar',
  'avatar-only': 'avatar only'
}
const gestureNames: Record<Gesture, string> = {
  point: 'Point',
  nod: 'Nod',
  glance: 'Glance'
}
const gestureTargetNames: Record<GestureTarget, string> = {
  top: 'top of slide',
  middle: 'middle of slide',
  bottom: 'bottom of slide'
}

export type AnnotationContentsProps = {
  annotation: Annotation
}
export function AnnotationContents ({ annotation }: AnnotationContentsProps) {
  switch (annotation.type) {
    case 'set-layout':
      return (
        <span>
          Change layout to <strong>{layoutNames[annotation.layout]}</strong>
        </span>
      )
    case 'gesture':
      return (
        <span>
          <strong>{gestureNames[annotation.gesture]}</strong> towards{' '}
          <strong>{gestureTargetNames[annotation.towards]}</strong>
        </span>
      )
    case 'set-slide':
      return (
        <span>
          Change slide to <strong>todo</strong>
        </span>
      )
    case 'play-video':
      return (
        <span>
          Play video <strong>todo</strong>
        </span>
      )
    default:
      return null
  }
}
