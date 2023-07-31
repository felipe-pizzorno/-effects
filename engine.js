
    /// RANDOM UTIL ///
    // Vector logic
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
    
    // Colors
    const primary = 'primary'
    const secondary = 'secondary'
    const black = 'black'
    const red = 'red'
    const green = 'green'
    const blue = 'blue'
    const violet = 'violet'
    const white = 'white'
    const whiteColor = [255, 255, 255]
    const blackColor = [0, 0, 0]
    const redColor = [255, 0, 0]
    const greenColor = [0, 255, 0]
    const blueColor = [0, 0, 255]
    const violetColor = sumVectors(red, blue)

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

    // Cycling
    const cycle = num => (num + 1) % pixelAmount
    const cycles2 = num => cycle(cycle(num))
    const antiCycle = num => {
      let prevNum = num - 1
      return prevNum < 0 || prevNum > pixelAmount ? pixelAmount - 1 : prevNum
    }
    /// FINISH RANDOM UTIL ///
    

    // Seconds since epoch
    const getTime = () => Math.round(Date.now())
    const updatePixels = (pixelIds, rgb, newPixelColors) => {
        pixelIds.forEach(pixelId => newPixelColors[pixelId] = rgb)
    }
    const pixelList = [0, 1, 2, 3, 4, 5, 6, 7]
    const resetPixels = (newPixelColors) => updatePixels(pixelList, 'black', newPixelColors)
    const newFrame = (pixelIds, colorId, defaultRgb) => {
        let newPixelColors = []
        for(let i = 0; i < pixelAmount; i++) {
            newPixelColors[i] = defaultRgb
        }

        pixelIds.forEach(pixelId => newPixelColors[pixelId] = colorId)
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

    var colors = {
      red: redColor,
      green: greenColor,
      blue: blueColor,
      black: blackColor,
      violet: violetColor,
      white: whiteColor,
    }
    const getColor = (colorEnriched) => {
      let ret
      if(typeof colorEnriched === 'object') {
        ret = colors[colorEnriched.color]
        ret = colorEnriched.alpha ? scale3Vector(ret, colorEnriched.alpha) : ret
      } else {
        ret = colors[colorEnriched]
      }

      if(ret === undefined || ret === null) {
        throw `Color ${colorEnriched.toString()} isn't defined...`
      }
      return ret
    }

    // Takes care of converting string colors to actual colors, and takes care of interpolating between frames
    const colorFrame = (oldFrame, nextFrame, interpolationWeight, interpolationStart) => {
        if(interpolationWeight >= interpolationStart) {
          let realInterpolationWeight = (interpolationWeight - interpolationStart) / (1 - interpolationStart) 
          let interpolatedFrames = []
          for(let i = 0; i < pixelAmount; i++) {
              interpolatedFrames[i] = interpolatePixels(getColor(oldFrame[i]), getColor(nextFrame[i]), realInterpolationWeight)
          }
          return interpolatedFrames
        } else {
          return oldFrame.map(getColor)
        }
    }
    const defaultBaseFrame = []
    updatePixels([0, 1, 2, 3, 4, 5, 6, 7], 'black', defaultBaseFrame)
    const defaultUpdate = (animationState) => animationState
    function initEngine(calculateNewAnimationState = defaultUpdate, initialState = {}, baseFrame = defaultBaseFrame, nextFrameThreshold = 500) {
      let animationState = {
          oldFrame: [...baseFrame],
          nextFrame: [...baseFrame],
          lastFrameTime: getTime(),
          timeSinceFrame: 0,
          extraFields: initialState,
      }

      const update = () => {
          colors = {
            ...colors,
            primary: hexToRgb(Primary),
            secondary: hexToRgb(Secondary),
            color3: hexToRgb(Color3),
          }
          let currentTime = getTime()
          timeSinceFrame = currentTime - animationState.lastFrameTime
          let actualNextFrameThreshold = nextFrameThreshold / Speed
          let coloredFrame = []
          let shouldStop = Speed === 0
          let shouldCalculateFrame = timeSinceFrame >= actualNextFrameThreshold
          if(!(shouldStop || !shouldCalculateFrame)) {
              animationState.lastFrameTime += actualNextFrameThreshold
              animationState.oldFrame = animationState.nextFrame
              animationState = calculateNewAnimationState(animationState)
              coloredFrame = colorFrame(animationState.oldFrame, animationState.nextFrame, (timeSinceFrame - actualNextFrameThreshold) / actualNextFrameThreshold, InterpolationStart / 10)
          } else{
            if(!shouldStop) {
                coloredFrame = colorFrame(animationState.oldFrame, animationState.nextFrame, timeSinceFrame / actualNextFrameThreshold, InterpolationStart / 10)
            } else {
                coloredFrame = animationState.oldFrame
                animationState.lastFrameTime = currentTime
            }
          }
          drawPixels(ctx, coloredFrame)
          drawTriangles(ctx, 800, 300, coloredFrame)
          window.requestAnimationFrame(update)
      }
      return update
    }
