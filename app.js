var Application = function () {
  this.boxbot = new Boxbot()
  this.editor = new BoxbotEditor('.boxbot-commander')
  this.init()
  this.reset()
}

Application.prototype.init = function () {
  document.addEventListener('keydown', proxy(this, this.hotkey))
  document.querySelector('#btn-run').addEventListener('click', proxy(this, this.run))
  document.querySelector('#btn-reset').addEventListener('click', proxy(this, this.reset))
  document.querySelector('#btn-random').addEventListener('click', proxy(this, this.random))
}

Application.prototype.hotkey = function (event) {
  if (event.target.tagName == 'BODY') {
    var direction = {37: LEFT, 38: TOP, 39: RIGHT, 40: BOTTOM}[event.keyCode]
    if (typeof direction != 'undefined') {
      if (direction == this.boxbot.bot.getDirection()) {
        this.boxbot.run(this.boxbot.go).catch(function (e) {
          console.log(e)
        })
      } else {
        this.boxbot.run(this.boxbot.turn, [direction])
      }
    } else if (event.keyCode == 32) {
      this.boxbot.run(this.boxbot.build)
    }
  }
}

Application.prototype.run = function () {
  this.editor.clearFlags()
  var codes = this.editor.getCodes()

  // 检查命令是否有误
  for (var i = 0; i < codes.length; i += 1) {
    if (codes[i] && this.boxbot.parse(codes[i]) === false) {
      return this.editor.setFlag(i, 'error')
    }
  }

  // 依次运行命令
  var _this = this
  codes.forEach(function (code, i) {
    if (code) {
      _this.boxbot.exec(code).then(function () {
        _this.editor.clearFlags()
        _this.editor.setFlag(i, 'success')
      }).catch(function (e) {
        console.log(e)
        _this.editor.clearFlags()
        _this.editor.setFlag(i, 'warning')
      })
    }
  })
}

Application.prototype.random = function () {
  // 先找出所有可修墙的位置
  var positions = []
  for (var y = 1; y <= this.boxbot.map.rows; y += 1) {
    for (var x = 1; x <= this.boxbot.map.columns; x += 1) {
      if (this.boxbot.map.getType([x, y]) == 'null') {
        positions.push([x, y])
      }
    }
  }

  if (positions.length) {
    this.boxbot.build(positions[Math.floor(Math.random() * positions.length)])
  }
}

Application.prototype.reset = function () {
  this.boxbot.queue = []
  this.boxbot.bot.turn(BOTTOM)
  this.boxbot.bot.goto([1, 1])
  this.boxbot.map.clear()
  this.editor.clearFlags()
}

new Application()
