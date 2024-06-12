import { PointerEvent, useState } from 'react'
import { Annotation as AnnotationType } from '../video-strategy'
import { Annotation } from './Annotation'

export type PaletteAnnotationProps = {
  defaultAnnotation: AnnotationType
  onDragStart?: (e: PointerEvent, annotation: AnnotationType) => void
}
export function PaletteAnnotation ({
  defaultAnnotation,
  onDragStart
}: PaletteAnnotationProps) {
  const [annotation, setAnnotation] = useState(defaultAnnotation)
  return (
    <Annotation
      annotation={annotation}
      onEdit={setAnnotation}
      onDragStart={e => onDragStart?.(e, annotation)}
    ></Annotation>
  )
}
