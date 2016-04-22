/**
 * @constructor
 */
var Boxbot = function () {
  this.element = document.querySelector('.boxbot')
  this.bot = new BoxbotBot('.boxbot-bot')
  this.map = new BoxbotMap('.boxbot-map')
  this.map.create(20, 20)
  this.finder = new BoxbotFinder(this.map)
  this.duration = 250
  this.queue = []
  this.running = false
}

Boxbot.prototype.directions = {bot: BOTTOM, lef: LEFT, top: TOP, rig: RIGHT}
Boxbot.prototype.commands = [
  {
    pattern: /^go(\s+)?(\d+)?$/i,
    handler: function (step) {
      return this.run(this.go, [arguments[1]])
    }
  },
  {
    pattern: /^go\s+to\s+(\d+)[,\s+](\d+)$/i,
    handler: function (x, y) {
      return this.run(this.goto, [[x, y]])
    }
  },
  {
    pattern: /^tun\s+(lef|rig|bac)$/i,
    handler: function (direction) {
      return this.run(this.rotate, [{lef: -90, rig: 90, bac: 180}[direction.toLowerCase()]])
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
    pattern: /^bru\s+(.*)$/i,
    handler: function (color) {
      return this.run(this.setColor, [color])
    }
  },
  {
    pattern: /^mov\s+to\s+(\d+)[,\s+](\d+)(\s+)?(dfs|bfs)?$/i,
    handler: function (x, y, _, algorithm) {
      return this.run(this.search, [[parseInt(x), parseInt(y)], algorithm])
    }
  }
]

/**
 * 解析命令，如果成功则返回命令对象，否则返回 false
 *
 * @param {string} string
 * @returns {boolean|{handler: handler, params: []}}
 */
Boxbot.prototype.parse = function (string) {
  for (var i = 0; i < this.commands.length; i += 1) {
    var command = this.commands[i]
    var match = string.match(command.pattern)
    if (match) {
      match.shift()
      return {handler: command.handler, params: match}
    }
  }
  return false
}

/**
 * 运行命令
 *
 * @param {string} string
 * @returns {boolean|Promise}
 */
Boxbot.prototype.exec = function (string) {
  var command = this.parse(string)
  if (command) {
    return command.handler.apply(this, command.params)
  } else {
    return false
  }
}

/**
 * 设置命令运行与动画的延时
 * 
 * @param {int} duration 单位为毫秒
 */
Boxbot.prototype.setDuration = function (duration) {
  this.duration = duration
  var boxs = document.querySelectorAll('.boxbot-box')
  for (var i = 0; i < boxs.length; i += 1) {
    boxs[i].style.transitionDuration = duration + 'ms'
  }
}

/**
 * 设置地图尺寸
 *
 * @param {int} size
 */
Boxbot.prototype.setResolution = function (size) {
  this.map.create(size, size)
  this.element.className = 'clearfix boxbot boxbot-' + size + 'x' + size
}

/**
 * 修墙
 * 
 * @param {[int]} [position] 默认为前方
 */
Boxbot.prototype.build = function (position) {
  position = position || this.bot.getPosition(null, 1)
  if (this.map.getType(position) == 'null') {
    this.map.set(position, 'wall')
  } else {
    throw '前方不可修墙'
  }
}

/**
 * 涂色
 * 
 * @param {string} color
 * @param {[int]} [position] 默认为前方
 */
Boxbot.prototype.setColor = function (color, position) {
  position = position || this.bot.getPosition(null, 1)
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
Boxbot.prototype.rotate = function (angle) {
  this.bot.rotate(angle)
}

/**
 * 转换方向
 *
 * @param {int} direction
 */
Boxbot.prototype.turn = function (direction) {
  this.bot.turn(direction)
}

/**
 * 朝指定方向移动
 *
 * @param {int} direction
 * @param {int} step
 */
Boxbot.prototype.moveDirect = function (direction, step) {
  this.checkPath(direction, step)
  this.bot.move(direction, step)
}

/**
 * 朝指定方向旋转并移动
 *
 * @param {int} direction
 * @param {int} step
 */
Boxbot.prototype.move = function (direction, step) {
  this.checkPath(direction, step)
  this.bot.turn(direction)
  this.bot.move(direction, step)
}

/**
 * 跳到指定位置
 *
 * @param {[int]} position
 * @param {boolean} [turn] 是否旋转方向
 */
Boxbot.prototype.goto = function (position, turn) {
  this.bot.goto(position, turn)
}

/**
 * 朝当前方向移动
 *
 * @param {int} [step=1]
 */
Boxbot.prototype.go = function (step) {
  step = step || 1
  var direction = this.bot.getCurrentDirection()
  this.checkPath(direction, step)
  this.bot.move(direction, step)
}

/**
 * 检查是否可以到达目的地
 *
 * @param direction
 * @param step
 */
Boxbot.prototype.checkPath = function (direction, step) {
  var offsetPosition = this.bot.getOffsetPosition(direction, 1)
  var currentPosition = this.bot.getCurrentPosition()

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
 * @param {[]} [params]
 * @return Promise
 */
Boxbot.prototype.run = function (func, params) {
  var promise = new Promise((function (resolve, reject) {
    this.queue.push({
      func: func, params: params, callback: function (exception) {
        if (exception) {
          reject(exception)
        } else {
          resolve()
        }
      }
    })
  }).bind(this))

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
      task.func.apply(this, task.params)
      task.callback()
      setTimeout(this.taskloop.bind(this), this.duration)
    } catch (e) {
      this.running = false
      this.queue = []
      task.callback(e)
    }
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
    this.nextPosition = this.nextPosition || this.bot.getCurrentPosition()
    var self = this
    var path = this.finder.search(algorithm || 'dfs', this.nextPosition, target)
    this.nextPosition = target

    if (path.length > 0) {
      path.forEach(function (item, i) {
        if (i == path.length - 1) {
          var then = function () {
            self.nextPosition = null
          }
        }
        self.run(self.goto, [item, true]).then(then)
      })
    } else {
      throw '寻路失败'
    }
  } else {
    throw '无法移动到 [' + target[0] + ',' + target[1] + ']'
  }
}
