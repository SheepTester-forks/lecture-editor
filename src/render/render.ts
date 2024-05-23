import { Layout, Strategy } from '../video-strategy'

const FONT = `'Brix Sans', 'Source Sans 3', sans-serif`

const WIDTH = 1920
const HEIGHT = 1080
const PADDING = 20

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

  let layout: Layout = 'avatar-only'
  for (const action of strategy.actions) {
    if (time < action.time) {
      break
    }
    if (action.type === 'set-layout') {
      layout = action.layout
    }
  }

  if (layout === 'slide-only') {
    context.fillStyle = 'white'
    context.fillRect(
      PADDING,
      PADDING,
      WIDTH - PADDING * 2,
      HEIGHT - PADDING * 2 - 40
    )
  }

  context.restore()
}
