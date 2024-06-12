import { PointerEvent } from 'react'
import { Annotation } from '../video-strategy'
import { AnnotationContents } from './AnnotationContents'
import { RemoveIcon } from './RemoveIcon'

export type DragPosition = {
  x: number
  y: number
  width: number
}

export type AnnotationProps = {
  annotation: Annotation
  first?: boolean
  last?: boolean
  dragPosition?: DragPosition
  onDragStart?: (e: PointerEvent) => void
  onEdit?: (annotation: Annotation) => void
  onRemove?: () => void
  refCallback?: (element: Element | null) => void
}

function AnnotationComponent ({
  annotation,
  first = true,
  last = true,
  dragPosition,
  onDragStart,
  onEdit,
  onRemove,
  refCallback
}: AnnotationProps) {
  return (
    <div
      className={`annotation ${first ? 'first' : ''} ${last ? 'last' : ''} ${
        dragPosition ? 'dragging' : ''
      }`}
      style={
        dragPosition
          ? {
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
              width: `${dragPosition.width}px`
            }
          : undefined
      }
      onPointerDown={onDragStart}
      ref={refCallback}
    >
      <AnnotationContents annotation={annotation} onEdit={onEdit} />
      {onRemove ? (
        <button className='remove-btn' onClick={onRemove}>
          <RemoveIcon />
        </button>
      ) : null}
    </div>
  )
}

export { AnnotationComponent as Annotation }
