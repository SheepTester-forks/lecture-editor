import { useState } from 'react'
import { Annotation as AnnotationType } from '../video-strategy'
import { Annotation, DragPosition } from './Annotation'
import { DragState } from '../App'

export type PaletteAnnotationProps = {
  defaultAnnotation: AnnotationType
  onDrag: (dragState: DragState) => void
  onDragEnd: () => void
}
export function PaletteAnnotation ({
  defaultAnnotation,
  onDrag,
  onDragEnd
}: PaletteAnnotationProps) {
  const [annotation, setAnnotation] = useState(defaultAnnotation)
  return (
    <Annotation
      annotation={annotation}
      onEdit={setAnnotation}
      onDrag={position => onDrag({ position, annotation })}
      onDragEnd={onDragEnd}
    ></Annotation>
  )
}
