import { Layout, Strategy } from '../video-strategy'

const FONT = `'Brix Sans', 'Source Sans 3', sans-serif`

const WIDTH = 1920
const HEIGHT = 1080
const PADDING = 20

const TRANSITION_DURATION = 500

function clamp (value: number, min = 0, max = 1): number {
  if (value > max) {
    return max
  }
  if (value < min) {
    return min
  }
  return value
}

function easeInOutCubic (t: number): number {
  t *= 2
  if (t < 1) {
    return (t * t * t) / 2
  }
  t -= 2
  return (t * t * t + 2) / 2
}

function v (
  t: number,
  from: number | undefined,
  to: number | undefined,
  defaultValue: number
): number {
  if (from === undefined) {
    return to ?? defaultValue
  } else if (to === undefined) {
    return from
  }
  return from + (to - from) * t
}

type Rect = { x: number; y: number; width: number; height: number }
function contain (aspect: number | null, bounds: Rect): Rect {
  if (aspect === null) {
    return bounds
  }
  const width = Math.min(bounds.width, bounds.height * aspect)
  const height = width / aspect
  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + (bounds.height - height) / 2,
    width,
    height
  }
}

type Style = Rect & {
  opacity: number
}

export function render (
  c: CanvasRenderingContext2D,
  strategy: Strategy,
  time: number
): void {
  c.save()

  c.clearRect(0, 0, WIDTH, HEIGHT)
  c.scale(c.canvas.width / WIDTH, c.canvas.height / HEIGHT)

  c.font = `40px ${FONT}`
  c.fillStyle = 'black'
  c.textAlign = 'right'
  c.fillText(
    `© ${new Date().getFullYear()} Regents of the University of California`,
    WIDTH - PADDING,
    HEIGHT - PADDING
  )

  const defaultLayout: Layout = 'avatar-only'
  let previousLayout: Layout | undefined
  let currentLayout: { layout: Layout; time: number } | undefined
  let previousSlide: HTMLImageElement | undefined
  let currentSlide: HTMLImageElement | undefined
  for (const action of strategy.actions) {
    if (time < action.time) {
      break
    }
    if (action.type === 'set-layout') {
      previousLayout = currentLayout?.layout
      currentLayout = action
    }
    if (action.type === 'set-slide') {
      previousSlide = currentSlide
      currentSlide = action.image
    }
  }
  previousLayout ??= defaultLayout
  currentLayout ??= { layout: defaultLayout, time: -Infinity }

  const layoutStyles: Record<Layout, Partial<Style>> = {
    'avatar-only': { opacity: 0 },
    'slide-avatar': {
      ...contain(
        currentSlide ? currentSlide.width / currentSlide.height || null : null,
        {
          x: PADDING,
          y: PADDING,
          width: (WIDTH * 2) / 3 - PADDING * 2,
          height: HEIGHT - PADDING * 2 - 40
        }
      ),
      opacity: 1
    },
    'slide-only': {
      ...contain(
        currentSlide ? currentSlide.width / currentSlide.height || null : null,
        {
          x: PADDING,
          y: PADDING,
          width: WIDTH - PADDING * 2,
          height: HEIGHT - PADDING * 2 - 40
        }
      ),
      opacity: 1
    }
  }
  const layoutTransition = {
    from: layoutStyles[previousLayout],
    to: layoutStyles[currentLayout.layout],
    t: easeInOutCubic(clamp((time - currentLayout.time) / TRANSITION_DURATION))
  }
  const layoutStyle: Style = {
    x: v(layoutTransition.t, layoutTransition.from.x, layoutTransition.to.x, 0),
    y: v(layoutTransition.t, layoutTransition.from.y, layoutTransition.to.y, 0),
    width: v(
      layoutTransition.t,
      layoutTransition.from.width,
      layoutTransition.to.width,
      0
    ),
    height: v(
      layoutTransition.t,
      layoutTransition.from.height,
      layoutTransition.to.height,
      0
    ),
    opacity: v(
      layoutTransition.t,
      layoutTransition.from.opacity,
      layoutTransition.to.opacity,
      1
    )
  }

  const radius = 20
  if (layoutStyle.opacity > 0) {
    c.save()
    c.globalAlpha = layoutStyle.opacity
    c.beginPath()
    c.moveTo(layoutStyle.x + radius, layoutStyle.y)
    c.arc(
      layoutStyle.x + layoutStyle.width - radius,
      layoutStyle.y + radius,
      radius,
      (3 * Math.PI) / 2,
      (4 * Math.PI) / 2
    )
    c.arc(
      layoutStyle.x + layoutStyle.width - radius,
      layoutStyle.y + layoutStyle.height - radius,
      radius,
      (4 * Math.PI) / 2,
      (1 * Math.PI) / 2
    )
    c.arc(
      layoutStyle.x + radius,
      layoutStyle.y + layoutStyle.height - radius,
      radius,
      (1 * Math.PI) / 2,
      (2 * Math.PI) / 2
    )
    c.arc(
      layoutStyle.x + radius,
      layoutStyle.y + radius,
      radius,
      (2 * Math.PI) / 2,
      (3 * Math.PI) / 2
    )

    c.closePath()
    c.clip()
    if (currentSlide) {
      c.drawImage(
        currentSlide,
        layoutStyle.x,
        layoutStyle.y,
        layoutStyle.width,
        layoutStyle.height
      )
    } else {
      c.fillStyle = 'white'
      c.fillRect(
        layoutStyle.x,
        layoutStyle.y,
        layoutStyle.width,
        layoutStyle.height
      )
    }
    c.restore()
  }

  c.restore()
}
