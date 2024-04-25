import { AddIcon } from './components/AddIcon'

export function App () {
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
        <textarea rows={1}>Test</textarea>
        <div className='add-row'>
          <button className='add-btn'>
            <AddIcon /> Annotation
          </button>
        </div>
        <div className='annotation first'>
          <span>
            Change layout to <strong>Lecturer Only</strong>
          </span>
        </div>
        <div className='add-row'>
          <button className='add-btn'>
            <AddIcon /> Annotation
          </button>
          <button className='add-btn'>
            <AddIcon /> Text
          </button>
        </div>
        <div className='annotation'>Show name</div>
        <div className='add-row'>
          <button className='add-btn'>
            <AddIcon /> Annotation
          </button>
          <button className='add-btn'>
            <AddIcon /> Text
          </button>
        </div>
        <div className='annotation last'>
          <span>
            Change background to <strong>Scripps Pier</strong>
          </span>
        </div>
        <div className='add-row'>
          <button className='add-btn'>
            <AddIcon /> Annotation
          </button>
        </div>
        <textarea>Test</textarea>
      </div>
    </div>
  )
}
