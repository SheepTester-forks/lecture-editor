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
        <div className='annotation'>Change to View 1</div>
        <textarea>Test</textarea>
      </div>
    </div>
  )
}
