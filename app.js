var Application = function () {
  this.boxbot = new Boxbot()
  this.editor = new BoxbotEditor('.boxbot-commander')
  this.imageReader = new ImageReader()

  this.$image = document.querySelector('#image')
  this.$random = document.querySelector('#random')
  this.$run = document.querySelector('#run')
  this.$reset = document.querySelector('#reset')
  this.$duration = document.querySelector('#duration')
  this.$resolution = document.querySelector('#resolution')

  this.init()
  this.reset()
}

Application.prototype.init = function () {
  document.addEventListener('keydown', this.hotkey.bind(this))
  this.$run.addEventListener('click', this.run.bind(this))
  this.$reset.addEventListener('click', this.reset.bind(this))
  this.$random.addEventListener('click', this.random.bind(this))
  this.$duration.addEventListener('change', this.setDuration.bind(this))
  this.$resolution.addEventListener('change', this.setResolution.bind(this))
  this.$image.addEventListener('change', this.loadImage.bind(this))
}

/**
 * 设置运行速度
 */
Application.prototype.setDuration = function () {
  this.boxbot.setDuration(parseInt(this.$duration.value))
}

/**
 * 设置地图尺寸
 */
Application.prototype.setResolution = function () {
  this.boxbot.setResolution(parseInt(this.$resolution.value))
  this.reset()
}

/**
 * 读取图片并生成绘图命令
 */
Application.prototype.loadImage = function () {
  this.imageReader
    .read(this.$image, this.boxbot.map.columns, this.boxbot.map.rows)
    .then((function (data) {
      var commands = 'mov to 1,1\nmov bot\nmov top\n'
      for (var y = 1; y <= data.length; y += 1) {
        // 移动到下一个位置
        if (y == data.length) {
          commands += 'tun rig\ntra lef\n'
        } else {
          commands += 'tra bot\n'
        }

        var columns = data[y - 1].length
        for (var x = 1; x <= columns; x += 1) {
          // 最后一个方块无法修墙，结束绘图
          if (y == data.length && x == columns) {
            break
          }

          var _x = columns - x
          var direction = 'lef'

          if (y % 2) {
            _x = [x - 1]
            direction = 'rig'
          }

          if (x != 1) {
            commands += 'tra ' + direction + '\n'
          }
          commands += 'biud\nbru ' + data[y - 1][_x] + '\n'
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
  this.editor.clearFlag()
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
    var prev = 0
    codes.forEach((function (code, i) {
      if (code) {
        this.boxbot.exec(code).then(
          (function () {
            if (i % 37 == 0) {
              this.editor.scrollTo(i)
            }
            this.editor.clearFlag(prev)
            this.editor.setFlag(i, 'success')
            prev = i
          }).bind(this),
          (function (e) {
            console.log(e)
            this.editor.clearFlag(prev)
            this.editor.setFlag(i, 'warning')
          }).bind(this))
      }
    }).bind(this))
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
  this.boxbot.map.clear()
  this.boxbot.bot.init()
  this.editor.clearFlag()
}

new Application()
