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
}

Application.prototype.hotkey = function (event) {
  if (event.target.tagName == 'BODY') {
    var direction = {37: LEFT, 38: TOP, 39: RIGHT, 40: BOTTOM}[event.keyCode]
    if (typeof direction != 'undefined') {
      if (direction == this.boxbot.bot.getDirection()) {
        this.boxbot.run(this.boxbot.go)
      } else {
        this.boxbot.run(this.boxbot.turn, [direction])
      }
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

Application.prototype.reset = function () {
  this.boxbot.queue = []
  this.boxbot.bot.turn(BOTTOM)
  this.boxbot.bot.goto([1, 1])
  this.editor.clearFlags()
}

new Application()
