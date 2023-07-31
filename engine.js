
    /// RANDOM UTIL ///
    const cycle = num => (num + 1) % pixelAmount
    const cycles2 = num => cycle(cycle(num))
    const antiCycle = num => {
      let prevNum = num - 1
      return prevNum < 0 || prevNum > pixelAmount ? pixelAmount - 1 : prevNum
    }
    function hexToRgb(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : null;
    }
    const sum3Vectors = ([c11, c12, c13], [c21,c22, c23]) => [c11 + c21, c12 + c22, c13 + c23]
    const scale3Vector = ([c1, c2, c3], scalar) => [scalar * c1, scalar * c2, scalar * c3]
    const substract3Vectors = ([c11, c12, c13], [c21, c22, c23]) => [c11 - c21, c12 - c22, c13 - c23]
    const sumVectors = ([c11, c12], [c21, c22]) => [c11 + c21, c12 + c22]
    const scaleVector = (scalar, [c1, c2]) => [scalar * c1, scalar * c2]
    const substractVectors = ([c11, c12], [c21, c22]) => [c11 - c21, c12 - c22]

    const rotate = (angle, baseVector, tangentVector) => {
      let cosBase = scaleVector(Math.cos(angle), baseVector)
      let sinTang = scaleVector(Math.sin(angle), tangentVector)
      let positiveTangent = sumVectors(cosBase, sinTang)
      let negativeTangent = substractVectors(cosBase, sinTang)

      return [positiveTangent, negativeTangent]
    }
    /// FINISH RANDOM UTIL ///
    

    // Seconds since epoch
    const getTime = () => Math.round(Date.now())
    const updatePixels = (pixelIds, rgb, newPixelColors) => {
        pixelIds.forEach(pixelId => newPixelColors[pixelId] = rgb)
    }
    const pixelList = [0, 1, 2, 3, 4, 5, 6, 7]
    const resetPixels = (newPixelColors) => updatePixels(pixelList, [0, 0, 0], newPixelColors)
    const newFrame = (pixelIds, rgb, defaultRgb) => {
        let newPixelColors = []
        for(let i = 0; i < pixelAmount; i++) {
            newPixelColors[i] = defaultRgb
        }

        pixelIds.forEach(pixelId => newPixelColors[pixelId] = rgb)
        return newPixelColors
    }

    const pixelSize = [12, 740]
    const pixelAmount = 8
    const initial = 240
    const pixelsPositions = [
        [initial, 0],
        [initial + pixelSize[0] * 1, 0],
        [initial + pixelSize[0] * 2, 0],
        [initial + pixelSize[0] * 3, 0],
        [initial + pixelSize[0] * 4, 0],
        [initial + pixelSize[0] * 5, 0],
        [initial + pixelSize[0] * 6, 0],
        [initial + pixelSize[0] * 7, 0],
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
    let c = document.getElementById('exCanvas')
    let ctx = c.getContext('2d')  

    const fanLedAngle = -2 * Math.PI / pixelAmount;
    const fanBaseRotation = - Math.PI / 2.66

    const getFanPoints = () => {
      const r = 100;
      const fanPoints = []

      for (var i = 0; i < pixelAmount; i++) {
        fanPoints[i] = [r * Math.cos(fanLedAngle * i + fanBaseRotation), r * Math.sin(fanLedAngle * i + fanBaseRotation)];
      }
      return fanPoints
    }
    let fanPoints = getFanPoints()

    const drawTriangles = (ctx, x, y, pixelsColors) => {
          for(let i = 0; i < pixelAmount; i++) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + fanPoints[i][0], y + fanPoints[i][1])
            ctx.lineTo(x + fanPoints[cycle(i)][0], y + fanPoints[cycle(i)][1])
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
    const defaultBaseFrame = []
    updatePixels([0, 1, 2, 3, 4, 5, 6, 7], [0, 0, 0], defaultBaseFrame)
    const defaultUpdate = (animationState) => animationState

    function initEngine(calculateNewAnimationState = defaultUpdate, initialState = {}, baseFrame = defaultBaseFrame, nextFrameThreshold = 500, interpolationStart = 0) {
      let animationState = {
          oldFrame: [...baseFrame],
          nextFrame: [...baseFrame],
          lastFrameTime: getTime(),
          timeSinceFrame: 0,
          extraFields: initialState,
      }

      const update = () => {
          let currentTime = getTime()
          timeSinceFrame = currentTime - animationState.lastFrameTime
          let actualNextFrameThreshold = nextFrameThreshold / speed
          let frame = []
          let shouldStop = speed === 0
          let shouldCalculateFrame = timeSinceFrame >= actualNextFrameThreshold
          if(!(shouldStop || !shouldCalculateFrame)) {
              animationState.lastFrameTime += actualNextFrameThreshold
              animationState.oldFrame = animationState.nextFrame
              animationState = calculateNewAnimationState(animationState)
              frame = interpolateFrames(animationState.oldFrame, animationState.nextFrame, (timeSinceFrame - actualNextFrameThreshold) / actualNextFrameThreshold, interpolationStart)
          } else{
            if(!shouldStop) {
                frame = interpolateFrames(animationState.oldFrame, animationState.nextFrame, timeSinceFrame / actualNextFrameThreshold, interpolationStart)
            } else {
                frame = animationState.oldFrame
                animationState.lastFrameTime = currentTime
            }
          }
          drawPixels(ctx, frame)
          drawTriangles(ctx, 800, 300, frame)
          window.requestAnimationFrame(update)
      }
      return update
    }
