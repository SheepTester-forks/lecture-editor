export type TextAreaProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextArea ({ value, onChange, placeholder }: TextAreaProps) {
  return (
    <div className='text-area'>
      <div className='text-area-sizer' aria-hidden>
        {value}.
      </div>
      <textarea
        className='text-area-input'
        rows={1}
        value={value}
        onChange={e => onChange(e.currentTarget.value)}
      ></textarea>
    </div>
  )
}
