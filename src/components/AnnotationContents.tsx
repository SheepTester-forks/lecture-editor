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
  onEdit?: (annotation: Annotation) => void
}
export function AnnotationContents ({
  annotation,
  onEdit
}: AnnotationContentsProps) {
  switch (annotation.type) {
    case 'set-layout':
      return (
        <span>
          Change layout to{' '}
          <select
            value={annotation.layout}
            onChange={e => {
              if (
                e.currentTarget.value === 'slide-only' ||
                e.currentTarget.value === 'slide-avatar' ||
                e.currentTarget.value === 'avatar-only'
              ) {
                onEdit?.({ ...annotation, layout: e.currentTarget.value })
              }
            }}
            disabled={!onEdit}
          >
            {Object.entries(layoutNames).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </span>
      )
    case 'gesture':
      return (
        <span>
          <select
            value={annotation.gesture}
            onChange={e => {
              if (
                e.currentTarget.value === 'point' ||
                e.currentTarget.value === 'nod' ||
                e.currentTarget.value === 'glance'
              ) {
                onEdit?.({ ...annotation, gesture: e.currentTarget.value })
              }
            }}
            disabled={!onEdit}
          >
            {Object.entries(gestureNames).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>{' '}
          towards{' '}
          <select
            value={annotation.towards}
            onChange={e => {
              if (
                e.currentTarget.value === 'top' ||
                e.currentTarget.value === 'middle' ||
                e.currentTarget.value === 'bottom'
              ) {
                onEdit?.({ ...annotation, towards: e.currentTarget.value })
              }
            }}
            disabled={!onEdit}
          >
            {Object.entries(gestureTargetNames).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </span>
      )
    case 'set-slide':
      return (
        <label>
          Change slide to{' '}
          <img
            src={annotation.image.src}
            alt='Selected slide image'
            className='selected-slide'
          />
          <input
            type='file'
            accept='image/*'
            className='visually-hidden'
            onChange={e => {
              const file = e.currentTarget.files?.[0]
              if (file) {
                const image = new Image()
                const url = URL.createObjectURL(file)
                image.src = url
                image.addEventListener('load', () => {
                  URL.revokeObjectURL(url)
                })
                image.addEventListener('error', () => {
                  URL.revokeObjectURL(url)
                })
                onEdit?.({ type: 'set-slide', image })
              }
            }}
            disabled={!onEdit}
          />
        </label>
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
