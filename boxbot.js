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

Boxbot.prototype.DIRECTION_MAP = {bot: BOTTOM, lef: LEFT, top: TOP, rig: RIGHT}

Boxbot.prototype.commands = [
  {
    pattern: /^go(\s+)?(\w+)?$/i,
    handler: function (step) {
      return this.run(this.go, [arguments[1] || 1])
    }
  },
  {
    pattern: /^tun\s+(lef|rig|bac)$/i,
    handler: function (direction) {
      return this.run(this.turn, [{lef: -90, rig: 90, bac: 180}[direction.toLowerCase()]])
    }
  },
  {
    pattern: /^mov\s+(bot|lef|top|rig)(\s+)?(\w+)?$/i,
    handler: function () {
      var direction = this.DIRECTION_MAP[arguments[0].toLowerCase()]
      return this.run(this.move, [direction, arguments[2] || 1])
    }
  },
  {
    pattern: /^tra\s+(bot|lef|top|rig)(\s+)?(\w+)?$/i,
    handler: function () {
      var direction = this.DIRECTION_MAP[arguments[0].toLowerCase()]
      return this.run(this.moveDirect, [direction, arguments[2] || 1])
    }
  }
]

/**
 * 运行命令
 *
 * @param {string} string
 * @returns {*}
 */
Boxbot.prototype.exec = function (string) {
  for (var i = 0; i < this.commands.length; i += 1) {
    var command = this.commands[i]
    var match = string.match(command.pattern)
    if (match) {
      match.shift()
      return command.handler.apply(this, match)
    }
  }
  throw '命令"' + string + '"解析错误'
}

/**
 * 旋转
 *
 * @param {int} angle
 */
Boxbot.prototype.turn = function (angle) {
  this.bot.rotate(angle)
}

/**
 * 朝指定方向移动
 *
 * @param {string} direction
 * @param {int} step
 */
Boxbot.prototype.moveDirect = function (direction, step) {
  this.checkPath(direction, step)
  boxbot.bot.move(direction, step)
}

/**
 * 朝指定方向旋转并移动
 *
 * @param {string} direction
 * @param {int} step
 */
Boxbot.prototype.move = function (direction, step) {
  this.checkPath(direction, step)
  boxbot.bot.turn(direction)
  boxbot.bot.move(direction, step)
}

/**
 * 朝当前方向移动
 *
 * @param {int} step
 */
Boxbot.prototype.go = function (step) {
  var direction = boxbot.bot.getDirection()
  this.checkPath(direction, step)
  boxbot.bot.move(direction, step)
}

/**
 * 检查是否可以到达目的地
 *
 * @param direction
 * @param step
 */
Boxbot.prototype.checkPath = function (direction, step) {
  var offsetPosition = boxbot.bot.getOffsetPosition(direction, 1)
  var currentPosition = boxbot.bot.getCurrentPosition()

  for (var s = 1; s <= step; s += 1) {
    var x = currentPosition[0] + offsetPosition[0] * s
    var y = currentPosition[1] + offsetPosition[1] * s

    if (!this.map.isNull([x, y])) {
      throw '无法移动到 [' + x + ',' + y + ']'
    }
  }
}

/**
 * 在任务循环里运行任务
 *
 * @param {function} func
 * @param {[]} params
 * @return Promise
 */
Boxbot.prototype.run = function (func, params) {
  var _this = this
  var promise = new Promise(function (resolve, reject) {
    _this.queue.push({
      func: func, params: params, callback: function (exception) {
        if (exception) {
          reject(exception)
        } else {
          resolve()
        }
      }
    })
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
      this.running = false
      this.queue = []
      return task.callback(e)
    }

    // 等待动画结束后运行下一个任务
    setTimeout(this.proxy(this, this.taskloop), this.duration)
    this.running = true
  } else {
    this.running = false
  }
}

/**
 * 提供类似 jQuery.proxy() 的功能
 *
 * @param {*} context
 * @param {function} func
 * @param {[]} [params]
 * @returns {function}
 */
Boxbot.prototype.proxy = function (context, func, params) {
  return function () {
    func.apply(context, params)
  }
}

var boxbot = new Boxbot()
boxbot.bot.goto([1, 1])
boxbot.exec('tun lef')
boxbot.exec('go')
boxbot.exec('mov bot 2')
boxbot.exec('tra rig 2')
boxbot.exec('tun lef')
boxbot.exec('go 4')
boxbot.exec('tun bac')
