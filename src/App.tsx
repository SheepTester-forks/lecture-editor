import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { AddIcon } from './components/AddIcon'
import { RemoveIcon } from './components/RemoveIcon'
import { TextArea } from './components/TextArea'
import { PlayIcon } from './components/PlayIcon'
import { PauseIcon } from './components/PauseIcon'
import {
  Annotation as AnnotationType,
  Part,
  strategize
} from './video-strategy'
import { useNow } from './lib/useNow'
import { AnnotationContents } from './components/AnnotationContents'
import { render } from './render/render'
import slideImage from './images/slide1.jpg'
import { Annotation, DragPosition } from './components/Annotation'
import { PaletteAnnotation } from './components/PaletteAnnotation'

type PlayState =
  | { playing: false; time: number }
  | { playing: true; offset: number }

export type DragState = {
  position: DragPosition
  annotation: AnnotationType
}

export function App () {
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

  const [dragged, setDragged] = useState<DragState | null>(null)

  const handleDrop = () => {
    setDragged(null)
  }

  return (
    <div className='editor'>
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
            onDrag={setDragged}
            onDragEnd={handleDrop}
          />
          <PaletteAnnotation
            defaultAnnotation={{
              type: 'set-layout',
              layout: 'slide-avatar'
            }}
            onDrag={setDragged}
            onDragEnd={handleDrop}
          />
          <PaletteAnnotation
            defaultAnnotation={{
              type: 'gesture',
              gesture: 'point',
              towards: 'top'
            }}
            onDrag={setDragged}
            onDragEnd={handleDrop}
          />
        </div>
      </div>
      <div className='script'>
        <h2>Script</h2>
        {parts.map((part, i) => {
          const handleRemove = () => {
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
          }
          return (
            <Fragment key={part.id}>
              {part.type === 'text' ? (
                <div className='text'>
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
                  onDragStart={handleRemove}
                  onDrag={position =>
                    setDragged({ position, annotation: part.annotation })
                  }
                  onDragEnd={handleDrop}
                  onEdit={annotation => {
                    setParts(parts.with(i, { ...part, annotation }))
                  }}
                  onRemove={handleRemove}
                />
              )}
              {part.type === 'annotation' &&
                parts[i + 1]?.type === 'annotation' && (
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
          )
        })}
      </div>
    </div>
  )
}
