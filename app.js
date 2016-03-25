var Application = function () {
  this.boxbot = new Boxbot()
  this.editor = new BoxbotEditor('.boxbot-commander')
  this.imageReader = new ImageReader()

  this.$image = document.querySelector('#image')
  this.$random = document.querySelector('#random')
  this.$run= document.querySelector('#run')
  this.$reset= document.querySelector('#reset')
  this.$duration= document.querySelector('#duration')

  this.init()
  this.reset()
}

Application.prototype.init = function () {
  document.addEventListener('keydown', this.hotkey.bind(this))
  this.$run.addEventListener('click', this.run.bind(this))
  this.$reset.addEventListener('click', this.reset.bind(this))
  this.$random.addEventListener('click', this.random.bind(this))
  this.$duration.addEventListener('change', this.setDuration.bind(this))
  this.$image.addEventListener('change', this.loadImage.bind(this))
}

Application.prototype.setDuration = function () {
  this.boxbot.setDuration(this.$duration.value)
}

/**
 * 读取图片并生成绘图命令
 */
Application.prototype.loadImage = function () {
  this.imageReader
    .read(this.$image, this.boxbot.map.columns, this.boxbot.map.rows)
    .then((function (data) {
      var commands = 'tun bac\ntra bot\n'
      for (var y = 1; y <= data.length; y += 1) {
        var columns = data[y - 1].length
        for (var x = 1; x <= columns; x += 1) {
          commands += 'biud\n'

          var _x = columns - x
          var direction = 'lef'

          if (y % 2) {
            _x = [x - 1]
            direction = 'rig'
          }

          commands += 'bru ' + data[y - 1][_x] + '\n'

          if (x != columns) {
            commands += 'tra ' + direction + '\n'
          }
        }

        if (y == data.length - 1) {
          commands += 'tun rig\ntra lef\n'
        } else {
          commands += 'tra bot\n'
        }
      }
      this.editor.setCodes(commands)
    }).bind(this))
}

/**
 * 键盘事件处理
 * 
 * @param {Event} event
 */
Application.prototype.hotkey = function (event) {
  if (event.target.tagName == 'BODY') {
    var direction = {37: LEFT, 38: TOP, 39: RIGHT, 40: BOTTOM}[event.keyCode]
    if (typeof direction != 'undefined') {
      if (direction == this.boxbot.bot.getCurrentDirection()) {
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
  var parseError = false
  var codes = this.editor.getCodes()

  // 检查命令是否有误
  for (var i = 0; i < codes.length; i += 1) {
    if (codes[i] && this.boxbot.parse(codes[i]) === false) {
      parseError = true
      this.editor.setFlag(i, 'error')
    }
  }

  // 依次运行命令
  if (!parseError) {
    var _this = this
    codes.forEach(function (code, i) {
      if (code) {
        _this.boxbot.exec(code).then(function () {
          _this.editor.clearFlags()
          _this.editor.setFlag(i, 'success')
          _this.editor.scrollTo(i)
        }).catch(function (e) {
          console.log(e)
          _this.editor.clearFlags()
          _this.editor.setFlag(i, 'warning')
        })
      }
    })
  }
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
