/**
 * @constructor
 */
var Boxbot = function () {
  this.bot = new BoxbotBot('.boxbot-bot')
  this.map = new BoxbotMap('.boxbot-map', 10, 10)
  this.duration = 500
  this.queue = []
  this.running = false
}

/**
 * 朝指定方向旋转并移动
 *
 * @param direction 方向
 * @param step 步数
 */
Boxbot.prototype.move = function (direction, step) {
  var unitOffsetPosition = boxbot.bot.getOffsetPosition(direction, 1)
  var currentPosition = boxbot.bot.getCurrentPosition()
  var moveAllowed = true

  for (var s = 1; s <= step; s += 1) {
    var x = currentPosition[0] + unitOffsetPosition[0] * s
    var y = currentPosition[1] + unitOffsetPosition[1] * s

    if (!this.map.isNull([x, y])) {
      console.log('无法移动到 [' + x + ',' + y + ']')
      return false
    }
  }

  boxbot.bot.turn(direction)
  boxbot.bot.move(direction, step)
  return true
}

/**
 * 在任务循环里运行任务
 *
 * @param func
 * @param params
 */
Boxbot.prototype.exec = function (func, params) {
  this.queue.push([func, params])
  if (!this.running) {
    this.taskloop()
  }
}

Boxbot.prototype.taskloop = function () {
  var task = this.queue.shift()
  if (task) {
    var _this = this
    setTimeout(function () { _this.taskloop() }, this.duration)
    task[0].apply(this, task[1])
    this.running = true
  } else {
    this.running = false
  }
}

var boxbot = new Boxbot()
boxbot.bot.goto([1, 1])
boxbot.exec(boxbot.move, ['right', 2])
boxbot.exec(boxbot.move, ['bottom', 2])
boxbot.exec(boxbot.move, ['left', 3])
