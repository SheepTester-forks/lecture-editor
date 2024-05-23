import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { AddIcon } from './components/AddIcon'
import { RemoveIcon } from './components/RemoveIcon'
import { TextArea } from './components/TextArea'
import { PlayIcon } from './components/PlayIcon'
import { PauseIcon } from './components/PauseIcon'
import { Part, strategize } from './video-strategy'
import { useNow } from './useNow'
import { AnnotationContents } from './components/Annotation'
import { render } from './render/render'

type PlayState =
  | { playing: false; time: number }
  | { playing: true; offset: number }

export function App () {
  const nextId = useRef(0)
  const [parts, setParts] = useState<Part[]>([
    {
      id: -1,
      type: 'text',
      content: "Hello, I'm Bob. Welcome to CSE 12 lecture recording."
    },
    {
      id: -2,
      type: 'annotation',
      annotation: { type: 'set-layout', layout: 'avatar-only' }
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

  const context = useRef<CanvasRenderingContext2D | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (context.current) {
      render(context.current, previewVideo, time)
    }
  }, [size, previewVideo, time])

  return (
    <div className='editor'>
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
            ref={canvas => {
              context.current = canvas?.getContext('2d') ?? null

              if (!canvas?.parentElement) {
                return
              }
              new ResizeObserver(([{ contentBoxSize }]) => {
                const [{ blockSize, inlineSize }] = contentBoxSize
                setSize({
                  width: inlineSize * window.devicePixelRatio,
                  height: blockSize * window.devicePixelRatio
                })
              }).observe(canvas?.parentElement)
            }}
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
                playState.playing
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
      </div>
      <div className='script'>
        <h2>Script</h2>
        {parts.map((part, i) => (
          <Fragment key={part.id}>
            {i === 0 && (
              <div className='add-row'>
                <button
                  className='add-btn'
                  onClick={() =>
                    setParts(parts =>
                      parts.toSpliced(
                        0,
                        0,
                        {
                          id: nextId.current++,
                          type: 'text',
                          content: ''
                        },
                        {
                          id: nextId.current++,
                          type: 'annotation',
                          annotation: {
                            type: 'set-layout',
                            layout: 'slide-only'
                          }
                        }
                      )
                    )
                  }
                >
                  <AddIcon /> Annotation
                </button>
              </div>
            )}
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
              <div
                className={`annotation ${
                  parts[i - 1]?.type !== 'annotation' ? 'first' : ''
                } ${parts[i + 1]?.type !== 'annotation' ? 'last' : ''}`}
              >
                <AnnotationContents annotation={part.annotation} />
                <button
                  className='remove-btn'
                  onClick={() => {
                    const before = parts[i - 1]
                    const after = parts[i + 1]
                    console.log(
                      before?.type === 'text' && after?.type === 'text'
                    )
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
                >
                  <RemoveIcon />
                </button>
              </div>
            )}
            <div className='add-row'>
              <button
                className='add-btn'
                onClick={() =>
                  setParts(parts =>
                    i === parts.length - 1
                      ? parts.toSpliced(
                          i + 1,
                          0,
                          {
                            id: nextId.current++,
                            type: 'annotation',
                            annotation: {
                              type: 'set-layout',
                              layout: 'slide-avatar'
                            }
                          },
                          {
                            id: nextId.current++,
                            type: 'text',
                            content: ''
                          }
                        )
                      : parts.toSpliced(i + 1, 0, {
                          id: nextId.current++,
                          type: 'annotation',
                          annotation: {
                            type: 'set-layout',
                            layout: 'avatar-only'
                          }
                        })
                  )
                }
              >
                <AddIcon /> Annotation
              </button>
              {part.type === 'annotation' &&
                parts[i + 1]?.type === 'annotation' && (
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
                )}
            </div>
          </Fragment>
        ))}
        <div className='end'></div>
      </div>
    </div>
  )
}
