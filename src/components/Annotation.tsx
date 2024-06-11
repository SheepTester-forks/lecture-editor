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
type VisualDragState = {
  x: number
  y: number
  width: number
}

export type AnnotationProps = {
  annotation: Annotation
  first?: boolean
  last?: boolean
  onEdit: (annotation: Annotation) => void
  onRemove?: () => void
}

function AnnotationComponent ({
  annotation,
  first = true,
  last = true,
  onEdit,
  onRemove
}: AnnotationProps) {
  const dragState = useRef<DragState | null>(null)
  const [dragging, setDragging] = useState<VisualDragState | null>(null)

  const handlePointerEnd = (e: PointerEvent) => {
    if (dragState.current?.pointerId === e.pointerId) {
      setDragging(null)
      dragState.current = null
    }
  }

  return (
    <div
      className={`annotation ${first || dragging ? 'first' : ''} ${
        last || dragging ? 'last' : ''
      } ${dragging ? 'dragging' : ''}`}
      style={
        dragging
          ? {
              left: `${dragging.x}px`,
              top: `${dragging.y}px`,
              width: `${dragging.width}px`
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
            } else {
              return
            }
          }
          setDragging({
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
