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
 * @param {string} direction
 * @param {int} step
 */
Boxbot.prototype.move = function (direction, step) {
  var unitOffsetPosition = boxbot.bot.getOffsetPosition(direction, 1)
  var currentPosition = boxbot.bot.getCurrentPosition()

  for (var s = 1; s <= step; s += 1) {
    var x = currentPosition[0] + unitOffsetPosition[0] * s
    var y = currentPosition[1] + unitOffsetPosition[1] * s

    if (!this.map.isNull([x, y])) {
      throw '无法移动到 [' + x + ',' + y + ']'
    }
  }

  boxbot.bot.turn(direction)
  boxbot.bot.move(direction, step)
}

/**
 * 在任务循环里运行任务
 *
 * @param {Function} func
 * @param {Array} params
 * @return Promise
 */
Boxbot.prototype.exec = function (func, params) {
  var _this = this
  var promise = new Promise(function (resolve, reject) {
    _this.queue.push({func: func, params: params, callback: function (exception) {
      if (exception) {
        reject(exception)
      } else {
        resolve()
      }
    }})
  })

  if (!this.running) {
    this.taskloop()
  }

  return promise
}

Boxbot.prototype.taskloop = function () {
  var task = this.queue.shift()
  if (task) {
    try {
      task.callback(task.func.apply(this, task.params))
    } catch (e) {
      return task.callback(e)
    }

    // 等待动画结束后运行下一个任务
    var _this = this
    setTimeout(function () { _this.taskloop() }, this.duration)

    this.running = true
  } else {
    this.running = false
  }
}

var boxbot = new Boxbot()
boxbot.bot.goto([1, 1])
boxbot.exec(boxbot.move, ['right', 2])
boxbot.exec(boxbot.move, ['bottom', 2])
boxbot.exec(boxbot.move, ['left', 3]).catch(function (e) {
  console.log(e)
})
