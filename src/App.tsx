import {
  Fragment,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { AddIcon } from './components/AddIcon'
import { Annotation, DragPosition } from './components/Annotation'
import { PaletteAnnotation } from './components/PaletteAnnotation'
import { PauseIcon } from './components/PauseIcon'
import { PlayIcon } from './components/PlayIcon'
import { RemoveIcon } from './components/RemoveIcon'
import { TextArea } from './components/TextArea'
import slideImage from './images/slide1.jpg'
import { useNow } from './lib/useNow'
import { render } from './render/render'
import {
  Annotation as AnnotationType,
  Part,
  strategize
} from './video-strategy'

type PlayState =
  | { playing: false; time: number }
  | { playing: true; offset: number }

type DragTarget = {
  left: number
  top: number
  width: number
}

type DragState = {
  pointerId: number
  initX: number
  initY: number
  element: Element
  partId?: number
  annotation: AnnotationType
  dragging: {
    initRect: DOMRect
    targets: DragTarget[]
  } | null
  insert: number | null
}

export type DraggedAnnotation = {
  position: DragPosition
  annotation: AnnotationType
  insert: number | null
}

export function App () {
  const ref = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const [parts, setParts] = useState<Part[]>([
    {
      id: -1,
      type: 'text',
      content: "Hello, I'm Bob."
    },
    {
      id: -6,
      type: 'annotation',
      annotation: {
        type: 'set-slide',
        image: Object.assign(new Image(), { src: slideImage })
      }
    },
    {
      id: -8,
      type: 'annotation',
      annotation: { type: 'set-layout', layout: 'slide-avatar' }
    },
    { id: -7, type: 'text', content: 'Welcome to CSE 12 lecture recording.' },
    {
      id: -2,
      type: 'annotation',
      annotation: { type: 'set-layout', layout: 'slide-only' }
    },
    {
      id: -3,
      type: 'annotation',
      annotation: { type: 'gesture', gesture: 'point', towards: 'top' }
    },
    {
      id: -5,
      type: 'text',
      content: 'Today we will talk about things.'
    }
  ])
  const [playState, setPlayState] = useState<PlayState>({
    playing: false,
    time: 0
  })

  const now = useNow(playState.playing)
  const previewVideo = useMemo(() => strategize(parts), [parts])

  const time = Math.max(
    Math.min(
      playState.playing ? now + playState.offset : playState.time,
      previewVideo.length
    ),
    0
  )
  const ended = time === previewVideo.length
  const caption = previewVideo.captions.findLast(
    caption => time >= caption.time
  ) ?? { content: '' }

  const canvas = useRef<HTMLCanvasElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    context.current = canvas.current?.getContext('2d') ?? null

    const observer = new ResizeObserver(([{ contentBoxSize }]) => {
      const [{ blockSize, inlineSize }] = contentBoxSize
      const newSize = {
        width: inlineSize * window.devicePixelRatio,
        height: blockSize * window.devicePixelRatio
      }
      setSize(size =>
        size.width === newSize.width && size.height === newSize.height
          ? size
          : newSize
      )
    })
    if (canvas.current?.parentElement) {
      observer.observe(canvas.current.parentElement)
    }
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (context.current) {
      render(context.current, previewVideo, time)
    }
  }, [size, previewVideo, time])

  const partElements = useRef<Record<number, Element>>({})
  useEffect(() => {
    // Clean up partElements
    partElements.current = Object.fromEntries(
      Object.entries(partElements.current).filter(([id]) =>
        parts.find(part => part.id === +id)
      )
    )
  }, [parts])

  const dragState = useRef<DragState | null>(null)
  const [dragged, setDragged] = useState<DraggedAnnotation | null>(null)

  const handleDragStart = (
    e: PointerEvent,
    annotation: AnnotationType,
    partId?: number
  ) => {
    if (!dragState.current) {
      dragState.current = {
        pointerId: e.pointerId,
        initX: e.clientX,
        initY: e.clientY,
        element: e.currentTarget,
        partId,
        annotation,
        dragging: null,
        insert: null
      }
    }
  }
  const handlePointerEnd = (e: PointerEvent) => {
    if (dragState.current?.pointerId === e.pointerId) {
      if (dragState.current.insert !== null) {
        setParts(
          parts.toSpliced(dragState.current.insert, 0, {
            id: nextId.current++,
            type: 'annotation',
            annotation: dragState.current.annotation
          })
        )
      }
      dragState.current = null
      setDragged(null)
    }
  }

  return (
    <div
      className='editor'
      ref={ref}
      onPointerMove={e => {
        const state = dragState.current
        if (state?.pointerId === e.pointerId) {
          if (!state.dragging) {
            const distance = Math.hypot(
              e.clientX - state.initX,
              e.clientY - state.initY
            )
            if (distance > 10) {
              ref.current?.setPointerCapture(e.pointerId)
              const targets: DragTarget[] = []
              let top = 0
              for (const { id } of parts) {
                if (id === state.partId) {
                  continue
                }
                const rect = partElements.current[id].getBoundingClientRect()
                top ||= rect.top
                targets.push({
                  left: rect.left,
                  width: rect.width,
                  top
                })
                top += rect.height
              }
              targets.push({ ...targets[targets.length - 1], top })
              state.dragging = {
                initRect: state.element.getBoundingClientRect(),
                targets
              }
              setParts(
                parts.filter(
                  part =>
                    part.type !== 'annotation' ||
                    part.annotation !== state.annotation
                )
              )
            } else {
              return
            }
          }
          const position = {
            x: e.clientX - state.initX + state.dragging.initRect.left,
            y: e.clientY - state.initY + state.dragging.initRect.top,
            width: state.dragging.initRect.width
          }
          const insert = state.dragging.targets.reduce<{
            distance: number
            index: number | null
          }>(
            (acc, curr, index) => {
              if (e.clientX < curr.left || e.clientX > curr.left + curr.width) {
                return acc
              }
              const distance = Math.abs(e.clientY - curr.top)
              return distance < acc.distance ? { distance, index } : acc
            },
            { distance: Infinity, index: null }
          ).index
          state.insert = insert
          setDragged({
            position,
            annotation: state.annotation,
            insert
          })
        }
      }}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {dragged ? (
        <Annotation
          annotation={dragged.annotation}
          first
          last
          dragPosition={dragged.position}
        />
      ) : null}
      <div className='output'>
        <div className='menubar'>
          <strong className='logo'>Ready Room</strong>
          <button className='menubar-btn'>File</button>
          <button className='menubar-btn'>Edit</button>
        </div>
        <div className='preview'>
          <canvas
            className='canvas'
            width={size.width}
            height={size.height}
            ref={canvas}
          ></canvas>
          <div className='caption'>
            <span>{caption.content}</span>
          </div>
        </div>
        <div className='controls'>
          <button
            className='play-btn'
            onClick={() =>
              setPlayState(
                ended
                  ? { playing: true, offset: -Date.now() }
                  : playState.playing
                  ? { playing: false, time }
                  : { playing: true, offset: time - Date.now() }
              )
            }
          >
            {playState.playing && !ended ? <PauseIcon /> : <PlayIcon />}
          </button>
          <input
            type='range'
            value={time}
            onChange={e => {
              const time = e.currentTarget.valueAsNumber
              setPlayState(
                playState.playing && !ended
                  ? { playing: true, offset: time - Date.now() }
                  : { playing: false, time }
              )
            }}
            step='any'
            min={0}
            max={previewVideo.length}
            className='scrubber'
          />
        </div>
        <p>Drag into your script.</p>
        <div className='annotations'>
          <PaletteAnnotation
            defaultAnnotation={{
              type: 'set-slide',
              image: Object.assign(new Image(), { src: slideImage })
            }}
            onDragStart={handleDragStart}
          />
          <PaletteAnnotation
            defaultAnnotation={{
              type: 'set-layout',
              layout: 'slide-avatar'
            }}
            onDragStart={handleDragStart}
          />
          <PaletteAnnotation
            defaultAnnotation={{
              type: 'gesture',
              gesture: 'point',
              towards: 'top'
            }}
            onDragStart={handleDragStart}
          />
        </div>
      </div>
      <div className='script'>
        <h2>Script</h2>
        {parts.map((part, i) => (
          <Fragment key={part.id}>
            {i === dragged?.insert ? (
              <div className='insertion-point'></div>
            ) : null}
            {part.type === 'text' ? (
              <div
                className='text'
                ref={elem => {
                  if (elem) {
                    partElements.current[part.id] = elem
                  }
                }}
              >
                <TextArea
                  placeholder='Start typing...'
                  value={part.content}
                  onChange={value =>
                    setParts(parts =>
                      parts.with(i, { ...part, content: value })
                    )
                  }
                ></TextArea>
                {i > 0 && i < parts.length - 1 && part.content.trim() === '' && (
                  <button
                    className='remove-btn'
                    onClick={() => setParts(parts => parts.toSpliced(i, 1))}
                  >
                    <RemoveIcon />
                  </button>
                )}
              </div>
            ) : (
              <Annotation
                annotation={part.annotation}
                first={parts[i - 1]?.type !== 'annotation'}
                last={parts[i + 1]?.type !== 'annotation'}
                onDragStart={e => handleDragStart(e, part.annotation, part.id)}
                onEdit={annotation => {
                  setParts(parts.with(i, { ...part, annotation }))
                }}
                onRemove={() => {
                  const before = parts[i - 1]
                  const after = parts[i + 1]
                  setParts(parts =>
                    before?.type === 'text' && after?.type === 'text'
                      ? parts.toSpliced(i - 1, 3, {
                          ...before,
                          content:
                            before.content.trimEnd() +
                            (before.content.trim() !== '' &&
                            after.content.trim() !== ''
                              ? '\n\n'
                              : '') +
                            after.content.trimStart()
                        })
                      : parts.toSpliced(i, 1)
                  )
                }}
                refCallback={elem => {
                  if (elem) {
                    partElements.current[part.id] = elem
                  }
                }}
              />
            )}
            {part.type === 'annotation' && parts[i + 1]?.type === 'annotation' && (
              <div className='add-row'>
                <button
                  className='add-btn'
                  onClick={() =>
                    setParts(parts =>
                      parts.toSpliced(i + 1, 0, {
                        id: nextId.current++,
                        type: 'text',
                        content: ''
                      })
                    )
                  }
                >
                  <AddIcon /> Text
                </button>
              </div>
            )}
          </Fragment>
        ))}
        {dragged?.insert === parts.length ? (
          <div className='insertion-point'></div>
        ) : null}
      </div>
    </div>
  )
}
