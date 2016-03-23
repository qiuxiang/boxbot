/**
 * @constructor
 */
var Boxbot = function () {
  this.bot = new BoxbotBot('.boxbot-bot')
  this.map = new BoxbotMap('.boxbot-map', 10, 10)
  this.finder = new BoxbotFinder(this.map)
  this.duration = 250
  this.queue = []
  this.running = false
}

Boxbot.prototype.directions = {bot: BOTTOM, lef: LEFT, top: TOP, rig: RIGHT}
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
      var direction = this.directions[arguments[0].toLowerCase()]
      return this.run(this.move, [direction, arguments[2] || 1])
    }
  },
  {
    pattern: /^tra\s+(bot|lef|top|rig)(\s+)?(\w+)?$/i,
    handler: function () {
      var direction = this.directions[arguments[0].toLowerCase()]
      return this.run(this.moveDirect, [direction, arguments[2] || 1])
    }
  },
  {
    pattern: /^biud$/i,
    handler: function () {
      return this.run(this.build, [])
    }
  },
  {
    pattern: /^bru\s+(#\d+)$/i,
    handler: function (color) {
      return this.run(this.setColor, [color])
    }
  },
  {
    pattern: /^mov\s+to\s+(\d+)[, ](\d+)(\s+)?(dfs)?$/i,
    handler: function (x, y) {
      return this.run(this.search, [[parseInt(x), parseInt(y)]])
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
 * 修墙
 */
Boxbot.prototype.build = function () {
  var position = this.bot.getPosition(null, 1)
  if (this.map.getType(position) == 'null') {
    this.map.set(position, 'wall')
  } else {
    throw '前方不可修墙'
  }
}

/**
 * 涂色
 * @param {string} color
 */
Boxbot.prototype.setColor = function (color) {
  var position = this.bot.getPosition(null, 1)
  if (this.map.getType(position) == 'wall') {
    this.map.setColor(position, color)
  } else {
    throw '前方没有墙'
  }
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
 * @param {int} direction
 * @param {int} step
 */
Boxbot.prototype.moveDirect = function (direction, step) {
  this.checkPath(direction, step)
  boxbot.bot.move(direction, step)
}

/**
 * 朝指定方向旋转并移动
 *
 * @param {int} direction
 * @param {int} step
 */
Boxbot.prototype.move = function (direction, step) {
  this.checkPath(direction, step)
  boxbot.bot.turn(direction)
  boxbot.bot.move(direction, step)
}

/**
 * 跳到指定位置
 *
 * @param {[int]} position
 * @param {boolean} [turn] 是否旋转方向
 */
Boxbot.prototype.goto = function (position, turn) {
  boxbot.bot.goto(position, turn)
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

    if (this.map.getType([x, y]) != 'null') {
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
  var promise = new Promise(proxy(this, function (resolve, reject) {
    this.queue.push({
      func: func, params: params, callback: function (exception) {
        if (exception) {
          reject(exception)
        } else {
          resolve()
        }
      }
    })
  }))

  if (!this.running) {
    this.taskloop()
  }

  return promise
}

Boxbot.prototype.taskloop = function () {
  this.running = true
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
    setTimeout(proxy(this, this.taskloop), this.duration)
  } else {
    this.running = false
  }
}

/**
 * 指定搜索算法并开始搜索
 *
 * @param {[int]} target
 * @param {string} [algorithm=dfs]
 */
Boxbot.prototype.search = function (target, algorithm) {
  if (this.map.getType(target) == 'null') {
    var path = this.finder.search(algorithm || 'dfs', this.bot.getCurrentPosition(), target)
    if (path) {
      path.forEach(proxy(this, function (item) {
        this.run(this.goto, [item, true])
      }))
    } else {
      throw '寻路失败'
    }
  } else {
    throw '无法移动到 [' + target[0] + ',' + target[1] + ']'
  }
}

var boxbot = new Boxbot()
boxbot.bot.goto([1, 1])
boxbot.map.set([5, 5], 'wall')
boxbot.map.set([5, 6], 'wall')
boxbot.map.set([5, 7], 'wall')
boxbot.map.set([5, 8], 'wall')
boxbot.map.set([3, 3], 'wall')
boxbot.map.set([3, 4], 'wall')
boxbot.map.set([3, 5], 'wall')
boxbot.map.set([3, 6], 'wall')
boxbot.map.set([1, 8], 'wall')
boxbot.map.set([2, 8], 'wall')
boxbot.map.set([3, 8], 'wall')
boxbot.map.set([4, 8], 'wall')
boxbot.map.set([6, 4], 'wall')
boxbot.map.set([7, 4], 'wall')
boxbot.map.set([8, 4], 'wall')
boxbot.map.set([9, 4], 'wall')
boxbot.exec('mov to 6,7')
//boxbot.exec('tun lef')
//boxbot.exec('go')
//boxbot.exec('mov bot 2')
//boxbot.exec('biud')
//boxbot.exec('mov rig')
//boxbot.exec('mov bot')
//boxbot.exec('tun rig')
//boxbot.exec('bru #000')
//boxbot.exec('tra rig 2')
//boxbot.exec('tun lef')
//boxbot.exec('go 4')
//boxbot.exec('tun bac')

var editor = new BoxbotEditor('.boxbot-commander')
