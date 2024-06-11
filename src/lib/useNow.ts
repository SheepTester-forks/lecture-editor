import { useEffect, useState } from 'react'

export function useNow (enable = true) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    let lastAnimationFrame = 0
    if (enable) {
      const check = () => {
        setNow(Date.now())
        lastAnimationFrame = window.requestAnimationFrame(check)
      }
      check()
    }
    return () => {
      window.cancelAnimationFrame(lastAnimationFrame)
    }
  }, [enable])

  return Date.now()
}
