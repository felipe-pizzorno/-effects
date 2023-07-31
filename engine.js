// Seconds since epoch
const getTime = () => Math.round(Date.now())
const updatePixels = (pixelIds, rgb, newPixelColors) => {
    pixelIds.forEach(pixelId => newPixelColors[pixelId] = rgb)
}
const newFrame = (pixelIds, rgb, defaultRgb) => {
    let newPixelColors = []
    for(let i = 0; i < pixelAmount; i++) {
        newPixelColors[i] = defaultRgb
    }

    pixelIds.forEach(pixelId => newPixelColors[pixelId] = rgb)
    return newPixelColors
}

const pixelSize = [3, 150]
const pixelAmount = 8
const pixelsPositions = [
    [56, 0],
    [59, 0],
    [62, 0],
    [65, 0],
    [68, 0],
    [71, 0],
    [74, 0],
    [77, 0],
]

// Engine, no need to understand it
const drawPixels = (ctx, pixelsColors) => {
    for(let i = 0; i < pixelAmount; i++) {
        const color = pixelsColors[i]
        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})` 

        const pixelPosition = pixelsPositions[i]
        ctx.fillRect(pixelPosition[0], pixelPosition[1], pixelSize[0], pixelSize[1])
    }
}

// Get the canvas element from the DOM
let c = document.getElementById("exCanvas")
let ctx = c.getContext("2d")  
const sumVectors = ([c11, c12], [c21,c22]) => [c11 + c21, c12 + c22]
const scaleVector = (scalar, [c1, c2]) => [scalar * c1, scalar * c2]
const substractVectors = ([c11, c12], [c21,c22]) => [c11 - c21, c12 - c22]

const rotate = (angle, baseVector, tangentVector) => {
  let cosBase = scaleVector(Math.cos(angle), baseVector)
  let sinTang = scaleVector(Math.sin(angle), tangentVector)
  let positiveTangent = sumVectors(cosBase, sinTang)
  let negativeTangent = substractVectors(cosBase, sinTang)

  return [positiveTangent, negativeTangent]
}
const getFanPoints = () => {
  const a = 2 * Math.PI / pixelAmount;
  const r = 20;
  const fanPoints = []

  for (var i = 0; i < pixelAmount; i++) {
    fanPoints[i] = [r * Math.cos(a * i + a * 1.5), r * Math.sin(a * i + a * 1.5)];
  }
  return fanPoints
}
let fanPoints = getFanPoints()

const drawTriangles = (ctx, x, y, pixelsColors) => {
      for(let i = 0; i < pixelAmount; i++) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + fanPoints[i][0], y + fanPoints[i][1])
        ctx.lineTo(x + fanPoints[(i + 1) % pixelAmount][0], y + fanPoints[(i + 1) % pixelAmount][1])
        ctx.fillStyle = `rgb(${pixelsColors[i][0]}, ${pixelsColors[i][1]}, ${pixelsColors[i][2]})` 
        ctx.fill()
        ctx.closePath()
      }
}

const interpolatePixels = (p1, p2, interpolationWeight) => {
    let interpolatedPixel = []
    for(let i = 0; i < 3; i++) {
        interpolatedPixel[i] = p1[i] * (1 - interpolationWeight) + p2[i] * interpolationWeight
    }
    return interpolatedPixel
}

const interpolateFrames = (oldFrame, nextFrame, interpolationWeight, interpolationStart) => {
    if(interpolationWeight >= interpolationStart) {
      let realInterpolationWeight = (interpolationWeight - interpolationStart) / (1 - interpolationStart) 
      let interpolatedFrames = []
      for(let i = 0; i < pixelAmount; i++) {
          interpolatedFrames[i] = interpolatePixels(oldFrame[i], nextFrame[i], realInterpolationWeight)
      }
      return interpolatedFrames
    } else {
      return oldFrame
    }
}

function initEngine(baseFrame, nextFrameThreshold, interpolationStart, calculateNewAnimationState) {
  let animationState = {
      oldFrame: [...baseFrame],
      nextFrame: [...baseFrame],
      lastFrameTime: getTime(),
      timeSinceFrame: 0,
      extraFields: {},
  }

  const update = () => {
      let currentTime = getTime()
      timeSinceFrame = currentTime - animationState.lastFrameTime
      if(timeSinceFrame >= nextFrameThreshold) {
          animationState.lastFrameTime += nextFrameThreshold

          let oldestFrame = animationState.oldFrame
          animationState.oldFrame = animationState.nextFrame
          animationState = calculateNewAnimationState(animationState)
          let frame = interpolateFrames(animationState.oldFrame, animationState.nextFrame, (timeSinceFrame - nextFrameThreshold) / nextFrameThreshold, interpolationStart)
          drawPixels(ctx, frame)
          drawTriangles(ctx, 160, 60, frame)
      } else {
          let interpolationWeight = timeSinceFrame / nextFrameThreshold
          let frame = interpolateFrames(animationState.oldFrame, animationState.nextFrame, timeSinceFrame / nextFrameThreshold, interpolationStart)
          drawPixels(ctx, frame)
          drawTriangles(ctx, 160, 60, frame)
      }
      window.requestAnimationFrame(update)
  }
  return update
}
