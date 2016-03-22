/**
 * @param width
 * @param height
 * @constructor
 */
var BoxbotMap = function (width, height) {
  this.width = width
  this.height = height
  this.data = (new Array(this.width)).fill(
    (new Array(this.height)).fill(null)
  )
}

BoxbotMap.prototype.get = function (x, y) {
  return this.data[x][y]
}

BoxbotMap.prototype.setColor = function (x, y, color) {
  this.data[x][y].color = color
}

/**
 * @constructor
 */
var BoxbotBot = function () {
  this.position = [0, 0]
  this.direction = this.DIRECTION_TOP;
}

BoxbotBot.prototype.DIRECTION_TOP = 0
BoxbotBot.prototype.DIRECTION_RIGHT = 1
BoxbotBot.prototype.DIRECTION_BOTTOM = 2
BoxbotBot.prototype.DIRECTION_LEFT = 3
BoxbotBot.prototype.DIRECTION_MAP = {}
BoxbotBot.prototype.DIRECTION_MAP[BoxbotBot.prototype.DIRECTION_TOP] = [0, -1]
BoxbotBot.prototype.DIRECTION_MAP[BoxbotBot.prototype.DIRECTION_RIGHT] = [1, 0]
BoxbotBot.prototype.DIRECTION_MAP[BoxbotBot.prototype.DIRECTION_BOTTOM] = [0, 1]
BoxbotBot.prototype.DIRECTION_MAP[BoxbotBot.prototype.DIRECTION_LEFT] = [-1, 0]

/**
 * 跳转到指定位置
 *
 * @param position
 */
BoxbotBot.prototype.goto = function (position) {
  this.position = position
}

/**
 * 获取当前方向的下一位置
 *
 * @param direction 方向
 * @param step 步数
 * @returns {[x, y]} 位置坐标
 */
BoxbotBot.prototype.getPosition = function (direction, step) {
  var position = this.DIRECTION_MAP[direction]
  return [this.position[0] + position[0] * step, this.position[1] + position[1] * step]
}

/**
 * 朝指定方向移动
 *
 * @param direction 方向
 * @param step 步数
 */
BoxbotBot.prototype.move = function (direction, step) {
  this.position = this.getPosition(direction, step)
}

/**
 * @constructor
 */
var Boxbot = function () {
  this.side = 40

  this.map = new BoxbotMap(10, 10)
  this.$map = document.querySelector('.boxbot-map')
  this.initMap()

  this.bot = new BoxbotBot()
  this.$bot = document.querySelector('.boxbot-bot')
  this.initBot()
}

Boxbot.prototype.initMap = function () {
  var html = ''
  for (var y = 0; y <= this.map.height; y += 1) {
    html += '<tr>'
    for (var x = 0; x <= this.map.width; x += 1) {
      if (x == 0 && y == 0) {
        html += '<td></td>'
      } else {
        if (y == 0) {
          html += '<td class="boxbot-box boxbot-x-axis">' + (x - 1) + '</td>'
        } else if (x == 0) {
          html += '<td class="boxbot-box boxbot-y-axis">' + (y - 1) + '</td>'
        } else {
          html += '<td class="boxbot-box boxbot-null"></td>'
        }
      }
    }
    html += '</tr>'
  }
  this.$map.innerHTML = html
}

Boxbot.prototype.initBot = function () {
  this.goto([1, 2])
  this.move(this.bot.DIRECTION_RIGHT, 2)
}

Boxbot.prototype.goto = function (position) {
  this.bot.goto(position)
  this.$bot.style.left = position[0] * this.side + 'px'
  this.$bot.style.top = position[1] * this.side + 'px'
}

Boxbot.prototype.move = function (direction, step) {
  this.bot.move(direction, step)
  this.$bot.style.left = position[0] * this.side + 'px'
  this.$bot.style.top = position[1] * this.side + 'px'
}

Boxbot.prototype.updateBotPosition = function () {

}

var boxbot = new Boxbot()
