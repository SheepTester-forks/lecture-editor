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
function contain (aspect: number, bounds: Rect): Rect {
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
  context: CanvasRenderingContext2D,
  strategy: Strategy,
  time: number
): void {
  context.save()

  context.clearRect(0, 0, WIDTH, HEIGHT)
  context.scale(context.canvas.width / WIDTH, context.canvas.height / HEIGHT)

  context.font = `40px ${FONT}`
  context.fillStyle = 'black'
  context.textAlign = 'right'
  context.fillText(
    `© ${new Date().getFullYear()} Regents of the University of California`,
    WIDTH - PADDING,
    HEIGHT - PADDING
  )

  let previousLayout: Layout | undefined
  let currentLayout: { layout: Layout; time: number } | undefined
  for (const action of strategy.actions) {
    if (time < action.time) {
      break
    }
    if (action.type === 'set-layout') {
      previousLayout = currentLayout?.layout
      currentLayout = action
    }
  }

  const layoutStyles: Record<Layout, Partial<Style>> = {
    'avatar-only': { opacity: 0 },
    'slide-avatar': {
      ...contain(1.5 + Math.sin(time / 1000) / 2, {
        x: PADDING,
        y: PADDING,
        width: (WIDTH * 2) / 3 - PADDING * 2,
        height: HEIGHT - PADDING * 2 - 40
      }),
      opacity: 1
    },
    'slide-only': {
      ...contain(1.5 + Math.sin(time / 1000) / 2, {
        x: PADDING,
        y: PADDING,
        width: WIDTH - PADDING * 2,
        height: HEIGHT - PADDING * 2 - 40
      }),
      opacity: 1
    }
  }
  const defaultLayout: Layout = 'avatar-only'
  const layoutTransition = {
    from: layoutStyles[previousLayout ?? defaultLayout],
    to: layoutStyles[currentLayout?.layout ?? defaultLayout],
    t: easeInOutCubic(
      clamp((time - (currentLayout?.time ?? -Infinity)) / TRANSITION_DURATION)
    )
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

  if (layoutStyle.opacity > 0) {
    context.globalAlpha = layoutStyle.opacity
    context.fillStyle = 'white'
    context.fillRect(
      layoutStyle.x,
      layoutStyle.y,
      layoutStyle.width,
      layoutStyle.height
    )
    context.globalAlpha = 1
  }

  context.restore()
}
