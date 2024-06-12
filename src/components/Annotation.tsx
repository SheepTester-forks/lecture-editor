import { PointerEvent, useRef, useState } from 'react'
import { Annotation } from '../video-strategy'
import { AnnotationContents } from './AnnotationContents'
import { RemoveIcon } from './RemoveIcon'

type DragState = {
  pointerId: number
  initX: number
  initY: number
  dragging: DOMRect | null
}
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
  onDragStart?: () => void
  onDrag?: (position: DragPosition) => void
  onDragEnd?: () => void
  onEdit?: (annotation: Annotation) => void
  onRemove?: () => void
}

function AnnotationComponent ({
  annotation,
  first = true,
  last = true,
  dragPosition,
  onDragStart,
  onDrag,
  onDragEnd,
  onEdit,
  onRemove
}: AnnotationProps) {
  const dragState = useRef<DragState | null>(null)

  const handlePointerEnd = (e: PointerEvent) => {
    if (dragState.current?.pointerId === e.pointerId) {
      onDragEnd?.()
      dragState.current = null
    }
  }

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
      onPointerDown={e => {
        if (!dragState.current) {
          dragState.current = {
            pointerId: e.pointerId,
            initX: e.clientX,
            initY: e.clientY,
            dragging: null
          }
          e.currentTarget.setPointerCapture(e.pointerId)
        }
      }}
      onPointerMove={e => {
        if (dragState.current?.pointerId === e.pointerId) {
          if (!dragState.current.dragging) {
            const distance = Math.hypot(
              e.clientX - dragState.current.initX,
              e.clientY - dragState.current.initY
            )
            if (distance > 10) {
              dragState.current.dragging =
                e.currentTarget.getBoundingClientRect()
              onDragStart?.()
            } else {
              return
            }
          }
          onDrag?.({
            x:
              e.clientX -
              dragState.current.initX +
              dragState.current.dragging.left,
            y:
              e.clientY -
              dragState.current.initY +
              dragState.current.dragging.top,
            width: dragState.current.dragging.width
          })
        }
      }}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
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
