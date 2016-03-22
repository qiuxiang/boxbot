/**
 * @constructor
 * @param {string} selector
 */
var BoxbotBot = function (selector) {
  this.element = document.querySelector(selector)
}

/**
 * 方向转换成角度
 *
 * @param {string} direction
 * @returns {int}
 */
BoxbotBot.prototype.direction2angle = function (direction) {
  return {'bottom': 0, 'left': 90, 'top': 180, 'right': -90}[direction]
}

/**
 * 角度转换成方向
 *
 * @param {int} angle
 * @returns {string}
 */
BoxbotBot.prototype.angle2direction = function (angle) {
  return {'0': 'bottom', '90': 'left', '180': 'top', '-90': 'right'}[angle]
}

/**
 * 转换方向
 *
 * @param {string} direction
 */
BoxbotBot.prototype.turn = function (direction) {
  this.element.style.transform = 'rotate(' + this.direction2angle(direction) + 'deg)'
}

/**
 * 获取当前方向
 *
 * @return {string}
 */
BoxbotBot.prototype.getDirection = function () {
  var match = this.element.style.transform.match(/rotate\((.*)deg\)/)
  if (match) {
    return this.angle2direction(parseInt(match[1]))
  } else {
    return 'bottom'
  }
}

/**
 * 获取指定方向上偏移的位置
 *
 * @param {string} direction
 * @param offset
 * @returns {[int]}
 */
BoxbotBot.prototype.getOffsetPosition = function (direction, offset) {
  var position = {'bottom': [0, 1], 'left': [-1, 0], 'top': [0, -1], 'right': [1, 0]}[direction]
  return [position[0] * offset, position[1] * offset]
}

/**
 * @param {string} direction
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
    this.getCurrentOffset('left') / this.element.clientWidth,
    this.getCurrentOffset('top') / this.element.clientHeight]
}

/**
 * 以当前位置为基准，获取指定方向上的位置
 *
 * @param {string} [direction]
 * @param {int} [offset=0]
 * @returns {[int]}
 */
BoxbotBot.prototype.getPosition = function (direction, offset) {
  direction = direction || this.getDirection()
  offset = offset || 0
  var offsetPosition = this.getOffsetPosition(direction, offset)
  var currentPosition = this.getCurrentPosition()
  return [currentPosition[0] + offsetPosition[0], currentPosition[1] + offsetPosition[1]]
}

/**
 * 跳到指定位置
 *
 * @param {[int]} position
 */
BoxbotBot.prototype.goto = function (position) {
  this.element.style.left = position[0] * this.element.clientWidth + 'px'
  this.element.style.top = position[1] * this.element.clientHeight + 'px'
}

/**
 * 朝指定方向移动
 *
 * @param {string} direction
 * @param {int} step
 */
BoxbotBot.prototype.move = function (direction, step) {
  this.goto(this.getPosition(direction, step))
}
