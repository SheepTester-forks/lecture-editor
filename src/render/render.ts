import { Layout, Strategy } from '../video-strategy'
import khoslaPng from '../images/khosla1.png'

const FONT = `'Brix Sans', 'Source Sans 3', sans-serif`

const WIDTH = 1920
const HEIGHT = 1080
const PADDING = 20

const TRANSITION_DURATION = 500

const khosla = new Image()
khosla.src = khoslaPng

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
  avatarX: number
  avatarOpacity: number
}

export function render (
  c: CanvasRenderingContext2D,
  strategy: Strategy,
  time: number
): void {
  c.save()

  c.clearRect(0, 0, WIDTH, HEIGHT)
  c.scale(c.canvas.width / WIDTH, c.canvas.height / HEIGHT)

  const defaultLayout: Layout = 'avatar-only'
  let previousLayout: Layout | undefined
  let currentLayout: { layout: Layout; time: number } | undefined
  let previousSlide: HTMLImageElement | undefined
  let currentSlide: { image: HTMLImageElement; time: number } | undefined
  for (const action of strategy.actions) {
    if (time < action.time) {
      break
    }
    if (action.type === 'set-layout') {
      previousLayout = currentLayout?.layout
      currentLayout = action
    }
    if (action.type === 'set-slide') {
      previousSlide = currentSlide?.image
      currentSlide = action
    }
  }
  currentLayout ??= { layout: defaultLayout, time: -Infinity }
  previousLayout ??=
    currentLayout.time === 0 ? currentLayout.layout : defaultLayout

  const slideT = easeInOutCubic(
    clamp((time - (currentSlide?.time ?? -Infinity)) / TRANSITION_DURATION)
  )
  const aspect = v(
    slideT,
    previousSlide
      ? previousSlide.width / previousSlide.height || undefined
      : undefined,
    currentSlide
      ? currentSlide.image.width / currentSlide.image.height || undefined
      : undefined,
    1
  )
  // TODO: split this up
  const layoutStyles: Record<Layout, Partial<Style>> = {
    'avatar-only': {
      opacity: 0,
      avatarX: WIDTH / 2,
      avatarOpacity: 1
    },
    'slide-avatar': {
      ...contain(aspect, {
        x: PADDING,
        y: PADDING,
        width: (WIDTH * 2) / 3 - PADDING * 2,
        height: HEIGHT - PADDING * 2 - 40
      }),
      opacity: 1,
      avatarX: (WIDTH * 2.5) / 3,
      avatarOpacity: 1
    },
    'slide-only': {
      ...contain(aspect, {
        x: PADDING,
        y: PADDING,
        width: WIDTH - PADDING * 2,
        height: HEIGHT - PADDING * 2 - 40
      }),
      opacity: 1,
      avatarOpacity: 0
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
    ),
    avatarX: v(
      layoutTransition.t,
      layoutTransition.from.avatarX,
      layoutTransition.to.avatarX,
      WIDTH
    ),
    avatarOpacity: v(
      layoutTransition.t,
      layoutTransition.from.avatarOpacity,
      layoutTransition.to.avatarOpacity,
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
    if (currentSlide?.image) {
      c.drawImage(
        currentSlide.image,
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
    if (slideT < 1 && previousSlide) {
      c.globalAlpha = 1 - slideT
      c.drawImage(
        previousSlide,
        layoutStyle.x,
        layoutStyle.y,
        layoutStyle.width,
        layoutStyle.height
      )
      c.globalAlpha = 1
    }
    c.restore()
  }
  if (layoutStyle.avatarOpacity > 0) {
    c.globalAlpha = layoutStyle.avatarOpacity
    c.drawImage(khosla, layoutStyle.avatarX - 1600 / 2, HEIGHT - 900, 1600, 900)
    c.globalAlpha = 1
  }

  c.font = `40px ${FONT}`
  c.fillStyle = 'white'
  c.textAlign = 'right'
  c.fillText(
    `© ${new Date().getFullYear()} Regents of the University of California`,
    WIDTH - PADDING,
    HEIGHT - PADDING
  )

  c.restore()
}
