var BOTTOM = 0
var LEFT = 90
var TOP = 180
var RIGHT = 270

/**
 * @constructor
 * @param {string} selector
 */
var BoxbotBot = function (selector) {
  this.element = document.querySelector(selector)
  this.init()
}

BoxbotBot.prototype.init = function () {
  this.element.style.left = this.element.clientWidth + 'px'
  this.element.style.top = this.element.clientHeight + 'px'
  this.element.style.transform = 'rotate(0deg)'
}

/**
 * 转换方向
 *
 * @param {int} direction
 */
BoxbotBot.prototype.turn = function (direction) {
  var ROTATE_MAP = {
    0: {0:0, 90: 90, 180: 180, 270: -90},
    90: {90: 0, 180: 90, 270: 180, 0: -90},
    180: {180: 0, 270: 90, 0: 180, 90: -90},
    270: {270: 0, 0: 90, 90: 180, 180: -90}
  }
  this.element.style.transform = 'rotate(' +
    (this.getCurrentAngle() + ROTATE_MAP[this.getCurrentDirection()][direction]) + 'deg)'
}

/**
 * 获取当前旋转角度
 *
 * @return {int}
 */
BoxbotBot.prototype.getCurrentAngle = function () {
  var match = this.element.style.transform.match(/rotate\((.*)deg\)/)
  if (match) {
    return parseInt(match[1])
  } else {
    return 0
  }
}

/**
 * 旋转
 *
 * @param {int} angle
 */
BoxbotBot.prototype.rotate = function (angle) {
  this.element.style.transform = 'rotate(' + (this.getCurrentAngle() + angle) + 'deg)'
}

/**
 * 获取当前方向
 *
 * @return {int}
 */
BoxbotBot.prototype.getCurrentDirection = function () {
  var angle = this.getCurrentAngle() % 360
  return angle >= 0 ? angle : angle + 360
}

/**
 * 获取指定方向上偏移的位置
 *
 * @param {int} direction
 * @param offset
 * @returns {[int]}
 */
BoxbotBot.prototype.getOffsetPosition = function (direction, offset) {
  var position = {0: [0, 1], 90: [-1, 0], 180: [0, -1], 270: [1, 0]}[direction]
  return [position[0] * offset, position[1] * offset]
}

/**
 * 获取当前位置便宜量
 * 
 * @param {string} direction left|top
 * @returns {int}
 */
BoxbotBot.prototype.getCurrentOffset = function (direction) {
  var offset = this.element.style[direction]
  if (offset) {
    return parseInt(offset.replace('px', ''))
  } else {
    return 0
  }
}

/**
 * 获取当前位置
 *
 * @returns {[int]}
 */
BoxbotBot.prototype.getCurrentPosition = function () {
  return [
    Math.round(this.getCurrentOffset('left') / this.element.clientWidth),
    Math.round(this.getCurrentOffset('top') / this.element.clientHeight)]
}

/**
 * 以当前位置为基准，获取指定方向上的位置
 *
 * @param {int|null} [direction] 如果为 null 则取当前方向
 * @param {int} [offset=0]
 * @returns {[int]}
 */
BoxbotBot.prototype.getPosition = function (direction, offset) {
  if (direction == null) {
    direction = this.getCurrentDirection()
  }
  offset = offset || 0
  var offsetPosition = this.getOffsetPosition(direction, offset)
  var currentPosition = this.getCurrentPosition()
  return [currentPosition[0] + offsetPosition[0], currentPosition[1] + offsetPosition[1]]
}

/**
 * 跳到指定位置
 *
 * @param {[int]} position
 * @param {boolean} [turn] 是否旋转方向
 */
BoxbotBot.prototype.goto = function (position, turn) {
  if (turn) {
    var currentPosition = this.getCurrentPosition()
    var distance = [position[0] - currentPosition[0], position[1] - currentPosition[1]]
    if (distance[0] < 0) {
      this.turn(LEFT)
    } else if (distance[0] > 0) {
      this.turn(RIGHT)
    } else if (distance[1] < 0) {
      this.turn(TOP)
    } else if (distance[1] > 0) {
      this.turn(BOTTOM)
    }
  }
  this.element.style.left = position[0] * this.element.clientWidth + 'px'
  this.element.style.top = position[1] * this.element.clientHeight + 'px'
}

/**
 * 朝指定方向移动
 *
 * @param {int} direction
 * @param {int} step
 */
BoxbotBot.prototype.move = function (direction, step) {
  this.goto(this.getPosition(direction, step))
}
