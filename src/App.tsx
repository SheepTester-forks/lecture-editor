import { Fragment, useRef, useState } from 'react'
import { AddIcon } from './components/AddIcon'
import { RemoveIcon } from './components/RemoveIcon'
import { TextArea } from './components/TextArea'
import { PlayIcon } from './components/PlayIcon'
import { PauseIcon } from './components/PauseIcon'

type Annotation =
  | { type: 'animation'; value: string }
  | { type: 'set-layout'; value: string }
  | { type: 'set-background'; value: string }
type Part = (
  | { type: 'text'; content: string }
  | { type: 'annotation'; annotation: Annotation }
) & { id: number }

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
      annotation: { type: 'set-layout', value: 'Lecturer Only' }
    },
    {
      id: -3,
      type: 'annotation',
      annotation: { type: 'animation', value: 'Show Name' }
    },
    {
      id: -4,
      type: 'annotation',
      annotation: { type: 'set-background', value: 'Scripps Pier' }
    },
    {
      id: -5,
      type: 'text',
      content: 'Today we will talk about things.'
    }
  ])
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)

  return (
    <div className='editor'>
      <div className='output'>
        <div className='menubar'>
          <strong className='logo'>Lecture Editor</strong>
          <button className='menubar-btn'>File</button>
          <button className='menubar-btn'>Edit</button>
        </div>
        <div className='preview'></div>
        <div className='controls'>
          <button className='play-btn' onClick={() => setPlaying(!playing)}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <input
            type='range'
            value={time}
            onChange={e => setTime(e.currentTarget.valueAsNumber)}
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
                          annotation: { type: 'animation', value: 'hey' }
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
                <span>
                  {part.annotation.type === 'animation'
                    ? 'Play animation'
                    : part.annotation.type === 'set-background'
                    ? 'Change background to'
                    : part.annotation.type === 'set-layout'
                    ? 'Change layout to'
                    : ''}{' '}
                  <strong>{part.annotation.value}</strong>
                </span>
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
                            annotation: { type: 'animation', value: 'hey' }
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
                          annotation: { type: 'animation', value: 'hey' }
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
