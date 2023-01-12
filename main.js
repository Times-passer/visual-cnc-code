// 初次加载时绘制坐标轴，并调用mouse函数实现实时显示坐标
window.onload = () => {
  initCanvas()
  mouse()
}

// 获取id="canvas"的元素作为画布
const canvas = document.querySelector('#canvas')
// 设置画布的宽高
canvas.width = 600
canvas.height = 600
// 构建二维渲染上下文
const ccsContext = canvas.getContext('2d')
// 将画布的起点移动到画布中心，作为坐标轴原点
ccsContext.translate(canvas.width / 2, canvas.height / 2)

// 为页面上的元素绑定常量，才能实现后续的逻辑操作
const text = document.querySelector('#text')
const btnIm1 = document.querySelector('#btnIm1')
const btnIm2 = document.querySelector('#btnIm2')
const btnIm3 = document.querySelector('#btnIm3')
const btnDraw = document.querySelector('#btnDraw')
const patch = document.querySelector('#patch')
const rotate = document.querySelector('#rotate')
const rpm = document.querySelector('#rpm')
const speed = document.querySelector('#speed')
const lqy = document.querySelector('#lqy')
const cx = document.querySelector('#cx')

btnIm1.addEventListener('click', () => {
  ccsContext.clearRect(-300, -300, canvas.width, canvas.height)
  initCanvas()
  patch.innerHTML = ''
  rotate.innerHTML = ''
  rpm.innerHTML = ''
  speed.innerHTML = ''
  lqy.innerHTML = ''
  text.value =
    'G92 X0 Y0\nG90 G00 X10 Y12 S600 M03\nM07\nG01 Y28 F100\nX42\nY12\nX10\nG00 X0 Y0\nM05\nM09\nM02'
})

btnIm2.addEventListener('click', () => {
  ccsContext.clearRect(-300, -300, canvas.width, canvas.height)
  initCanvas()
  patch.innerHTML = ''
  rotate.innerHTML = ''
  rpm.innerHTML = ''
  speed.innerHTML = ''
  lqy.innerHTML = ''
  text.value =
    'G92 X0 Y0\nG90 G00 X25 Y10 S700 M04\nM08\nG01 X40 Y20 F120\nX25 Y30\nX10 Y20\nX25 Y10\nG00 X0 Y0\nM05\nM09\nM02'
})

btnIm3.addEventListener('click', () => {
  ccsContext.clearRect(-300, -300, canvas.width, canvas.height)
  initCanvas()
  patch.innerHTML = ''
  rotate.innerHTML = ''
  rpm.innerHTML = ''
  speed.innerHTML = ''
  lqy.innerHTML = ''
  text.value =
    'G92 X0 Y0\nG90 G17 G00 X10 Y10 S500 M04\nM08\nG01 X30 F80\nG03 X40 Y20 I0 J10\nG02 X30 Y30 I0 J10\nG01 X10 Y20\nY10\nG00 X0 Y0\nM05\nM09\nM02'
})

// 初始化存放NC代码的数组、起点、坐标、以及后续代码需要用到的常量
let a = ''
let b = []
let x1 = 0
let y1 = 0
let drawG0 = ''
let l = {
  length: 0,
}
let i = {
  length: 0,
}

btnDraw.addEventListener('click', () => {
  if (text.value == '') {
    alert('请输入NC代码')
  } else {
    text.setAttribute('disabled', 'disabled')
    btnIm1.setAttribute('disabled', 'disabled')
    btnIm2.setAttribute('disabled', 'disabled')
    btnIm3.setAttribute('disabled', 'disabled')
    btnDraw.setAttribute('disabled', 'disabled')

    ccsContext.clearRect(-300, -300, canvas.width, canvas.height) // 每次绘制时清空上次的画布
    initCanvas() // 重绘坐标轴
    patch.innerHTML = ''
    rotate.innerHTML = ''
    rpm.innerHTML = ''
    speed.innerHTML = ''
    lqy.innerHTML = ''

    a = text.value // 获取文本框的NC代码,并存入字符串a中
    b = a.split(/\n/g) // 将全部NC代码通过正则表达式拆分,并存入数组b中
    l.length = b.length

    // 设置默认值
    x1 = 0
    y1 = 0
    drawG0[0] = 'G00'

    // 循环分析NC代码
    var countdown = function () {
      var setTimeoutHandler = setTimeout(function () {
        step() // 逐步加工函数
        if (i.length == 0 && l.length == 0) {
          clearTimeout(setTimeoutHandler)
        } else {
          countdown()
        }
      }, 1000)
    }
    countdown()
  }
})

// 逐步加工函数
function step() {
  if (i.length < l.length) {
    patch.innerHTML = `正在执行第${i.length + 1}行NC代码...`

    const line = b[i.length]
    let c = line.split(' ')

    // 检查是否存在S开头的转速指令
    let hasS = c.find((element) => {
      let rg = /^S/
      if (rg.test(element)) return true
      // 如果存在S开头的字符串，则返回true【.find()方法内的函数如果返回了true .find()就会返回这个字符串】
      return false
    })
    if (hasS) {
      // 如果存在S开头的字符串，那么hasS里就存放着这个字符串，我们需要把这个字符串的首字母通过.slice(1)去掉，拿到后面的数字
      rpm.innerHTML = `主轴转速：${hasS.slice(1)} r/min`
    }

    // 检查是否存在F开头的进给速度指令
    let hasF = c.find((element) => {
      let rg = /^F/
      if (rg.test(element)) return true
      return false
    })
    if (hasF) {
      speed.innerHTML = `进给速度：${hasF.slice(1)} mm/min`
    }

    // 检查是否存在M开头的指令
    let hasM = c.find((element) => {
      let rg = /^M/
      if (rg.test(element)) return true
      return false
    })
    if (hasM) {
      if (hasM == 'M03') rotate.innerHTML = '主轴旋转方向：顺时针'
      if (hasM == 'M04') rotate.innerHTML = '主轴旋转方向：逆时针'
      if (hasM == 'M05') {
        rotate.innerHTML = '主轴停止'
        rpm.innerHTML = '主轴转速： 0r/min'
        speed.innerHTML = '进给速度： 0mm/min'
      }
      if (hasM == 'M02') {
        rotate.innerHTML = '机床复位'
        rpm.innerHTML = ''
        speed.innerHTML = ''
      }
      if (hasM == 'M07') {
        lqy.innerHTML = '2号冷却液开'
      }
      if (hasM == 'M08') {
        lqy.innerHTML = '1号冷却液开'
      }
      if (hasM == 'M09') {
        lqy.innerHTML = '冷却液关'
      }
    }

    // 检查是否存在X开头的坐标信息
    let hasX = c.find((element) => {
      let rg = /^X/
      if (rg.test(element)) return true
      return false
    })
    // 如果有X开头的指令，则将字符串转化成数字
    if (hasX) {
      hasX = Number(hasX.slice(1))
    }
    // 如果没有X开头的指令，则沿用上一步的X坐标
    else {
      hasX = x1
    }

    // 检查是否存在Y开头的坐标信息
    let hasY = c.find((element) => {
      let rg = /^Y/
      if (rg.test(element)) return true
      return false
    })
    // 如果有Y开头的指令，则将字符串转化成数字
    if (hasY) {
      hasY = Number(hasY.slice(1))
    }
    // 如果没有Y开头的指令，则沿用上一步的Y坐标
    else {
      hasY = y1
    }

    // 检查是否存在I开头的指令
    let hasI = c.find((element) => {
      let rg = /^I/
      if (rg.test(element)) return true
      return false
    })
    // 如果有I开头的指令，则将字符串转化成数字
    if (hasI) {
      hasI = Number(hasI.slice(1))
    }

    // 检查是否存在J开头的指令
    let hasJ = c.find((element) => {
      let rg = /^J/
      if (rg.test(element)) return true
      return false
    })
    // 如果有J开头的指令，则将字符串转化成数字
    if (hasJ) {
      hasJ = Number(hasJ.slice(1))
    }

    // 检查是否存在G0开头的插补指令
    let hasG0 = c.find((element) => {
      let rg = /^G0/
      if (rg.test(element)) return true
      return false
    })
    // 如果连着G01 下一行就不写G01了 所以得保存上一次的G0开头指令
    if (hasG0) {
      drawG0 = hasG0
    }

    // 不同的G指令情况
    if (drawG0) {
      switch (drawG0) {
        case 'G01':
          drawLineFlash(ccsContext, x1, y1, hasX, hasY)
          // drawLine(ccsContext, x1, y1, hasX, hasY);
          // 每次画完一条线，这次的终点即为下次绘制的起点，所以本次画完后，更新起点坐标x1 y1
          x1 = hasX
          y1 = hasY
          break
        case 'G02': //顺时针圆弧
          drawArcFlash(ccsContext, x1, y1, hasX, hasY, hasI, hasJ, false)
          // 每次画完一条线，这次的终点即为下次绘制的起点，所以本次画完后，更新起点坐标x1 y1
          x1 = hasX
          y1 = hasY
          break
        case 'G03': //逆时针圆弧
          drawArcFlash(ccsContext, x1, y1, hasX, hasY, hasI, hasJ, true)
          // 每次画完一条线，这次的终点即为下次绘制的起点，所以本次画完后，更新起点坐标x1 y1
          x1 = hasX
          y1 = hasY
          break
        default:
          // G00 是点定位，不需要插补，所以无需绘制，只需更新起点坐标x1 y1
          x1 = hasX
          y1 = hasY
          break
      }
    }
    i.length++
  } else {
    i.length = 0
    l.length = 0
    x1 = 0
    y1 = 0
    patch.innerHTML = 'NC代码运行完毕'
    text.removeAttribute('disabled')
    btnIm1.removeAttribute('disabled')
    btnIm2.removeAttribute('disabled')
    btnIm3.removeAttribute('disabled')
    btnDraw.removeAttribute('disabled')
  }
}

// 直线绘制动画
async function drawLineFlash(canvasContext, x1, y1, x2, y2) {
  // 把绘制的轨迹放大5倍，因为1像素对于人眼的观察来说太小了；并且用数组存储才能传址
  let X1 = [x1 * 5]
  let Y1 = [y1 * 5]
  let X2 = [x2 * 5]
  let Y2 = [y2 * 5]
  let tanFlag = Math.atan2(Y2[0] - Y1[0], X2[0] - X1[0])
  let drawFlag = 0

  let timer = null
  timer = setInterval(() => {
    debugger
    console.log('flagDraw')
    console.log(X2[0], X1[0], Y2[0], Y1[0])
    // 第一象限
    if (X2[0] > X1[0] && Y2[0] > Y1[0]) drawFlag = 1
    // 第二象限
    if (X2[0] < X1[0] && Y2[0] > Y1[0]) drawFlag = 2
    // 第三象限
    if (X2[0] < X1[0] && Y2[0] < Y1[0]) drawFlag = 3
    // 第四象限
    if (X2[0] > X1[0] && Y2[0] < Y1[0]) drawFlag = 4
    // 上
    if (X2[0] == X1[0] && Y2[0] > Y1[0]) drawFlag = 5
    // 左
    if (X2[0] < X1[0] && Y2[0] == Y1[0]) drawFlag = 6
    // 下
    if (X2[0] == X1[0] && Y2[0] < Y1[0]) drawFlag = 7
    // 右
    if (X2[0] > X1[0] && Y2[0] == Y1[0]) drawFlag = 8

    flagDraw(canvasContext, X1, Y1, X2, Y2, tanFlag, drawFlag)
    // 如果已经到达终点，停止setInterval()循环
    if (X2[0] == X1[0] && Y2[0] == Y1[0]) {
      clearInterval(timer)
    }
  }, 1)
}

// 象限判断函数：根据不同象限，执行不同插补
function flagDraw(canvasContext, X1, Y1, X2, Y2, tanFlag, drawFlag) {
  switch (drawFlag) {
    // 第一象限
    case 1:
      if (Math.atan2(Y2[0] - Y1[0], X2[0] - X1[0]) > tanFlag) {
        upDraw(canvasContext, X1, Y1)
      } else {
        rightDraw(canvasContext, X1, Y1)
      }
      break
    // 第二象限
    case 2:
      if (Math.atan2(Y2[0] - Y1[0], X2[0] - X1[0]) < tanFlag) {
        upDraw(canvasContext, X1, Y1)
      } else {
        leftDraw(canvasContext, X1, Y1)
      }
      break
    // 第三象限
    case 3:
      if (Math.atan2(Y2[0] - Y1[0], X2[0] - X1[0]) > tanFlag) {
        downDraw(canvasContext, X1, Y1)
      } else {
        leftDraw(canvasContext, X1, Y1)
      }
      break
    // 第四象限
    case 4:
      if (Math.atan2(Y2[0] - Y1[0], X2[0] - X1[0]) < tanFlag) {
        downDraw(canvasContext, X1, Y1)
      } else {
        rightDraw(canvasContext, X1, Y1)
      }
      break
    // 上
    case 5:
      upDraw(canvasContext, X1, Y1)
      break
    // 左
    case 6:
      leftDraw(canvasContext, X1, Y1)
      break
    // 下
    case 7:
      downDraw(canvasContext, X1, Y1)
      break
    // 右
    case 8:
      rightDraw(canvasContext, X1, Y1)
      break
    default:
      break
  }
}

// 单步绘制函数
function rightDraw(canvasContext, X1, Y1) {
  canvasContext.beginPath()
  canvasContext.moveTo(X1[0], -Y1[0])
  canvasContext.lineTo(++X1[0], -Y1[0])
  canvasContext.stroke()
}
function leftDraw(canvasContext, X1, Y1) {
  canvasContext.beginPath()
  canvasContext.moveTo(X1[0], -Y1[0])
  canvasContext.lineTo(--X1[0], -Y1[0])
  canvasContext.stroke()
}
function upDraw(canvasContext, X1, Y1) {
  canvasContext.beginPath()
  canvasContext.moveTo(X1[0], -Y1[0])
  // 为了保证在外部判断象限的时候不出错，那么就得保证Y1这个数组始终是为正数；
  // 所以应该先保证 ++Y1[0] ，然后只在画线的时候向API传入负数
  canvasContext.lineTo(X1[0], -++Y1[0])
  canvasContext.stroke()
}
function downDraw(canvasContext, X1, Y1) {
  canvasContext.beginPath()
  canvasContext.moveTo(X1[0], -Y1[0])
  // 为了保证在外部判断象限的时候不出错，那么就得保证Y1这个数组始终是为正数；
  // 所以应该先保证 --Y1[0] ，然后只在画线的时候向API传入负数
  canvasContext.lineTo(X1[0], -(--Y1[0]))
  canvasContext.stroke()
}

// 圆弧绘制动画
function drawArcFlash(canvasContext, x1, y1, x2, y2, i, j, anticlockwise) {
  // 计算圆心坐标
  let x = (x1 + i) * 5
  let y = (y1 + j) * 5
  x2 *= 5
  y2 *= 5
  // 计算圆弧半径
  let r = Math.sqrt(Math.pow(i * 5, 2) + Math.pow(j * 5, 2))
  // 计算圆弧的起始弧度
  let startAngle = [Math.atan2(j, -i)]
  // 计算圆弧的终点弧度
  let endAngle = [Math.atan2(y - y2, x2 - x)]

  // 因为JavaScript 的X轴负半轴为+3.14，为了保证逆时针在每个象限都是越来越小，顺时针是越来越大。所以要警惕以下2种特殊情况
  if (startAngle[0] == Math.atan2(0, -10) && endAngle[0] < 0) {
    startAngle[0] = -startAngle[0]
  }

  if (startAngle[0] < 0 && endAngle[0] == Math.atan2(0, -10)) {
    endAngle[0] = -endAngle[0]
  }

  let timer = null
  timer = setInterval(() => {
    console.log('setInterval')
    arcDraw(canvasContext, x, y, r, startAngle, anticlockwise)
    // 因为顺时针的终点弧度比起点弧度大，所以当起点弧度自增到超过终点弧度，就代表该弧线已经画完
    if (anticlockwise == false && startAngle[0] > endAngle[0]) {
      clearInterval(timer)
    }
    // 因为逆时针的终点弧度比起点弧度小，所以当起点弧度自减到小于终点弧度，就代表该弧线已经画完
    if (anticlockwise == true && startAngle[0] < endAngle[0]) {
      clearInterval(timer)
    }
  }, 1)

  // 圆弧单步绘制函数
  function arcDraw(canvasContext, x, y, r, startAngle, anticlockwise) {
    let temAngle
    if (anticlockwise == false) {
      temAngle = startAngle[0] + 0.01
    } else {
      temAngle = startAngle[0] - 0.01
    }
    // anticlockwise 参数表示从终点到起点，false顺时针绘制圆弧，true逆时针绘制圆弧；
    canvasContext.beginPath()
    //因为JavaScript的圆弧绘制函数是以x轴方向开始计算，且y轴向下为正，所以y用负号
    canvasContext.arc(x, -y, r, startAngle[0], temAngle, anticlockwise)
    canvasContext.stroke()
    if (anticlockwise == false) {
      startAngle[0] += 0.01
    } else {
      startAngle[0] -= 0.01
    }
  }
}

// 封装直线绘制函数
function drawArcLine(canvasContext, x1, y1, x2, y2) {
  canvasContext.beginPath()
  canvasContext.moveTo(x1, -y1)
  canvasContext.lineTo(x2, -y2)
  canvasContext.stroke()
}

// 封装箭头绘制函数
function fillTriangle(canvasContext, x0, y0, x1, y1, x2, y2) {
  canvasContext.beginPath()
  canvasContext.moveTo(x0, -y0)
  canvasContext.lineTo(x1, -y1)
  canvasContext.lineTo(x2, -y2)
  canvasContext.closePath()
  canvasContext.fill()
}

// 绘制直角坐标系函数
function initCanvas() {
  // 画 x 正半轴
  drawArcLine(ccsContext, 0, 0, canvas.width / 2, 0)
  // 设置每20px为一格
  const offset = 20
  // 画 x 正半轴上的刻度
  for (let i = 0; i < canvas.width / 2 / offset; i++) {
    drawArcLine(ccsContext, offset * i, 0, offset * i, 4)
  }
  // 画 x 正半轴的箭头
  fillTriangle(
    ccsContext,
    canvas.width / 2 - 10,
    5,
    canvas.width / 2,
    0,
    canvas.width / 2 - 10,
    -5
  )
  // 画 x 负半轴
  drawArcLine(ccsContext, 0, 0, -canvas.width / 2, 0)
  // 画 x 负半轴上的刻度
  for (let i = 0; i < canvas.width / 2 / offset; i++) {
    drawArcLine(ccsContext, -offset * i, 0, -offset * i, 4)
  }

  // 画 y 正半轴
  drawArcLine(ccsContext, 0, 0, 0, canvas.height / 2)
  // 画 y 正半轴上的刻度
  for (let i = 0; i < canvas.height / 2 / offset; i++) {
    drawArcLine(ccsContext, 0, offset * i, 4, offset * i)
  }
  // 画 y 正半轴的箭头
  fillTriangle(
    ccsContext,
    5,
    canvas.height / 2 - 10,
    0,
    canvas.height / 2,
    -5,
    canvas.height / 2 - 10
  )
  // 画 y 负半轴
  drawArcLine(ccsContext, 0, 0, 0, -canvas.height / 2)
  // 画 y 负半轴上的刻度
  for (let i = 0; i < canvas.height / 2 / offset; i++) {
    drawArcLine(ccsContext, 0, -offset * i, 4, -offset * i)
  }
}

// 封装实时显示坐标函数
function mouse() {
  // 创建一个元素，用于显示鼠标在画布中的坐标
  const span = document.createElement('span')
  span.innerText = '' // 默认该元素内无内容
  span.style.setProperty('display', 'none') // 默认隐藏该元素
  span.style.setProperty('box-shadow', '0px 0px 2px 1px rgba(0, 0, 0, 0.4)') // 坐标显示框
  span.style.setProperty('padding', '0px 5px') // 设置框内的数字与边框存在间隔，看上去更美观
  span.style.setProperty('position', 'fixed') // 设置该坐标框为绝对定位，后续才能使用 top、left属性 实现跟随鼠标移动

  document.body.appendChild(span) // 将该元素添加到网页中

  // 添加鼠标在画布中移动的监听事件
  canvas.addEventListener('mousemove', (event) => {
    // 把鼠标在画布中的坐标写入我们创建的元素中
    // 因为把绘制的轨迹放大了5倍，所以显示的坐标除以5才是NC代码的坐标
    span.innerText = `${(event.offsetX - canvas.width / 2) / 5}, ${
      -(event.offsetY - canvas.height / 2) / 5
    }`
    // 显示该元素
    span.style.setProperty('display', 'inline')
    // 使用 top、left属性 实现跟随鼠标移动
    span.style.setProperty('top', event.clientY + 20 + 'px')
    span.style.setProperty('left', event.clientX + 20 + 'px')
  })

  // 如果不在画布中移动，则隐藏坐标显示
  document.onmousemove = (event) => {
    if (event.toElement !== canvas) {
      span.style.setProperty('display', 'none')
    }
  }
}
