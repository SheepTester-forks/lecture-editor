import { Fragment, useRef, useState } from 'react'
import { AddIcon } from './components/AddIcon'

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
  return (
    <div className='editor'>
      <div className='output'>
        <div className='menubar'>
          <strong className='logo'>Lecture Editor</strong>
          <button className='menubar-btn'>File</button>
          <button className='menubar-btn'>Edit</button>
        </div>
        <div className='preview'></div>
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
              <textarea placeholder='Start typing...' rows={1}>
                {part.content}
              </textarea>
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
              </div>
            )}
            <div className='add-row'>
              <button
                className='add-btn'
                onClick={() =>
                  setParts(parts =>
                    parts.toSpliced(i + 1, 0, {
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
